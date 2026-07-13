# Contributing

## Releasing

Changelog generation and releases are automated with npm scripts and GitHub Actions.

- Open the Actions tab.
- Select the `Version and Release` action.
- Trigger the action and choose the semantic version bump.
- The action updates the changelog, creates the GitHub release, and publishes to npm.

For a local release, ensure the working tree is clean, run `npm version {patch, minor, major}`, and then run `npm publish`.

## Guidelines

- Patches, ideas, and changes are welcome.
- Keep changes consistent with the existing style.
- Add tests for new behavior and code paths.
- Run `npm test` before opening a pull request.
- Aim for complete test coverage.
