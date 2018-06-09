var fs = require('fs')
var jsonfeedToRSS = require('./')
var jsonfeedToRSSObj = require('./jsonfeed-to-rss-object')
var testFeed = require('./snapshots/test-feed.json')
var readmeFeed = require('./snapshots/readme-feed.json')
var podcastFeed = require('./snapshots/podcast-feed.json')
var podcastOpts = require('./snapshots/podcast-opts.json')

const rssObj = jsonfeedToRSSObj(testFeed)
const rssFeed = jsonfeedToRSS(testFeed)

fs.writeFileSync('snapshots/snapshot.xml', rssFeed)
fs.writeFileSync('snapshots/snapshot.json', JSON.stringify(rssObj, null, ' '))

fs.writeFileSync('snapshots/readme-feed.xml', jsonfeedToRSS(readmeFeed))

fs.writeFileSync('snapshots/podcast-feed.xml', jsonfeedToRSS(podcastFeed, podcastOpts))

console.log('update snapshot snapshot.xml')
