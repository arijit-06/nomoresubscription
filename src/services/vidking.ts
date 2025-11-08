import { VidkingOptions, ProgressEvent } from '../types/player.types';

const VIDKING_BASE_URL = import.meta.env.VITE_VIDKING_BASE_URL;

export const generateEmbedUrl = (
  tmdbId: number,
  type: 'movie' | 'tv'
): string => {
  return `https://www.vidking.net/embed/${type}/${tmdbId}`;
};

export const generateTVEmbedUrl = (
  tmdbId: number,
  season: number,
  episode: number
): string => {
  return `https://www.vidking.net/embed/tv/${tmdbId}/${season}/${episode}`;
};

export const parseProgressEvent = (event: MessageEvent): ProgressEvent | null => {
  try {
    if (event.origin !== new URL(VIDKING_BASE_URL).origin) {
      return null;
    }

    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

    if (!data || typeof data !== 'object') {
      return null;
    }

    // Validate required fields
    if (typeof data.currentTime !== 'number' || typeof data.duration !== 'number') {
      return null;
    }

    return {
      type: data.type || 'progress',
      currentTime: data.currentTime,
      duration: data.duration,
      buffered: data.buffered,
      error: data.error,
    };
  } catch (error) {
    console.error('Error parsing progress event:', error);
    return null;
  }
};

export const setupPlayerMessageListener = (
  callback: (event: ProgressEvent) => void
): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    const progressEvent = parseProgressEvent(event);
    if (progressEvent) {
      callback(progressEvent);
    }
  };

  window.addEventListener('message', handleMessage);

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

export const sendPlayerCommand = (
  iframe: HTMLIFrameElement,
  command: string,
  data?: any
): void => {
  if (!iframe.contentWindow) return;

  const message = {
    command,
    data,
  };

  iframe.contentWindow.postMessage(message, VIDKING_BASE_URL);
};

// Player control commands
export const playVideo = (iframe: HTMLIFrameElement): void => {
  sendPlayerCommand(iframe, 'play');
};

export const pauseVideo = (iframe: HTMLIFrameElement): void => {
  sendPlayerCommand(iframe, 'pause');
};

export const seekTo = (iframe: HTMLIFrameElement, time: number): void => {
  sendPlayerCommand(iframe, 'seek', { time });
};

export const setVolume = (iframe: HTMLIFrameElement, volume: number): void => {
  sendPlayerCommand(iframe, 'volume', { volume: Math.max(0, Math.min(1, volume)) });
};

export const toggleMute = (iframe: HTMLIFrameElement): void => {
  sendPlayerCommand(iframe, 'mute');
};

export const toggleFullscreen = (iframe: HTMLIFrameElement): void => {
  sendPlayerCommand(iframe, 'fullscreen');
};

export const skipIntro = (iframe: HTMLIFrameElement): void => {
  sendPlayerCommand(iframe, 'skipIntro');
};

export const nextEpisode = (iframe: HTMLIFrameElement): void => {
  sendPlayerCommand(iframe, 'nextEpisode');
};

// Utility functions
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const calculateProgress = (currentTime: number, duration: number): number => {
  if (duration === 0) return 0;
  return Math.max(0, Math.min(100, (currentTime / duration) * 100));
};

export const isVideoCompleted = (currentTime: number, duration: number): boolean => {
  return duration > 0 && (currentTime / duration) >= 0.9;
};

export const shouldShowNextEpisode = (currentTime: number, duration: number): boolean => {
  return duration > 0 && (duration - currentTime) <= 30; // Show 30 seconds before end
};

export const getSkipIntroTimestamp = (tmdbId: number, season?: number, episode?: number): number => {
  // This would typically come from a database or API
  // For now, return a default skip time
  return 90; // Skip first 90 seconds
};

export const getSkipCreditsTimestamp = (tmdbId: number, season?: number, episode?: number): number => {
  // This would typically come from a database or API
  // For now, return a default time before credits
  return 0; // No skip for credits in this implementation
};