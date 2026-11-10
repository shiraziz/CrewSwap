export const parseDate = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  return date;
};

export const isPast = (date: Date) => date.getTime() < Date.now();

export const sameDay = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

export const rangesMirror = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  sameDay(aStart, bStart) && sameDay(aEnd, bEnd);
