const striptags = require('striptags')
const trimRight = require('trim-right')
const trimLeft = require('trim-left')
const sentenceSplitter = require('sentence-splitter')
const get = require('lodash.get')

/**
 *  Generate the required atom title for a JSON feed item
 */
module.exports = function generateTitle (item) {
  // A fairly arbitrary attempt at generating titles.
  // Ideally your JSON feed includes a title for every post. Most UI's will look strange without it
  if (item.title) return item.title
  if (item.summary) return cleanTitleString(item.summary)
  if (item.content_text) { return cleanTitleString(item.content_text) }
  if (item.content_html) return cleanTitleString(striptags(item.content_html))
  throw new Error('jsonfeed-to-atom: can\'t generate a title for entry ' + item.id)
}
/**
 * Removes title unfriendly whitespace
 */
function getFirstParagraph (str) {
  return trimPadding(trimPadding(str).split('\n')[0])
}

function getFirstSentence (str) {
  const splitString = sentenceSplitter.split(getFirstParagraph(str) || '')
  const sentenceObj = splitString.find(obj => obj.type === 'Sentence')
  const rawSentence = get(sentenceObj, 'raw')
  return rawSentence
}

module.exports.getFirstParagraph = getFirstParagraph

/**
 * Truncate a string to 100 characters with an ellipsis
 */
function truncate (string) {
  return string.length > 100 ? string.slice(0, 100) + '…' : string
}

function trimPadding (str) {
  return trimLeft(trimRight(str))
}

function removeTrailingPeriod (str) {
  const stripped = trimPadding(str)
  return stripped.endsWith('.') ? stripped.slice(0, -1) : stripped
}

function cleanTitleString (str) {
  return truncate(removeTrailingPeriod(getFirstSentence(str)))
}
