import get from 'lodash.get'
import { split } from 'sentence-splitter'
import striptags from 'striptags'
import { getFirstParagraph } from './generate-title.js'

/**
 * @param {Record<string, any>} object
 * @returns {string | null}
 */
export function getSummary (object) {
  return truncate4k(
    get(object, '_itunes.summary') ||
    get(object, 'summary') ||
    getFirstParagraph(
      object['description'] ||
      object['content_text'] ||
      striptags(object['content_html'] || '')
    )
  )
}

/**
 * @param {unknown} string
 * @returns {string | null}
 */
export function truncate4k (string) {
  if (typeof string !== 'string') return null
  return string.length > 4000 ? `${string.slice(0, 3999)}…` : string
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
  return truncate250(get(object, '_itunes.subtitle') || get(sentence, 'raw'))
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
  const type = get(jsonFeed, '_itunes.type')
  return type === 'serial' ? 'serial' : 'episodic'
}
