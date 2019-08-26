# jsonfeed-to-rss [![stability][0]][1]

[![npm version][2]][3] [![build status][4]][5] [![coverage][12]][13]
[![downloads][8]][9] [![js-standard-style][10]][11]

Convert a JSON feed to an rss feed ([RSS 2.0.11][rss]).  Supports the [@xmlns:itunes][itunes] iTunes RSS extensions and [best practices for podcasts][bp], [xmlns:dc][dc] Dublin Core author names, and the [xmlns:content][content] RDF Site Summary 1.0 Modules: Content encoded content extension.

![JSON feed icon](/reference/icon.png)

## Installation
```console
$ npm install jsonfeed-to-rss
```

## Usage

```js
const jsonfeedToRSS = require('jsonfeed-to-rss')
const someJSONFeed = require('./load-some-json-feed-data.json')

const rssFeed = jsonfeedToRSS(someJSONFeed) // Returns an rss 2.0.11 formatted json feed
```

Example input:

```json
{
  "version":"https://jsonfeed.org/version/1",
  "title":"bret.io log",
  "home_page_url":"https://jsonfeed-to-rss.netlify.com",
  "feed_url":"https://jsonfeed-to-rss.netlify.com/snapshots/readme-feed.json",
  "description": "A simple summary that describes the podcast.  It can have a few sentences.\n\nIf there is more than one paragraph, it gets truncated in some contexts.",
  "next_url":"https://jsonfeed-to-rss.netlify.com/snapshots/2017.json",
  "icon":"https://jsonfeed-to-rss.netlify.com/icon-512x512.png",
  "author":{
     "name":"Bret Comnes",
     "url":"https://bret.io",
     "avatar":"https://gravatar.com/avatar/8d8b82740cb7ca994449cccd1dfdef5f?size=512"
  },
  "_itunes":{
     "about":"https://github.com/bcomnes/jsonfeed-to-rss#itunes",
     "owner": {
       "email": "bcomnes@gmail.com"
     },
     "image": "https://jsonfeed-to-rss.netlify.com/icon-3000x3000.png",
     "category": "Sports & Recreation",
     "subcategory": "Outdoor"
  },
  "items":[
     {
        "date_published":"2018-04-07T20:48:02.000Z",
        "content_html":"<h1>Curam ad aut hactenus dentes cedere vigil</h1>\n<h2>Non Clitorio vertitur cavatur</h2>\n<p>Lorem markdownum edendi, non ad clamant solacia septem ambierantque. Scelus te\nmihi arcum fore nitidam; in dixit de simul.</p>",
        "url":"https://jsonfeed-to-rss.netlify.com/a-url-to-a-post",
        "id":"https://jsonfeed-to-rss.netlify.com/a-url-to-a-post-2018-04-07T20:48:02.000Z",
        "image": "https://jsonfeed-to-rss.netlify.com/a-url-to-a-post/episode-3000x3000.png",
        "_itunes": {
          "episode": 12
        },
        "attachments":[
           {
              "url":"https://jsonfeed-to-rss.netlify.com/a-url-to-a-post/attatchment.mp4",
              "mime_type":"audio/mpeg",
              "title":"Hey this is a podcast episode",
              "duration_in_seconds":12345,
              "size_in_bytes":1234
           }
        ]
     }
  ]
}
```

Example output:

```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <atom:link href="https://jsonfeed-to-rss.netlify.com/snapshots/readme-feed-rss.xml" rel="self" type="application/rss+xml"/>
    <title>bret.io log</title>
    <link>https://jsonfeed-to-rss.netlify.com</link>
    <description>A simple summary that describes the podcast.  It can have a few sentences.

If there is more than one paragraph, it gets truncated in some contexts.</description>
    <language>en-us</language>
    <copyright>© 2018 Bret Comnes</copyright>
    <pubDate>Sat, 07 Apr 2018 20:48:02 GMT</pubDate>
    <category>Sports &amp; Recreation</category>
    <category>Outdoor</category>
    <generator>jsonfeed-to-rss 1.1.1 (https://github.com/bcomnes/jsonfeed-to-rss#readme)</generator>
    <docs>http://www.rssboard.org/rss-specification</docs>
    <image>
      <url>https://jsonfeed-to-rss.netlify.com/icon-512x512.png</url>
      <link>https://jsonfeed-to-rss.netlify.com</link>
      <title>bret.io log</title>
    </image>
    <itunes:author>Bret Comnes</itunes:author>
    <itunes:summary>A simple summary that describes the podcast.  It can have a few sentences.</itunes:summary>
    <itunes:subtitle>A simple summary that describes the podcast.</itunes:subtitle>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>Bret Comnes</itunes:name>
      <itunes:email>bcomnes@gmail.com</itunes:email>
    </itunes:owner>
    <itunes:image href="https://jsonfeed-to-rss.netlify.com/icon-3000x3000.png"/>
    <itunes:category text="Sports &amp; Recreation">
      <itunes:category text="Outdoor"/>
    </itunes:category>
    <item>
      <title>Curam ad aut hactenus dentes cedere vigil</title>
      <link>https://jsonfeed-to-rss.netlify.com/a-url-to-a-post</link>
      <dc:creator>Bret Comnes</dc:creator>
      <description>Curam ad aut hactenus dentes cedere vigil
Non Clitorio vertitur cavatur
Lorem markdownum edendi, non ad clamant solacia septem ambierantque. Scelus te
mihi arcum fore nitidam; in dixit de simul.</description>
      <content:encoded>
        <![CDATA[<h1>Curam ad aut hactenus dentes cedere vigil</h1>
<h2>Non Clitorio vertitur cavatur</h2>
<p>Lorem markdownum edendi, non ad clamant solacia septem ambierantque. Scelus te
mihi arcum fore nitidam; in dixit de simul.</p>]]>
      </content:encoded>
      <guid isPermaLink="false">https://jsonfeed-to-rss.netlify.com/a-url-to-a-post-2018-04-07T20:48:02.000Z</guid>
      <pubDate>Sat, 07 Apr 2018 20:48:02 GMT</pubDate>
      <enclosure type="audio/mpeg" url="https://jsonfeed-to-rss.netlify.com/a-url-to-a-post/attatchment.mp4" length="1234"/>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:title>Curam ad aut hactenus dentes cedere vigil</itunes:title>
      <itunes:author>Bret Comnes</itunes:author>
      <itunes:episode>12</itunes:episode>
      <itunes:subtitle>Curam ad aut hactenus dentes cedere vigil</itunes:subtitle>
      <itunes:summary>Curam ad aut hactenus dentes cedere vigil</itunes:summary>
      <itunes:image>https://jsonfeed-to-rss.netlify.com/a-url-to-a-post/episode-3000x3000.png</itunes:image>
      <itunes:duration>3:25:45</itunes:duration>
      <itunes:season>2018</itunes:season>
    </item>
  </channel>
</rss>
```

## API

### `jsonfeedToRSS(parsedJsonfeed, opts)`
Coverts a parsed JSON feed into an RSS feed.  Returns the string of the rss feed.

Opts include:

```js
{
  // a function that returns the rss feed url
  feedURLFn: (feedURL, jf) => feedURL.replace(/\.json\b/, '-rss.xml'),
  language: 'en-us',
  copyright: `© ${now.getFullYear()} ${jf.author && jf.author.name ? jf.author.name : ''}`,
  managingEditor,
  webMaster,
  idIsPermalink: false, // if guid is the permalink, you can set this true
  category, // array of categories.. will attempt to use iTunes categories if available
  ttl,
  skipHours,
  skipDays,
  itunes: !!jf._itunes // generate RSS feed with iTunes extensions
}
```

## [Dublin Core Extensions][dc]

There is only one mapping implemented between jsonfeed and RSS:

### Items

- `item.author.name || jf.author.name` (recommended) maps to `dc:creator`.

## [RDF Site Summary Extensions][content]

The `content:encoded` field is used to store an `html` representation of content, and RSS's default `description` field is for a plain text representation.

### Items

- `item.content_html` (recommended) maps to a `CDATA` encoded `content:encoded` node.
- `item.content_text || striptags(item.content_html)` (recommended) maps to an escaped `description` node.  When creating an iTunes feed, description is truncated to 4000 characters.

## [iTunes Extensions][itunes]

If the `itunes` option is set to `true` (or if the `jsonfeed._itunes` extension object is included in the jsonfeed) the resulting RSS feed will include as many itunes extension tags as possible.  You can override/set `_itunes` extension fields from the `opts.itunes` object.

All `_itunes.property` map directly to the RSS `itunes:property` extensions, but most have default mappings to standard JSONFeed properties. Its better to rely on the [default JSONFeed fields](https://jsonfeed.org/version/1), but you can override these mappings by including explicit `_itunes` extension properties in your JSONFeed.

- There are a few extension fields that SHOULD be included, but dont map well.  These are marked as (recommended).
- There are fields that dont have a mapping that are definitely optional but CAN be included. These are marked as (optional).
- There are fields that have default and acceptable mappings.  These MAY be included but probably not.  These are marked as (mapped).

### Top-level

- `_itunes.owner.email` (recommended) maps to `itunes:owner.itunes:email`.
- `_itunes.image` (recommended) maps to `itunes:image`.  Defaults to `icon` but the `icon` field does not meet the minimum requirements for this field.  The `icon` field is a 512x512 image, where iTunes recommends Artwork that must be a minimum size of 1400 x 1400 pixels and a maximum size of 3000 x 3000 pixels, in JPEG or PNG format, 72 dpi, with appropriate file extensions (.jpg, .png), and in the RGB colorspace.
- `_itunes.category` (recommended) maps to `itunes:category`.  Defaults to `opts.category[0]`.  Must be a [valid category][categories].
- `_itunes.subcategory` (recommended) maps to `itunes:category:itunes:category`.  Defaults to `opts.category[1]`. Must be a [valid subcategory][categories].
- `_itunes.explicit` (recommended) maps to `itunes:explicit`.  Defaults to unset.  Definitely set this if you like cussin' or for your christian minecraft server 🙏 ⛪️.
- `_itunes.type` (optional) maps to `itunes:type`.  Defaults to `episodic` (newest first).  The other option is `serial` (oldest first). [Details][bp].
- `_itunes.complete` (optional) maps to `itunes:complete`.  Defaults to null.  Tells podcast clients to stop updating this feed ️️️forever. ⚠️
- `_itunes.block` (optional) maps to `itunes:block`.  Defaults to null.  Prevents the feed from being added to Apple's podcast directory.  Helpful for private or customer specific feeds.
- `_itunes.new_feed_url` (optional) maps to `itunes:new-feed-url`.  Used for moving feeds from an old url to a new url.  When generating `next_url` (the next n older feed items), you could generate the converse url for the previous (newer) n items and store it here.
- `_itunes.author` (mapped) maps to `itunes:author`.  Defaults to `author.name`.
- `_itunes.summary` (mapped) maps to `itunes:summary`.  Defaults to the first paragraph of the generated `description` rss field.
- `_itunes.subtitle` (mapped) maps to `itunes:subtitle`.  Defaults to the first sentence of the generated `itunes:summary`.
- `_itunes.owner.name` (mapped) maps to `itunes:owner.itunes:name`.  Defaults to `author.name`.

### Items

- `_itunes.episode` (recommended) maps to `itunes:episode`.  No fallback. Must be an integer > 0.  Its recommended you put episode numbers here, instead of in the title.
- `_itunes.episode_type` (optional) maps to `itunes:episodeType`, but must be one of `full`, `trailer`, or `bonus`.  Defaults to `full`.
- `_itunes.block` (optional) maps to `itunes:block`.  Defaults to null.  Prevents the item from being added to Apple's podcast directory. "For example, you might want to block a specific episode if you know that its content would otherwise cause the entire podcast to be removed from Apple Podcasts."
- `_itunes.is_closed_captioned` (optional) maps to `itunes:isClosedCaptioned`.
- `_itunes.explicit` (optional) maps to `itunes:explicit`.  Defaults to null.
- `_itunes.title` (mapped) maps to `itunes:title`.  Falls back to `item.title` and then the `generateTitle` function.
- `_itunes.author` (mapped) maps to `itunes:author`.  Falls back to `author.name || jf._itunes.author || jf.author.name`.
- `_itunes.subtitle` (mapped) maps to `itunes:subtitle`.  Defaults to the first sentence of the generated `_itunes.summary`.
- `_itunes.summary` (mapped) maps to `itunes:summary`.  Defaults to the first paragraph of the generated plaintext description of the item.
- `_itunes.duration` (mapped) maps to `itunes:duration`. Defaults to `attachment.duration_in_seconds` formatted as HH:MM:SS.
- `_itunes.season` (mapped) maps to `itunes:season`.  Falls back to the year of the item if the podcast is `episodic`.
- `_itunes.image` (mapped) maps to `itunes:image`.  Defaults to `image`.  Artwork must be a minimum size of 1400 x 1400 pixels and a maximum size of 3000 x 3000 pixels, in JPEG or PNG format, 72 dpi, with appropriate file extensions (.jpg, .png), and in the RGB colorspace.  JSONFeed has no defined image restrictions on the `image` field, so it can be safely used for this purpose.

## See also

- [JSON Feed: Mapping RSS and Atom to JSON Feed](https://jsonfeed.org/mappingrssandatom)
- [rssboard.org/rss-specification](http://www.rssboard.org/rss-specification)
- [Really Simple Syndication Best Practices Profile](http://www.rssboard.org/rss-profile#namespace-elements-content-encoded)
- [RSS validator.w3.org](https://validator.w3.org/feed/docs/rss2.html)
- [AtomEnabled: Developers > Syndication](https://web.archive.org/web/20160113103647/http://atomenabled.org/developers/syndication/#link)
- [Why RSS Content Module is Popular](https://developer.mozilla.org/en-US/docs/Web/RSS/Article/Why_RSS_Content_Module_is_Popular_-_Including_HTML_Contents)

### Related projects

- [bcomnes/jsonfeed-to-atom](https://github.com/bcomnes/jsonfeed-to-atom)
- [bcomnes/generate-feed](https://github.com/bcomnes/generate-feed)

### More iTunes RSS feed information

- [RSS tags for Podcasts Connect][itunes]
- [Podcast best practices][bp]
- [Podcasts Connect categories][categories]
  - [bcomnes/podcast-categories](https://github.com/bcomnes/podcast-categories)
- [Apple Create a podcast](https://help.apple.com/itc/podcasts_connect/#/itca5b22233a)
- [Apple RSS feed sample](https://help.apple.com/itc/podcasts_connect/#/itcbaf351599)
  - [reference/podcast.xml](reference/podcast.xml)
- [Apple Requirements - Podcasts Connect Help](https://help.apple.com/itc/podcasts_connect/#/itc1723472cb)
- [Apple Podcasts - What’s New in iOS 11 - 2017](http://podcasts.apple.com/resources/spec/ApplePodcastsSpecUpdatesiOS11.pdf) ([mirror](reference/ApplePodcastsSpecUpdatesiOS11.pdf))
- [Apple Podcasts Identity Guidelines](https://www.apple.com/itunes/marketing-on-podcasts/identity-guidelines.html#messaging-and-style)
- [podbase Podcast Validator](https://podba.se/validate/)

### Reference RSS feeds

- [reference/datcast.xml](reference/datcast.xml)
- [reference/podcast.xml](reference/podcast.xml)
- [reference/rss-2.0-sample.xml](reference/rss-2.0-sample.xml)
- [reference/rss20.xml](reference/rss20.xml)
- [reference/scripting.rss](reference/scripting.rss)

### Snapshots

- [snapshots/podcast-feed.json](snapshots/podcast-feed.json)
- [snapshots/podcast-feed-rss.xml](snapshots/podcast-feed.xml)
- [snapshots/podcast-no-itunes-feed-rss.xml](snapshots/podcast-no-itunes-feed.xml)
- [snapshots/readme-feed.json](snapshots/readme-feed.json)
- [snapshots/readme-feed-rss.xml](snapshots/readme-feed.xml)
- [snapshots/extended-feed-rss.xml](snapshots/snapshot.xml)
- [snapshots/extended-feed.json](snapshots/test-feed.json)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/jsonfeed-to-rss.svg?style=flat-square
[3]: https://npmjs.org/package/jsonfeed-to-rss
[4]: https://img.shields.io/travis/bcomnes/jsonfeed-to-rss/master.svg?style=flat-square
[5]: https://travis-ci.org/bcomnes/jsonfeed-to-rss
[8]: http://img.shields.io/npm/dm/jsonfeed-to-rss.svg?style=flat-square
[9]: https://npmjs.org/package/jsonfeed-to-rss
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[12]: https://img.shields.io/coveralls/bcomnes/jsonfeed-to-rss/master.svg?style=flat-square
[13]: https://coveralls.io/github/bcomnes/jsonfeed-to-rss
[rss]: http://www.rssboard.org/rss-specification
[bp]: https://help.apple.com/itc/podcasts_connect/#/itc2b3780e76
[itunes]: https://help.apple.com/itc/podcasts_connect/#/itcb54353390
[categories]: https://help.apple.com/itc/podcasts_connect/?lang=en#/itc9267a2f12
[dc]: http://www.rssboard.org/rss-profile#namespace-elements-dublin-creator
[content]: http://web.resource.org/rss/1.0/modules/content/
