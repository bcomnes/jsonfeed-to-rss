/** @import { Author } from './json-feed-types.d.ts' */

/**
 * JSON Feed 1.1 readers prefer `authors`; `author` remains a deprecated
 * compatibility field in the 1.1 specification.
 *
 * @param {{ authors?: Author[], author?: Author }} object
 * @returns {Author | undefined}
 */
export function getAuthor (object) {
  return object.authors?.[0] ?? object.author
}

/**
 * @param {{ authors?: Author[], author?: Author }} object
 * @returns {string | undefined}
 */
export function getAuthorName (object) {
  return getAuthor(object)?.name
}
