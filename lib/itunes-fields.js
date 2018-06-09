const get = require('lodash.get')
const striptags = require('striptags')
const { getFirstParagraph } = require('./generate-title')
const sentenceSplitter = require('sentence-splitter')

exports.getSummary = getSummary

function getSummary (obj) {
  return get(obj, '_itunes.summary') || get(obj, 'summary') || truncate(getFirstParagraph(obj.description || obj.text_content || striptags(obj.html_content)))
}

function truncate (string) {
  return string.length > 5000 ? string.slice(0, 5000) + '…' : string
}

exports.getSubtitle = getSubtitle

function getSubtitle (obj) {
  return get(obj, '_itunes.subtitle') || get(sentenceSplitter.split(getSummary(obj) || '').find(obj => obj.type === 'Sentence'), 'raw')
}
