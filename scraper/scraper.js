const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");

// Read URLs from urls.txt
const urls = fs.readFileSync("urls.txt", "utf8")
    .split("\n")
    .map(url => url.trim())
    .filter(url => url !== "");

const outputPath = "../data/recipes.json";

const nutritionFields = {
    calories: "calories",
    fatContent: "fatContent",
    saturatedFatContent: "saturatedFatContent",
    transFatContent: "transFatContent",
    cholesterolContent: "cholesterolContent",
    sodiumContent: "sodiumContent",
    carbohydrateContent: "carbohydrateContent",
    fiberContent: "fiberContent",
    sugarContent: "sugarContent",
    proteinContent: "proteinContent",
    vitaminDContent: "vitaminDContent",
    calciumContent: "calciumContent",
    ironContent: "ironContent",
    potassiumContent: "potassiumContent",
};

function normalizeNutrition(nutrition) {
    if (!nutrition || typeof nutrition !== "object" || Array.isArray(nutrition)) {
        return null;
    }

    const result = {};
    for (const [outputKey, sourceKey] of Object.entries(nutritionFields)) {
        const value = nutrition[sourceKey];
        if ((typeof value === "string" || typeof value === "number") && String(value).trim()) {
            result[outputKey] = String(value).trim();
        }
    }

    const servingSize = nutrition.servingSize;
    if ((typeof servingSize === "string" || typeof servingSize === "number") && String(servingSize).trim()) {
        result.servingSize = String(servingSize).trim();
    }

    return Object.keys(result).length ? result : null;
}

function normalizeRecipeName(name) {
    return String(name || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

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
    // Retain source labels for broad cuisine/diet categories, but derive drinks
    // and desserts from recipe-specific text. Source category labels are often
    // broad or incorrect, and words such as "pie" can describe savory meals.
    const values = [recipe.recipeCategory, recipe.recipeCuisine, recipe.name]
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter(Boolean);
    const text = values.join(" ").toLowerCase();
    const recipeText = [recipe.name, recipe.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    const drinkPattern = /\b(?:drink|cocktail|beverage|mocktail|smoothie|milkshake|frappuccino|margarita|martini|spritz|mimosa|sangria|horchata|lemonade|latte|juice|punch|negroni|mojito|paloma|wassail|eggnog|bloody mary|jell[- ]?o shots?|shots?|cold brew|hot chocolate|hot cocoa|coffee|tea|soda|beer|mulled wine|float|shamrock shake)\b/;
    const dessertPattern = /\b(?:dessert|cake|cookies?|brownies?|tarts?|blondies?|cupcakes?|puddings?|fudge|candy|cobblers?|crumbles?|ice cream|shortcake|donuts?|doughnuts?|truffles?|macarons?|tiramisu|churros?|baklava|flan|custard|mousse|sorbet|sundae|cheesecake|cinnamon rolls?|sticky buns?|babka|danish|cannoli|biscotti|macaroons?|meringue|snickerdoodles?|s'mores|smores|popsicles?|rice krispies|sweet potato pie|apple pie|pumpkin pie|pecan pie|key lime pie|chess pie|cream pie|lemon meringue pie|hand pies?|hot cocoa fluff|dessert dip|cookie dough dip|cake dip)\b/;
    const nonDessertFormat = /\b(?:pancakes?|waffles?|granola|bagels?|strata|savory pie|shepherd'?s pie|tomato pie|apple pie bourbon shots|chickpeas?|dumplings?|skewers?|sandwiches?|falafel|tofu|tempeh|fries|gratin|muffins?|scones?|oatmeal|breakfast bowl|corn dogs?|pizzagna|sweet potato pudding)\b/;
    const nonDrinkFormat = /\b(?:syrup|fluff|dip|cheesecake|cookies?|brownies?|skewers?|dumplings?|board|balls?)\b/;
    const categoryRules = [
        ["vegan", /\bvegan\b/],
        ["italian", /\bitalian\b/],
        ["side-dish", /side[\s-]?dish(?:es)?/],
        ["seafood", /\bseafood\b|\bshellfish\b|\bfish\b/],
        ["latin-american", /latin[\s-]?american|tex[\s-]?mex|mexican|southwestern|central american|south american|brazilian|argentinian|peruvian|colombian|chilean|cuban|puerto rican|\btacos?\b|\bburritos?\b|\benchiladas?\b|\bquesadillas?\b|\btostadas?\b|\btamales?\b|\bfajitas?\b|\bnachos?\b|\bguacamole\b|\belotes?\b|\bchurros?\b|tres leches|\bchorizo\b|\bsalsas?\b|\bchimichurri\b|\bempanadas?\b|\bpozole\b|sopa de fideo|\bchicharrones?\b|\bcoquito\b|\bconcha bread\b|\bmargaritas?\b|\bmichelada\b|\bmojitos?\b|\bmezcalita\b/],
        ["german", /\bgerman\b|\bgermany\b/],
        ["european", /\beuropean\b|\bgerman\b|\bgermany\b|\bitalian\b|\bgreek\b|\bgreece\b|\bfrench\b|\bfrance\b|\bspanish\b|\bspain\b|\bbritish\b|\birish\b|\bdutch\b|\bpolish\b|\baustrian\b|\bscandinavian\b|\bswedish\b|\bnorwegian\b|\bswiss\b|\bportuguese\b/],
        ["asian", /\basian\b|chinese|japanese|korean|thai|filipino/],
        ["autumn", /autumn|fall/],
        ["winter", /\bwinter\b/],
        ["breakfast", /breakfast|brunch/],
        ["lunch", /\blunch\b/],
        ["dinner", /\bdinner\b|main dish|main course/],
    ];
    const categories = categoryRules
        .filter(([, pattern]) => pattern.test(text))
        .map(([category]) => category);

    if (drinkPattern.test(recipeText) && !/\bcoffee cake\b/.test(recipeText) && !nonDrinkFormat.test(String(recipe.name || "").toLowerCase())) {
        categories.push("drinks");
    }
    if (dessertPattern.test(recipeText) && !nonDessertFormat.test(String(recipe.name || "").toLowerCase())) {
        categories.push("dessert");
    }

    return categories.length ? categories : ["dinner"];
}

function getDrinkType(recipe) {
    const name = String(recipe.name || '').toLowerCase();
    let ingredients = (recipe.recipeIngredient || []).join(' ').toLowerCase();
    ingredients = ingredients
        .replace(/\b(?:alcohol[- ]free|non[- ]alcoholic)\s+(?:gin|rum|vodka|whiskey|tequila|spirits?)\b/g, '')
        .replace(/\bginger beer\b|\b(?:red|white|rice|sherry|cooking) wine vinegar\b|\brum extract\b/g, '');

    if (/\bsmoothie\b/.test(name)) {
        return 'smoothie';
    }

    const containsAlcohol = /\b(vodka|gin|tequila|mezcal|rum|bourbon|whisk(?:e)y|scotch|brandy|cognac|triple sec|cointreau|liqueur|vermouth|prosecco|champagne|cava|moscato|beer|ale|stout|aperol|campari|kahl[u?]a|baileys|chartreuse|amaro|limoncello|schnapps|cura[c?]ao|falernum|absinthe|sake|soju|bitters|red wine|white wine|sparkling wine)\b/.test(ingredients);
    return containsAlcohol ? 'alcoholic' : 'non-alcoholic';
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

function getRecipeVideos(recipe, $, baseUrl) {
    const videos = [];
    const seenUrls = new Set();

    function addVideo(video, fallbackThumbnail = "") {
        const item = typeof video === "string" ? { url: video } : video;
        if (!item || typeof item !== "object") return;

        const urlValue = item.contentUrl || item.url || item.embedUrl || "";
        if (typeof urlValue !== "string" || !urlValue.trim()) return;
        let url;
        try {
            url = new URL(urlValue.trim(), baseUrl).href;
        } catch (error) {
            return;
        }
        if (!/^https?:\/\//i.test(url) || seenUrls.has(url)) return;

        // Native video players need a media stream, not a recipe or embed page.
        let path = "";
        try {
            path = new URL(url).pathname;
        } catch (error) {
            return;
        }
        if (!/\.(mp4|m4v|mov|webm|m3u8|mpd)$/i.test(path)) return;

        seenUrls.add(url);
        videos.push({
            url,
            title: item.name || item.headline || "",
            thumbnailUrl: getImageUrl(item.thumbnailUrl || item.thumbnail || fallbackThumbnail),
        });
    }

    const recipeVideo = recipe.video;
    (Array.isArray(recipeVideo) ? recipeVideo : [recipeVideo]).forEach((video) => addVideo(video));

    // Some recipe pages expose video URLs in page metadata or video elements
    // even when the Recipe JSON-LD does not include a VideoObject.
    $("meta[property='og:video'], meta[property='og:video:url'], meta[property='og:video:secure_url'], meta[name='twitter:player:stream']")
        .each((_, element) => addVideo($(element).attr("content")));

    $("video").each((_, element) => {
        const video = $(element);
        const thumbnailUrl = video.attr("poster") || "";
        addVideo(video.attr("src"), thumbnailUrl);
        video.find("source").each((__, source) => addVideo($(source).attr("src"), thumbnailUrl));
    });

    return videos;
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

        const recipeCategories = getCategory(recipe);
        const videos = getRecipeVideos(recipe, $, url);
        const nutrition = normalizeNutrition(recipe.nutrition);
        const cleanedRecipe = {
            id: Date.now().toString(),
            name: recipe.name || recipe.headline || "",

            image: imageUrl,

            categories: recipeCategories,
            ...(recipeCategories.includes("drinks") && {
                drinkType: getDrinkType({
                    name: recipe.name || recipe.headline || "",
                    recipeIngredient: recipe.recipeIngredient || [],
                }),
            }),

            prepTime: `${prepMinutes} min`,
            cookTime: `${cookMinutes} min`,

            ingredients: recipe.recipeIngredient || [],

            instructions: getInstructions(recipe.recipeInstructions),

            servings: recipe.recipeYield || "",

            ...(nutrition && { nutrition }),

            description: recipe.description || "",
            ...(videos.length > 0 && { videos }),
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

async function refreshRecipeNutrition() {
    const existingRecipes = JSON.parse(fs.readFileSync(outputPath, "utf8"));
    if (!Array.isArray(existingRecipes)) {
        throw new Error("recipes.json must contain a recipe array.");
    }

    const allRecipeLinks = new Set();
    for (const url of urls) {
        const recipeLinks = await findRecipeLinks(url);
        recipeLinks.forEach(link => allRecipeLinks.add(link));
    }

    if (allRecipeLinks.size === 0) {
        console.error("No recipe links were found; leaving recipes.json unchanged.");
        return;
    }

    const recipeUrls = [...allRecipeLinks];
    const scrapedRecipes = [];
    let nextRecipeIndex = 0;
    const workerCount = Math.min(6, recipeUrls.length);
    await Promise.all(Array.from({ length: workerCount }, async () => {
        while (nextRecipeIndex < recipeUrls.length) {
            const recipeUrl = recipeUrls[nextRecipeIndex++];
            const recipe = await scrapeRecipe(recipeUrl);
            if (recipe) scrapedRecipes.push(recipe);
        }
    }));

    if (scrapedRecipes.length === 0) {
        console.error("No recipes were scraped; leaving recipes.json unchanged.");
        return;
    }

    const existingCounts = new Map();
    const scrapedByName = new Map();
    for (const recipe of existingRecipes) {
        const name = normalizeRecipeName(recipe.name);
        existingCounts.set(name, (existingCounts.get(name) || 0) + 1);
    }
    for (const recipe of scrapedRecipes) {
        const name = normalizeRecipeName(recipe.name);
        if (!name) continue;
        if (!scrapedByName.has(name)) scrapedByName.set(name, []);
        scrapedByName.get(name).push(recipe);
    }

    let updated = 0;
    let unmatched = 0;
    let ambiguous = 0;
    let withoutNutrition = 0;
    const updatedRecipes = existingRecipes.map(recipe => {
        const name = normalizeRecipeName(recipe.name);
        const matches = scrapedByName.get(name) || [];
        if (matches.length === 0) {
            unmatched += 1;
            return recipe;
        }
        if (matches.length !== 1 || existingCounts.get(name) !== 1) {
            ambiguous += 1;
            return recipe;
        }
        if (!matches[0].nutrition) {
            withoutNutrition += 1;
            return recipe;
        }

        updated += 1;
        return { ...recipe, nutrition: matches[0].nutrition };
    });

    const temporaryPath = `${outputPath}.${process.pid}.tmp`;
    const backupPath = `${outputPath}.pre-nutrition-${new Date().toISOString().replace(/[:.]/g, "-")}.backup`;
    try {
        fs.writeFileSync(temporaryPath, JSON.stringify(updatedRecipes, null, 2));
        fs.copyFileSync(outputPath, backupPath);
        fs.renameSync(temporaryPath, outputPath);
    } catch (error) {
        if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
        throw error;
    }

    console.log(`Nutrition updated: ${updated}`);
    console.log(`Unmatched existing recipes: ${unmatched}`);
    console.log(`Ambiguous name matches skipped: ${ambiguous}`);
    console.log(`Matched recipes without source nutrition: ${withoutNutrition}`);
}

if (process.argv.includes("--nutrition-refresh")) {
    refreshRecipeNutrition().catch(error => {
        console.error("Nutrition refresh failed; recipes.json was not intentionally modified.");
        console.error(error.message);
        process.exitCode = 1;
    });
} else {
    scrapeAllRecipes();
}
