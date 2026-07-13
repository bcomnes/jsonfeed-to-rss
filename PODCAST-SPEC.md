# Podcast specification support

`jsonfeed-to-rss` supports Apple Podcasts RSS metadata and all active tags in the Podcasting 2.0 namespace.
Apple-specific input belongs in `_itunes`, while open Podcasting 2.0 input belongs in `_podcast`.

## Audited sources

The Podcasting 2.0 implementation was audited on July 12, 2026 against [`Podcastindex-org/podcast-namespace` commit `c0ff5caa3729610362ee93f8034454fa41f3c493`](https://github.com/Podcastindex-org/podcast-namespace/tree/c0ff5caa3729610362ee93f8034454fa41f3c493).
The canonical namespace URL is [`https://podcastindex.org/namespace/1.0`](https://podcastindex.org/namespace/1.0).
The locked tag index is the [Podcasting 2.0 namespace specification](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/1.0.md).

Apple behavior was audited against these current sources:

- [Podcast RSS feed requirements](https://podcasters.apple.com/support/823-podcast-requirements)
- [Validate your podcast RSS feed](https://podcasters.apple.com/support/829-validate-your-podcast)
- [Explicit content on Apple Podcasts](https://podcasters.apple.com/support/5440-explicit-content)
- [Apple Podcasts categories](https://podcasters.apple.com/support/1691-apple-podcasts-categories)
- [Show Cover requirements](https://podcasters.apple.com/support/5514-show-cover-template)
- [Episode Art requirements](https://podcasters.apple.com/support/5516-episode-art-template)
- [Transcripts on Apple Podcasts](https://podcasters.apple.com/support/5316-transcripts-on-apple-podcasts)
- [Chapters on Apple Podcasts](https://podcasters.apple.com/support/5482-using-chapters-on-apple-podcasts)
- [Technical updates for hosting providers](https://podcasters.apple.com/4115-technical-updates-for-hosting-providers)
- [Change the RSS feed URL](https://podcasters.apple.com/support/837-change-the-rss-feed-url)

## Apple Podcasts behavior

Podcast mode validates the Apple-required show metadata, at least one attached episode, and complete enclosure attributes.
`itunes:explicit` uses the current `true` and `false` values.
Show and episode artwork URLs should point to square PNG or JPEG files between 1400 and 3000 pixels without transparency, with 3000 pixels preferred.
Descriptions are truncated without splitting a Unicode code point and never exceed Apple's 4000-byte limit.
Episode and season numbers must be positive integers, and serial shows require an episode number for every attached episode.
Apple allows two category and subcategory pairs, which are validated against the current category list.

The current Apple profile emits these channel tags when applicable:

- `itunes:title`
- `itunes:author`
- `itunes:image`
- `itunes:category`
- `itunes:explicit`
- `itunes:type`
- `itunes:new-feed-url`
- `itunes:block`
- `itunes:complete`

The current Apple profile emits these item tags when applicable:

- `itunes:title`
- `itunes:image`
- `itunes:explicit`
- `itunes:duration`
- `itunes:episode`
- `itunes:season`
- `itunes:episodeType`
- `itunes:block`

Apple no longer supports `itunes:owner`, and the current tag reference no longer includes `itunes:subtitle`, `itunes:summary`, item-level `itunes:author`, or `itunes:isClosedCaptioned`.
Set `legacyITunesTags: true` to preserve those historical tags for clients that still consume them.
Use [`podcast:transcript`](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/transcript.md) with `rel="captions"` instead of `itunes:isClosedCaptioned`.

## Podcasting 2.0 support matrix

The deprecated [`podcast:images`](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/images-%28deprecated%29.md) tag is intentionally not emitted.

| Tag | Parent | JSON property | Specification URL |
| --- | --- | --- | --- |
| `podcast:alternateEnclosure` | item, live item | `alternate_enclosures` | [Alternate Enclosure](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/alternate-enclosure.md) |
| `podcast:block` | channel | `blocks` | [Block](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/block.md) |
| `podcast:chapters` | item | `chapters` | [Chapters](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/chapters.md) |
| `podcast:chat` | channel, item, live item | `chat` | [Chat](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/chat.md) |
| `podcast:contentLink` | item, live item | `content_links` | [Content Link](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/content-link.md) |
| `podcast:episode` | item | `episode` | [Episode](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/episode.md) |
| `podcast:funding` | channel, item, live item | `funding` | [Funding](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/funding.md) |
| `podcast:guid` | channel | `guid` | [GUID](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/guid.md) |
| `podcast:image` | channel, item, live item | `images` | [Image](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/image.md) |
| `podcast:integrity` | alternate enclosure | `integrity` | [Integrity](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/integrity.md) |
| `podcast:license` | channel, item | `license` | [License](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/license.md) |
| `podcast:liveItem` | channel | `live_items` | [Live Item](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/live-item.md) |
| `podcast:location` | channel, item, live item | `locations` | [Location](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/location.md) |
| `podcast:locked` | channel | `locked` | [Locked](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/locked.md) |
| `podcast:medium` | channel | `medium` | [Medium](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/medium.md) |
| `podcast:person` | channel, item, live item | `people` | [Person](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/person.md) |
| `podcast:podping` | channel | `podping` | [Podping](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/podping.md) |
| `podcast:podroll` | channel | `podroll` | [Podroll](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/podroll.md) |
| `podcast:publisher` | channel | `publisher` | [Publisher](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/publisher.md) |
| `podcast:remoteItem` | channel and nested parents | `remote_items`, `podroll`, `publisher`, `remote_item` | [Remote Item](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/remote-item.md) |
| `podcast:season` | item | `season` | [Season](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/season.md) |
| `podcast:socialInteract` | channel, item | `social_interactions` | [Social Interact](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/social-interact.md) |
| `podcast:soundbite` | item | `soundbites` | [Soundbite](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/soundbite.md) |
| `podcast:source` | alternate enclosure | `sources` | [Source](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/source.md) |
| `podcast:trailer` | channel | `trailers` | [Trailer](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/trailer.md) |
| `podcast:transcript` | item | `transcripts` | [Transcript](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/transcript.md) |
| `podcast:txt` | channel, item | `text` | [TXT](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/txt.md) |
| `podcast:updateFrequency` | channel | `update_frequency` | [Update Frequency](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/update-frequency.md) |
| `podcast:value` | channel, item | `values` | [Value](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/value.md) |
| `podcast:valueRecipient` | value and value time split | `recipients` | [Value Recipient](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/value-recipient.md) |
| `podcast:valueTimeSplit` | value | `time_splits` | [Value Time Split](https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/tags/value-time-split.md) |

## Type generation

The JSON input adapter schema is [schemas/podcast-extensions.json](schemas/podcast-extensions.json).
`npm run build:json-feed-types` uses [`json-schema-to-typescript`](https://github.com/bcherny/json-schema-to-typescript) to generate [lib/podcast-types.d.ts](lib/podcast-types.d.ts).
The public `types.js` module re-exports the generated Apple Podcasts and Podcasting 2.0 types.

The JSON Schema describes this package's JSON Feed extension API rather than claiming to be an official JSON representation of either XML specification.

## Updating the implementation

1. Compare the current upstream tag index with the audited commit above.
2. Review changed tag documents, `podcast.xsd`, `taxonomy.json`, `serviceslugs.txt`, `socialprotocols.txt`, and `docs/chatprotocols.txt`.
3. Recheck Apple's RSS requirements, validator guidance, category list, artwork rules, transcript support, and chapter support.
4. Update the extension schema, serializer, complete fixture, public types, this support matrix, README, and migration guide together.
5. Run `npm test`, declaration generation, packed-package type checks, minimum-Node tests, and external feed validation.

The monthly [podcast specification audit workflow](.github/workflows/podcast-spec.yml) compares the upstream namespace branch with the pinned commit and verifies that the primary Apple source URLs remain available.
Run `npm run check:podcast-spec` to perform the same check locally.
