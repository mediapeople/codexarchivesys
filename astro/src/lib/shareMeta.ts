import type { CodexCollection } from './archive';
import type { CodexMediaItem } from '../content/config';
import type { ImageAssetMetadata } from './mediaAsset';
import { pickPrimaryMedia, withMediaVersion } from './media';

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
  loremap: {
    socialType: 'article',
    prefersLargeImage: true,
    defaultDescription: 'A loremap in the Codex Archive.',
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
  const primaryMedia = pickPrimaryMedia(mediaItems);
  if (primaryMedia?.kind === 'image') {
    return primaryMedia.src;
  }

  return mediaItems.find((item) => item.kind === 'image')?.src;
}

export function buildObjectShareMeta({
  collection,
  title,
  excerpt,
  mediaItems,
  canonicalPath,
  imageVersion,
  socialImageMetadata,
}: {
  collection: CodexCollection;
  title: string;
  excerpt?: string;
  mediaItems: CodexMediaItem[];
  canonicalPath: string;
  imageVersion?: string;
  socialImageMetadata?: ImageAssetMetadata | null;
}): {
  description: string;
  socialType: SocialType;
  twitterCard: TwitterCard;
  socialImage?: string;
  socialImageWidth?: number;
  socialImageHeight?: number;
  canonicalPath: string;
} {
  const profile = SHARE_PROFILE_BY_TYPE[collection];
  const rawSocialImage = pickShareImage(mediaItems);
  const socialImage = rawSocialImage ? withMediaVersion(rawSocialImage, imageVersion) : undefined;
  const fallbackDescription = `${title}. ${profile.defaultDescription}`;
  const description = trimToLength(excerpt || fallbackDescription);
  const prefersLargeSocialCard =
    profile.prefersLargeImage &&
    Boolean(rawSocialImage) &&
    Boolean(
      socialImageMetadata &&
      (socialImageMetadata.shape === 'wide' || socialImageMetadata.shape === 'landscape')
    );
  const twitterCard: TwitterCard = prefersLargeSocialCard ? 'summary_large_image' : 'summary';

  return {
    description,
    socialType: profile.socialType,
    twitterCard,
    socialImage,
    socialImageWidth: socialImageMetadata?.width,
    socialImageHeight: socialImageMetadata?.height,
    canonicalPath,
  };
}
