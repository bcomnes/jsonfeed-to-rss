---
name: migrate-jsonfeed-to-rss
description: Migrate an application from an older jsonfeed-to-rss release to the next ESM-only major version. Use when Codex needs to upgrade jsonfeed-to-rss, replace CommonJS imports, update JSON Feed 1.0 inputs to 1.1, adopt generated TypeScript types, migrate historical Apple Podcasts metadata, add Podcasting 2.0 tags, repair deep imports, or validate changed RSS output.
---

# Migrate jsonfeed-to-rss consumers

Upgrade a consuming application while preserving its intended feed behavior.
Read the target release's `MIGRATION.md` and `PODCAST-SPEC.md` before editing.

## Establish the baseline

1. Read the consuming repository's instructions.
2. Identify its package manager, installed package version, Node.js support, module format, TypeScript configuration, test commands, and snapshot policy.
3. Search source, fixtures, and generated-feed jobs for `jsonfeed-to-rss`, `jsonfeed-to-rss-object`, `require(`, JSON Feed version URLs, singular `author` fields, `_itunes`, `_podcast`, and RSS snapshots.
4. Run the relevant existing tests before editing when practical.
5. Inventory downstream RSS consumers before removing historical Apple tags.

Do not widen the work into an application-wide ESM conversion unless requested.
Do not invent missing podcast artwork, categories, enclosure sizes, ownership addresses, GUIDs, or payment recipients.

## Update the runtime and imports

Require Node.js 20.19 or newer wherever the application declares or tests its production runtime.
Replace a CommonJS load with an ESM import when the caller is ESM:

```js
import jsonfeedToRSS from 'jsonfeed-to-rss'
```

Use asynchronous dynamic import when a CommonJS caller must remain CommonJS:

```js
const { default: jsonfeedToRSS } = await import('jsonfeed-to-rss')
```

Update lower-level imports to include the file extension:

```js
import jsonfeedToRSSObject from 'jsonfeed-to-rss/jsonfeed-to-rss-object.js'
```

The package intentionally omits an export map.
Treat the root entry point, `types.js`, and `jsonfeed-to-rss-object.js` as the documented public entry points.

## Migrate inputs to JSON Feed 1.1

- Set every converter input to exactly `https://jsonfeed.org/version/1.1`.
- Replace feed-level and item-level singular `author` data with `authors` arrays.
- Keep singular `author` only when the same feed must support older readers.
- Ensure every converter input has `title`, `feed_url`, and `home_page_url`.
- Preserve or add `language` when the feed should set the RSS channel language.
- Update builders, fixtures, schemas, and tests instead of changing only examples.
- Add a rejection test for JSON Feed 1.0 when the application validates converter inputs at its boundary.

## Migrate Apple Podcasts metadata

Apple mode now validates current required metadata.
For every Apple feed:

1. Add a non-empty show `description`.
2. Add `_itunes.image` with qualifying show artwork instead of relying on JSON Feed `icon`.
3. Add a boolean `_itunes.explicit`.
4. Replace obsolete category names with entries from Apple's current category list.
5. Prefer the two-pair `_itunes.categories` shape.
6. Ensure at least one item has an attachment.
7. Ensure each podcast attachment has `url`, `mime_type`, and `size_in_bytes`.
8. Make episode and season numbers positive integers.
9. Give every attached episode in a serial show an episode number.

Use the current category shape:

```json
{
  "_itunes": {
    "image": "https://example.com/show-3000x3000.jpg",
    "explicit": false,
    "categories": [
      { "category": "Technology" },
      { "category": "Education", "subcategory": "How To" }
    ]
  }
}
```

Expect `itunes:explicit` to contain `true` or `false`.
Expect descriptions to be limited to 4,000 UTF-8 bytes without splitting a Unicode code point.
Expect `itunes:new-feed-url` to preserve the supplied destination URL instead of applying `feedURLFn`.

The current profile omits unsupported historical `itunes:owner`, `itunes:summary`, `itunes:subtitle`, item-level `itunes:author`, and `itunes:isClosedCaptioned`.
Enable `legacyITunesTags: true` only when a known non-Apple consumer still requires them.
Plan to remove that compatibility option after downstream consumers migrate.

## Add Podcasting 2.0 features

Use `_podcast` on the channel or item.
The converter infers namespace output from those objects, or accepts `podcast: true`.

Use the generated types:

```ts
import type {
  ITunesChannelData,
  JSONFeedWithExtensions,
  JsonFeedToRSSOptions,
  PodcastChannelData,
  PodcastItemData
} from 'jsonfeed-to-rss/types.js'
```

Start with small, verifiable features such as a stable channel GUID, medium, people, transcript, or chapters.
Use the complete support matrix in `PODCAST-SPEC.md` before constructing nested alternate enclosures, values, remote items, live items, chat, social interactions, or image metadata.
Use the singular active `podcast:image` model through the JSON `images` array.
Do not add the deprecated `podcast:images` tag.
Use a UUIDv5 for `_podcast.guid`.
Keep value recipients, splits, remote items, and live-item fallback links grounded in real application data.

## Review output-sensitive changes

- Review RSS descriptions and generated titles derived from `content_html`.
- Expect HTML character references to decode and block elements to produce readable plain-text boundaries.
- Review Apple tag removals, boolean values, categories, and feed-move URLs.
- Review the new `xmlns:podcast` declaration and namespace elements.
- Review snapshots semantically before regenerating them.
- Parse representative output as XML in addition to comparing strings.
- Test content containing the literal CDATA terminator `]]>` when such input is possible.
- Treat rejection of `]]>` as an xmlbuilder2 compatibility limitation rather than silently changing input.

## Validate the migration

1. Run focused tests for ESM imports, JSON Feed version rejection, author precedence, required URLs, and public type imports.
2. Validate representative `_itunes` and `_podcast` objects against the published types or schema.
3. Test current Apple requirements and every Podcasting 2.0 structure the application uses.
4. Parse representative output and inspect changed XML semantically.
5. Run the application's complete test, lint, and typecheck commands.
6. Test on Node.js 20 when the repository supports a runtime matrix.
7. Inspect the dependency and lockfile diff for unrelated upgrades.
8. Confirm deprecated version URLs and unintended singular-author builders are gone.
9. Confirm historical Apple tags remain only where `legacyITunesTags` is an intentional temporary bridge.

When handing off, separate required source changes from snapshot updates.
Call out unresolved domain data and any output changes that downstream feed consumers must review.
