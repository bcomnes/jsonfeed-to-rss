const podcastCategories = require('podcast-categories')
const get = require('lodash.get')

exports.cleanCategory = function cleanCategory (category) {
  const valid = !!get(podcastCategories, `${category}`)
  return valid ? category : null
}

exports.cleanSubcategory = function cleanSubcategory (category, subcategory) {
  const valid = !!get(podcastCategories, `${category}.${subcategory}`)
  return valid ? subcategory : null
}
