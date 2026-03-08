import type { CodexCollection } from './archive';
import type { CodexMediaItem } from '../content/config';

type SocialType = 'website' | 'article';
type TwitterCard = 'summary' | 'summary_large_image';

interface ShareProfile {
  socialType: SocialType;
  prefersLargeImage: boolean;
  defaultDescription: string;
}

const SHARE_PROFILE_BY_TYPE: Record<CodexCollection, ShareProfile> = {
  scroll: {
    socialType: 'article',
    prefersLargeImage: false,
    defaultDescription: 'A scroll in the Codex Archive.',
  },
  artifact: {
    socialType: 'article',
    prefersLargeImage: true,
    defaultDescription: 'An artifact record in the Codex Archive.',
  },
  fieldlog: {
    socialType: 'article',
    prefersLargeImage: true,
    defaultDescription: 'A field log in the Codex Archive.',
  },
  codex: {
    socialType: 'article',
    prefersLargeImage: false,
    defaultDescription: 'A codex entry in the Codex Archive.',
  },
  fragment: {
    socialType: 'article',
    prefersLargeImage: false,
    defaultDescription: 'A fragment in the Codex Archive.',
  },
  nexus: {
    socialType: 'article',
    prefersLargeImage: true,
    defaultDescription: 'A curated nexus issue in the Codex Archive.',
  },
  signal: {
    socialType: 'website',
    prefersLargeImage: false,
    defaultDescription: 'A signal object in the Codex Archive.',
  },
};

function trimToLength(value: string, max = 180): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 1).trim()}…`;
}

function pickShareImage(mediaItems: CodexMediaItem[]): string | undefined {
  return mediaItems.find((item) => item.kind === 'image')?.src;
}

export function buildObjectShareMeta({
  collection,
  title,
  excerpt,
  mediaItems,
  canonicalPath,
}: {
  collection: CodexCollection;
  title: string;
  excerpt?: string;
  mediaItems: CodexMediaItem[];
  canonicalPath: string;
}): {
  description: string;
  socialType: SocialType;
  twitterCard: TwitterCard;
  socialImage?: string;
  canonicalPath: string;
} {
  const profile = SHARE_PROFILE_BY_TYPE[collection];
  const socialImage = pickShareImage(mediaItems);
  const fallbackDescription = `${title}. ${profile.defaultDescription}`;
  const description = trimToLength(excerpt || fallbackDescription);
  const twitterCard: TwitterCard =
    profile.prefersLargeImage && socialImage ? 'summary_large_image' : 'summary';

  return {
    description,
    socialType: profile.socialType,
    twitterCard,
    socialImage,
    canonicalPath,
  };
}
