const VIDKING_BASE_URL = 'https://www.vidking.net/embed';

interface VidkingOptions {
  color?: string;
  autoPlay?: boolean;
  nextEpisode?: boolean;
  episodeSelector?: boolean;
  progress?: number;
}

interface PlayerEvent {
  type: string;
  data: {
    event: 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked';
    currentTime: number;
    duration: number;
    progress: number;
    id: string;
    mediaType: 'movie' | 'tv';
    season?: number;
    episode?: number;
    timestamp: number;
  };
}

export const generateEmbedUrl = (
  tmdbId: number,
  type: 'movie' | 'tv',
  options: VidkingOptions = {}
): string => {
  const params = new URLSearchParams({
    color: options.color || 'e50914',
    autoPlay: options.autoPlay !== false ? 'true' : 'false',
    ...(options.progress && { progress: options.progress.toString() })
  });
  
  return `${VIDKING_BASE_URL}/${type}/${tmdbId}?${params.toString()}`;
};

export const generateTVEmbedUrl = (
  tmdbId: number,
  season: number,
  episode: number,
  options: VidkingOptions = {}
): string => {
  const params = new URLSearchParams({
    color: options.color || 'e50914',
    autoPlay: options.autoPlay !== false ? 'true' : 'false',
    nextEpisode: options.nextEpisode !== false ? 'true' : 'false',
    episodeSelector: options.episodeSelector !== false ? 'true' : 'false',
    ...(options.progress && { progress: options.progress.toString() })
  });
  
  return `${VIDKING_BASE_URL}/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
};

// Progress tracking
export const setupProgressTracking = (callback: (event: PlayerEvent) => void) => {
  const handleMessage = (event: MessageEvent) => {
    try {
      if (typeof event.data === 'string') {
        const playerEvent: PlayerEvent = JSON.parse(event.data);
        if (playerEvent.type === 'PLAYER_EVENT') {
          callback(playerEvent);
        }
      }
    } catch (error) {
      console.error('Error parsing player event:', error);
    }
  };

  window.addEventListener('message', handleMessage);
  
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

// Save progress to localStorage
export const saveProgress = (contentId: string, mediaType: 'movie' | 'tv', progress: number, season?: number, episode?: number) => {
  const key = `progress_${mediaType}_${contentId}${season ? `_s${season}_e${episode}` : ''}`;
  const progressData = {
    contentId,
    mediaType,
    progress,
    season,
    episode,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(progressData));
};

// Get saved progress
export const getProgress = (contentId: string, mediaType: 'movie' | 'tv', season?: number, episode?: number): number => {
  const key = `progress_${mediaType}_${contentId}${season ? `_s${season}_e${episode}` : ''}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      return data.progress || 0;
    } catch {
      return 0;
    }
  }
  return 0;
};

