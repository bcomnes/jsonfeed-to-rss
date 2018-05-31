const get = require('lodash.get')

function getManagingEditor (jf) {
  const name = get(jf, 'author.name')
  return name ? `noreply@example.com (${name})` : null
}

module.exports = getManagingEditor
