const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

// Read URLs from urls.txt
const urls = fs.readFileSync("urls.txt", "utf8")
    .split("\n")
    .map(url => url.trim())
    .filter(url => url !== "");

const outputPath = "../data/recipes.json";

// Maximum recipes to collect from each page
const MAX_RECIPES = 25;

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

    const categories = [];

    // Get categories
    if (Array.isArray(recipe.recipeCategory)) {
        categories.push(...recipe.recipeCategory);
    } else if (recipe.recipeCategory) {
        categories.push(recipe.recipeCategory);
    }

    // Get keywords
    if (Array.isArray(recipe.keywords)) {
        categories.push(...recipe.keywords);
    } else if (recipe.keywords) {
        categories.push(recipe.keywords);
    }

    const text = categories
        .join(" ")
        .toLowerCase();


    // Check for specific categories
    if (text.includes("vegan")) {
        return "vegan";
    }

    if (text.includes("indian")) {
        return "indian";
    }

    if (text.includes("italian")) {
        return "italian";
    }

    if (text.includes("asian")) {
        return "asian";
    }

    if (
        text.includes("drink") ||
        text.includes("cocktail") ||
        text.includes("beverage")
    ) {
        return "drinks";
    }

    if (text.includes("autumn") || text.includes("fall")) {
        return "autumn";
    }

    if (text.includes("winter")) {
        return "winter";
    }

    if (
        text.includes("breakfast") ||
        text.includes("brunch")
    ) {
        return "breakfast";
    }

    if (text.includes("lunch")) {
        return "lunch";
    }

    if (text.includes("dinner")) {
        return "dinner";
    }

    if (text.includes("dessert") || text.includes("baking")) {
        return "dessert";
    }


    // Default category
    return "dinner";
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

            // Only accept actual Delish recipe URLs
            if (
                fullUrl.includes("delish.com") &&
                fullUrl.includes("/recipe-ideas/") &&
                fullUrl.includes("-recipe/")
            ) {
                links.add(fullUrl);
            }
        });

        const recipeLinks = Array.from(links).slice(0, MAX_RECIPES);

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

                if (Array.isArray(data)) {

                    const foundRecipe = data.find(
                        item => item["@type"] === "Recipe"
                    );

                    if (foundRecipe) {
                        recipe = foundRecipe;
                    }

                } else if (data["@type"] === "Recipe") {

                    recipe = data;

                }

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
        if (!recipe.image) {

            console.log("Skipping recipe because it has no image.");

            return null;
        }

        const prepMinutes = convertTime(recipe.prepTime);
        const totalMinutes = convertTime(recipe.totalTime);
        const cookMinutes = totalMinutes - prepMinutes;

        const cleanedRecipe = {
            id: Date.now().toString(),
            name: recipe.name,

            image:
                recipe.image?.[0]?.url ||
                recipe.image?.url ||
                recipe.image,

            category: getCategory(recipe),

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