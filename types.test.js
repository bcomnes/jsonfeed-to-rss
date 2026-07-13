/** @import {
 *   ITunesChannelData,
 *   JSONFeed,
 *   JSONFeedWithExtensions,
 *   PodcastChannelData,
 *   PodcastItemData
 * } from './types.js' */

import assert from 'node:assert/strict'
import test from 'node:test'
import jsonfeedToRSS from './index.js'

test('exports schema and converter input types', () => {
  /** @type {JSONFeed} */
  const jsonFeed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'A feed title',
    items: []
  }

  /** @type {JSONFeedWithExtensions} */
  const converterFeed = {
    ...jsonFeed,
    home_page_url: 'https://example.com',
    feed_url: 'https://example.com/feed.json',
    _podcast: {
      medium: 'podcast'
    },
    items: [{
      id: 'episode-1',
      title: 'Episode one',
      _podcast: {
        transcripts: [{
          url: 'https://example.com/episode-1.vtt',
          type: 'text/vtt'
        }]
      }
    }]
  }

  /** @type {ITunesChannelData} */
  const apple = {
    explicit: false,
    categories: [{ category: 'Technology' }]
  }

  /** @type {PodcastChannelData} */
  const podcast = /** @type {PodcastChannelData} */ (converterFeed._podcast)

  /** @type {PodcastItemData} */
  const episode = /** @type {PodcastItemData} */ (converterFeed.items[0]?._podcast)

  assert.equal(apple.explicit, false)
  assert.equal(podcast?.medium, 'podcast')
  assert.equal(episode?.transcripts?.[0]?.type, 'text/vtt')
  assert.doesNotThrow(() => jsonfeedToRSS(converterFeed))
})
