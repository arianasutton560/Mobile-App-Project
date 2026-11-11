# Recipe Pairing Review Catalog Plan

**Goal:** Export recommendation candidates for the local recipe collection into a reviewable file keyed by recipe IDs.

**Architecture:** Use the existing deterministic recommendation engine and its category rules to create candidate groups. Write the result as a pending CSV that stays outside the app runtime until recommendations are reviewed and approved.

**Tech Stack:** Node.js, existing recipe JSON, current recommendation helper.

**Spec:** `docs/superpowers/specs/2026-11-11-recipe-pairing-recommendations-design.md`

## Tasks

1. Add a script that formats local recipe records for the existing recommender and exports each source recipe/group with up to three candidate IDs and titles.
2. Mark every row `PENDING`; prevent accidental overwrite of an existing review file unless `--force` is passed.
3. Generate the initial review file and confirm every recipe is represented and every candidate ID belongs to the local collection.
4. Keep the review export disconnected from app rendering until the user reviews and approves it.

## Regeneration

Run `node scripts/generate-recipe-pairing-review.mjs` to create the review CSV. The script will stop if the CSV already exists; pass `--force` only when intentionally replacing the review file.
