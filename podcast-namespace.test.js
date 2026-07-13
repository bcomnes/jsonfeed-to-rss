import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import jsonfeedToRSS from './index.js'
import jsonfeedToRSSObject from './jsonfeed-to-rss-object.js'

const loadModule = createRequire(import.meta.url)
const Ajv = loadModule('ajv')
const addFormats = loadModule('ajv-formats')
const completeFeed = JSON.parse(
  readFileSync(new URL('./snapshots/podcast-namespace-feed.json', import.meta.url), 'utf8')
)
const extensionSchema = JSON.parse(
  readFileSync(new URL('./schemas/podcast-extensions.json', import.meta.url), 'utf8')
)

const activeTags = [
  'podcast:alternateEnclosure',
  'podcast:block',
  'podcast:chapters',
  'podcast:chat',
  'podcast:contentLink',
  'podcast:episode',
  'podcast:funding',
  'podcast:guid',
  'podcast:image',
  'podcast:integrity',
  'podcast:license',
  'podcast:liveItem',
  'podcast:location',
  'podcast:locked',
  'podcast:medium',
  'podcast:person',
  'podcast:podping',
  'podcast:podroll',
  'podcast:publisher',
  'podcast:remoteItem',
  'podcast:season',
  'podcast:socialInteract',
  'podcast:soundbite',
  'podcast:source',
  'podcast:trailer',
  'podcast:transcript',
  'podcast:txt',
  'podcast:updateFrequency',
  'podcast:value',
  'podcast:valueRecipient',
  'podcast:valueTimeSplit'
]

test('complete fixture conforms to the generated extension schema', () => {
  const ajv = new Ajv({ strict: false })
  addFormats(ajv)
  const validate = ajv.compile(extensionSchema)
  const valid = validate({
    channel: {
      _podcast: completeFeed._podcast
    },
    item: {
      _podcast: completeFeed.items[0]._podcast
    }
  })

  assert.equal(valid, true, JSON.stringify(validate.errors, null, 2))
})

test('supports all active Podcasting 2.0 tags', () => {
  const rss = jsonfeedToRSSObject(completeFeed)
  const keys = collectKeys(rss)

  assert.equal(activeTags.length, 31)
  for (const tag of activeTags) assert.ok(keys.has(tag), `missing ${tag}`)
  assert.equal(keys.has('podcast:images'), false)
  assert.equal(rss['rss']['@xmlns:podcast'], 'https://podcastindex.org/namespace/1.0')
})

test('serializes nested Podcasting 2.0 structures', () => {
  const xml = jsonfeedToRSS(completeFeed)

  assert.match(xml, /<podcast:transcript url="https:\/\/example\.com\/episode-1\.vtt" type="text\/vtt" language="en-US" rel="captions"\/>/)
  assert.match(xml, /<podcast:chapters url="https:\/\/example\.com\/episode-1-chapters\.json" type="application\/json\+chapters"\/>/)
  assert.match(xml, /<podcast:alternateEnclosure[^>]+>/)
  assert.match(xml, /<podcast:source uri="ipfs:\/\/episode-1-opus" contentType="audio\/opus"\/>/)
  assert.match(xml, /<podcast:valueTimeSplit startTime="300" duration="60" remoteStartTime="10" remotePercentage="95">/)
  assert.match(xml, /<podcast:liveItem status="pending" start="2026-08-01T17:00:00Z" end="2026-08-01T18:00:00Z">/)
  assert.match(xml, /<podcast:transcript url="https:\/\/example\.com\/live\.vtt" type="text\/vtt" language="en-US" rel="captions"\/>/)
  assert.match(xml, /<podcast:episode display="Live special">4<\/podcast:episode>/)
  assert.match(xml, /<podcast:image[^>]+aspect-ratio="1\/1"[^>]+purpose="artwork"\/>/)
})

test('maps JSON Feed authors to podcast people when no override exists', () => {
  const feed = structuredClone(completeFeed)
  delete feed._podcast.people
  delete feed.items[0]._podcast.people

  const rss = jsonfeedToRSSObject(feed)

  assert.deepEqual(rss['rss'].channel['podcast:person'], [{
    '#text': 'Alice Host',
    '@href': 'https://example.com/alice',
    '@img': 'https://example.com/alice.jpg'
  }])
  assert.deepEqual(rss['rss'].channel.item[0]['podcast:person'], [{
    '#text': 'Alice Host',
    '@href': 'https://example.com/alice',
    '@img': 'https://example.com/alice.jpg'
  }])
})

test('rejects malformed nested Podcasting 2.0 values with a cited error', () => {
  const feed = structuredClone(completeFeed)
  feed.items[0]._podcast.values[0].time_splits[0].remote_item = {
    feed_guid: '917393e3-1b1e-5cef-ace4-edaa54e1f810'
  }

  assert.throws(
    () => jsonfeedToRSS(feed),
    /value time split requires recipients or one remote item; see https:\/\/github\.com\/Podcastindex-org\/podcast-namespace/
  )
})

/**
 * @param {unknown} value
 * @param {Set<string>} [keys]
 * @returns {Set<string>}
 */
function collectKeys (value, keys = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, keys)
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      keys.add(key)
      collectKeys(item, keys)
    }
  }
  return keys
}
