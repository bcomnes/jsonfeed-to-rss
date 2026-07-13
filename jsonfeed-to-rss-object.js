import { createRequire } from 'node:module'
import cleanDeep from './lib/clean-deep.js'
import {
  buildApplePodcastChannel,
  buildApplePodcastItem,
  truncateApplePodcastDescription
} from './lib/apple-podcast.js'
import generateTitle from './lib/generate-title.js'
import htmlToPlainText from './lib/html-to-plain-text.js'
import { getAuthorName } from './lib/json-feed-author.js'
import { truncate250 } from './lib/itunes-fields.js'
import {
  buildPodcastChannel,
  buildPodcastItem,
  PODCAST_NAMESPACE_URL
} from './lib/podcast-namespace.js'

/** @import { Item, JSONFeed } from './lib/json-feed-types.d.ts' */
/** @import { ITunesChannelData, ITunesItemData, PodcastChannelData, PodcastItemData } from './lib/podcast-types.d.ts' */

const loadModule = createRequire(import.meta.url)
const packageInfo = loadModule('./package.json')
const JSON_FEED_VERSION = 'https://jsonfeed.org/version/1.1'

/**
 * @typedef {Item & {
 *   _itunes?: ITunesItemData,
 *   _podcast?: PodcastItemData
 * }} JSONFeedItemWithExtensions
 */

/**
 * @typedef {JSONFeed & {
 *   feed_url: string,
 *   home_page_url: string,
 *   _itunes?: ITunesChannelData,
 *   _podcast?: PodcastChannelData,
 *   items: JSONFeedItemWithExtensions[]
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
 * @property {boolean | ITunesChannelData} [itunes]
 * @property {boolean} [podcast]
 * @property {boolean} [legacyITunesTags]
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
 * @property {boolean | ITunesChannelData} itunes
 * @property {boolean} podcast
 * @property {boolean} legacyITunesTags
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
    podcast: Boolean(jf._podcast || jf.items?.some(item => item['_podcast'])),
    legacyITunesTags: false,
    ...options
  }

  if (typeof opts.itunes === 'object') {
    jf = structuredClone(jf)
    jf._itunes = mergeITunesData(jf._itunes, opts.itunes)
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
    category: getRSSCategories(jf._itunes, opts),
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
    Object.assign(rss, {
      ...buildApplePodcastChannel(jf, opts),
      description: truncateApplePodcastDescription(rss['description']),
      title: truncate250(rss['title'])
    })
  }

  if (opts.podcast) Object.assign(rss, buildPodcastChannel(jf))

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
        description: item.content_text || (item.content_html ? htmlToPlainText(item.content_html) : null),
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
          Object.assign(rssItem, {
            ...buildApplePodcastItem(item, jf, attachment, opts),
            description: truncateApplePodcastDescription(rssItem['description'])
          })
        }
      }

      if (opts.podcast) Object.assign(rssItem, buildPodcastItem(item))

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
      '@xmlns:podcast': opts.podcast ? PODCAST_NAMESPACE_URL : null,
      channel: rss
    }
  })
}

/**
 * @param {ITunesChannelData | undefined} base
 * @param {ITunesChannelData} override
 * @returns {ITunesChannelData}
 */
function mergeITunesData (base, override) {
  const owner = base?.owner || override.owner
    ? { ...base?.owner, ...override.owner }
    : undefined

  return {
    ...base,
    ...override,
    ...(owner ? { owner } : {})
  }
}

/**
 * @param {ITunesChannelData | undefined} data
 * @param {ResolvedOptions} options
 * @returns {string[] | null}
 */
function getRSSCategories (data, options) {
  if (!options.itunes || options.category) return options.category
  if (data?.categories?.length) {
    return data.categories.flatMap(({ category, subcategory }) => subcategory
      ? [category, subcategory]
      : [category])
  }
  return data?.category
    ? data.subcategory ? [data.category, data.subcategory] : [data.category]
    : []
}

export default jsonfeedToRSSObject
