type TimelineData = {
  id: string;
  date: Date;
  postedAt?: Date;
};

type TimelineEntryLike = {
  data: TimelineData;
};

const ARCHIVE_POSTED_AT_TIME_ZONE = 'America/New_York';

function getArchiveCalendarParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === 'year')?.value || 0);
  const month = Number(parts.find((part) => part.type === 'month')?.value || 0);
  const day = Number(parts.find((part) => part.type === 'day')?.value || 0);
  return { year, month, day };
}

function getCalendarDayTimestamp(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function getPostedAtTimestamp(date?: Date): number {
  return date ? date.valueOf() : 0;
}

function getTimelineDayTimestamp(data: TimelineData): number {
  if (data.postedAt) {
    const { year, month, day } = getArchiveCalendarParts(data.postedAt, ARCHIVE_POSTED_AT_TIME_ZONE);
    return Date.UTC(year, month - 1, day);
  }

  return getCalendarDayTimestamp(data.date);
}

function resolveArchiveDisplayDate(value: TimelineData | Date): { date: Date; timeZone: string } {
  if (value instanceof Date) {
    return { date: value, timeZone: 'UTC' };
  }

  if (value.postedAt) {
    return { date: value.postedAt, timeZone: ARCHIVE_POSTED_AT_TIME_ZONE };
  }

  return { date: value.date, timeZone: 'UTC' };
}

export function compareByPureTimeline<T extends TimelineEntryLike>(a: T, b: T): number {
  const dayDelta = getTimelineDayTimestamp(b.data) - getTimelineDayTimestamp(a.data);
  if (dayDelta !== 0) {
    return dayDelta;
  }

  return (
    getPostedAtTimestamp(b.data.postedAt ?? b.data.date) -
    getPostedAtTimestamp(a.data.postedAt ?? a.data.date)
  );
}

export function formatArchiveDate(value: TimelineData | Date): string {
  const { date, timeZone } = resolveArchiveDisplayDate(value);
  return date.toLocaleDateString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatArchiveLongDate(value: TimelineData | Date): string {
  const { date, timeZone } = resolveArchiveDisplayDate(value);
  return date.toLocaleDateString('en-US', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
