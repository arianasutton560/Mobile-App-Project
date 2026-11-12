const MEDIA_ID_PATTERN = /[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}/i;

export function getVideoMediaId(video) {
  const candidates = [video?.url, video?.thumbnailUrl];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const mediaId = candidate.match(MEDIA_ID_PATTERN)?.[0];
    if (mediaId) return mediaId.toLowerCase();
  }

  return null;
}

export function getCaptionAtTime(cues, currentTime) {
  if (!Array.isArray(cues) || !Number.isFinite(currentTime)) return null;

  let low = 0;
  let high = cues.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const cue = cues[middle];

    if (!cue || !Number.isFinite(cue.start) || !Number.isFinite(cue.end)) {
      return null;
    }
    if (currentTime < cue.start) {
      high = middle - 1;
    } else if (currentTime >= cue.end) {
      low = middle + 1;
    } else {
      return cue;
    }
  }

  return null;
}
