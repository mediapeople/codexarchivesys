type TimelineData = {
  id: string;
  date: Date;
  postedAt?: Date;
};

type TimelineEntryLike = {
  data: TimelineData;
};

function getCalendarDayTimestamp(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getPostedAtTimestamp(date?: Date): number {
  return date ? date.valueOf() : 0;
}

export function compareByPureTimeline<T extends TimelineEntryLike>(a: T, b: T): number {
  const dayDelta = getCalendarDayTimestamp(b.data.date) - getCalendarDayTimestamp(a.data.date);
  if (dayDelta !== 0) {
    return dayDelta;
  }

  return getPostedAtTimestamp(b.data.postedAt) - getPostedAtTimestamp(a.data.postedAt);
}

export function formatArchiveDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatArchiveLongDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
