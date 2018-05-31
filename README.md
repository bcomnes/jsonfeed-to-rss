# jsonfeed-to-rss [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![coverage][12]][13]
[![downloads][8]][9] [![js-standard-style][10]][11]

Convert a JSON feed to an rss feed ([RSS 2.0.11][rss]).

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
 "items": [
  {
   "date_published": "2018-04-07T20:48:02.000Z",
   "content_text": "Wee wooo this is some content. \n Maybe a new paragraph too",
   "url": "https://bret.io/my-text-post",
   "id": "https://bret.io/my-text-post-2018-04-07T20:48:02.000Z"
  },
  {
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
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <atom:link href="https://bret.io/feed-rss.xml" rel="self" type="application/rss+xml"/>
    <title>bret.io log (RSS)</title>
    <link>https://bret.io</link>
    <description>A running log of announcements, projects and accomplishments.</description>
    <language>en-us</language>
    <copyright>© 2018 Bret Comnes</copyright>
    <pubDate>Sat, 07 Apr 2018 22:06:43 GMT</pubDate>
    <generator>jsonfeed-to-rss 1.0.0 (https://github.com/bcomnes/jsonfeed-to-rss#readme)</generator>
    <docs>http://www.rssboard.org/rss-specification</docs>
    <image>
      <url>https://bret.io/icon-512x512.png</url>
      <link>https://bret.io</link>
      <title>bret.io log (RSS)</title>
    </image>
    <item>
      <title>Wee wooo this is some content.</title>
      <link>https://bret.io/my-text-post</link>
      <dc:creator>Bret Comnes</dc:creator>
      <description xml:base="https://bret.io">
        <![CDATA[Wee wooo this is some content. 
 Maybe a new paragraph too]]>
      </description>
      <content:encoded xml:base="https://bret.io">
        <![CDATA[Wee wooo this is some content. 
 Maybe a new paragraph too]]>
      </content:encoded>
      <guid isPermaLink="false">https://bret.io/my-text-post-2018-04-07T20:48:02.000Z</guid>
      <pubDate>Sat, 07 Apr 2018 20:48:02 GMT</pubDate>
    </item>
    <item>
      <title>This is a blog title</title>
      <link>https://example.com/some-external-link</link>
      <dc:creator>Bret Comnes</dc:creator>
      <description xml:base="https://bret.io">
        <![CDATA[<p>Hello, world!</p>]]>
      </description>
      <content:encoded xml:base="https://bret.io">
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
  idIsPermalink, // if guid is the permalink, you can use this
  category, // array of categories
  ttl, 
  skipHours,
  skipDays
}
```

## See also

- [JSON Feed: Mapping RSS and Atom to JSON Feed](https://jsonfeed.org/mappingrssandatom)
- [rssboard.org/rss-specification](http://www.rssboard.org/rss-specification)
- [validator.w3.org](https://validator.w3.org/feed/docs/rss2.html)
- [AtomEnabled: Developers > Syndication](https://web.archive.org/web/20160113103647/http://atomenabled.org/developers/syndication/#link)
- [bcomnes/generate-feed](https://github.com/bcomnes/generate-feed)
- [Apple Requirements - Podcasts Connect Help](https://help.apple.com/itc/podcasts_connect/#/itc1723472cb)
- [Apple RSS feed sample](https://help.apple.com/itc/podcasts_connect/#/itcbaf351599)
- [Apple Create a podcast](https://help.apple.com/itc/podcasts_connect/#/itca5b22233a)
- [Apple Podcasts Identity Guidelines](https://www.apple.com/itunes/marketing-on-podcasts/identity-guidelines.html#messaging-and-style)

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
