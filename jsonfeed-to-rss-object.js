const packageInfo = require('./package.json')
const generateTitle = require('./lib/generate-title')
const get = require('lodash.get')
const cleanDeep = require('clean-deep')

module.exports = function jsonfeedToAtomObject (jf, opts) {
  const now = new Date()

  opts = Object.assign({
    feedURLFn: (feedURL, jf) => feedURL.replace(/\.json\b/, '-rss.xml'),
    language: 'en-us',
    copyright: `© ${now.getFullYear()} ${jf.author && jf.author.name ? jf.author.name : ''}`,
    managingEditor: null,
    webMaster: null,
    idIsPermalink: false,
    category: null,
    ttl: null, // TODO default on ttl
    skipHours: null,
    skipDays: null,
    relativeItemLinks: false // enable item level relative links
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
  const rssTitle = `${title} (RSS)`
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
    category: opts.category, // no mapping, so leave as option
    generator: `${packageInfo.name} ${packageInfo.version} (${packageInfo.homepage})`,
    docs: 'http://www.rssboard.org/rss-specification',
    // TODO: cloud
    ttl: opts.ttl,
    image: jf.icon ? {
      url: jf.icon,
      link: homePageURL,
      title: rssTitle
    } : undefined,
    skipHours: opts.skipHours,
    skipDays: opts.skipDays
  }

  if (jf.items) {
    let mostRecentlyUpdated = '0'
    rss.item = jf.items.map(item => {
      // capture mostRecentlyUpdated date, if any
      if (item.date_published && (item.date_published > mostRecentlyUpdated)) mostRecentlyUpdated = item.date_published
      if (item.date_modified && (item.date_modified > mostRecentlyUpdated)) mostRecentlyUpdated = item.date_modified

      // Generate item object
      const rssItem = {
        title: generateTitle(item),
        link: item.external_url || item.url,
        // author: getManagingEditor(item) || getManagingEditor(jf),
        'dc:creator': get(item, 'author.name') || get(jf, 'author.name'),
        description: {
          '#cdata': item.content_html || item.content_text,
          '@xml:base': homePageURL
        },
        'content:encoded': {
          '#cdata': item.content_html || item.content_text,
          '@xml:base': homePageURL
        },
        category: item.tags,
        guid: {
          '#text': item.id,
          '@isPermaLink': opts.idIsPermalink
        },
        pubDate: new Date(item.date_published).toUTCString()
      }

      if (item.attachments) {
        rssItem.enclosure = item.attachments.map(attachment => ({
          '@type': attachment.mime_type,
          '@url': attachment.url,
          '@length': attachment.size_in_bytes
        }))
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
      channel: rss
    }
  })
}
