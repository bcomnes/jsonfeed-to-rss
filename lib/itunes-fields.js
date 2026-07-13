import { split } from 'sentence-splitter'
import { getFirstParagraph } from './generate-title.js'
import htmlToPlainText from './html-to-plain-text.js'

/**
 * @param {Record<string, any>} object
 * @returns {string | null}
 */
export function getSummary (object) {
  return truncate4k(
    object['_itunes']?.summary ||
    object['summary'] ||
    getFirstParagraph(
      object['description'] ||
      object['content_text'] ||
      htmlToPlainText(object['content_html'] || '')
    )
  )
}

/**
 * @param {unknown} string
 * @returns {string | null}
 */
export function truncate4k (string) {
  return truncateUTF8(string, 4000)
}

/**
 * Truncate a string to a UTF-8 byte limit without splitting a code point.
 *
 * @param {unknown} string
 * @param {number} maximumBytes
 * @returns {string | null}
 */
export function truncateUTF8 (string, maximumBytes) {
  if (typeof string !== 'string') return null
  if (Buffer.byteLength(string) <= maximumBytes) return string

  const ellipsis = '…'
  const limit = maximumBytes - Buffer.byteLength(ellipsis)
  let result = ''
  for (const character of string) {
    if (Buffer.byteLength(result + character) > limit) break
    result += character
  }
  return `${result}${ellipsis}`
}

/**
 * @param {unknown} string
 * @returns {string | null}
 */
export function truncate250 (string) {
  if (typeof string !== 'string') return null
  return string.length > 250 ? `${string.slice(0, 249)}…` : string
}

/**
 * @param {Record<string, any>} object
 * @returns {string | null}
 */
export function getSubtitle (object) {
  const summary = getSummary(object) || ''
  const sentence = split(summary).find(node => node.type === 'Sentence')
  return truncate250(object['_itunes']?.subtitle || sentence?.raw)
}

/**
 * @param {number} timeInSeconds
 * @returns {string}
 */
export function secondsToHMS (timeInSeconds) {
  const roundTowardZero = timeInSeconds > 0 ? Math.floor : Math.ceil
  const hours = roundTowardZero(timeInSeconds / 3600)
  const minutes = roundTowardZero(timeInSeconds / 60) % 60
  const seconds = roundTowardZero(timeInSeconds) % 60
  const paddedSeconds = padNumber(seconds)

  if (hours) return `${hours}:${padNumber(minutes)}:${paddedSeconds}`
  return `${minutes}:${paddedSeconds}`
}

/**
 * @param {number} value
 * @returns {string}
 */
function padNumber (value) {
  const sign = value < 0 ? '-' : ''
  return `${sign}${String(Math.abs(value)).padStart(2, '0')}`
}

/**
 * @param {Record<string, any>} jsonFeed
 * @returns {'episodic' | 'serial'}
 */
export function getPodcastType (jsonFeed) {
  const type = jsonFeed['_itunes']?.type
  return type === 'serial' ? 'serial' : 'episodic'
}
