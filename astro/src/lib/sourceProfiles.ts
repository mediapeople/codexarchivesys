export type SourceLink = {
  label: string;
  href: string;
};

export type SourceProfile = {
  id: string;
  name: string;
  designation: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  orientationBio?: string;
  links?: SourceLink[];
};

export const SOURCE_PROFILES: Record<string, SourceProfile> = {
  'nathan-davis': {
    id: 'nathan-davis',
    name: 'Nathan Davis',
    designation: 'Archive Operator',
    handle: '@nathandavis',
    avatar: '/media/people/nathan-davis.jpg',
    bio: 'Designer, builder, and curator of the Codex Archive System.',
    orientationBio:
      'Multi-faceted creative, builder, and maker working across design systems, product craft, collage, and poetry. Through nfile.co and social streams, Nathan documents process, experiments, and signal in public. The Codex Archive is his operating layer for turning creative output into structured, connected, and retrievable objects.',
    links: [
      {
        label: 'nfile.co',
        href: 'https://www.nfile.co/',
      },
      {
        label: 'Instagram · @tornframes',
        href: 'https://www.instagram.com/tornframes/',
      },
      {
        label: 'Threads · @mediapeople',
        href: 'https://www.threads.com/@mediapeople',
      },
    ],
  },
};

export const DEFAULT_SOURCE_ID = 'nathan-davis';

export function getSourceProfile(id?: string): SourceProfile | null {
  if (!id) {
    return null;
  }
  return SOURCE_PROFILES[id] || null;
}

export function getDefaultSourceProfile(): SourceProfile {
  return SOURCE_PROFILES[DEFAULT_SOURCE_ID];
}
