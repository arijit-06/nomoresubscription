import axios from 'axios';
import { Content, ContentDetails, ContentResponse, Genre, Credits } from '../types/content.types';
import { env } from '../utils/env';

export const IMAGE_BASE_URL = env.TMDB_IMAGE_BASE;

// Validate API key
if (!env.TMDB_API_KEY) {
  throw new Error('TMDB API key is missing. Please set VITE_TMDB_API_KEY in your environment variables.');
}

const tmdbApi = axios.create({
  baseURL: env.TMDB_BASE_URL,
  params: {
    api_key: env.TMDB_API_KEY,
  },
  timeout: 8000, // Reduced timeout for faster failures
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for better error handling
tmdbApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please check your connection';
    } else if (error.response?.status === 401) {
      error.message = 'Invalid API key';
    } else if (error.response?.status === 429) {
      error.message = 'Too many requests - please try again later';
    } else if (!error.response) {
      error.message = 'Network error - please check your connection';
    }
    return Promise.reject(error);
  }
);

// Optimized cache with different durations for different content types
const cache = new Map<string, { data: any; timestamp: number; duration: number }>();

// Cache durations based on content volatility
export const CACHE_DURATIONS = {
  TRENDING: 1 * 60 * 1000,        // 1 minute (volatile)
  POPULAR: 2 * 60 * 1000,         // 2 minutes
  TOP_RATED: 5 * 60 * 1000,       // 5 minutes (stable)
  DETAILS: 24 * 60 * 60 * 1000,   // 24 hours (rarely changes)
  SEARCH: 10 * 60 * 1000,         // 10 minutes
  GENRES: 24 * 60 * 60 * 1000,    // 24 hours (static)
} as const;

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.duration) {
    return cached.data;
  }
  cache.delete(key); // Clean up expired entries
  return null;
};

const setCachedData = (key: string, data: any, duration: number) => {
  // Prevent cache from growing too large
  if (cache.size > 100) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now(), duration });
};

// Generic API call with optimized caching
const apiCall = async <T>(endpoint: string, params?: Record<string, any>, cacheDuration = CACHE_DURATIONS.POPULAR): Promise<T> => {
  if (!env.TMDB_API_KEY) {
    throw new Error('TMDB API key is not configured');
  }
  
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
  const cached = getCachedData(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await tmdbApi.get(endpoint, { params });
    setCachedData(cacheKey, response.data, cacheDuration);
    return response.data;
  } catch (error: any) {
    // Sanitize error logging to prevent sensitive data exposure
    console.error('TMDB API Error:', {
      endpoint: endpoint.replace(/\/\d+/g, '/:id'), // Remove IDs from logs
      status: error.response?.status,
      message: error.message
    });
    throw new Error('Failed to fetch content data');
  }
};

// Trending content
export const getTrending = async (timeWindow: 'day' | 'week' = 'day'): Promise<ContentResponse> => {
  return apiCall(`/trending/all/${timeWindow}`, {}, CACHE_DURATIONS.TRENDING);
};

// Popular content by type
export const getPopular = async (type: 'movie' | 'tv', page = 1): Promise<ContentResponse> => {
  return apiCall(`/${type}/popular`, { page });
};

// Top rated content
export const getTopRated = async (type: 'movie' | 'tv', page = 1): Promise<ContentResponse> => {
  return apiCall(`/${type}/top_rated`, { page });
};

// Now playing movies
export const getNowPlaying = async (page = 1): Promise<ContentResponse> => {
  return apiCall('/movie/now_playing', { page });
};

// Upcoming movies
export const getUpcoming = async (page = 1): Promise<ContentResponse> => {
  return apiCall('/movie/upcoming', { page });
};

// TV shows airing today
export const getAiringToday = async (page = 1): Promise<ContentResponse> => {
  return apiCall('/tv/airing_today', { page });
};

// TV shows on the air
export const getOnTheAir = async (page = 1): Promise<ContentResponse> => {
  return apiCall('/tv/on_the_air', { page });
};

// Get genres
export const getGenres = async (type: 'movie' | 'tv'): Promise<{ genres: Genre[] }> => {
  return apiCall(`/genre/${type}/list`, {}, CACHE_DURATIONS.GENRES);
};

// Get content by genre
export const getByGenre = async (
  type: 'movie' | 'tv',
  genreId: number,
  page = 1
): Promise<ContentResponse> => {
  return apiCall(`/discover/${type}`, {
    with_genres: genreId,
    page,
    sort_by: 'popularity.desc',
  });
};

// Get content details
export const getDetails = async (
  id: number,
  type: 'movie' | 'tv'
): Promise<ContentDetails> => {
  return apiCall(`/${type}/${id}`, {
    append_to_response: 'credits,similar,videos',
  }, CACHE_DURATIONS.DETAILS);
};

// Get credits
export const getCredits = async (id: number, type: 'movie' | 'tv'): Promise<Credits> => {
  return apiCall(`/${type}/${id}/credits`);
};

// Get similar content
export const getSimilar = async (
  id: number,
  type: 'movie' | 'tv',
  page = 1
): Promise<ContentResponse> => {
  return apiCall(`/${type}/${id}/similar`, { page });
};

// Search content with input validation
export const search = async (query: string, page = 1): Promise<ContentResponse> => {
  // Validate and sanitize search query
  if (!query || query.trim().length === 0) {
    throw new Error('Search query cannot be empty');
  }
  
  const sanitizedQuery = query.trim().slice(0, 100); // Limit query length
  
  return apiCall('/search/multi', {
    query: sanitizedQuery,
    page: Math.max(1, Math.min(page, 1000)), // Limit page range
    include_adult: false,
  }, CACHE_DURATIONS.SEARCH);
};

// Search movies
export const searchMovies = async (query: string, page = 1): Promise<ContentResponse> => {
  return apiCall('/search/movie', {
    query,
    page,
    include_adult: false,
  });
};

// Search TV shows
export const searchTV = async (query: string, page = 1): Promise<ContentResponse> => {
  return apiCall('/search/tv', {
    query,
    page,
    include_adult: false,
  });
};

// Get TV season details
export const getSeasonDetails = async (tvId: number, seasonNumber: number) => {
  return apiCall(`/tv/${tvId}/season/${seasonNumber}`);
};

// Get episode details
export const getEpisodeDetails = async (
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
) => {
  return apiCall(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
};

// Optimized image URL helpers with responsive sizes
export const getOptimizedImageUrl = (path: string | null, type: 'poster' | 'backdrop', width?: number): string => {
  if (!path) return '/placeholder-image.jpg';
  
  const sizes: Record<string, string> = {
    poster: width && width <= 200 ? 'w185' : width && width <= 300 ? 'w342' : 'w500',
    backdrop: width && width <= 400 ? 'w300' : width && width <= 800 ? 'w780' : 'w1280',
  };
  
  return `${IMAGE_BASE_URL}/${sizes[type]}${path}`;
};

// Legacy helpers (deprecated - use getOptimizedImageUrl)
export const getImageUrl = (path: string | null, size: string = 'w342'): string => {
  if (!path) return '/placeholder-image.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: string = 'w780'): string => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path: string | null, size: string = 'w342'): string => {
  if (!path) return '/placeholder-poster.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Get content title (works for both movies and TV shows)
export const getContentTitle = (content: Content): string => {
  return content.title || content.name || 'Unknown Title';
};

// Get content release date (works for both movies and TV shows)
export const getContentReleaseDate = (content: Content): string => {
  return content.release_date || content.first_air_date || '';
};

// Get content year
export const getContentYear = (content: Content): string => {
  const date = getContentReleaseDate(content);
  return date ? new Date(date).getFullYear().toString() : '';
};

// Format runtime
export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Get age rating
export const getAgeRating = (content: ContentDetails): string => {
  // This is a simplified version - in a real app, you'd use the release_dates endpoint
  if (content.adult) return '18+';
  if (content.vote_average < 6) return 'PG-13';
  if (content.vote_average < 7.5) return 'PG';
  return 'G';
};

// Generate match percentage (simulated)
export const getMatchPercentage = (content: Content): number => {
  // This is a simplified calculation based on vote_average and popularity
  const voteWeight = content.vote_average * 10;
  const popularityWeight = Math.min(content.popularity / 100, 1) * 20;
  return Math.min(Math.round(voteWeight + popularityWeight), 99);
};