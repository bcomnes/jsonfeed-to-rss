const jsonfeedToAtomObject = require('./jsonfeed-to-atom-object')
const testFeed = require('./test-feed.json')
const jsonfeedToAtom = require('./')
const generateTitle = require('./lib/generate-title')
const test = require('tape')
const fs = require('fs')
const packageInfo = require('./package.json')

test('missing property errors', t => {
  t.throws(() => {
    jsonfeedToAtom({
      version: 'https://jsonfeed.org/version/1',
      feed_url: 'https://jsonfeed.org/feed.json'
    })
  }, /missing title/, 'Missing titles throw')

  t.throws(() => {
    jsonfeedToAtom({
      feed_url: 'https://jsonfeed.org/feed.json',
      title: 'A feed title'
    })
  }, /version 1 required/, 'Missing version throw')

  t.throws(() => {
    jsonfeedToAtom({
      version: 'https://jsonfeed.org/version/1',
      title: 'A feed title'
    })
  }, /missing feed_url/, 'Missing version throw')

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
  const atomObj = jsonfeedToAtomObject(testFeed)

  const expect = require('./snapshot.json')

  t.deepEqual(atomObj, expect, 'js transform is expected')
  t.end()
})

test('full integration snapshot', t => {
  const atomFeed = jsonfeedToAtom(testFeed)
  const expect = fs.readFileSync('snapshot.xml', 'utf8')
  t.equal(atomFeed, expect, 'xml output snapshot is the same')
  t.end()
})

test('Missing most fields', {objectPrintDepth: 10}, t => {
  const jf = {
    version: 'https://jsonfeed.org/version/1',
    title: 'a feed',
    feed_url: 'https://jsonfeed.org/version/feed.json',
    items: [
      {
        'date_published': '2018-04-13T22:06:43.000Z',
        'date_modified': '2018-04-16T03:42:56Z',
        'content_text': 'ey, no link, nourl',
        'title': 'but it has a summary!',
        'id': 'a-unique-id',
        'summary': 'but it has a summary!'
      }
    ]
  }
  const expect = { feed: {
    '@xmlns': 'http://www.w3.org/2005/Atom',
    title: 'a feed',
    id: 'https://jsonfeed.org/version/feed.xml',
    updated: '2018-04-16T03:42:56Z',
    link: [
      { '@rel': 'self', '@type': 'application/atom+xml', '@href': 'https://jsonfeed.org/version/feed.xml' },
      { '@rel': 'alternate', '@type': 'application/json', '@href': 'https://jsonfeed.org/version/feed.json' }
    ],
    generator: { '@uri': 'https://github.com/bcomnes/jsonfeed-to-atom#readme', '@version': packageInfo.version, '#text': 'jsonfeed-to-atom' },
    entry: [
      {
        id: 'a-unique-id',
        title: 'but it has a summary!',
        updated: '2018-04-16T03:42:56Z',
        published: '2018-04-13T22:06:43.000Z',
        content: [
          { '@type': 'text', '#text': 'ey, no link, nourl' }
        ],
        link: [],
        summary: 'but it has a summary!'
      }
    ]
  } }

  t.deepEqual(jsonfeedToAtomObject(jf), expect, 'test missing most fields')
  t.end()
})

test('Authorship variants', {objectPrintDepth: 10}, t => {
  const jf = {
    version: 'https://jsonfeed.org/version/1',
    title: 'a feed',
    feed_url: 'https://jsonfeed.org/version/feed.json',
    author: {
      name: 'A primary author'
    },
    items: [
      {
        'date_published': '2018-04-13T22:06:43.000Z',
        'date_modified': '2018-04-16T03:42:56Z',
        'content_text': 'ey, no link, nourl',
        'title': 'but it has a summary!',
        'id': 'a-unique-id',
        'summary': 'but it has a summary!',
        author: {
          'name': 'Different Person'
        }
      },
      {
        'date_published': '2018-04-14T22:06:43.000Z',
        'date_modified': '2018-04-15T03:42:56Z',
        'content_text': 'ey, no link, nourl',
        'title': 'but it has a summary!',
        'id': 'a-unique-id-2',
        'summary': 'but it has a summary!',
        author: {
          'url': 'https://example.com'
        }
      }
    ]
  }

  const atomObj = jsonfeedToAtomObject(jf)

  const jf2 = {
    version: 'https://jsonfeed.org/version/1',
    title: 'a feed',
    feed_url: 'https://jsonfeed.org/version/feed.json',
    author: {
      url: 'https://example.com'
    }
  }

  const atomObj2 = jsonfeedToAtomObject(jf)

  t.end()
})
