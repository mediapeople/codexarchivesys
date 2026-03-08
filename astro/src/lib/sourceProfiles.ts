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
    handle: 'nfile.co · @tornframes · @mediapeople',
    avatar: '/media/people/nathan-davis.jpg',
    bio: 'Multi-faceted creative, builder, and maker working across design systems, product craft, collage, and poetry. Through nfile.co and social streams, Nathan documents process, experiments, and signal in public. The Codex Archive is his operating layer for turning creative output into structured, connected, and retrievable objects.',
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
