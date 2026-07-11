import { createRequire } from 'node:module'
import cleanDeep from 'clean-deep'
import get from 'lodash.get'
import merge from 'lodash.merge'
import striptags from 'striptags'
import { cleanCategory, cleanSubcategory } from './lib/clean-category.js'
import generateTitle from './lib/generate-title.js'
import { getAuthorName } from './lib/json-feed-author.js'
import {
  getPodcastType,
  getSubtitle,
  getSummary,
  secondsToHMS,
  truncate250,
  truncate4k
} from './lib/itunes-fields.js'

/** @import { JSONFeed } from './lib/json-feed-types.d.ts' */

const loadModule = createRequire(import.meta.url)
const packageInfo = loadModule('./package.json')
const JSON_FEED_VERSION = 'https://jsonfeed.org/version/1.1'

/**
 * @typedef {object} ITunesData
 * @property {string} [about]
 * @property {string} [author]
 * @property {boolean} [block]
 * @property {string} [category]
 * @property {boolean} [complete]
 * @property {string | number} [duration]
 * @property {number} [episode]
 * @property {'full' | 'trailer' | 'bonus'} [episode_type]
 * @property {boolean} [explicit]
 * @property {string} [image]
 * @property {boolean} [is_closed_captioned]
 * @property {string} [new_feed_url]
 * @property {{ name?: string, email?: string }} [owner]
 * @property {number} [season]
 * @property {string} [subcategory]
 * @property {string} [subtitle]
 * @property {string} [summary]
 * @property {string} [title]
 * @property {'episodic' | 'serial'} [type]
 */

/**
 * @typedef {JSONFeed & {
 *   feed_url: string,
 *   home_page_url: string,
 *   _itunes?: ITunesData
 * }} JSONFeedWithExtensions
 */

/**
 * @typedef {object} JsonFeedToRSSOptions
 * @property {(feedURL: string, jsonFeed: JSONFeedWithExtensions) => string} [feedURLFn]
 * @property {string} [language]
 * @property {string | null} [copyright]
 * @property {string | null} [managingEditor]
 * @property {string | null} [webMaster]
 * @property {boolean} [idIsPermalink]
 * @property {string[] | null} [category]
 * @property {number | null} [ttl]
 * @property {number[] | null} [skipHours]
 * @property {string[] | null} [skipDays]
 * @property {boolean | ITunesData} [itunes]
 */

/**
 * @typedef {object} ResolvedOptions
 * @property {(feedURL: string, jsonFeed: JSONFeedWithExtensions) => string} feedURLFn
 * @property {string} language
 * @property {string | null} copyright
 * @property {string | null} managingEditor
 * @property {string | null} webMaster
 * @property {boolean} idIsPermalink
 * @property {string[] | null} category
 * @property {number | null} ttl
 * @property {number[] | null} skipHours
 * @property {string[] | null} skipDays
 * @property {boolean | ITunesData} itunes
 */

/**
 * Convert a JSON Feed 1.1 document into the object consumed by xmlbuilder.
 *
 * @param {JSONFeedWithExtensions} jsonFeed
 * @param {JsonFeedToRSSOptions} [options]
 * @returns {Record<string, any>}
 */
export function jsonfeedToRSSObject (jsonFeed, options) {
  const now = new Date()
  let jf = jsonFeed
  const feedAuthorName = getAuthorName(jf)

  /** @type {ResolvedOptions} */
  const opts = {
    feedURLFn: feedURL => feedURL.replace(/\.json\b/, '-rss.xml'),
    language: jf.language || 'en-us',
    copyright: `© ${now.getFullYear()} ${feedAuthorName || ''}`,
    managingEditor: null,
    webMaster: null,
    idIsPermalink: false,
    category: null,
    ttl: null,
    skipHours: null,
    skipDays: null,
    itunes: Boolean(jf._itunes),
    ...options
  }

  if (typeof opts.itunes === 'object') {
    jf = merge({}, jf)
    jf._itunes = merge(jf._itunes, opts.itunes)
  }

  const {
    title,
    version,
    home_page_url: homePageURL,
    description,
    feed_url: feedURL
  } = jf

  if (version !== JSON_FEED_VERSION) {
    throw new Error('jsonfeed-to-rss: JSON Feed version 1.1 required')
  }
  if (!title) throw new Error('jsonfeed-to-rss: missing title')
  if (!feedURL) throw new Error('jsonfeed-to-rss: missing feed_url')
  if (!homePageURL) {
    throw new Error('jsonfeed-to-rss: JSON Feed missing home_page_url property')
  }

  const rssFeedURL = opts.feedURLFn(feedURL, jf)
  const rssTitle = `${title}`
  /** @type {Record<string, any>} */
  const rss = {
    'atom:link': {
      '@href': rssFeedURL,
      '@rel': 'self',
      '@type': 'application/rss+xml'
    },
    title: rssTitle,
    link: homePageURL,
    description,
    language: opts.language,
    copyright: opts.copyright,
    managingEditor: opts.managingEditor,
    webMaster: opts.webMaster,
    pubDate: now.toUTCString(),
    category: opts.itunes && !opts.category
      ? [get(jf, '_itunes.category'), get(jf, '_itunes.subcategory')]
      : opts.category,
    generator: `${packageInfo.name} ${packageInfo.version} (${packageInfo.homepage})`,
    docs: 'https://www.rssboard.org/rss-specification',
    ttl: opts.ttl,
    image: jf.icon
      ? {
          url: jf.icon,
          link: homePageURL,
          title: rssTitle
        }
      : undefined,
    skipHours: opts.skipHours ? { hour: opts.skipHours } : null,
    skipDays: opts.skipDays ? { day: opts.skipDays } : null
  }

  if (opts.itunes) {
    const category = /** @type {string | undefined} */ (
      get(jf, '_itunes.category') || get(opts, 'category[0]')
    )
    const subcategory = /** @type {string | undefined} */ (
      get(jf, '_itunes.subcategory') || get(opts, 'category[1]')
    )
    Object.assign(rss, {
      'itunes:author': get(jf, '_itunes.author') || getAuthorName(jf),
      'itunes:summary': getSummary(jf),
      'itunes:subtitle': getSubtitle(jf),
      'itunes:type': getPodcastType(jf),
      'itunes:owner': {
        'itunes:name': get(jf, '_itunes.owner.name') || getAuthorName(jf),
        'itunes:email': get(jf, '_itunes.owner.email')
      },
      'itunes:image': {
        '@href': get(jf, '_itunes.image') || jf.icon
      },
      'itunes:category': {
        '@text': cleanCategory(category),
        'itunes:category': {
          '@text': cleanSubcategory(category, subcategory)
        }
      },
      'itunes:explicit': exists(get(jf, '_itunes.explicit'))
        ? isTruthy(get(jf, '_itunes.explicit')) ? 'yes' : 'no'
        : null,
      'itunes:block': get(jf, '_itunes.block') ? 'Yes' : null,
      'itunes:complete': get(jf, '_itunes.complete') ? 'Yes' : null,
      'itunes:new-feed-url': get(jf, '_itunes.new_feed_url')
        ? opts.feedURLFn(/** @type {string} */ (get(jf, '_itunes.new_feed_url')), jf)
        : null,
      description: truncate4k(rss['description']),
      title: truncate250(rss['title'])
    })
  }

  if (jf.items) {
    let mostRecentlyUpdated = '0'
    rss['item'] = jf.items.map(item => {
      if (item.date_published && item.date_published > mostRecentlyUpdated) {
        mostRecentlyUpdated = item.date_published
      }
      if (item.date_modified && item.date_modified > mostRecentlyUpdated) {
        mostRecentlyUpdated = item.date_modified
      }

      const title = generateTitle(item)
      const date = item.date_published ? new Date(item.date_published) : null
      /** @type {Record<string, any>} */
      const rssItem = {
        title,
        link: item.external_url || item.url,
        'dc:creator': getAuthorName(item) || getAuthorName(jf),
        description: item.content_text || (item.content_html ? striptags(item.content_html) : null),
        'content:encoded': item.content_html
          ? { '#cdata': item.content_html }
          : null,
        category: item.tags,
        guid: {
          '#text': item.id,
          '@isPermaLink': opts.idIsPermalink
        },
        pubDate: date && !Number.isNaN(date.valueOf()) ? date.toUTCString() : null
      }

      if (item.attachments?.length) {
        const attachment = item.attachments[0]
        if (!attachment) return rssItem

        rssItem['enclosure'] = {
          '@type': attachment.mime_type,
          '@url': attachment.url,
          '@length': attachment.size_in_bytes
        }

        if (opts.itunes) {
          const duration = get(item, '_itunes.duration') ||
            (attachment.duration_in_seconds !== undefined
              ? secondsToHMS(attachment.duration_in_seconds)
              : null)
          const episodeType = /** @type {string} */ (get(item, '_itunes.episode_type'))

          Object.assign(rssItem, {
            'itunes:episodeType': ['full', 'trailer', 'bonus'].includes(episodeType)
              ? episodeType
              : 'full',
            'itunes:title': get(item, '_itunes.title') || generateTitle(item),
            'itunes:author': get(item, '_itunes.author') ||
              getAuthorName(item) ||
              get(jf, '_itunes.author') ||
              getAuthorName(jf),
            'itunes:episode': Number.isInteger(get(item, '_itunes.episode'))
              ? get(item, '_itunes.episode')
              : null,
            'itunes:subtitle': getSubtitle(item),
            'itunes:summary': getSummary(item),
            'itunes:image': {
              '@href': get(item, '_itunes.image') || item.image
            },
            'itunes:duration': duration,
            'itunes:season': get(item, '_itunes.season') || null,
            'itunes:block': get(item, '_itunes.block') ? 'Yes' : null,
            'itunes:explicit': exists(get(item, '_itunes.explicit'))
              ? isTruthy(get(item, '_itunes.explicit')) ? 'yes' : 'no'
              : null,
            'itunes:isClosedCaptioned': get(item, '_itunes.is_closed_captioned') ? 'Yes' : null,
            description: truncate4k(rssItem['description'])
          })
        }
      }

      return rssItem
    })

    if (mostRecentlyUpdated > '0') {
      rss['pubDate'] = new Date(mostRecentlyUpdated).toUTCString()
    }
  }

  return cleanDeep({
    rss: {
      '@version': '2.0',
      '@xmlns:atom': 'http://www.w3.org/2005/Atom',
      '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
      '@xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
      '@xmlns:itunes': opts.itunes
        ? 'http://www.itunes.com/dtds/podcast-1.0.dtd'
        : null,
      channel: rss
    }
  })
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function exists (value) {
  return value !== null && value !== undefined
}

/**
 * Preserve the historical truthiness semantics used for iTunes flags.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isTruthy (value) {
  return value !== false && exists(value)
}

export default jsonfeedToRSSObject
