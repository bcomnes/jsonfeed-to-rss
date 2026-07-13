import { create } from 'xmlbuilder2'
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
  const feed = create({
    version: '1.0',
    encoding: 'utf-8',
    invalidCharReplacement: '',
    convert: {
      text: '#text',
      cdata: '#cdata'
    }
  }, feedObject)

  return feed.end({ prettyPrint: true })
}

export default jsonfeedToRSS
