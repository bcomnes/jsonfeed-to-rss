import {
  isApplePodcastCategory,
  isApplePodcastSubcategory
} from './apple-podcast-categories.js'
import generateTitle from './generate-title.js'
import {
  getSubtitle,
  getSummary,
  secondsToHMS,
  truncateUTF8
} from './itunes-fields.js'
import { getAuthorName } from './json-feed-author.js'

/** @import { Attachment, Item, JSONFeed } from './json-feed-types.d.ts' */
/** @import { ITunesCategory, ITunesChannelData, ITunesItemData } from './podcast-types.d.ts' */

export const APPLE_PODCASTS_CATEGORIES_URL = 'https://podcasters.apple.com/support/1691-apple-podcasts-categories'
export const APPLE_PODCASTS_REQUIREMENTS_URL = 'https://podcasters.apple.com/support/823-podcast-requirements'

/**
 * @typedef {object} ApplePodcastOptions
 * @property {string[] | null} category
 * @property {boolean} legacyITunesTags
 */

/**
 * @typedef {JSONFeed & {
 *   _itunes?: ITunesChannelData,
 *   items: (Item & { _itunes?: ITunesItemData })[]
 * }} ApplePodcastFeed
 */

/**
 * @param {ApplePodcastFeed} feed
 * @param {ApplePodcastOptions} options
 * @returns {Record<string, any>}
 */
export function buildApplePodcastChannel (feed, options) {
  const data = /** @type {ITunesChannelData} */ (feed['_itunes'] || {})
  const categories = resolveCategories(data, options.category)
  validateApplePodcastChannel(feed, data, categories)

  const current = {
    'itunes:title': data.title,
    'itunes:author': data.author || getAuthorName(feed),
    'itunes:type': data.type === 'serial' ? 'serial' : 'episodic',
    'itunes:image': { '@href': data.image },
    'itunes:category': categories.map(category => ({
      '@text': category.category,
      'itunes:category': category.subcategory
        ? { '@text': category.subcategory }
        : null
    })),
    'itunes:explicit': data.explicit ? 'true' : 'false',
    'itunes:block': data.block ? 'Yes' : null,
    'itunes:complete': data.complete ? 'Yes' : null,
    'itunes:new-feed-url': data.new_feed_url
  }

  if (!options.legacyITunesTags) return current

  return {
    ...current,
    'itunes:summary': getSummary(feed),
    'itunes:subtitle': getSubtitle(feed),
    'itunes:owner': {
      'itunes:name': data.owner?.name || getAuthorName(feed),
      'itunes:email': data.owner?.email
    }
  }
}

/**
 * @param {Item & Record<string, any>} item
 * @param {ApplePodcastFeed} feed
 * @param {Attachment} attachment
 * @param {ApplePodcastOptions} options
 * @returns {Record<string, any>}
 */
export function buildApplePodcastItem (item, feed, attachment, options) {
  const data = /** @type {ITunesItemData} */ (item['_itunes'] || {})
  validateApplePodcastItem(item, feed, attachment, data)
  const duration = data.duration ??
    (attachment.duration_in_seconds !== undefined
      ? secondsToHMS(attachment.duration_in_seconds)
      : null)

  const current = {
    'itunes:episodeType': data.episode_type || 'full',
    'itunes:title': data.title || generateTitle(item),
    'itunes:image': data.image || item.image
      ? { '@href': data.image || item.image }
      : null,
    'itunes:duration': duration,
    'itunes:episode': data.episode,
    'itunes:season': data.season,
    'itunes:block': data.block ? 'Yes' : null,
    'itunes:explicit': data.explicit === undefined
      ? null
      : data.explicit ? 'true' : 'false'
  }

  if (!options.legacyITunesTags) return current

  return {
    ...current,
    'itunes:author': data.author || getAuthorName(item) || getAuthorName(feed),
    'itunes:subtitle': getSubtitle(item),
    'itunes:summary': getSummary(item),
    'itunes:isClosedCaptioned': data.is_closed_captioned ? 'Yes' : null
  }
}

/**
 * @param {ApplePodcastFeed} feed
 * @param {ITunesChannelData} data
 * @param {ITunesCategory[]} categories
 */
function validateApplePodcastChannel (feed, data, categories) {
  if (!feed.description) {
    throw appleError('missing podcast description')
  }
  if (!data.image) {
    throw appleError('missing _itunes.image show artwork URL')
  }
  if (data.explicit === undefined) {
    throw appleError('missing _itunes.explicit boolean')
  }
  if (categories.length === 0) {
    throw appleError('missing Apple Podcasts category')
  }
  if (!feed.items?.some(item => item.attachments?.length)) {
    throw appleError('podcast requires at least one item with an attachment')
  }
}

/**
 * @param {Item & Record<string, any>} item
 * @param {ApplePodcastFeed} feed
 * @param {Attachment} attachment
 * @param {ITunesItemData} data
 */
function validateApplePodcastItem (item, feed, attachment, data) {
  if (!attachment.url || !attachment.mime_type || attachment.size_in_bytes === undefined) {
    throw appleError(`item ${item.id} enclosure requires url, mime_type, and size_in_bytes`)
  }
  if (data.episode !== undefined && (!Number.isInteger(data.episode) || data.episode < 1)) {
    throw appleError(`item ${item.id} episode must be a positive integer`)
  }
  if (data.season !== undefined && (!Number.isInteger(data.season) || data.season < 1)) {
    throw appleError(`item ${item.id} season must be a positive integer`)
  }
  if (feed['_itunes']?.type === 'serial' && data.episode === undefined) {
    throw appleError(`serial podcast item ${item.id} requires _itunes.episode`)
  }
}

/**
 * @param {ITunesChannelData} data
 * @param {string[] | null} fallback
 * @returns {ITunesCategory[]}
 */
function resolveCategories (data, fallback) {
  /** @type {ITunesCategory[]} */
  const categories = data.categories?.length
    ? [...data.categories]
    : data.category
      ? [{ category: data.category, ...(data.subcategory ? { subcategory: data.subcategory } : {}) }]
      : fallback?.[0]
        ? [{ category: fallback[0], ...(fallback[1] ? { subcategory: fallback[1] } : {}) }]
        : []

  if (categories.length > 2) {
    throw appleError('Apple Podcasts accepts at most two categories')
  }

  for (const { category, subcategory } of categories) {
    if (!isApplePodcastCategory(category)) {
      throw new Error(`jsonfeed-to-rss: unsupported Apple Podcasts category ${category}; see ${APPLE_PODCASTS_CATEGORIES_URL}`)
    }
    if (subcategory && !isApplePodcastSubcategory(category, subcategory)) {
      throw new Error(`jsonfeed-to-rss: unsupported Apple Podcasts subcategory ${category} > ${subcategory}; see ${APPLE_PODCASTS_CATEGORIES_URL}`)
    }
  }

  return categories
}

/**
 * @param {string} message
 * @returns {Error}
 */
function appleError (message) {
  return new Error(`jsonfeed-to-rss: ${message}; see ${APPLE_PODCASTS_REQUIREMENTS_URL}`)
}

/**
 * Apply Apple's 4,000-byte limit to a podcast description.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function truncateApplePodcastDescription (value) {
  return truncateUTF8(value, 4000)
}
