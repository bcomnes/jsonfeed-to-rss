const test = require('tape')
const fs = require('fs')
const generateTitle = require('./lib/generate-title')
const jsonfeedToRSS = require('./')
const jsonfeedToRSSObject = require('./jsonfeed-to-rss-object')

const extendedFeed = require('./snapshots/extended-feed.json')
const readmeFeed = require('./snapshots/readme-feed.json')
const podcastFeed = require('./snapshots/podcast-feed.json')
const podcastOpts = require('./snapshots/podcast-opts.json')

test('missing property errors', t => {
  t.throws(() => {
    jsonfeedToRSS({
      version: 'https://jsonfeed.org/version/1',
      feed_url: 'https://jsonfeed.org/feed.json'
    })
  }, /missing title/, 'Missing titles throw')

  t.throws(() => {
    jsonfeedToRSS({
      feed_url: 'https://jsonfeed.org/feed.json',
      title: 'A feed title'
    })
  }, /version 1 required/, 'Missing version throw')

  t.throws(() => {
    jsonfeedToRSS({
      version: 'https://jsonfeed.org/version/1',
      title: 'A feed title'
    })
  }, /missing feed_url/, 'Missing feed_url throw')

  t.throws(() => {
    jsonfeedToRSS({
      version: 'https://jsonfeed.org/version/1',
      feed_url: 'https://jsonfeed.org/feed.json',
      title: 'A feed title'
    })
  }, /missing home_page_url/, 'Missing home_page_url throw')

  t.end()
})

test('generateTitle', t => {
  const simpleTitle = 'Hey this is a title'
  t.equal(generateTitle({ title: simpleTitle }), simpleTitle, 'title properties are passed through')

  const missingTitle = {
    summary: 'This is a summary',
    content_text: 'This is some text',
    content_html: '<p>yo</p>  '
  }
  t.equal(generateTitle(missingTitle), missingTitle.summary, 'use a summary if present')

  const missingSummary = Object.assign({}, missingTitle, { summary: null })
  t.equal(generateTitle(missingSummary), missingSummary.content_text, 'use text_content if summary is missing')

  const missingText = Object.assign({}, missingSummary, { content_text: null })
  t.equal(generateTitle(missingText), 'yo', 'use a cleaned up content_html last')

  t.throws(() => generateTitle({}), /can't generate a title/, 'Will throw if it can\'t generate a title')

  t.end()
})

test('test-feed snapshot', t => {
  const rssObj = jsonfeedToRSSObject(extendedFeed)

  const expect = require('./snapshots/extended-feed-rss.json')

  t.deepEqual(rssObj, expect, 'js transform is expected')
  t.end()
})

test('full integration snapshot', t => {
  const rssFeed = jsonfeedToRSS(extendedFeed)
  const expect = fs.readFileSync('./snapshots/extended-feed-rss.xml', 'utf8')
  t.equal(rssFeed, expect, 'xml output snapshot is the same')
  t.end()
})

test('README full integration snapshot', t => {
  const rssFeed = jsonfeedToRSS(readmeFeed)
  const expect = fs.readFileSync('./snapshots/readme-feed-rss.xml', 'utf8')
  t.equal(rssFeed, expect, 'xml output snapshot is the same for README feed')
  t.end()
})

test('Podcast full integration snapshot', t => {
  const rssFeed = jsonfeedToRSS(podcastFeed, podcastOpts)
  const expect = fs.readFileSync('./snapshots/podcast-feed-rss.xml', 'utf8')
  t.equal(rssFeed, expect, 'xml output snapshot is the same for podcast feed')
  t.end()
})

test('Podcast full integration snapshot no itunes', t => {
  const rssFeed = jsonfeedToRSS(podcastFeed)
  const expect = fs.readFileSync('./snapshots/podcast-no-itunes-feed-rss.xml', 'utf8')
  t.equal(rssFeed, expect, 'xml output snapshot is the same for podcast feed without itunes')
  t.end()
})
