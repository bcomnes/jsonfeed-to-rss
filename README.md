# jsonfeed-to-rss [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![coverage][12]][13]
[![downloads][8]][9] [![js-standard-style][10]][11]

Convert a JSON feed to an rss feed ([RSS 2.0.11][rss]).  Supports the [@xmlns:itunes][bp] iTunes RSS extensions and best practices for podcasts, [xmlns:dc](http://www.rssboard.org/rss-profile#namespace-elements-dublin-creator) Dublin Core author names, and the [xmlns:content](RDF Site Summary 1.0 Modules: Content) encoded content extension.  

![JSON feed icon](/icon.png) 

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
  "version": "https://jsonfeed.org/version/1",
  "title": "bret.io log",
  "home_page_url": "https://bret.io",
  "feed_url": "https://bret.io/feed.json",
  "description": "A running log of announcements, projects and accomplishments.",
  "next_url": "https://bret.io/2017.json",
  "icon": "https://bret.io/icon-512x512.png",
  "author": {
   "name": "Bret Comnes",
   "url": "https://bret.io",
   "avatar": "https://gravatar.com/avatar/8d8b82740cb7ca994449cccd1dfdef5f?size=512"
  },
  "_itunes": {
    about: "https://github.com/bcomnes/jsonfeed-to-rss#itunes"
  },
  "items": [
   {
    "date_published": "2018-04-07T20:48:02.000Z",
    "content_text": "Wee wooo this is some content. \n Maybe a new paragraph too",
    "url": "https://bret.io/my-text-post",
    "id": "https://bret.io/my-text-post-2018-04-07T20:48:02.000Z",
    "attachments":[  
      {  
        "url":"https://example.com/attatchments.mp4",
        "mime_type":"audio/mpeg",
        "title":"Hey this is a podcast",
        "duration_in_seconds":12345,
        "size_in_bytes":1234
      }
    ]
   },**
   {**
    "date_published": "2018-04-07T22:06:43.000Z",
    "content_html": "<p>Hello, world!</p>",
    "title": "This is a blog title",
    "url": "https://bret.io/my-blog-post",
    "external_url": "https://example.com/some-external-link",
    "id": "https://bret.io/my-blog-post-2018-04-07T22:06:43.000Z"
   }
  ]
}
```

Example output:

```xml
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <atom:link href="https://bret.io/feed-rss.xml" rel="self" type="application/rss+xml"/>
    <title>bret.io log</title>
    <link>https://bret.io</link>
    <description>A running log of announcements, projects and accomplishments.</description>
    <language>en-us</language>
    <copyright>© 2018 Bret Comnes</copyright>
    <pubDate>Sat, 07 Apr 2018 22:06:43 GMT</pubDate>
    <generator>jsonfeed-to-rss 1.0.2 (https://github.com/bcomnes/jsonfeed-to-rss#readme)</generator>
    <docs>http://www.rssboard.org/rss-specification</docs>
    <image>
      <url>https://bret.io/icon-512x512.png</url>
      <link>https://bret.io</link>
      <title>bret.io log</title>
    </image>
    <itunes:author>Bret Comnes</itunes:author>
    <itunes:summary>A running log of announcements, projects and accomplishments.</itunes:summary>
    <itunes:type>episodic</itunes:type>
    <itunes:owner>
      <itunes:name>Bret Comnes</itunes:name>
    </itunes:owner>
    <itunes:image>https://bret.io/icon-512x512.png</itunes:image>
    <itunes:explicit>no</itunes:explicit>
    <item>
      <title>Wee wooo this is some content. </title>
      <link>https://bret.io/my-text-post</link>
      <dc:creator>Bret Comnes</dc:creator>
      <description>Wee wooo this is some content. 
 Maybe a new paragraph too</description>
      <guid isPermaLink="false">https://bret.io/my-text-post-2018-04-07T20:48:02.000Z</guid>
      <pubDate>Sat, 07 Apr 2018 20:48:02 GMT</pubDate>
      <enclosure type="audio/mpeg" url="https://example.com/attatchments.mp4" length="1234"/>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:title>Wee wooo this is some content. </itunes:title>
      <itunes:author>Bret Comnes</itunes:author>
      <itunes:duration>12345</itunes:duration>
    </item>
    <item>
      <title>This is a blog title</title>
      <link>https://example.com/some-external-link</link>
      <dc:creator>Bret Comnes</dc:creator>
      <description>Hello, world!</description>
      <content:encoded>
        <![CDATA[<p>Hello, world!</p>]]>
      </content:encoded>
      <guid isPermaLink="false">https://bret.io/my-blog-post-2018-04-07T22:06:43.000Z</guid>
      <pubDate>Sat, 07 Apr 2018 22:06:43 GMT</pubDate>
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

## Dublin Core Extensions

There is only one mapping implemented between jsonfeed and RSS:

### Items

- `item.author.name || jf.author.name` (recommended) maps to `dc:creator`.

## RDF Site Summary Extensions

The `content:encoded` field is used to store an `html` representation of content, and RSS's default `description` field is for a plain text representation.  

### Items

- `item.content_html` (recommended) maps to a `CDATA` encoded `content:encoded` node.
- `item.content_text || striptags(item.content_html)` (recommended) maps to an escaped `description` node.

### Items

## iTunes Extensions

If the `itunes` option is set to `true` (or if the `jsonfeed._itunes` extension object is included in the jsonfeed) the resulting RSS feed will include as many itunes extension tags as possible.  

All `_itunes.property` map directly to the RSS `itunes:property` extension, but most have default mappings to standard JSONFeed properties.  Its better to rely on the [default JSONFeed fields](https://jsonfeed.org/version/1), but you can override these mappings by including explicit `_itunes` extension properties in your JSONFeed.

### Top-level

- `_itunes.author` (optional) maps to `itunes:author`.  Defaults to `author.name`.
- `_itunes.summary` (optional) maps to `itunes:summary`.  Defaults to `description`.
- 'itunes:subtitle' (recommended) maps to `itunes:subtitle`.
- 'itunes:type' (recommended) maps to `itunes:type`.  Defaults to `episodic` (newest first).  The other option is `serial` (oldest first). [Details][bp].
- `_itunes.owner.name` (optional) maps to `itunes:owner.itunes:name`.  Defaults to `author.name`.
- `_itunes.owner.email` (recommended) maps to `itunes:owner.itunes:email`.
- `_itunes.image` (recommended) maps to `itunes:image`.  Defaults to `icon`.  iTunes has a different image recommendations than JSONFeed, so this is recommended.
- `_itunes.category` (recommended) maps to `itunes:category`.  Defaults to `opts.category[0]`
- `_itunes.subcategory` (recommended) maps to `itunes:category:itunes:category`.  Defaults to `opts.category[1]`
- `_itunes.explicit` (optional) maps to `itunes:explicit`.  Defaults to 'no'.  Definitely set this if you like to swear. ✝️ Christian channel! 🙏 

### Items




## See also

- [JSON Feed: Mapping RSS and Atom to JSON Feed](https://jsonfeed.org/mappingrssandatom)
- [rssboard.org/rss-specification](http://www.rssboard.org/rss-specification)
- [Really Simple Syndication Best Practices Profile](http://www.rssboard.org/rss-profile#namespace-elements-content-encoded)
- [validator.w3.org](https://validator.w3.org/feed/docs/rss2.html)
- [AtomEnabled: Developers > Syndication](https://web.archive.org/web/20160113103647/http://atomenabled.org/developers/syndication/#link)
- [bcomnes/generate-feed](https://github.com/bcomnes/generate-feed)
- [Apple Requirements - Podcasts Connect Help](https://help.apple.com/itc/podcasts_connect/#/itc1723472cb)
- [Apple RSS feed sample](https://help.apple.com/itc/podcasts_connect/#/itcbaf351599)
- [Apple Create a podcast](https://help.apple.com/itc/podcasts_connect/#/itca5b22233a)
- [Apple Podcasts Identity Guidelines](https://www.apple.com/itunes/marketing-on-podcasts/identity-guidelines.html#messaging-and-style)
- [Why RSS Content Module is Popular](https://developer.mozilla.org/en-US/docs/Web/RSS/Article/Why_RSS_Content_Module_is_Popular_-_Including_HTML_Contents)
- [Apple Podcasts - What’s New in iOS 11 - 2017](http://podcasts.apple.com/resources/spec/ApplePodcastsSpecUpdatesiOS11.pdf)

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
