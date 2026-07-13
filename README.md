# jsonfeed-to-rss

[![npm version][npm-badge]][npm] [![build status][ci-badge]][ci] [![downloads][downloads-badge]][downloads] [![neostandard JavaScript style][style-badge]][style]

Convert a [JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/) document to RSS 2.0.
JSON Feed 1.0 and non-standard version URLs are rejected.

The converter supports current Apple Podcasts RSS metadata, all 31 active [Podcasting 2.0 namespace](https://podcastindex.org/namespace/1.0) tags, Dublin Core author names, and `content:encoded` HTML.
See the cited [podcast specification support matrix](PODCAST-SPEC.md) for the exact upstream revision, tag coverage, and Apple sources.

![JSON Feed icon](/reference/icon.png)

## Installation

This package is ESM-only and requires Node.js 20.19 or newer.
See the [migration guide](MIGRATION.md) when upgrading from the CommonJS and JSON Feed 1.0 release.

```console
npm install jsonfeed-to-rss
```

## Usage

```js
import jsonfeedToRSS from 'jsonfeed-to-rss'
import feed from './feed.json' with { type: 'json' }

const rss = jsonfeedToRSS(feed)
```

The input must include the exact JSON Feed 1.1 version URL plus `title`, `home_page_url`, and `feed_url`.

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Example feed",
  "home_page_url": "https://example.com",
  "feed_url": "https://example.com/feed.json",
  "authors": [{ "name": "Example Author" }],
  "items": []
}
```

The default export returns an RSS XML string.
The lower-level object representation is also available as an open deep import.

```js
import jsonfeedToRSSObject from 'jsonfeed-to-rss/jsonfeed-to-rss-object.js'
```

## Options

```js
const options = {
  feedURLFn: (feedURL, jsonFeed) => feedURL.replace(/\.json\b/, '-rss.xml'),
  language: 'en-US',
  copyright: '© 2026 Example Author',
  managingEditor: 'editor@example.com',
  webMaster: 'webmaster@example.com',
  idIsPermalink: false,
  category: ['Technology'],
  ttl: 60,
  skipHours: [0, 1],
  skipDays: ['Saturday', 'Sunday'],
  itunes: true,
  podcast: true,
  legacyITunesTags: false
}

const rss = jsonfeedToRSS(feed, options)
```

`itunes` defaults to `true` when the feed has a top-level `_itunes` object.
An object supplied as `itunes` is merged over the feed-level `_itunes` data.
`podcast` defaults to `true` when the feed or any item has a `_podcast` object.

## Apple Podcasts

Put Apple-specific metadata in `_itunes`.
Enabling Apple mode validates the show metadata and enclosure fields that Apple requires.

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "Example podcast",
  "home_page_url": "https://example.com/show",
  "feed_url": "https://example.com/feed.json",
  "description": "A show about practical examples.",
  "authors": [{ "name": "Example Host" }],
  "_itunes": {
    "image": "https://example.com/show-3000x3000.jpg",
    "explicit": false,
    "type": "episodic",
    "categories": [
      { "category": "Technology" },
      { "category": "Education", "subcategory": "How To" }
    ]
  },
  "items": [
    {
      "id": "episode-1",
      "title": "A useful episode",
      "content_text": "Episode notes.",
      "_itunes": {
        "episode": 1,
        "explicit": false
      },
      "attachments": [
        {
          "url": "https://example.com/episode-1.mp3",
          "mime_type": "audio/mpeg",
          "size_in_bytes": 123456,
          "duration_in_seconds": 600
        }
      ]
    }
  ]
}
```

The current profile emits supported `itunes:title`, `itunes:author`, `itunes:type`, `itunes:image`, `itunes:category`, `itunes:explicit`, episode numbering, duration, block, completion, and feed-move metadata when applicable.
Descriptions are truncated to Apple's 4,000-byte limit without splitting Unicode code points.
Categories are validated against [Apple's current category list](https://podcasters.apple.com/support/1691-apple-podcasts-categories), and up to two category and subcategory pairs are supported.
Show artwork must be supplied as `_itunes.image`; the smaller JSON Feed `icon` is not used as an Apple artwork fallback.
Every podcast enclosure must include `url`, `mime_type`, and `size_in_bytes`.
Serial podcasts must give each attached episode a positive `_itunes.episode` number.

Apple no longer supports `itunes:owner`, and its current reference no longer includes `itunes:summary`, `itunes:subtitle`, item-level `itunes:author`, or `itunes:isClosedCaptioned`.
Set `legacyITunesTags: true` only when another consumer still needs those historical tags.
See [PODCAST-SPEC.md](PODCAST-SPEC.md) for the full Apple behavior and source URLs.

## Podcasting 2.0

Put Podcasting 2.0 data in `_podcast` at channel or item level.
The namespace is inferred automatically, or it can be enabled explicitly with `podcast: true`.

```json
{
  "_podcast": {
    "guid": "917393e3-1b1e-5cef-ace4-edaa54e1f810",
    "medium": "podcast",
    "people": [
      {
        "name": "Example Host",
        "role": "host",
        "group": "cast"
      }
    ],
    "funding": [
      {
        "url": "https://example.com/support",
        "label": "Support the show"
      }
    ]
  },
  "items": [
    {
      "id": "episode-1",
      "title": "A useful episode",
      "_podcast": {
        "transcripts": [
          {
            "url": "https://example.com/episode-1.vtt",
            "type": "text/vtt",
            "language": "en-US",
            "rel": "captions"
          }
        ],
        "chapters": {
          "url": "https://example.com/episode-1-chapters.json",
          "type": "application/json+chapters"
        }
      }
    }
  ]
}
```

All 31 active namespace tags are supported, including nested alternate-enclosure sources and integrity, value recipients and time splits, remote items, live items, transcripts, chapters, people, chat, social interactions, and modern image metadata.
The deprecated `podcast:images` tag is intentionally not emitted; use the singular `podcast:image` model through the `images` array.
JSON Feed authors become `podcast:person` entries when no explicit people array is supplied.
The complete input model and direct source link for every tag are documented in [PODCAST-SPEC.md](PODCAST-SPEC.md).

## TypeScript and editor types

The runtime remains JavaScript checked with strict TypeScript through JSDoc.
The package publishes declarations generated from the vendored SchemaStore JSON Feed 1.1 schema and the local podcast extension schema with [`json-schema-to-typescript`](https://github.com/bcherny/json-schema-to-typescript).

```ts
import type {
  Attachment,
  ITunesChannelData,
  Item,
  JSONFeed,
  JSONFeedWithExtensions,
  JsonFeedToRSSOptions,
  PodcastChannelData,
  PodcastItemData
} from 'jsonfeed-to-rss/types.js'
```

The package intentionally has no export map, so published deep imports remain open.
Include `.js` in ESM subpath imports.

## Field mappings

The first item attachment becomes the RSS enclosure.
`item.content_html` becomes a CDATA-encoded `content:encoded` node.
`item.content_text`, or readable plain text derived from `content_html`, becomes the RSS description.
`item.authors[0].name` falls back to `feed.authors[0].name` for `dc:creator`.
The deprecated singular JSON Feed `author` field remains a compatibility fallback, but `authors` takes precedence.

## Development

```console
npm test
npm run build
npm pack --dry-run
```

`npm run build:json-feed-types` regenerates `lib/json-feed-types.d.ts` and `lib/podcast-types.d.ts`.
The contributor workflow and spec-refresh checklist are in [PODCAST-SPEC.md](PODCAST-SPEC.md).

## Related projects

- [bcomnes/jsonfeed-to-atom](https://github.com/bcomnes/jsonfeed-to-atom)
- [bcomnes/generate-feed](https://github.com/bcomnes/generate-feed)

## Reference fixtures

- [Complete Podcasting 2.0 JSON Feed fixture](snapshots/podcast-namespace-feed.json)
- [Apple podcast JSON Feed fixture](snapshots/podcast-feed.json)
- [Apple podcast RSS fixture](snapshots/podcast-feed-rss.xml)
- [RSS conversion fixture](snapshots/extended-feed-rss.xml)

## License

[MIT](https://tldrlegal.com/license/mit-license)

[npm-badge]: https://img.shields.io/npm/v/jsonfeed-to-rss.svg?style=flat-square
[npm]: https://npmjs.org/package/jsonfeed-to-rss
[ci-badge]: https://github.com/bcomnes/jsonfeed-to-rss/actions/workflows/tests.yml/badge.svg
[ci]: https://github.com/bcomnes/jsonfeed-to-rss/actions/workflows/tests.yml
[downloads-badge]: http://img.shields.io/npm/dm/jsonfeed-to-rss.svg?style=flat-square
[downloads]: https://npmtrends.com/jsonfeed-to-rss
[style-badge]: https://img.shields.io/badge/code%20style-neostandard-brightgreen.svg?style=flat-square
[style]: https://github.com/neostandard/neostandard
