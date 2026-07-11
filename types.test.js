/** @import { JSONFeed, JSONFeedWithExtensions } from './types.js' */

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
    feed_url: 'https://example.com/feed.json'
  }

  assert.doesNotThrow(() => jsonfeedToRSS(converterFeed))
})
