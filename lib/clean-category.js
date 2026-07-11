import get from 'lodash.get'
import podcastCategories from 'podcast-categories'

/**
 * @param {string | null | undefined} category
 * @returns {string | null}
 */
export function cleanCategory (category) {
  const valid = Boolean(category && get(podcastCategories, category))
  return valid && category ? category : null
}

/**
 * @param {string | null | undefined} category
 * @param {string | null | undefined} subcategory
 * @returns {string | null}
 */
export function cleanSubcategory (category, subcategory) {
  const valid = Boolean(category && subcategory && get(podcastCategories, `${category}.${subcategory}`))
  return valid && subcategory ? subcategory : null
}
