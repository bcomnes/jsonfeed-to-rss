const get = require('lodash.get')
const striptags = require('striptags')
const { getFirstParagraph } = require('./generate-title')
const sentenceSplitter = require('sentence-splitter')
const addZero = require('add-zero')

exports.getSummary = getSummary

function getSummary (obj) {
  return truncate4k(
    get(obj, '_itunes.summary') ||
    get(obj, 'summary') ||
    getFirstParagraph(obj.description ||
       obj.content_text ||
       striptags(obj.content_html)
    )
  )
}

exports.truncate4k = truncate4k

function truncate4k (string) {
  if (typeof string !== 'string') return null
  return string.length > 4000 ? string.slice(0, 4000 - 1) + '…' : string
}

exports.truncate250 = truncate250

function truncate250 (string) {
  if (typeof string !== 'string') return null
  return string.length > 250 ? string.slice(0, 250 - 1) + '…' : string
}

exports.getSubtitle = getSubtitle

function getSubtitle (obj) {
  return truncate250(
    get(obj, '_itunes.subtitle') ||
    get(sentenceSplitter.split(
      getSummary(obj) || '').find(obj => obj.type === 'Sentence'), 'raw'))
}

exports.secondsToHMS = secondsToHMS

function secondsToHMS (timeInSeconds) {
  const roundTowardZero = timeInSeconds > 0 ? Math.floor : Math.ceil
  let { hours, minutes, seconds } = {
    hours: roundTowardZero(timeInSeconds / 3600),
    minutes: roundTowardZero(timeInSeconds / 60) % 60,
    seconds: roundTowardZero(timeInSeconds) % 60
  }

  seconds = addZero(seconds)

  if (hours) return `${hours}:${addZero(minutes)}:${seconds}`
  return `${minutes}:${seconds}`
}

exports.getPodcastType = getPodcastType

function getPodcastType (jf) {
  return ['episodic', 'serial'].some(type => get(jf, '_itunes.type') === type) ? get(jf, '_itunes.type') : 'episodic'
}
