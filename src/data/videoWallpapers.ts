export interface VideoWallpaper {
  id: string;
  label: string;
  mp4: string;
  webm: string;
  poster: string;
}

/**
 * Brand emblem loops, encoded from the studio masters.
 * Each clip plays forward then reversed, so it loops without a visible jump.
 */
export const VIDEO_WALLPAPERS: VideoWallpaper[] = [
  {
    id: 'emblem-close',
    label: 'Emblem Close',
    mp4: '/video/emblem-close.mp4',
    webm: '/video/emblem-close.webm',
    poster: '/video/emblem-close.jpg',
  },
  {
    id: 'emblem-rows',
    label: 'Emblem Rows',
    mp4: '/video/emblem-rows.mp4',
    webm: '/video/emblem-rows.webm',
    poster: '/video/emblem-rows.jpg',
  },
  {
    id: 'emblem-grid',
    label: 'Emblem Grid',
    mp4: '/video/emblem-grid.mp4',
    webm: '/video/emblem-grid.webm',
    poster: '/video/emblem-grid.jpg',
  },
  {
    id: 'emblem-field',
    label: 'Emblem Field',
    mp4: '/video/emblem-field.mp4',
    webm: '/video/emblem-field.webm',
    poster: '/video/emblem-field.jpg',
  },
];

export const getVideoWallpaper = (id?: string): VideoWallpaper =>
  VIDEO_WALLPAPERS.find((w) => w.id === id) ?? VIDEO_WALLPAPERS[0];
