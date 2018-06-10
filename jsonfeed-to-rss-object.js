const packageInfo = require('./package.json')
const generateTitle = require('./lib/generate-title')
const get = require('lodash.get')
const cleanDeep = require('clean-deep')
const striptags = require('striptags')
const { cleanCategory, cleanSubcategory } = require('./lib/clean-category')
const { getSubtitle, getSummary, truncate4k, truncate250, secondsToHMS, getPodcastType } = require('./lib/itunes-fields')
const existy = require('existy')
const truthy = require('@bret/truthy')
const merge = require('lodash.merge')

module.exports = function jsonfeedToAtomObject (jf, opts) {
  const now = new Date()

  opts = Object.assign({
    feedURLFn: (feedURL, jf) => feedURL.replace(/\.json\b/, '-rss.xml'),
    language: 'en-us',
    copyright: `© ${now.getFullYear()} ${jf.author && jf.author.name ? jf.author.name : ''}`,
    managingEditor: null, // email@domain.com (First Last)
    webMaster: null, // email@domain.com (First Last)
    idIsPermalink: false, // guid is permalink
    categories: null, // site level categories. no mapping, so leave as option array.
    ttl: null,
    skipHours: null, // array of hour numbers
    skipDays: null,  // array of skip days
    itunes: !!jf._itunes // enable/disable itunes tags
  }, opts)

  if (typeof opts.itunes === 'object') {
    jf = merge({}, jf)
    jf._itunes = merge(jf._itunes, opts.itunes)
  }

  // 2.0.11 http://www.rssboard.org/rss-specification
  // best practice http://www.rssboard.org/rss-profile
  // JSON Feed to rss mapping based off http://cyber.harvard.edu/rss/rss.html
  // and http://www.rssboard.org/rss-profile and
  // https://validator.w3.org/feed/docs/rss2.html

  const { title, version, home_page_url: homePageURL, description, feed_url: feedURL } = jf
  if (version !== 'https://jsonfeed.org/version/1') throw new Error('jsonfeed-to-atom: JSON feed version 1 required')
  if (!title) throw new Error('jsonfeed-to-rss: missing title')
  if (!feedURL) throw new Error('jsonfeed-to-atom: missing feed_url')
  if (!homePageURL) throw new Error('jsonfeed-to-rss: JSON feed missing home_page_url property')

  const rssFeedURL = opts.feedURLFn(feedURL, jf)
  const rssTitle = `${title}`
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
    pubDate: now.toUTCString(), // override with the newest pubdate thats less than now
    // lastBuildDate: now.toUTCString(),
    category: (opts.itunes && !opts.category) ? [get(jf, '_itunes.category'), get(jf, '_itunes.subcategory')] : opts.category,
    generator: `${packageInfo.name} ${packageInfo.version} (${packageInfo.homepage})`,
    docs: 'http://www.rssboard.org/rss-specification',
    // TODO: cloud
    ttl: opts.ttl,
    image: jf.icon ? {
      url: jf.icon,
      link: homePageURL,
      title: rssTitle
    } : undefined,
    skipHours: opts.skipHours ? { hour: opts.skipHours } : null,
    skipDays: opts.skipDays ? { day: opts.skipDays } : null
  }

  if (opts.itunes) {
    const category = get(jf, '_itunes.category') || get(opts, 'category[0]')
    const subcategory = get(jf, '_itunes.subcategory') || get(opts, 'category[1]')
    Object.assign(rss, {
      'itunes:author': get(jf, '_itunes.author') || get(jf, 'author.name'),
      'itunes:summary': getSummary(jf),
      'itunes:subtitle': getSubtitle(jf),
      'itunes:type': getPodcastType(jf),
      'itunes:owner': {
        'itunes:name': get(jf, '_itunes.owner.name') || get(jf, 'author.name'),
        'itunes:email': get(jf, '_itunes.owner.email')
      },
      'itunes:image': {
        '@href': get(jf, '_itunes.image') || get(jf, 'icon')
      },
      'itunes:category': {
        '@text': cleanCategory(category),
        'itunes:category': {
          '@text': cleanSubcategory(category, subcategory)
        }
      },
      'itunes:explicit': existy(get(jf, '_itunes.explicit')) ? truthy(get(jf, '_itunes.explicit')) ? 'yes' : 'no' : null,
      'itunes:block': get(jf, '_itunes.block') ? 'Yes' : null,
      'itunes:complete': get(jf, '_itunes.complete') ? 'Yes' : null,
      'itunes:new-feed-url': get(jf, '_itunes.new_feed_url'),
      description: truncate4k(rss.description),
      title: truncate250(rss.title)
    })
  }

  if (jf.items) {
    let mostRecentlyUpdated = '0'
    rss.item = jf.items.map(item => {
      // capture mostRecentlyUpdated date, if any
      if (item.date_published && (item.date_published > mostRecentlyUpdated)) mostRecentlyUpdated = item.date_published
      if (item.date_modified && (item.date_modified > mostRecentlyUpdated)) mostRecentlyUpdated = item.date_modified

      // Generate item object
      const title = generateTitle(item)
      const date = new Date(item.date_published)
      const rssItem = {
        title: title,
        link: item.external_url || item.url,
        // author: getManagingEditor(item) || getManagingEditor(jf),
        'dc:creator': get(item, 'author.name') || get(jf, 'author.name'),
        // RSS supports HTML in description, but we are only going to use it for plain text, a common practice/misconception + apple recommended.
        description: item.content_text || striptags(item.content_html),
        'content:encoded': {
          '#cdata': item.content_html
        },
        category: item.tags,
        guid: {
          '#text': item.id,
          '@isPermaLink': opts.idIsPermalink
        },
        pubDate: date.toUTCString()
      }

      if (item.attachments && item.attachments.length > 0) {
        const attachment = item.attachments[0] // RSS only supports 1 per item!
        rssItem.enclosure = {
          '@type': attachment.mime_type,
          '@url': attachment.url,
          '@length': attachment.size_in_bytes
        }

        if (opts.itunes) {
          Object.assign(rssItem, {
            'itunes:episodeType': ['full', 'trailer', 'bonus'].some(type => get(item, '_itunes.episode_type') === type) ? get(item, '_itunes.episode_type') : 'full',
            'itunes:title': get(item, '_itunes.title') || generateTitle(item),
            'itunes:author': get(item, '_itunes.author') || get(item, 'author.name') || get(jf, '_itunes.author') || get(jf, 'author.name'),
            'itunes:episode': Number.isInteger(get(item, '_itunes.episode')) ? get(item, '_itunes.episode') : null,
            'itunes:subtitle': getSubtitle(item),
            'itunes:summary': getSummary(item),
            'itunes:image': get(item, '_itunes.image') || get(item, 'image'),
            'itunes:duration': get(item, '_itunes.duration') || existy(attachment.duration_in_seconds) ? secondsToHMS(attachment.duration_in_seconds) : null,
            'itunes:season': get(item, '_itunes.season') || getPodcastType(jf) === 'episodic' ? date.getFullYear() : null,
            'itunes:block': get(item, '_itunes.block') ? 'Yes' : null,
            'itunes:explicit': existy(get(item, '_itunes.explicit')) ? truthy(get(item, '_itunes.explicit')) ? 'yes' : 'no' : null,
            'itunes:isClosedCaptioned': get(item, '_itunes.is_closed_captioned') ? 'Yes' : null,
            description: truncate4k(rssItem.description)
          })
        }
      }

      return rssItem
    })
    // Replace pubdate date most recently updated or published
    if (mostRecentlyUpdated > '0') rss.pubDate = new Date(mostRecentlyUpdated).toUTCString()
  }

  return cleanDeep({
    rss: {
      '@version': '2.0',
      '@xmlns:atom': 'http://www.w3.org/2005/Atom',
      '@xmlns:dc': 'http://purl.org/dc/elements/1.1/',
      '@xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
      '@xmlns:itunes': opts.itunes ? 'http://www.itunes.com/dtds/podcast-1.0.dtd' : null,
      channel: rss
    }
  })
}
