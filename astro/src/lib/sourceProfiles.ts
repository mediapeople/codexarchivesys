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
  orientationNoteTitle?: string;
  orientationNoteParagraphs?: string[];
  orientationNoteSignature?: string;
  links?: SourceLink[];
};

export const SOURCE_PROFILES: Record<string, SourceProfile> = {
  'nathan-davis': {
    id: 'nathan-davis',
    name: 'Nathan Davis',
    designation: 'Archive Operator',
    handle: '@nathandavis',
    avatar: '/media/people/nathan-davis.jpg',
    bio: 'Designer, builder, and curator of the Codex Archive.',
    orientationBio:
      'Multi-faceted creative, builder, and maker working across design systems, product craft, collage, and poetry. Through nfile.co and social streams, Nathan documents process, experiments, and signal in public. The Codex Archive is his operating layer for turning creative output into structured, connected, and retrievable objects.',
    orientationNoteTitle: 'A Personal Note',
    orientationNoteParagraphs: [
      'A recurrent theme of my life has been survival — learning how to live, and sometimes even thrive, under load.',
      'I am a poet and a designer by heart. Curiosity tends to lead the work. Many of the pieces here are experiments with language, structure, and myth — ways of examining the stories we tell ourselves and each other.',
      'Some of those stories are personal. Some are cultural. Some are the quiet agreements that hold communities together. Others are the tensions and contradictions we have not resolved.',
      'The Codex Archive is a place where those explorations can live side by side.',
      'Poems, notes, artifacts, and experiments are recorded as objects so they can be linked, revisited, and placed in relation to each other over time. The goal is not perfection. It is continuity — a way of keeping the work visible as it evolves.',
      'What you see here is not a finished statement.',
      'It is a living practice.',
      'Thank you for spending a little time inside the archive.',
    ],
    orientationNoteSignature: 'Nathan Davis',
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
