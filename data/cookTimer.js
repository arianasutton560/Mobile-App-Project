const durationPattern = /(\d+(?:\.\d+|\s+\d+\/\d+|\/\d+)?)\s*(?:to\s+(\d+(?:\.\d+|\s+\d+\/\d+|\/\d+)?)\s*|[-\u2013\u2014]\s*(\d+(?:\.\d+|\s+\d+\/\d+|\/\d+)?)\s*)?(hours?|hrs?|hr|horas?|h|minutes?|mins?|min|minutos?|m|seconds?|secs?|sec|segundos?|segs?|s)\b/gi;

const unitSeconds = {
  h: 3600,
  hr: 3600,
  hrs: 3600,
  hour: 3600,
  hours: 3600,
  hora: 3600,
  horas: 3600,
  m: 60,
  min: 60,
  mins: 60,
  minute: 60,
  minutes: 60,
  minuto: 60,
  minutos: 60,
  s: 1,
  sec: 1,
  secs: 1,
  second: 1,
  seconds: 1,
  segundo: 1,
  segundos: 1,
  seg: 1,
  segs: 1,
};

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours} hr`);
  if (minutes) parts.push(`${minutes} min`);
  if (remainingSeconds || parts.length === 0) parts.push(`${remainingSeconds} sec`);
  return parts.join(' ');
}

function parseQuantity(value) {
  const [wholePart, fractionPart] = String(value).trim().split(/\s+/);
  const fraction = fractionPart ?? wholePart;
  const [numerator, denominator] = fraction.includes('/')
    ? fraction.split('/').map(Number)
    : [Number(fraction), 1];
  if (!denominator) return 0;
  return (fractionPart ? Number(wholePart) : 0) + numerator / denominator;
}

export function getTimerOptions(instruction) {
  const text = String(instruction || '');
  const matches = [...text.matchAll(durationPattern)];
  const groups = [];
  let previousMatch = null;

  for (const match of matches) {
    const start = parseQuantity(match[1]);
    const rangeEnd = match[2] ?? match[3];
    const unit = match[4].toLowerCase();
    const seconds = Math.round(start * unitSeconds[unit]);

    if (rangeEnd !== undefined) {
      groups.push([seconds, Math.round(parseQuantity(rangeEnd) * unitSeconds[unit])]);
      previousMatch = match;
      continue;
    }

    const previous = groups[groups.length - 1];
    const gap = previousMatch
      ? text.slice(previousMatch.index + previousMatch[0].length, match.index)
      : '';
    const previousUnit = previousMatch?.[4]?.toLowerCase();
    const isCompoundDuration = previous && previousMatch &&
      previous.length === 1 && previousUnit !== unit && /^\s*(?:and\s*)?$/i.test(gap);

    if (isCompoundDuration) {
      previous[0] += seconds;
    } else {
      groups.push([seconds]);
    }
    previousMatch = match;
  }

  return [...new Set(groups.flat().filter((seconds) => seconds > 0))]
    .map((seconds) => ({ seconds, label: formatDuration(seconds) }));
}

export function formatCountdown(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  const twoDigits = (value) => String(value).padStart(2, '0');
  return hours > 0
    ? `${hours}:${twoDigits(minutes)}:${twoDigits(remainder)}`
    : `${twoDigits(minutes)}:${twoDigits(remainder)}`;
}
