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
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>bret.io log</title>
  <id>https://bret.io/feed.xml</id>
  <updated>2018-04-07T22:06:43.000Z</updated>
  <link rel="self" type="application/atom+xml" href="https://bret.io/feed.xml"/>
  <link rel="alternate" type="application/json" href="https://bret.io/feed.json"/>
  <link rel="alternate" type="text/html" href="https://bret.io"/>
  <link rel="next" href="https://bret.io/2017.xml"/>
  <author>
    <name>Bret Comnes</name>
    <uri>https://bret.io</uri>
  </author>
  <generator uri="https://github.com/bcomnes/jsonfeed-to-atom#readme" version="1.0.0">jsonfeed-to-atom</generator>
  <rights>© 2018 Bret Comnes</rights>
  <subtitle>A running log of announcements, projects and accomplishments.</subtitle>
  <entry>
    <id>https://bret.io/my-text-post-2018-04-07T20:48:02.000Z</id>
    <title>Wee wooo this is some content.</title>
    <updated>2018-04-07T20:48:02.000Z</updated>
    <published>2018-04-07T20:48:02.000Z</published>
    <content type="text">Wee wooo this is some content. 
 Maybe a new paragraph too</content>
    <link rel="alternate" href="https://bret.io/my-text-post"/>
  </entry>
  <entry>
    <id>https://bret.io/my-blog-post-2018-04-07T22:06:43.000Z</id>
    <title>This is a blog title</title>
    <updated>2018-04-07T22:06:43.000Z</updated>
    <published>2018-04-07T22:06:43.000Z</published>
    <content type="html">
      <![CDATA[<p>Hello, world!</p>]]>
    </content>
    <link rel="alternate" href="https://bret.io/my-blog-post"/>
    <link rel="related" href="https://example.com/some-external-link"/>
  </entry>
</feed>
```

## API
### `jsonfeedToAtom(parsedJsonfeed, opts)`
Coverts a parsed JSON feed into an atom feed.  Returns the string of the atom feed.

Opts include:

```js
{
  // a function that returns the atom feed url
  feedURLFn: (feedURL, jf) => feedURL.replace(/\.json\b/, '.xml')
}
```

## See also

- [JSON Feed: Mapping RSS and Atom to JSON Feed](https://jsonfeed.org/mappingrssandatom)
- [AtomEnabled: Developers > Syndication](https://web.archive.org/web/20160113103647/http://atomenabled.org/developers/syndication/#link)
- [bcomnes/generate-feed](https://github.com/bcomnes/generate-feed)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/jsonfeed-to-atom.svg?style=flat-square
[3]: https://npmjs.org/package/jsonfeed-to-atom
[4]: https://img.shields.io/travis/bcomnes/jsonfeed-to-atom/master.svg?style=flat-square
[5]: https://travis-ci.org/bcomnes/jsonfeed-to-atom
[8]: http://img.shields.io/npm/dm/jsonfeed-to-atom.svg?style=flat-square
[9]: https://npmjs.org/package/jsonfeed-to-atom
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[12]: https://img.shields.io/coveralls/bcomnes/jsonfeed-to-atom/master.svg?style=flat-square
[13]: https://coveralls.io/github/bcomnes/jsonfeed-to-atom
[rss]: http://www.rssboard.org/rss-specification


RSS LINKS:

http://www.rssboard.org/rss-specification
https://jsonfeed.org/mappingrssandatom
https://jsonfeed.org/version/1
http://www.rssboard.org/rss-profile
https://validator.w3.org/feed/docs/rss2.html
http://web.resource.org/rss/1.0/modules/content/


ITUNES RSS LINKS

https://help.apple.com/itc/podcasts_connect/#/itc1723472cb
https://help.apple.com/itc/podcasts_connect/#/itcbaf351599
https://help.apple.com/itc/podcasts_connect/#/itca5b22233a
https://gist.github.com/bcomnes/defb825462722d96da7b877e22dd7588
https://www.apple.com/itunes/marketing-on-podcasts/identity-guidelines.html#messaging-and-style
