export interface Content {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
  adult?: boolean;
  original_language: string;
  popularity: number;
}

export interface ContentDetails extends Content {
  genres: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  tagline?: string;
  homepage?: string;
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
  credits?: Credits;
  similar?: ContentResponse;
  videos?: VideoResponse;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path?: string;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

export interface ContentResponse {
  page: number;
  results: Content[];
  total_pages: number;
  total_results: number;
}

export interface VideoResponse {
  results: Video[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  profileId: string;
  contentId: number;
  contentType: 'movie' | 'tv';
  addedAt: string;
  content?: Content;
}

export interface ViewingProgress {
  id: string;
  userId: string;
  profileId: string;
  contentId: number;
  contentType: 'movie' | 'tv';
  progress: number;
  duration: number;
  timestamp: string;
  season?: number;
  episode?: number;
  completed: boolean;
}

export interface ContentRow {
  title: string;
  content: Content[];
  showRankings?: boolean;
  type?: 'trending' | 'popular' | 'genre' | 'continue' | 'watchlist';
}