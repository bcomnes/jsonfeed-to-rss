import { readFile, writeFile } from 'node:fs/promises'
import jsonfeedToRSS from './index.js'
import jsonfeedToRSSObject from './jsonfeed-to-rss-object.js'

const extendedFeed = await readJSON('./snapshots/extended-feed.json')
const readmeFeed = await readJSON('./snapshots/readme-feed.json')
const podcastFeed = await readJSON('./snapshots/podcast-feed.json')
const podcastOptions = await readJSON('./snapshots/podcast-opts.json')
const datedOptions = { copyright: '© 2018 Bret Comnes' }
const undatedAuthorOptions = { copyright: '© 2018 ' }

const rssObject = jsonfeedToRSSObject(extendedFeed, datedOptions)

await Promise.all([
  writeFile('./snapshots/extended-feed-rss.xml', jsonfeedToRSS(extendedFeed, datedOptions)),
  writeFile(
    './snapshots/extended-feed-rss.json',
    JSON.stringify(rssObject, null, ' ')
  ),
  writeFile('./snapshots/readme-feed-rss.xml', jsonfeedToRSS(readmeFeed, datedOptions)),
  writeFile(
    './snapshots/podcast-feed-rss.xml',
    jsonfeedToRSS(podcastFeed, { ...podcastOptions, ...undatedAuthorOptions })
  ),
  writeFile(
    './snapshots/podcast-no-itunes-feed-rss.xml',
    jsonfeedToRSS(podcastFeed, undatedAuthorOptions)
  )
])

console.log('Updated RSS snapshots')

/**
 * @param {string} path
 * @returns {Promise<any>}
 */
async function readJSON (path) {
  return JSON.parse(await readFile(path, 'utf8'))
}
