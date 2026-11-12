export function getPlayableVideo(video) {
  if (/\.(mp4|m4v|mov|webm|m3u8|mpd)(?:$|[?#])/i.test(video.url || '')) {
    return video.url;
  }

  // Older scraper output saved the recipe page URL. Delish's video poster URL
  // contains the media ID needed to rebuild its direct MP4 stream URL.
  if (/www\.delish\.com$/i.test(new URL(video.url).hostname)) {
    const videoId = video.thumbnailUrl?.match(/\/vidthumb\/([\da-f-]{36})\//i)?.[1];
    if (videoId) {
      return `https://mos-streaming.hearst.io/${videoId}/video_9x16_1080p_h264_hd.mp4`;
    }
  }

  return null;
}

