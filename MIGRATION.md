# Migrating to the next major release

The next major release of `jsonfeed-to-rss` moves the package to ESM, raises the minimum Node.js version, and accepts JSON Feed 1.1 inputs only.
Most applications need to update their import syntax, feed version, and author fields.

## Changes at a glance

| Before | After | Migration action |
| --- | --- | --- |
| CommonJS package | ESM-only package | Replace `require()` with `import`, or use dynamic `import()` from CommonJS. |
| Older Node.js releases | Node.js 20.19 or newer | Upgrade the application runtime before updating the package. |
| JSON Feed 1.0 | JSON Feed 1.1 only | Set the exact 1.1 version URL and update deprecated fields. |
| `author` as the primary author field | `authors[0]` takes precedence | Publish an `authors` array at feed and item level. |
| Inferred converter types only | Public schema and converter types | Import types from `jsonfeed-to-rss/types.js`. |
| Extensionless mapped subpaths | Open published deep imports | Include `.js` in ESM deep-import specifiers. |
| HTML tags removed with minimal processing | Readable plain-text conversion | Review snapshots if consumers compare generated RSS strings exactly. |

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer when installing or publishing the package
- An ESM application, or a CommonJS application that loads the package with dynamic `import()`

Repository contributors use a newer development toolchain than package consumers.
The repository's `devEngines` currently require Node.js 24 and npm 11 for development and release commands.

## Move from `require()` to `import`

The package no longer exposes a CommonJS entry point.

Before:

```js
const jsonfeedToRSS = require('jsonfeed-to-rss')
```

After:

```js
import jsonfeedToRSS from 'jsonfeed-to-rss'
```

The named export is also available:

```js
import { jsonfeedToRSS } from 'jsonfeed-to-rss'
```

If the calling application still uses CommonJS, load the package asynchronously:

```js
async function convertFeed (feed, options) {
  const { default: jsonfeedToRSS } = await import('jsonfeed-to-rss')
  return jsonfeedToRSS(feed, options)
}
```

Any CommonJS function that calls the converter must now be asynchronous or receive the imported function from another module.

## Update feeds to JSON Feed 1.1

The converter now requires the exact JSON Feed 1.1 version URL.
Missing versions, JSON Feed 1.0, and custom version URLs are rejected.

Before:

```json
{
  "version": "https://jsonfeed.org/version/1",
  "title": "Example feed",
  "home_page_url": "https://example.com",
  "feed_url": "https://example.com/feed.json",
  "author": {
    "name": "Example Author"
  },
  "items": []
}
```

After:

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Example feed",
  "home_page_url": "https://example.com",
  "feed_url": "https://example.com/feed.json",
  "language": "en-US",
  "authors": [
    {
      "name": "Example Author"
    }
  ],
  "items": []
}
```

JSON Feed 1.1 deprecates the singular `author` field in favor of `authors`.
The converter still accepts `author` as a compatibility fallback, but prefers the first entry in `authors` when both fields are present.
The same precedence applies to item authors.

The 1.1 `language` field becomes the default RSS channel language when the `language` option is not supplied.

The converter continues to require `title`, `feed_url`, and `home_page_url` because they are needed to create the RSS channel and self link.
Validation failures now explicitly report that JSON Feed 1.1 is required or identify the missing property.

## TypeScript and editor types

The runtime source remains JavaScript and is checked in strict TypeScript mode through JSDoc.
Published declarations are generated during the package build.

The JSON Feed input types are generated from the vendored SchemaStore JSON Feed 1.1 schema with `json-schema-to-typescript`.
The generated `JSONFeed` type restricts `version` to `https://jsonfeed.org/version/1.1` and includes the 1.1 `authors` and `language` fields.

Schema and converter input types are available from the open type module:

```ts
import type {
  Attachment,
  Author,
  Item,
  JSONFeed,
  JSONFeedWithExtensions,
  JsonFeedToRSSOptions
} from 'jsonfeed-to-rss/types.js'
```

Use `JSONFeed` when working with the format itself.
Use `JSONFeedWithExtensions` when passing a value to the converter because it requires `feed_url` and `home_page_url` and supports the `_itunes` extension.

No TypeScript configuration changes should be necessary for consumers already using modern Node.js ESM resolution.
If TypeScript cannot resolve the package, use a current `node16`, `nodenext`, or `bundler` module resolution mode.

## Options and iTunes extensions

The `jsonfeedToRSS(feed, options)` signature is unchanged.
Existing options such as `feedURLFn`, `copyright`, `category`, `ttl`, and `itunes` continue to work.

The `_itunes` extension format is also unchanged.
Feed-level and item-level author fallbacks now prefer `authors[0].name` before the deprecated `author.name` field.

When an object is supplied through the `itunes` option, its fields override feed-level `_itunes` fields.
Nested owner fields are merged so an override can replace the email without discarding the existing owner name.

## Direct and deep imports

Code that imports the lower-level object converter must include the file extension:

```js
import jsonfeedToRSSObject from 'jsonfeed-to-rss/jsonfeed-to-rss-object.js'
```

The package intentionally does not define an export map, so files included in the published package remain available to deep imports.
Only the root entry point, `types.js`, and `jsonfeed-to-rss-object.js` are documented public entry points.
Other deep imports are open for compatibility but are not guaranteed to remain stable.

## Generated RSS differences

The original `content_html` value is still written to `content:encoded` as CDATA.
The fallback RSS `description`, generated title, and iTunes summary fields now use `html-to-text` when plain text is not supplied.

This change decodes HTML character references instead of emitting strings such as `&amp;#8220;`.
It also preserves readable boundaries for paragraphs, headings, lists, and blockquotes while removing images and link destinations.

Applications that compare complete RSS strings or store golden snapshots should review and update expected description text.
Consumers that parse RSS as XML should see equivalent structure with more accurate plain text.

XML serialization now uses `xmlbuilder2` instead of the maintenance-only `xmlbuilder` package.
The converter's existing RSS fixtures remain well-formed and preserve the established element and CDATA structure.

If `content_html` can contain the literal CDATA closing sequence `]]>`, test that input before upgrading.
`xmlbuilder2` 4.0.3 rejects that sequence instead of splitting it automatically, unlike the previous serializer.

## Dependency and tooling changes

The removal of `lodash.get`, `lodash.merge`, and `clean-deep` does not require application changes.
Their narrowly used behavior is now implemented with modern JavaScript and local helpers.

The test, lint, coverage, declaration, CI, and release tooling changes affect contributors rather than runtime consumers.
The repository now uses `node:test`, Neostandard, Node's built-in coverage, JSDoc declaration emission, and the current ESM-template release workflow.

## Upgrade checklist

1. Upgrade production to Node.js 20.19 or newer.
2. Replace synchronous `require()` calls with ESM imports or asynchronous dynamic imports.
3. Change the feed version to `https://jsonfeed.org/version/1.1`.
4. Add `authors` arrays and keep `author` only when older readers still need it.
5. Confirm every feed has `title`, `feed_url`, and `home_page_url`.
6. Add `.js` to documented deep-import specifiers.
7. Update type imports to use `jsonfeed-to-rss/types.js` where useful.
8. Review RSS snapshots for decoded entities and more readable plain-text formatting.
9. Test any HTML content that may contain `]]>`.
10. Run the application's complete feed-generation and RSS-consumer tests before deploying.

## Release impact

The module-format, runtime, and accepted-input changes are intentionally breaking.
This work should ship as a new major version even though the converter function and option shape remain familiar.
