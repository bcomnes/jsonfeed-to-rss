/** @import { Author, Item, JSONFeed } from './json-feed-types.d.ts' */
/** @import {
 *   PodcastAlternateEnclosure,
 *   PodcastBlock,
 *   PodcastChannelData,
 *   PodcastChat,
 *   PodcastContentLink,
 *   PodcastFunding,
 *   PodcastImage,
 *   PodcastItemData,
 *   PodcastLicense,
 *   PodcastLiveItem,
 *   PodcastLocation,
 *   PodcastPerson,
 *   PodcastRemoteItem,
 *   PodcastSeason,
 *   PodcastEpisode,
 *   PodcastSocialInteract,
 *   PodcastText,
 *   PodcastValue,
 *   PodcastValueRecipient,
 *   PodcastValueTimeSplit
 * } from './podcast-types.d.ts' */

/**
 * @typedef {JSONFeed & { _podcast?: PodcastChannelData }} PodcastFeed
 */

export const PODCAST_NAMESPACE_URL = 'https://podcastindex.org/namespace/1.0'
export const PODCAST_NAMESPACE_SPEC_URL = 'https://github.com/Podcastindex-org/podcast-namespace/blob/c0ff5caa3729610362ee93f8034454fa41f3c493/docs/1.0.md'

/**
 * @param {PodcastFeed} feed
 * @returns {Record<string, any>}
 */
export function buildPodcastChannel (feed) {
  const data = /** @type {PodcastChannelData} */ (feed['_podcast'] || {})
  validatePodcastGuid(data.guid)

  return {
    'podcast:locked': data.locked
      ? node(booleanValue(data.locked.value), { owner: data.locked.owner })
      : null,
    'podcast:funding': map(data.funding, buildFunding),
    'podcast:person': map(data.people || authorsToPeople(feed.authors), buildPerson),
    'podcast:location': map(data.locations, buildLocation),
    'podcast:license': data.license ? buildLicense(data.license) : null,
    'podcast:guid': data.guid,
    'podcast:medium': data.medium,
    'podcast:trailer': map(data.trailers, trailer => node(trailer.title, {
      url: trailer.url,
      pubdate: trailer.published,
      length: trailer.length,
      type: trailer.type,
      season: trailer.season
    })),
    'podcast:value': map(data.values, buildValue),
    'podcast:liveItem': map(data.live_items, buildLiveItem),
    'podcast:socialInteract': map(data.social_interactions, buildSocialInteract),
    'podcast:block': map(data.blocks, buildBlock),
    'podcast:txt': map(data.text, buildText),
    'podcast:remoteItem': map(data.remote_items, buildRemoteItem),
    'podcast:podroll': data.podroll?.length
      ? { 'podcast:remoteItem': data.podroll.map(buildRemoteItem) }
      : null,
    'podcast:updateFrequency': data.update_frequency
      ? node(data.update_frequency.label, {
        complete: optionalBoolean(data.update_frequency.complete),
        dtstart: data.update_frequency.start,
        rrule: data.update_frequency.rrule
      })
      : null,
    'podcast:podping': data.podping
      ? { '@usesPodping': 'true' }
      : null,
    'podcast:chat': data.chat ? buildChat(data.chat) : null,
    'podcast:publisher': data.publisher
      ? { 'podcast:remoteItem': buildRemoteItem(data.publisher) }
      : null,
    'podcast:image': map(data.images, buildImage)
  }
}

/**
 * @param {Item & Record<string, any>} item
 * @returns {Record<string, any>}
 */
export function buildPodcastItem (item) {
  const data = /** @type {PodcastItemData} */ (item['_podcast'] || {})
  const itunes = item['_itunes'] || {}
  /** @type {PodcastSeason | null} */
  const season = data.season || (itunes.season ? { number: itunes.season } : null)
  /** @type {PodcastEpisode | null} */
  const episode = data.episode || (itunes.episode ? { number: itunes.episode } : null)

  return {
    'podcast:transcript': map(data.transcripts, transcript => attributes({
      url: transcript.url,
      type: transcript.type,
      language: transcript.language,
      rel: transcript.rel
    })),
    'podcast:chapters': data.chapters
      ? attributes({ url: data.chapters.url, type: data.chapters.type })
      : null,
    'podcast:soundbite': map(data.soundbites, soundbite => node(soundbite.title, {
      startTime: soundbite.start_time,
      duration: soundbite.duration
    })),
    'podcast:person': map(data.people || authorsToPeople(item.authors), buildPerson),
    'podcast:funding': map(data.funding, buildFunding),
    'podcast:location': map(data.locations, buildLocation),
    'podcast:season': season
      ? node(season.number, { name: season.name })
      : null,
    'podcast:episode': episode
      ? node(episode.number, { display: episode.display })
      : null,
    'podcast:license': data.license ? buildLicense(data.license) : null,
    'podcast:alternateEnclosure': map(data.alternate_enclosures, buildAlternateEnclosure),
    'podcast:contentLink': map(data.content_links, buildContentLink),
    'podcast:socialInteract': map(data.social_interactions, buildSocialInteract),
    'podcast:txt': map(data.text, buildText),
    'podcast:value': map(data.values, buildValue),
    'podcast:chat': data.chat ? buildChat(data.chat) : null,
    'podcast:image': map(data.images, buildImage)
  }
}

/**
 * @param {PodcastLiveItem} liveItem
 * @returns {Record<string, any>}
 */
function buildLiveItem (liveItem) {
  return {
    ...attributes({
      status: liveItem.status,
      start: liveItem.start,
      end: liveItem.end
    }),
    title: liveItem.title,
    description: liveItem.description,
    link: liveItem.link,
    guid: node(liveItem.guid, { isPermaLink: optionalBoolean(liveItem.guid_is_permalink) }),
    enclosure: attributes({
      url: liveItem.enclosure.url,
      type: liveItem.enclosure.type,
      length: liveItem.enclosure.length
    }),
    'podcast:person': map(liveItem.people, buildPerson),
    'podcast:alternateEnclosure': map(liveItem.alternate_enclosures, buildAlternateEnclosure),
    'podcast:contentLink': liveItem.content_links.map(buildContentLink),
    'podcast:funding': map(liveItem.funding, buildFunding),
    'podcast:location': map(liveItem.locations, buildLocation),
    'podcast:transcript': map(liveItem.transcripts, transcript => attributes({
      url: transcript.url,
      type: transcript.type,
      language: transcript.language,
      rel: transcript.rel
    })),
    'podcast:chapters': liveItem.chapters
      ? attributes({ url: liveItem.chapters.url, type: liveItem.chapters.type })
      : null,
    'podcast:soundbite': map(liveItem.soundbites, soundbite => node(soundbite.title, {
      startTime: soundbite.start_time,
      duration: soundbite.duration
    })),
    'podcast:season': liveItem.season
      ? node(liveItem.season.number, { name: liveItem.season.name })
      : null,
    'podcast:episode': liveItem.episode
      ? node(liveItem.episode.number, { display: liveItem.episode.display })
      : null,
    'podcast:license': liveItem.license ? buildLicense(liveItem.license) : null,
    'podcast:socialInteract': map(liveItem.social_interactions, buildSocialInteract),
    'podcast:txt': map(liveItem.text, buildText),
    'podcast:value': map(liveItem.values, buildValue),
    'podcast:chat': liveItem.chat ? buildChat(liveItem.chat) : null,
    'podcast:image': map(liveItem.images, buildImage)
  }
}

/**
 * @param {PodcastAlternateEnclosure} enclosure
 * @returns {Record<string, any>}
 */
function buildAlternateEnclosure (enclosure) {
  if (!enclosure.sources.length) throw podcastError('alternate enclosure requires at least one source')

  return {
    ...attributes({
      type: enclosure.type,
      length: enclosure.length,
      bitrate: enclosure.bitrate,
      height: enclosure.height,
      lang: enclosure.language,
      title: enclosure.title,
      rel: enclosure.rel,
      codecs: enclosure.codecs,
      default: optionalBoolean(enclosure.default)
    }),
    'podcast:source': enclosure.sources.map(source => attributes({
      uri: source.uri,
      contentType: source.content_type
    })),
    'podcast:integrity': enclosure.integrity
      ? attributes({ type: enclosure.integrity.type, value: enclosure.integrity.value })
      : null
  }
}

/**
 * @param {PodcastValue} value
 * @returns {Record<string, any>}
 */
function buildValue (value) {
  if (!value.recipients.length) throw podcastError('value requires at least one recipient')

  return {
    ...attributes({
      type: value.type,
      method: value.method,
      suggested: value.suggested
    }),
    'podcast:valueRecipient': value.recipients.map(buildValueRecipient),
    'podcast:valueTimeSplit': map(value.time_splits, buildValueTimeSplit)
  }
}

/**
 * @param {PodcastValueTimeSplit} split
 * @returns {Record<string, any>}
 */
function buildValueTimeSplit (split) {
  if (Boolean(split.remote_item) === Boolean(split.recipients?.length)) {
    throw podcastError('value time split requires recipients or one remote item')
  }

  return {
    ...attributes({
      startTime: split.start_time,
      duration: split.duration,
      remoteStartTime: split.remote_start_time,
      remotePercentage: split.remote_percentage
    }),
    'podcast:valueRecipient': map(split.recipients, buildValueRecipient),
    'podcast:remoteItem': split.remote_item ? buildRemoteItem(split.remote_item) : null
  }
}

/**
 * @param {PodcastValueRecipient} recipient
 * @returns {Record<string, any>}
 */
function buildValueRecipient (recipient) {
  return attributes({
    type: recipient.type,
    address: recipient.address,
    split: recipient.split,
    name: recipient.name,
    customKey: recipient.custom_key,
    customValue: recipient.custom_value,
    fee: optionalBoolean(recipient.fee)
  })
}

/**
 * @param {PodcastRemoteItem} item
 * @returns {Record<string, any>}
 */
function buildRemoteItem (item) {
  return attributes({
    feedGuid: item.feed_guid,
    feedUrl: item.feed_url,
    itemGuid: item.item_guid,
    medium: item.medium,
    title: item.title
  })
}

/**
 * @param {PodcastPerson} person
 * @returns {Record<string, any>}
 */
function buildPerson (person) {
  return node(person.name, {
    role: person.role,
    group: person.group,
    img: person.image,
    href: person.url
  })
}

/**
 * @param {PodcastFunding} funding
 * @returns {Record<string, any>}
 */
function buildFunding (funding) {
  return node(funding.label, { url: funding.url })
}

/**
 * @param {PodcastLocation} location
 * @returns {Record<string, any>}
 */
function buildLocation (location) {
  return node(location.name, {
    rel: location.rel,
    geo: location.geo,
    osm: location.osm,
    country: location.country?.toUpperCase()
  })
}

/**
 * @param {PodcastLicense} license
 * @returns {Record<string, any>}
 */
function buildLicense (license) {
  return node(license.identifier.toLowerCase(), { url: license.url })
}

/**
 * @param {PodcastContentLink} link
 * @returns {Record<string, any>}
 */
function buildContentLink (link) {
  return node(link.label, { href: link.url })
}

/**
 * @param {PodcastSocialInteract} interaction
 * @returns {Record<string, any>}
 */
function buildSocialInteract (interaction) {
  if (interaction.protocol !== 'disabled' && !interaction.uri) {
    throw podcastError(`social interaction using ${interaction.protocol} requires a uri`)
  }

  return attributes({
    protocol: interaction.protocol,
    uri: interaction.uri,
    accountId: interaction.account_id,
    accountUrl: interaction.account_url,
    priority: interaction.priority
  })
}

/**
 * @param {PodcastBlock} block
 * @returns {Record<string, any>}
 */
function buildBlock (block) {
  return node(booleanValue(block.value), { id: block.id })
}

/**
 * @param {PodcastText} text
 * @returns {Record<string, any>}
 */
function buildText (text) {
  return node(text.value, { purpose: text.purpose })
}

/**
 * @param {PodcastChat} chat
 * @returns {Record<string, any>}
 */
function buildChat (chat) {
  return attributes({
    server: chat.server,
    protocol: chat.protocol,
    accountId: chat.account_id,
    space: chat.space
  })
}

/**
 * @param {PodcastImage} image
 * @returns {Record<string, any>}
 */
function buildImage (image) {
  return attributes({
    href: image.url,
    alt: image.alt,
    'aspect-ratio': image.aspect_ratio,
    width: image.width,
    height: image.height,
    type: image.type,
    purpose: image.purpose
  })
}

/**
 * @param {Author[] | undefined} authors
 * @returns {PodcastPerson[] | undefined}
 */
function authorsToPeople (authors) {
  return authors?.flatMap(author => author.name
    ? [{
        name: author.name,
        ...(author.url ? { url: author.url } : {}),
        ...(author.avatar ? { image: author.avatar } : {})
      }]
    : [])
}

/**
 * @param {string | undefined} guid
 */
function validatePodcastGuid (guid) {
  if (guid && !/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guid)) {
    throw podcastError('podcast guid must be a UUIDv5')
  }
}

/**
 * @param {boolean} value
 * @returns {'yes' | 'no'}
 */
function booleanValue (value) {
  return value ? 'yes' : 'no'
}

/**
 * @param {boolean | undefined} value
 * @returns {'true' | 'false' | undefined}
 */
function optionalBoolean (value) {
  return value === undefined ? undefined : value ? 'true' : 'false'
}

/**
 * @param {unknown} value
 * @param {Record<string, unknown>} values
 * @returns {Record<string, any>}
 */
function node (value, values = {}) {
  return { '#text': value, ...attributes(values) }
}

/**
 * @param {Record<string, unknown>} values
 * @returns {Record<string, any>}
 */
function attributes (values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [`@${key}`, value])
  )
}

/**
 * @template T
 * @param {T[] | undefined} values
 * @param {(value: T) => Record<string, any>} builder
 * @returns {Record<string, any>[] | null}
 */
function map (values, builder) {
  return values?.length ? values.map(builder) : null
}

/**
 * @param {string} message
 * @returns {Error}
 */
function podcastError (message) {
  return new Error(`jsonfeed-to-rss: ${message}; see ${PODCAST_NAMESPACE_SPEC_URL}`)
}
