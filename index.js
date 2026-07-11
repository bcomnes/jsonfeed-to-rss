import builder from 'xmlbuilder'
import jsonfeedToRSSObject from './jsonfeed-to-rss-object.js'

/**
 * Convert a parsed JSON Feed 1.1 object into an RSS 2.0 XML document.
 *
 * @param {Parameters<typeof jsonfeedToRSSObject>[0]} jsonfeed
 * @param {Parameters<typeof jsonfeedToRSSObject>[1]} [options]
 * @returns {string}
 */
export function jsonfeedToRSS (jsonfeed, options) {
  const feedObject = jsonfeedToRSSObject(jsonfeed, options)
  const feed = builder.create(feedObject, /** @type {any} */ ({
    encoding: 'utf-8',
    skipNullAttributes: true,
    skipNullNodes: true,
    invalidCharReplacement: ''
  }))

  return feed.end({ pretty: true, allowEmpty: false })
}

export default jsonfeedToRSS
