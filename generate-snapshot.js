var fs = require('fs')
var jsonfeedToRSS = require('./')
var jsonfeedToRSSObj = require('./jsonfeed-to-rss-object')
var testFeed = require('./test-feed.json')

const rssObj = jsonfeedToRSSObj(testFeed)
const rssFeed = jsonfeedToRSS(testFeed)

fs.writeFileSync('snapshot.xml', rssFeed)
fs.writeFileSync('snapshot.json', JSON.stringify(rssObj, null, ' '))

console.log('update snapshot snapshot.xml')
