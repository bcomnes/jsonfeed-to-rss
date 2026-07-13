import { execFileSync } from 'node:child_process'

const expectedCommit = 'c0ff5caa3729610362ee93f8034454fa41f3c493'
const repository = 'Podcastindex-org/podcast-namespace'
const appleSources = [
  'https://podcasters.apple.com/support/823-podcast-requirements',
  'https://podcasters.apple.com/support/1691-apple-podcasts-categories',
  'https://podcasters.apple.com/support/5514-show-cover-template',
  'https://podcasters.apple.com/support/5516-episode-art-template',
  'https://podcasters.apple.com/support/5316-transcripts-on-apple-podcasts',
  'https://podcasters.apple.com/support/5482-using-chapters-on-apple-podcasts'
]

const headers = {
  accept: 'application/vnd.github+json',
  'user-agent': 'jsonfeed-to-rss-podcast-spec-check',
  ...(process.env['GITHUB_TOKEN']
    ? { authorization: `Bearer ${process.env['GITHUB_TOKEN']}` }
    : {})
}

const response = await fetch(`https://api.github.com/repos/${repository}/commits/main`, {
  headers
})

if (!response.ok) {
  throw new Error(`Unable to check ${repository}: ${response.status} ${response.statusText}`)
}

const commit = await response.json()
if (!commit || typeof commit !== 'object' || !('sha' in commit) || typeof commit.sha !== 'string') {
  throw new Error(`Unexpected response while checking ${repository}`)
}
if (commit.sha !== expectedCommit) {
  throw new Error([
    'The Podcasting 2.0 namespace changed.',
    `Expected ${expectedCommit} but main is ${commit.sha}.`,
    `Review https://github.com/${repository}/compare/${expectedCommit}...${commit.sha}`,
    'Update the schema, serializer, complete fixture, types, support matrix, and migration skill together.'
  ].join('\n'))
}

for (const url of appleSources) {
  try {
    execFileSync('curl', [
      '--fail',
      '--head',
      '--location',
      '--max-time',
      '30',
      '--retry',
      '3',
      '--show-error',
      '--silent',
      url
    ])
  } catch {
    throw new Error(`Apple Podcasts source is unavailable: ${url}`)
  }
}

console.log(`Podcasting 2.0 remains pinned to ${expectedCommit}.`)
console.log(`Checked ${appleSources.length} Apple Podcasts source URLs.`)
