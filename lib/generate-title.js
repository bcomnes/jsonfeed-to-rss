import { split } from 'sentence-splitter'
import htmlToPlainText from './html-to-plain-text.js'

/**
 * Generate the required RSS title for a JSON Feed item.
 *
 * @param {{ id?: string | number, title?: string, summary?: string, content_text?: string, content_html?: string }} item
 * @returns {string}
 */
export default function generateTitle (item) {
  if (item.title) return item.title
  if (item.summary) return cleanTitleString(item.summary)
  if (item.content_text) return cleanTitleString(item.content_text)
  if (item.content_html) return cleanTitleString(htmlToPlainText(item.content_html))

  throw new Error(`jsonfeed-to-rss: can't generate a title for item ${item.id ?? ''}`)
}

/**
 * @param {string} string
 * @returns {string}
 */
export function getFirstParagraph (string) {
  return string.trim().split('\n')[0]?.trim() ?? ''
}

/**
 * @param {string} string
 * @returns {string | undefined}
 */
function getFirstSentence (string) {
  const sentence = split(getFirstParagraph(string) || '')
    .find(node => node.type === 'Sentence')

  return sentence?.raw
}

/**
 * @param {string} string
 * @returns {string}
 */
function truncate (string) {
  return string.length > 100 ? `${string.slice(0, 100)}…` : string
}

/**
 * @param {string} string
 * @returns {string}
 */
function removeTrailingPeriod (string) {
  const stripped = string.trim()
  return stripped.endsWith('.') ? stripped.slice(0, -1) : stripped
}

/**
 * @param {string} string
 * @returns {string}
 */
function cleanTitleString (string) {
  return truncate(removeTrailingPeriod(getFirstSentence(string) ?? string))
}
