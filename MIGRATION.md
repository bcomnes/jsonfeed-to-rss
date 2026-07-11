# Migrating to the next major release

The next major release of `jsonfeed-to-rss` moves the package to ESM and accepts JSON Feed 1.1 inputs only.
Most callers only need to update their import and the `version` and `authors` fields in the feed object.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer when installing or publishing the package
- An ESM application, or a CommonJS application that loads the package with dynamic `import()`

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

## TypeScript and editor types

The package now publishes TypeScript declarations generated from the SchemaStore JSON Feed 1.1 schema.
The generated input type restricts `version` to `https://jsonfeed.org/version/1.1` and includes the 1.1 `authors` and `language` fields.

The converter additionally requires `feed_url` and `home_page_url` because both values are needed to create the RSS channel and self link.

Schema and converter input types can be imported from the open type module:

```ts
import type {
  JSONFeed,
  JSONFeedWithExtensions,
  JsonFeedToRSSOptions
} from 'jsonfeed-to-rss/types.js'
```

No TypeScript configuration changes should be necessary for consumers already using Node.js ESM resolution.
If TypeScript cannot resolve the package, use a current `node16`, `nodenext`, or `bundler` module resolution mode.

## Options and iTunes extensions

The `jsonfeedToRSS(feed, options)` signature is unchanged.
Existing options such as `feedURLFn`, `copyright`, `category`, `ttl`, and `itunes` continue to work.

The `_itunes` extension format is also unchanged.
Feed-level and item-level author fallbacks now prefer `authors[0].name` before the deprecated `author.name` field.

## Direct object conversion

Code that imports the lower-level object converter should include the file extension:

```js
import jsonfeedToRSSObject from 'jsonfeed-to-rss/jsonfeed-to-rss-object.js'
```

The package intentionally does not define an export map, so published deep imports remain open.
Only the documented entry points are considered part of the supported public API.

## Release impact

This migration changes the module format, minimum Node.js version, and accepted JSON Feed version.
It should therefore be adopted as a major-version upgrade.
