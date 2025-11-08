export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  loading: boolean;
  error: string | null;
}

export interface PlayerControls {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

export interface EpisodeData {
  season: number;
  episode: number;
  title: string;
  overview: string;
  still_path?: string;
  air_date: string;
  runtime?: number;
}

export interface SeasonData {
  season_number: number;
  name: string;
  overview: string;
  poster_path?: string;
  air_date: string;
  episode_count: number;
  episodes?: EpisodeData[];
}

export interface VidkingOptions {
  autoplay?: boolean;
  muted?: boolean;
  startTime?: number;
  color?: string;
  controls?: boolean;
}

export interface ProgressEvent {
  type: 'progress' | 'ended' | 'error';
  currentTime: number;
  duration: number;
  buffered?: number;
  error?: string;
}