/**
 * Remove empty strings, arrays, objects, null, and undefined recursively.
 * Preserve false, zero, and NaN values.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
export default function cleanDeep (value) {
  if (Array.isArray(value)) {
    return /** @type {T} */ (value
      .map(item => cleanDeep(item))
      .filter(item => !isEmpty(item)))
  }

  if (!isPlainObject(value)) return value

  const cleaned = Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, cleanDeep(item)])
      .filter(([, item]) => !isEmpty(item))
  )

  return /** @type {T} */ (cleaned)
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isEmpty (value) {
  return value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (isPlainObject(value) && Object.keys(value).length === 0)
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject (value) {
  if (!value || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
