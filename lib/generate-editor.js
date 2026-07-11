import { getAuthorName } from './json-feed-author.js'

/**
 * @param {Parameters<typeof getAuthorName>[0]} jsonFeed
 * @returns {string | null}
 */
export default function getManagingEditor (jsonFeed) {
  const name = getAuthorName(jsonFeed)
  return name ? `noreply@example.com (${name})` : null
}
