const test = require('tape')
const fs = require('fs')
const generateTitle = require('./lib/generate-title')
const jsonfeedToRSS = require('./')
const jsonfeedToRSSObject = require('./jsonfeed-to-rss-object')

const testFeed = require('./snapshots/test-feed.json')

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

  t.throws(() => {
    jsonfeedToRSS({
      version: 'https://jsonfeed.org/version/1',
      feed_url: 'https://jsonfeed.org/feed.json',
      title: 'A feed title',
      home_page_url: 'https://bret.io'
    })
  }, /missing description/, 'Missing description throw')

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
  const rssObj = jsonfeedToRSSObject(testFeed)

  const expect = require('./snapshots/snapshot.json')

  t.deepEqual(rssObj, expect, 'js transform is expected')
  t.end()
})

test('full integration snapshot', t => {
  const rssFeed = jsonfeedToRSS(testFeed)
  const expect = fs.readFileSync('./snapshots/snapshot.xml', 'utf8')
  t.equal(rssFeed, expect, 'xml output snapshot is the same')
  t.end()
})
