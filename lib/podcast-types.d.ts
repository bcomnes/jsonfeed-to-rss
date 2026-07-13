/* eslint-disable */
/**
 * Generated from the jsonfeed-to-rss podcast extension schema.
 * Run `npm run build:json-feed-types` to regenerate.
 */

/**
 * JSON Feed extension model for Apple Podcasts and the Podcasting 2.0 namespace.
 */
export interface PodcastExtensions {
  channel: {
    _itunes?: ITunesChannelData;
    _podcast?: PodcastChannelData;
  };
  item: {
    _itunes?: ITunesItemData;
    _podcast?: PodcastItemData;
  };
}
export interface ITunesChannelData {
  about?: string;
  author?: string;
  block?: boolean;
  /**
   * @maxItems 2
   */
  categories?: [] | [ITunesCategory] | [ITunesCategory, ITunesCategory];
  /**
   * @deprecated
   */
  category?: string;
  complete?: boolean;
  explicit?: boolean;
  image?: string;
  new_feed_url?: string;
  /**
   * @deprecated
   */
  owner?: {
    name?: string;
    email?: string;
  };
  /**
   * @deprecated
   */
  subcategory?: string;
  /**
   * @deprecated
   */
  subtitle?: string;
  /**
   * @deprecated
   */
  summary?: string;
  title?: string;
  type?: "episodic" | "serial";
}
export interface ITunesCategory {
  category: string;
  subcategory?: string;
}
export interface PodcastChannelData {
  locked?: PodcastLocked;
  funding?: PodcastFunding[];
  people?: PodcastPerson[];
  locations?: PodcastLocation[];
  license?: PodcastLicense;
  guid?: string;
  medium?:
    | "podcast"
    | "music"
    | "video"
    | "film"
    | "audiobook"
    | "newsletter"
    | "blog"
    | "publisher"
    | "course"
    | "podcastL"
    | "musicL"
    | "videoL"
    | "filmL"
    | "audiobookL"
    | "newsletterL"
    | "blogL"
    | "publisherL"
    | "courseL"
    | "mixed";
  trailers?: PodcastTrailer[];
  values?: PodcastValue[];
  live_items?: PodcastLiveItem[];
  social_interactions?: PodcastSocialInteract[];
  blocks?: PodcastBlock[];
  text?: PodcastText[];
  remote_items?: PodcastRemoteItem[];
  podroll?: PodcastRemoteItem[];
  update_frequency?: PodcastUpdateFrequency;
  podping?: true;
  chat?: PodcastChat;
  publisher?: PodcastRemoteItem;
  images?: PodcastImage[];
}
export interface PodcastLocked {
  value: boolean;
  owner?: string;
}
export interface PodcastFunding {
  url: string;
  label: string;
}
export interface PodcastPerson {
  name: string;
  role?: string;
  group?: string;
  image?: string;
  url?: string;
}
export interface PodcastLocation {
  name: string;
  rel?: "subject" | "creator";
  geo?: string;
  osm?: string;
  country?: string;
}
export interface PodcastLicense {
  identifier: string;
  url?: string;
}
export interface PodcastTrailer {
  title: string;
  url: string;
  published: string;
  length?: number;
  type?: string;
  season?: number;
}
export interface PodcastValue {
  type: string;
  method: string;
  suggested?: string;
  /**
   * @minItems 1
   */
  recipients: [PodcastValueRecipient, ...PodcastValueRecipient[]];
  time_splits?: PodcastValueTimeSplit[];
}
export interface PodcastValueRecipient {
  type: string;
  address: string;
  split: number;
  name?: string;
  custom_key?: string;
  custom_value?: string;
  fee?: boolean;
}
export interface PodcastValueTimeSplit {
  start_time: number;
  duration: number;
  remote_start_time?: number;
  remote_percentage?: number;
  /**
   * @minItems 1
   */
  recipients?: [PodcastValueRecipient, ...PodcastValueRecipient[]];
  remote_item?: PodcastRemoteItem;
}
export interface PodcastRemoteItem {
  feed_guid: string;
  feed_url?: string;
  item_guid?: string;
  medium?: string;
  title?: string;
}
export interface PodcastLiveItem {
  status: "pending" | "live" | "ended";
  start: string;
  end?: string;
  title: string;
  description?: string;
  link?: string;
  guid: string;
  guid_is_permalink?: boolean;
  enclosure: PodcastEnclosure;
  people?: PodcastPerson[];
  alternate_enclosures?: PodcastAlternateEnclosure[];
  /**
   * @minItems 1
   */
  content_links: [PodcastContentLink, ...PodcastContentLink[]];
  funding?: PodcastFunding[];
  locations?: PodcastLocation[];
  transcripts?: PodcastTranscript[];
  chapters?: PodcastChapters;
  soundbites?: PodcastSoundbite[];
  season?: PodcastSeason;
  episode?: PodcastEpisode;
  license?: PodcastLicense;
  social_interactions?: PodcastSocialInteract[];
  text?: PodcastText[];
  values?: PodcastValue[];
  chat?: PodcastChat;
  images?: PodcastImage[];
}
export interface PodcastEnclosure {
  url: string;
  type: string;
  length: number;
}
export interface PodcastAlternateEnclosure {
  type: string;
  length?: number;
  bitrate?: number;
  height?: number;
  language?: string;
  title?: string;
  rel?: string;
  codecs?: string;
  default?: boolean;
  /**
   * @minItems 1
   */
  sources: [PodcastSource, ...PodcastSource[]];
  integrity?: PodcastIntegrity;
}
export interface PodcastSource {
  uri: string;
  content_type?: string;
}
export interface PodcastIntegrity {
  type: "sri" | "pgp-signature";
  value: string;
}
export interface PodcastContentLink {
  url: string;
  label: string;
}
export interface PodcastTranscript {
  url: string;
  type: string;
  language?: string;
  rel?: "captions";
}
export interface PodcastChapters {
  url: string;
  type: string;
}
export interface PodcastSoundbite {
  start_time: number;
  duration: number;
  title?: string;
}
export interface PodcastSeason {
  number: number;
  name?: string;
}
export interface PodcastEpisode {
  number: number;
  display?: string;
}
export interface PodcastSocialInteract {
  protocol: string;
  uri?: string;
  account_id?: string;
  account_url?: string;
  priority?: number;
}
export interface PodcastText {
  value: string;
  purpose?: string;
}
export interface PodcastChat {
  server: string;
  protocol: string;
  account_id?: string;
  space?: string;
}
export interface PodcastImage {
  url: string;
  alt?: string;
  aspect_ratio?: string;
  width?: number;
  height?: number;
  type?: string;
  purpose?: string;
}
export interface PodcastBlock {
  value: boolean;
  id?: string;
}
export interface PodcastUpdateFrequency {
  label: string;
  complete?: boolean;
  start?: string;
  rrule?: string;
}
export interface ITunesItemData {
  /**
   * @deprecated
   */
  author?: string;
  block?: boolean;
  duration?: number | string;
  episode?: number;
  episode_type?: "full" | "trailer" | "bonus";
  explicit?: boolean;
  image?: string;
  /**
   * @deprecated
   */
  is_closed_captioned?: boolean;
  season?: number;
  /**
   * @deprecated
   */
  subtitle?: string;
  /**
   * @deprecated
   */
  summary?: string;
  title?: string;
}
export interface PodcastItemData {
  transcripts?: PodcastTranscript[];
  chapters?: PodcastChapters;
  soundbites?: PodcastSoundbite[];
  people?: PodcastPerson[];
  funding?: PodcastFunding[];
  locations?: PodcastLocation[];
  season?: PodcastSeason;
  episode?: PodcastEpisode;
  license?: PodcastLicense;
  alternate_enclosures?: PodcastAlternateEnclosure[];
  content_links?: PodcastContentLink[];
  social_interactions?: PodcastSocialInteract[];
  text?: PodcastText[];
  values?: PodcastValue[];
  chat?: PodcastChat;
  images?: PodcastImage[];
}
