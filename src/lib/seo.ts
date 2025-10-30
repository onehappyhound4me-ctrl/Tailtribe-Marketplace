import { Metadata } from "next";

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface VideoData {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string;
  contentUrl: string;
  embedUrl: string;
}

/**
 * Generate canonical URL
 */
export function canonical(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tailtribe.be';
  return `${baseUrl}${path}`;
}

/**
 * Generate breadcrumbs JSON-LD
 */
export function breadcrumbsJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
}

/**
 * Generate FAQ JSON-LD
 */
export function faqJsonLd(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate VideoObject JSON-LD for story highlights
 */
export function videoJsonLd(video: VideoData) {
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.name,
    "contentUrl": video.contentUrl,
    "embedUrl": video.embedUrl
  };

  if (video.description) jsonLd.description = video.description;
  if (video.thumbnailUrl) jsonLd.thumbnailUrl = video.thumbnailUrl;
  if (video.uploadDate) jsonLd.uploadDate = video.uploadDate;
  if (video.duration) jsonLd.duration = video.duration;

  return jsonLd;
}

/**
 * Generate LocalBusiness JSON-LD for caregiver profiles
 */
export function localBusinessJsonLd({
  name,
  description,
  address,
  telephone,
  email,
  url,
  image,
  priceRange,
  geo
}: {
  name: string;
  description?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  telephone?: string;
  email?: string;
  url: string;
  image?: string[];
  priceRange?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
}) {
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": url,
    "name": name,
    "url": url
  };

  if (description) jsonLd.description = description;
  if (address) jsonLd.address = {
    "@type": "PostalAddress",
    ...address
  };
  if (telephone) jsonLd.telephone = telephone;
  if (email) jsonLd.email = email;
  if (image && image.length > 0) jsonLd.image = image;
  if (priceRange) jsonLd.priceRange = priceRange;
  if (geo) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      "latitude": geo.latitude,
      "longitude": geo.longitude
    };
  }

  return jsonLd;
}

/**
 * Generate basic page metadata with OpenGraph
 */
export function generatePageMetadata({
  title,
  description,
  path,
  images,
  noIndex = false
}: {
  title: string;
  description: string;
  path: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const canonicalUrl = canonical(path);
  const siteName = "TailTribe";
  const fullTitle = `${title} | ${siteName}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'nl_BE',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description
    }
  };

  if (images && images.length > 0) {
    metadata.openGraph!.images = images.map(image => ({
      url: image,
      alt: title
    }));
    metadata.twitter!.images = images;
  }

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false
    };
  }

  return metadata;
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Extract Vimeo video ID from various Vimeo URL formats
 */
export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hqdefault' | 'maxresdefault' = 'hqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Get Vimeo thumbnail URL (requires API call in practice, but this is the pattern)
 */
export function getVimeoThumbnail(videoId: string): string {
  return `https://vumbnail.com/${videoId}.jpg`; // Third-party service
}

/**
 * Get video embed URL
 */
export function getVideoEmbedUrl(platform: 'YOUTUBE' | 'VIMEO', videoId: string): string {
  switch (platform) {
    case 'YOUTUBE':
      return `https://www.youtube.com/embed/${videoId}`;
    case 'VIMEO':
      return `https://player.vimeo.com/video/${videoId}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Validate video URL and extract platform/ID
 */
export function parseVideoUrl(url: string): { platform: 'YOUTUBE' | 'VIMEO'; videoId: string } | null {
  const youtubeId = extractYouTubeId(url);
  if (youtubeId) {
    return { platform: 'YOUTUBE', videoId: youtubeId };
  }
  
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return { platform: 'VIMEO', videoId: vimeoId };
  }
  
  return null;
}





