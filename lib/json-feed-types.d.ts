/* eslint-disable */
/**
 * Generated from the SchemaStore JSON Feed 1.1 schema.
 * Run `npm run build:json-feed-types` to regenerate.
 */

/**
 * Describes endpoints that can be used to subscribe to real-time notifications from the publisher of this feed
 */
export type Hubs = {
  /**
   * Describes the protocol used to talk with the hub, such as "rssCloud" or "WebSub".
   */
  type: string;
  url: string;
  [k: string]: unknown;
}[];
export type Item = {
  attachments?: Attachments;
  /**
   * @deprecated
   * Use the "authors" key instead, even when there is only one author. Existing feeds can include both "author" and "authors" for compatibility with existing feed readers. Feed readers should always prefer `authors` if present.
   */
  author?: Author;
  authors?: Author[];
  /**
   * The URL of an image to use as a banner. Some blogging systems (such as Medium) display a different banner image chosen to go with each post, but that image wouldn't otherwise appear in the "content_html". A feed reader with a detail view may choose to show this banner image at the top of the detail view, possibly with the title overlaid.
   */
  banner_image?: string;
  /**
   * The HTML representation of the content
   */
  content_html?: string;
  /**
   * The plain text representation of the content
   */
  content_text?: string;
  /**
   * Specifies the date in ISO 8601 format. (Example: 2010-02-07T14:04:00-05:00.)
   */
  date_modified?: string;
  /**
   * Specifies the date in ISO 8601 format. (Example: 2010-02-07T14:04:00-05:00.)
   */
  date_published?: string;
  /**
   * Is the URL of a page elsewhere. This is especially useful for linkblogs. If "url" links to where you're talking about a thing, then "external_url" links to the thing you're talking about.
   */
  external_url?: string;
  /**
   * Is unique for that item for that feed over time. If an item is ever updated, the id should be unchanged. New items should never use a previously-used id. Ideally, the id is the full URL of the resource described by the item, since URLs make great unique identifiers.
   */
  id: string;
  /**
   * The URL of the main image for the item. This image may also appear in the "content_html" — if so, it's a hint to the feed reader that this is the main, featured image. Feed readers may use the image as a preview.
   */
  image?: string;
  /**
   * The language for this item, using the same format as the top-level "language" field. The value can be different than the primary language for the feed when a specific item is written in a different language than other items in the feed.
   */
  language?: string;
  /**
   * A plain text sentence or two describing the item. This might be presented in a timeline, for instance, where a detail view would display all of "content_html" or "content_text".
   */
  summary?: string;
  tags?: Tags;
  /**
   * Is plain text. Microblog items in particular may omit titles.
   */
  title?: string;
  /**
   * Is the URL of the resource described by the item. It's the permalink. This may be the same as the id — but should be present regardless.
   */
  url?: string;
  [k: string]: unknown;
} & Item1;
/**
 * Lists related resources
 */
export type Attachments = Attachment[];
/**
 * Can have any plain text values you want. Tags tend to be just one word, but they may be anything. Note: they are not the equivalent of Twitter hashtags. Some blogging systems and other feed formats call these categories.
 */
export type Tags = string[];
export type Item1 = {
  [k: string]: unknown;
};

export interface JSONFeed {
  /**
   * @deprecated
   * Use the "authors" key instead, even when there is only one author. Existing feeds can include both "author" and "authors" for compatibility with existing feed readers. Feed readers should always prefer `authors` if present.
   */
  author?: Author;
  authors?: Author[];
  /**
   * Provides more detail, beyond the title, on what the feed is about. A feed reader may display this text.
   */
  description?: string;
  /**
   * Says whether or not the feed is finished — that is, whether or not it will ever update again. A feed for a temporary event, such as an instance of the Olympics, could expire. If the value is true, then it's expired. Any other value, or the absence of expired, means the feed may continue to update.
   */
  expired?: boolean;
  /**
   * Provides more detail, beyond the title, on what the feed is about. A feed reader may display this text.
   */
  favicon?: string;
  /**
   * The URL of the feed, and serves as the unique identifier for the feed. As with 'home_page_url', this should be considered required for feeds on the public web.
   */
  feed_url?: string;
  /**
   * The URL of the resource that the feed describes. This resource may or may not actually be a "home" page, but it should be an HTML page. If a feed is published on the public web, this should be considered as required. But it may not make sense in the case of a file created on a desktop computer, when that file is not shared or is shared only privately.
   */
  home_page_url?: string;
  hubs?: Hubs;
  /**
   * The URL of an image for the feed suitable to be used in a timeline, much the way an avatar might be used. It should be square and relatively large — such as 512 x 512 — so that it can be scaled-down and so that it can look good on retina displays. It should use transparency where appropriate, since it may be rendered on a non-white background.
   */
  icon?: string;
  items: Item[];
  /**
   * The primary language for the feed in the format specified in RFC 5646. The value is usually a 2-letter language tag from ISO 639-1, optionally followed by a region tag. (Examples: "en" or "en-US".)
   */
  language?: string;
  /**
   * The URL of a feed that provides the next n items, where n is determined by the publisher. This allows for pagination, but with the expectation that reader software is not required to use it and probably won't use it very often. next_url must not be the same as feed_url, and it must not be the same as a previous next_url (to avoid infinite loops).
   */
  next_url?: string;
  /**
   * The name of the feed, which will often correspond to the name of the website (blog, for instance), though not necessarily.
   */
  title: string;
  /**
   * A description of the purpose of the feed. This is for the use of people looking at the raw JSON, and should be ignored by feed readers
   */
  user_comment?: string;
  /**
   * The URL of the version of the format the feed uses. This should appear at the very top, though we recognize that not all JSON generators allow for ordering.
   */
  version: "https://jsonfeed.org/version/1.1";
  [k: string]: unknown;
}
/**
 * Specifies the feed author
 */
export interface Author {
  /**
   * the URL for an image for the author. As with icon, it should be square and relatively large — such as 512 x 512 pixels — and should use transparency where appropriate, since it may be rendered on a non-white background.
   */
  avatar?: string;
  /**
   * Is the author's name
   */
  name?: string;
  /**
   * Is the URL of a site owned by the author. It could be a blog, micro-blog, Twitter account, and so on. Ideally the linked-to page provides a way to contact the author, but that's not required.
   */
  url?: string;
  [k: string]: unknown;
}
export interface Attachment {
  /**
   * Specifies how long the attachment takes to listen to or watch.
   */
  duration_in_seconds?: number;
  /**
   * Specifies the type of the attachment, such as "audio/mpeg".
   */
  mime_type: string;
  /**
   * Specifies how large the file is.
   */
  size_in_bytes?: number;
  /**
   * Is a name for the attachment. Important: if there are multiple attachments, and two or more have the exact same title (when title is present), then they are considered as alternate representations of the same thing. In this way a podcaster, for instance, might provide an audio recording in different formats.
   */
  title?: string;
  /**
   * Specifies the location of the attachment
   */
  url: string;
  [k: string]: unknown;
}
