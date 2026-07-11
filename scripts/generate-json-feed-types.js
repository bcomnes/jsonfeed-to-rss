import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile } from 'json-schema-to-typescript'

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)))
const schemaDirectory = join(rootDirectory, 'schemas')
const outputPath = join(rootDirectory, 'lib', 'json-feed-types.d.ts')
const version = 'https://jsonfeed.org/version/1.1'

const [jsonFeedSchema, jsonFeed1Schema] = await Promise.all([
  readSchema('feed.json'),
  readSchema('feed-1')
])

const adaptedJSONFeedSchema = adaptSchema(jsonFeedSchema)
const adaptedJSONFeed1Schema = adaptSchema(jsonFeed1Schema)
adaptedJSONFeedSchema['title'] = 'JSONFeed'
adaptedJSONFeedSchema['properties']['version'] = {
  description: adaptedJSONFeedSchema['properties']['version'].description,
  enum: [version]
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'jsonfeed-to-rss-schema-'))

try {
  await Promise.all([
    writeFile(
      join(temporaryDirectory, 'feed.json'),
      JSON.stringify(adaptedJSONFeedSchema, null, 2)
    ),
    writeFile(
      join(temporaryDirectory, 'feed-1'),
      JSON.stringify(adaptedJSONFeed1Schema, null, 2)
    )
  ])

  const declarations = await compile(adaptedJSONFeedSchema, 'JSONFeed', {
    bannerComment: [
      '/* eslint-disable */',
      '/**',
      ' * Generated from the SchemaStore JSON Feed 1.1 schema.',
      ' * Run `npm run build:json-feed-types` to regenerate.',
      ' */'
    ].join('\n'),
    cwd: temporaryDirectory,
    unknownAny: true
  })

  await writeFile(outputPath, declarations)
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}

/**
 * @param {string} filename
 * @returns {Promise<Record<string, any>>}
 */
async function readSchema (filename) {
  return JSON.parse(await readFile(join(schemaDirectory, filename), 'utf8'))
}

/**
 * json-schema-to-typescript cannot express JSON Schema pattern properties as
 * template-literal keys. Broaden extension properties to `unknown` in the
 * generated TypeScript while keeping the vendored schemas unchanged.
 *
 * @param {Record<string, any>} schema
 * @returns {Record<string, any>}
 */
function adaptSchema (schema) {
  const clone = structuredClone(schema)

  visit(clone, value => {
    if (value['patternProperties']) {
      delete value['patternProperties']
      value['additionalProperties'] = true
    }
  })

  return clone
}

/**
 * @param {unknown} value
 * @param {(value: Record<string, any>) => void} visitor
 */
function visit (value, visitor) {
  if (!value || typeof value !== 'object') return

  if (!Array.isArray(value)) visitor(value)
  for (const child of Object.values(value)) visit(child, visitor)
}
