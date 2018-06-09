const packageInfo = require('./package.json')
const generateTitle = require('./lib/generate-title')
const get = require('lodash.get')
const cleanDeep = require('clean-deep')
const striptags = require('striptags')
const sentenceSplitter = require('sentence-splitter')
const { cleanCategory, cleanSubcategory } = require('./lib/clean-category')
const { getSubtitle, getSummary } = require('./lib/itunes-fields')

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
  if (!description) throw new Error('jsonfeed-to-rss: JSON feed missing description property')

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
      'itunes:type': ['episodic', 'serial'].some(type => get(jf, '_itunes.type') === type) ? get(jf, '_itunes.type') : 'episodic',
      'itunes:owner': {
        'itunes:name': get(jf, '_itunes.owner.name') || get(jf, 'author.name'),
        'itunes:email': get(jf, '_itunes.owner.email')
      },
      'itunes:image': get(jf, '_itunes.image') || get(jf, 'icon'),
      'itunes:category': {
        // TODO Validate these // https://help.apple.com/itc/podcasts_connect/?lang=en#/itc9267a2f12
        '@text': cleanCategory(category),
        'itunes:category': {
          '@text': cleanSubcategory(category, subcategory)
        }
      },
      'itunes:explicit': get(jf, '_itunes.explicit') ? 'yes' : 'no'
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
            'itunes:episodeType': ['full', 'trailer', 'bonus'].some(type => get(item, '_itunes.type') === type) ? get(item, '_itunes.type') : 'full',
            'itunes:title': get(item, '_itunes.title') || generateTitle(item),
            'itunes:author': get(item, '_itunes.author') || get(item, 'author.name') || get(jf, '_itunes.author') || get(jf, 'author.name'),
            'itunes:subtitle': getSubtitle(item),
            'itunes:summary': getSummary(item),
            'itunes:duration': attachment.duration_in_seconds,
            'itunes:season': get(item, '_itunes.season') || date.getFullYear()
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
