export type SourceProfile = {
  id: string;
  name: string;
  designation: string;
  handle?: string;
  avatar?: string;
  bio?: string;
};

export const SOURCE_PROFILES: Record<string, SourceProfile> = {
  'nathan-davis': {
    id: 'nathan-davis',
    name: 'Nathan Davis',
    designation: 'Archive Operator',
    handle: '@nathandavis',
    avatar: '/media/people/nathan-davis.jpg',
    bio: 'Builder and curator of the Codex Archive System.',
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
