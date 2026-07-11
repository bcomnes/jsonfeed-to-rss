import { convert } from 'html-to-text'

/** @type {import('html-to-text').HtmlToTextOptions} */
const options = {
  wordwrap: false,
  selectors: [
    { selector: 'a', options: { ignoreHref: true } },
    { selector: 'img', format: 'skip' },
    { selector: 'hr', format: 'skip' },
    { selector: 'ul', options: { itemPrefix: '' } },
    { selector: 'h1', options: { uppercase: false } },
    { selector: 'h2', options: { uppercase: false } },
    { selector: 'h3', options: { uppercase: false } },
    { selector: 'h4', options: { uppercase: false } },
    { selector: 'h5', options: { uppercase: false } },
    { selector: 'h6', options: { uppercase: false } }
  ]
}

/**
 * @param {string} html
 * @returns {string}
 */
export default function htmlToPlainText (html) {
  return convert(html, options)
}
