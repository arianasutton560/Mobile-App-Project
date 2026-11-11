"""Generate bundled Spanish recipe and ingredient translations with Argos Translate.

The Argos package and English-to-Spanish model are local authoring tools. They
are not imported by the React Native app and no translation requests run at
runtime. To regenerate the data, install `argostranslate` with pip and run
`python scripts/generate-spanish-translations.py`; the script downloads the
open-source model into the ignored `.translation-tools/` cache when needed.
"""

import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TOOL_ROOT = ROOT / ".translation-tools"
os.environ.setdefault("XDG_CONFIG_HOME", str(TOOL_ROOT / "config"))
os.environ.setdefault("XDG_DATA_HOME", str(TOOL_ROOT / "data"))
os.environ.setdefault("XDG_CACHE_HOME", str(TOOL_ROOT / "cache"))

import argostranslate.package
import argostranslate.translate

RECIPES_PATH = ROOT / "data" / "recipes.json"
RECIPE_OUTPUT = ROOT / "data" / "recipeTranslations.es.json"
INGREDIENT_OUTPUT = ROOT / "data" / "ingredientNames.es.json"
INGREDIENT_SCREEN = ROOT / "screens" / "WhatCanIMake.js"
NUMBER_PATTERN = re.compile(r"(?<![\w])\d+(?:[.,]\d+)?(?![\w])")
GROUP_PATTERN = re.compile(
    r"\{\s*label:\s*'([^']+)',\s*ingredients:\s*\[([\s\S]*?)\]\s*,?\s*\}",
    re.MULTILINE,
)
STRING_PATTERN = re.compile(r"'((?:\\'|[^'])*)'")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def protect_numbers(value):
    markers = []

    def replace(match):
        marker = f"ZXQNUM{len(markers)}QXZ"
        markers.append((marker, match.group(0)))
        return marker

    return NUMBER_PATTERN.sub(replace, value), markers


def translate_value(value, translator, cache):
    if not isinstance(value, str) or not value.strip():
        return value
    if value in cache:
        return cache[value]

    protected, markers = protect_numbers(value)
    result = translator.translate(protected)
    for marker, number in markers:
        if marker not in result:
            # A translation that loses a protected quantity is rejected.
            return value
        result = result.replace(marker, number)

    cache[value] = result
    return result


def translate_time(value, translator, cache):
    translated = translate_value(value, translator, cache)
    if not isinstance(translated, str):
        return translated
    translated = re.sub(r"\bhrs?\b", "h", translated, flags=re.IGNORECASE)
    translated = re.sub(r"\bhr(?=\s|\d|$)", "h ", translated, flags=re.IGNORECASE)
    translated = re.sub(r"\bmins?\b", "min", translated, flags=re.IGNORECASE)
    translated = re.sub(r"\s+h\s+0\s*min\b", " h", translated, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", translated).strip()


def translate_servings(value, translator, cache):
    if not isinstance(value, str):
        return value
    match = re.fullmatch(
        r"\s*(\d+(?:\s*[-–]\s*\d+)?)\s*serving\(s\)\s*",
        value,
        re.IGNORECASE,
    )
    if match:
        return f"{match.group(1).replace(' - ', '–').replace(' -', '–').replace('- ', '–')} porciones"
    return translate_value(value, translator, cache)


def ingredient_catalog():
    source = INGREDIENT_SCREEN.read_text(encoding="utf-8")
    groups = list(GROUP_PATTERN.finditer(source))
    if not groups:
        raise RuntimeError("Could not read ingredient groups from WhatCanIMake.js")
    labels = []
    ingredients = []
    for group in groups:
        labels.append(group.group(1))
        ingredients.extend(item.replace("\\'", "'") for item in STRING_PATTERN.findall(group.group(2)))
    return list(dict.fromkeys(labels + ingredients))


def main():
    translator = argostranslate.translate.get_translation_from_codes("en", "es")
    if translator is None:
        argostranslate.package.update_package_index()
        model = next(
            (
                package
                for package in argostranslate.package.get_available_packages()
                if package.from_code == "en" and package.to_code == "es"
            ),
            None,
        )
        if model is None:
            raise RuntimeError("Argos does not list an English-to-Spanish model.")
        argostranslate.package.install_from_path(model.download())
        translator = argostranslate.translate.get_translation_from_codes("en", "es")
        if translator is None:
            raise RuntimeError("Could not install the English-to-Spanish Argos model.")

    source_recipes = read_json(RECIPES_PATH)
    translation_cache = {}
    output = {}

    for index, recipe in enumerate(source_recipes, start=1):
        translation = {
            "title": translate_value(recipe.get("name", ""), translator, translation_cache),
            "description": translate_value(recipe.get("description", ""), translator, translation_cache),
            "prepTime": translate_time(recipe.get("prepTime", ""), translator, translation_cache),
            "cookTime": translate_time(recipe.get("cookTime", ""), translator, translation_cache),
            "servings": translate_servings(recipe.get("servings", ""), translator, translation_cache),
            "ingredients": [
                translate_value(item, translator, translation_cache)
                for item in recipe.get("ingredients", [])
            ],
            "instructions": [
                translate_value(item, translator, translation_cache)
                for item in recipe.get("instructions", [])
            ],
            "videoTitles": [
                translate_value(video.get("title", ""), translator, translation_cache)
                for video in recipe.get("videos", [])
            ],
        }
        serving_size = (recipe.get("nutrition") or {}).get("servingSize")
        if serving_size:
            translation["servingSize"] = translate_value(
                serving_size, translator, translation_cache
            )
        output[str(recipe["id"])] = translation

        if index % 100 == 0 or index == len(source_recipes):
            print(f"Translated {index}/{len(source_recipes)} recipes", flush=True)

    ingredients = ingredient_catalog()
    ingredient_translations = {
        source: translate_value(source, translator, translation_cache)
        for source in ingredients
    }

    RECIPE_OUTPUT.write_text(
        json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    INGREDIENT_OUTPUT.write_text(
        json.dumps(ingredient_translations, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(output)} recipe translations and {len(ingredients)} ingredient labels")


if __name__ == "__main__":
    main()
