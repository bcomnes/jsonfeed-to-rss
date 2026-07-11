import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import jsonfeedToRSS from './index.js'
import jsonfeedToRSSObject from './jsonfeed-to-rss-object.js'
import cleanDeep from './lib/clean-deep.js'
import generateTitle from './lib/generate-title.js'
import htmlToPlainText from './lib/html-to-plain-text.js'

const extendedFeed = readJSON('./snapshots/extended-feed.json')
const readmeFeed = readJSON('./snapshots/readme-feed.json')
const podcastFeed = readJSON('./snapshots/podcast-feed.json')
const podcastOptions = readJSON('./snapshots/podcast-opts.json')
const datedOptions = { copyright: '© 2018 Bret Comnes' }
const undatedAuthorOptions = { copyright: '© 2018 ' }

test('requires exactly JSON Feed version 1.1', () => {
  /** @type {any} */
  const validFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'A feed title',
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.json',
    items: []
  }

  assert.doesNotThrow(() => jsonfeedToRSS(validFeed))

  for (const version of [
    undefined,
    'https://jsonfeed.org/version/1',
    'https://example.com/json-feed-version'
  ]) {
    assert.throws(
      () => jsonfeedToRSS({ ...validFeed, version }),
      /JSON Feed version 1\.1 required/
    )
  }
})

test('reports missing properties', () => {
  /** @type {any} */
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'A feed title',
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.json',
    items: []
  }

  assert.throws(
    () => jsonfeedToRSS({ ...feed, title: '' }),
    /missing title/
  )
  assert.throws(
    () => jsonfeedToRSS({ ...feed, feed_url: '' }),
    /missing feed_url/
  )
  assert.throws(
    () => jsonfeedToRSS({ ...feed, home_page_url: '' }),
    /missing home_page_url/
  )
})

test('prefers JSON Feed 1.1 authors and language', () => {
  const rss = jsonfeedToRSSObject({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'A feed title',
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.json',
    language: 'fr-CA',
    author: { name: 'Deprecated author' },
    authors: [{ name: 'Preferred author' }],
    items: [{
      id: 'item-1',
      content_text: 'An item',
      author: { name: 'Deprecated item author' },
      authors: [{ name: 'Preferred item author' }]
    }]
  })

  assert.equal(rss['rss'].channel.language, 'fr-CA')
  assert.equal(rss['rss'].channel['dc:creator'], undefined)
  assert.equal(rss['rss'].channel.item[0]['dc:creator'], 'Preferred item author')
  assert.match(rss['rss'].channel.copyright, /Preferred author$/)
})

test('generateTitle', () => {
  const simpleTitle = 'Hey this is a title'
  assert.equal(generateTitle({ title: simpleTitle }), simpleTitle)

  const missingTitle = {
    summary: 'This is a summary',
    content_text: 'This is some text',
    content_html: '<p>yo</p>  '
  }
  assert.equal(generateTitle(missingTitle), missingTitle.summary)

  const { summary: _summary, ...missingSummary } = missingTitle
  assert.equal(generateTitle(missingSummary), missingSummary.content_text)

  const { content_text: _contentText, ...missingText } = missingSummary
  assert.equal(generateTitle(missingText), 'yo')

  assert.throws(() => generateTitle({}), /can't generate a title/)
})

test('converts HTML to readable plain text', () => {
  assert.equal(
    htmlToPlainText('<p>&#8220;Hi&#8221; <a href="https://example.com">there</a><img src="image.jpg"></p>'),
    '“Hi” there'
  )
})

test('removes empty nested values without removing meaningful falsy values', () => {
  assert.deepEqual(
    cleanDeep({
      emptyString: '',
      emptyArray: [null, '', {}],
      nested: { empty: undefined, value: 'kept' },
      falseValue: false,
      zero: 0,
      notANumber: Number.NaN
    }),
    {
      nested: { value: 'kept' },
      falseValue: false,
      zero: 0,
      notANumber: Number.NaN
    }
  )
})

test('merges partial iTunes owner options', () => {
  const rss = jsonfeedToRSSObject({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'A podcast',
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.json',
    items: [],
    _itunes: { owner: { name: 'Owner name' } }
  }, {
    itunes: { owner: { email: 'owner@example.com' } }
  })

  assert.deepEqual(rss['rss'].channel['itunes:owner'], {
    'itunes:name': 'Owner name',
    'itunes:email': 'owner@example.com'
  })
})

test('object snapshot', () => {
  const rssObject = jsonfeedToRSSObject(extendedFeed, datedOptions)
  const expected = readJSON('./snapshots/extended-feed-rss.json')
  assert.deepEqual(rssObject, expected)
})

test('XML snapshots', async t => {
  const fixtures = [
    [extendedFeed, datedOptions, './snapshots/extended-feed-rss.xml'],
    [readmeFeed, datedOptions, './snapshots/readme-feed-rss.xml'],
    [podcastFeed, { ...podcastOptions, ...undatedAuthorOptions }, './snapshots/podcast-feed-rss.xml'],
    [podcastFeed, undatedAuthorOptions, './snapshots/podcast-no-itunes-feed-rss.xml']
  ]

  for (const [feed, options, snapshot] of fixtures) {
    await t.test(snapshot, () => {
      const expected = readFileSync(new URL(snapshot, import.meta.url), 'utf8')
      assert.equal(jsonfeedToRSS(feed, options), expected)
    })
  }
})

/**
 * @param {string} path
 * @returns {any}
 */
function readJSON (path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
}
