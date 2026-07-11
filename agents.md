# Agent Guidelines

- Write Markdown prose with one sentence per line so git diffs stay focused and readable.
- Never use inline type imports.
- Always favor `@import` syntax at the top of JavaScript files for JSDoc types.
- Do not leave declaration-build outputs in the working tree.
- Keep the generated `lib/json-feed-types.d.ts` file in sync with the vendored SchemaStore schemas.
- Run `npm test` after code changes.
