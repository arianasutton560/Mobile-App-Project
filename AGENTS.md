# Repository Guidelines

## Project Structure & Module Organization

Keep application code in `src/`, grouped by feature or platform rather than by a single growing file. Place automated tests in `tests/` or beside the code they cover using a `*.test.*` or `*.spec.*` suffix. Store static images, fonts, and other bundled resources in `assets/`. Keep configuration files at the repository root and document any non-obvious environment variables in `.env.example` (never commit real secrets).

This repository is currently a starter workspace. Update this guide when the app framework, package manager, or module layout is introduced.

## Build, Test, and Development Commands

Add the project's canonical commands to its package manifest or build file, then keep this section current. A typical JavaScript/TypeScript project uses:

```sh
npm install       # install dependencies
npm run dev       # run the local development server
npm test          # execute the automated test suite
npm run build     # create a production build
```

Do not introduce alternate commands without documenting their purpose. Run the relevant formatter, linter, tests, and production build before opening a pull request.

## Coding Style & Naming Conventions

Use the formatter and linter selected for the project; avoid manual formatting that conflicts with them. Prefer two-space indentation for JSON, YAML, and JavaScript/TypeScript unless the toolchain specifies otherwise. Use `PascalCase` for components and classes, `camelCase` for functions and variables, and `kebab-case` for directories and non-code assets. Keep modules focused and use descriptive names such as `user-profile.ts` rather than `utils.ts`.

## Testing Guidelines

Add or update tests with every behavior change. Name tests for observable behavior, for example `user-profile.test.ts` or `renders the saved profile`. Keep tests deterministic: mock network calls and avoid reliance on time, device state, or external accounts.

## Commit & Pull Request Guidelines

Use concise imperative commits, such as `Add profile validation` or `Fix offline sync`. Keep commits narrowly scoped. Pull requests should explain the change, list validation performed, link the related issue when applicable, and include screenshots or recordings for visible UI changes.
