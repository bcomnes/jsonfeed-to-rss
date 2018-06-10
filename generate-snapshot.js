const fs = require('fs')
const jsonfeedToRSS = require('./')
const jsonfeedToRSSObj = require('./jsonfeed-to-rss-object')
const extendedFeed = require('./snapshots/extended-feed.json')
const readmeFeed = require('./snapshots/readme-feed.json')
const podcastFeed = require('./snapshots/podcast-feed.json')
const podcastOpts = require('./snapshots/podcast-opts.json')

const rssObj = jsonfeedToRSSObj(extendedFeed)
const rssFeed = jsonfeedToRSS(extendedFeed)

fs.writeFileSync('snapshots/extended-feed-rss.xml', rssFeed)
fs.writeFileSync('snapshots/extended-feed-rss.json', JSON.stringify(rssObj, null, ' '))

fs.writeFileSync('snapshots/readme-feed-rss.xml', jsonfeedToRSS(readmeFeed))

fs.writeFileSync('snapshots/podcast-feed-rss.xml', jsonfeedToRSS(podcastFeed, podcastOpts))
fs.writeFileSync('snapshots/podcast-no-itunes-feed-rss.xml', jsonfeedToRSS(podcastFeed))

console.log('update snapshot snapshot.xml')
