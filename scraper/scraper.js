const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

// Read URLs from urls.txt
const urls = fs.readFileSync("urls.txt", "utf8")
    .split("\n")
    .map(url => url.trim())
    .filter(url => url !== "");

const outputPath = "../data/recipes.json";

function convertTime(time) {
    if (!time) {
        return 0;
    }

    const hours = time.match(/(\d+)H/);
    const minutes = time.match(/(\d+)M/);

    let totalMinutes = 0;

    if (hours) {
        totalMinutes += Number(hours[1]) * 60;
    }

    if (minutes) {
        totalMinutes += Number(minutes[1]);
    }

    return totalMinutes;
}

function getCategory(recipe) {
    const values = [recipe.recipeCategory, recipe.recipeCuisine, recipe.keywords]
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter(Boolean);
    const text = values.join(" ").toLowerCase();
    const categoryRules = [
        ["vegan", /\bvegan\b/],
        ["indian", /\bindian\b/],
        ["italian", /\bitalian\b/],
        ["side-dish", /side[\s-]?dish(?:es)?/],
        ["latin-american", /latin[\s-]?american|mexican|central american|south american|brazilian|argentinian|peruvian|colombian|chilean|cuban|puerto rican/],
        ["german", /\bgerman\b|\bgermany\b/],
        ["european", /\beuropean\b|\bgerman\b|\bgermany\b|\bitalian\b|\bgreek\b|\bgreece\b|\bfrench\b|\bfrance\b|\bspanish\b|\bspain\b|\bbritish\b|\birish\b|\bdutch\b|\bpolish\b|\baustrian\b|\bscandinavian\b|\bswedish\b|\bnorwegian\b|\bswiss\b|\bportuguese\b/],
        ["asian", /\basian\b|chinese|japanese|korean|thai|filipino/],
        ["drinks", /drink|cocktail|beverage/],
        ["autumn", /autumn|fall/],
        ["winter", /\bwinter\b/],
        ["breakfast", /breakfast|brunch/],
        ["lunch", /\blunch\b/],
        ["dinner", /\bdinner\b|main dish|main course/],
        ["dessert", /dessert|baking|sweet/],
    ];
    const categories = categoryRules
        .filter(([, pattern]) => pattern.test(text))
        .map(([category]) => category);

    return categories.length ? categories : ["dinner"];
}

// Find recipe links on a page
async function findRecipeLinks(pageUrl) {

    try {
        console.log(`Looking for recipes on: ${pageUrl}`);

        const response = await axios.get(pageUrl);

        const $ = cheerio.load(response.data);

        const links = new Set();

        $("a").each((index, element) => {

            const href = $(element).attr("href");

            if (!href) {
                return;
            }

            const fullUrl = new URL(href, pageUrl).href;

            const parsedUrl = new URL(fullUrl);

            if (
                parsedUrl.hostname === "www.delish.com" &&
                parsedUrl.pathname.includes("/recipe-ideas/") &&
                parsedUrl.pathname.includes("-recipe/")
            ) {
                links.add(`${parsedUrl.origin}${parsedUrl.pathname}`);
            }
        });

        const recipeLinks = Array.from(links);

        console.log(`Found ${recipeLinks.length} possible recipe links.`);

        return recipeLinks;

    } catch (error) {

        console.log(`Could not read: ${pageUrl}`);
        console.log(error.message);

        return [];
    }
}

function getInstructions(instructions) {
    if (!Array.isArray(instructions)) {
        return [];
    }

    const result = [];

    for (const step of instructions) {

        // Normal HowToStep
        if (typeof step === "object" && step.text) {
            result.push(step.text);
        }

        // Instruction is already a string
        else if (typeof step === "string") {
            result.push(step);
        }

        // HowToSection containing multiple steps
        else if (
            typeof step === "object" &&
            Array.isArray(step.itemListElement)
        ) {
            for (const subStep of step.itemListElement) {
                if (typeof subStep === "string") {
                    result.push(subStep);
                }
                else if (subStep && subStep.text) {
                    result.push(subStep.text);
                }
            }
        }
    }

    return result.filter(step => step.trim() !== "");
}

function findRecipeData(data) {
    if (Array.isArray(data)) {
        for (const item of data) {
            const recipe = findRecipeData(item);
            if (recipe) return recipe;
        }
        return null;
    }

    if (!data || typeof data !== "object") return null;

    const type = data["@type"];
    if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
        return data;
    }

    return findRecipeData(data["@graph"] || data.mainEntity);
}

function getImageUrl(image) {
    const firstImage = Array.isArray(image) ? image[0] : image;
    if (typeof firstImage === "string") return firstImage;
    return firstImage?.url || firstImage?.contentUrl || "";
}

// Scrape one recipe
async function scrapeRecipe(url) {

    try {

        console.log(`Scraping recipe: ${url}`);

        const response = await axios.get(url);

        const $ = cheerio.load(response.data);

        const scripts = $('script[type="application/ld+json"]');

        let recipe = null;

        // Find Recipe JSON-LD
        scripts.each((index, element) => {

            try {

                const data = JSON.parse($(element).html());

                recipe = findRecipeData(data) || recipe;

            } catch (error) {
                // Ignore invalid JSON-LD
            }
        });


        // No recipe found
        if (!recipe) {

            console.log("No recipe data found.");

            return null;
        }


        // Make sure the recipe has an image
        const imageUrl = getImageUrl(recipe.image);
        if (!imageUrl) {

            console.log("Skipping recipe because it has no image.");

            return null;
        }

        const prepMinutes = convertTime(recipe.prepTime);
        const totalMinutes = convertTime(recipe.totalTime);
        const cookMinutes = convertTime(recipe.cookTime) ||
            Math.max(totalMinutes - prepMinutes, 0);

        const cleanedRecipe = {
            id: Date.now().toString(),
            name: recipe.name || recipe.headline || "",

            image: imageUrl,

            categories: getCategory(recipe),

            prepTime: `${prepMinutes} min`,
            cookTime: `${cookMinutes} min`,

            ingredients: recipe.recipeIngredient || [],

            instructions: getInstructions(recipe.recipeInstructions),

            servings: recipe.recipeYield || "",

            description: recipe.description || ""
        };


        console.log(`Found: ${cleanedRecipe.name}`);

        return cleanedRecipe;

    } catch (error) {

        console.log("Could not scrape recipe:");
        console.log(error.message);

        return null;
    }
}


// Main function
async function scrapeAllRecipes() {

    const allRecipeLinks = new Set();


    // Find recipe links from every URL in urls.txt
    for (const url of urls) {

        const recipeLinks = await findRecipeLinks(url);

        recipeLinks.forEach(link => {
            allRecipeLinks.add(link);
        });
    }


    console.log("\nTotal unique recipe links:");
    console.log(allRecipeLinks.size);


    const recipes = [];


    // Scrape each recipe
    for (const recipeUrl of allRecipeLinks) {

        const recipe = await scrapeRecipe(recipeUrl);

        if (recipe) {
            recipes.push(recipe);
        }

    }

    if (recipes.length === 0) {
        console.error("No recipes were scraped; leaving the existing recipes.json unchanged.");
        return;
    }


    // Save recipes.json
    fs.writeFileSync(
        outputPath,
        JSON.stringify(recipes, null, 2)
    );


    console.log("\n-----------------------------");
    console.log(`Saved ${recipes.length} recipes!`);
    console.log(`File: ${outputPath}`);
    console.log("-----------------------------");
}


scrapeAllRecipes();
