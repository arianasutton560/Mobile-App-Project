# Recipe scraper

Run commands from this directory.

- `node scraper.js` runs the full scrape and replaces `../data/recipes.json` with the discovered recipe collection.
- `npm run refresh-nutrition` adds nutrition data to unambiguous title matches in the existing collection. It preserves existing recipe fields and IDs, skips missing or ambiguous matches, writes atomically, and creates a timestamped backup before replacing the JSON file.

The nutrition refresh reads Delish's Recipe structured data. It does not estimate nutrition for recipes whose source does not provide it.
