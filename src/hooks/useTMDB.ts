import { useState, useEffect, useCallback } from 'react';
import { Content, ContentResponse, ContentDetails, Genre } from '../types/content.types';
import * as tmdbService from '../services/tmdb';

interface UseTMDBResult {
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTrending = (timeWindow: 'day' | 'week' = 'day'): UseTMDBResult => {
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tmdbService.getTrending(timeWindow);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trending content');
    } finally {
      setLoading(false);
    }
  }, [timeWindow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const usePopular = (type: 'movie' | 'tv', page = 1): UseTMDBResult => {
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tmdbService.getPopular(type, page);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch popular content');
    } finally {
      setLoading(false);
    }
  }, [type, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useContentDetails = (id: number, type: 'movie' | 'tv'): UseTMDBResult => {
  const [data, setData] = useState<ContentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tmdbService.getDetails(id, type);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch content details');
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useGenres = (type: 'movie' | 'tv'): UseTMDBResult => {
  const [data, setData] = useState<{ genres: Genre[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tmdbService.getGenres(type);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch genres');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useGenreContent = (
  type: 'movie' | 'tv',
  genreId: number,
  page = 1
): UseTMDBResult => {
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await tmdbService.getByGenre(type, genreId, page);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch genre content');
    } finally {
      setLoading(false);
    }
  }, [type, genreId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useSearch = () => {
  const [data, setData] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, page = 1) => {
    if (!query.trim()) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await tmdbService.search(query, page);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, search, clearSearch };
};

// Optimized hook with lazy loading to prevent N+1 query problem
export const useMultipleContent = () => {
  const [contentRows, setContentRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowsLoaded, setRowsLoaded] = useState(0);

  const fetchMultipleContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load critical rows FIRST (trending, popular movies)
      const [trending, popularMovies] = await Promise.all([
        tmdbService.getTrending('day'),
        tmdbService.getPopular('movie'),
      ]);
      
      // Set initial critical rows and show page immediately
      setContentRows([
        { title: 'Trending Now', content: trending.results, type: 'trending' },
        { title: 'Popular Movies', content: popularMovies.results, type: 'popular' },
      ]);
      setLoading(false); // Show page now!
      setRowsLoaded(2);
      
      // Load remaining rows in background
      const [popularTV, topRatedMovies, topRatedTV, nowPlaying, upcoming, airingToday, onTheAir] = 
        await Promise.all([
          tmdbService.getPopular('tv'),
          tmdbService.getTopRated('movie'),
          tmdbService.getTopRated('tv'),
          tmdbService.getNowPlaying(),
          tmdbService.getUpcoming(),
          tmdbService.getAiringToday(),
          tmdbService.getOnTheAir()
        ]);

      // Add remaining rows to existing ones
      setContentRows(prev => [...prev,
        { title: 'Popular TV Shows', content: popularTV.results, type: 'popular' },
        { title: 'Top Rated Movies', content: topRatedMovies.results, type: 'top_rated' },
        { title: 'Top Rated TV Shows', content: topRatedTV.results, type: 'top_rated' },
        { title: 'Now Playing', content: nowPlaying.results, type: 'now_playing' },
        { title: 'Upcoming Movies', content: upcoming.results, type: 'upcoming' },
        { title: 'Airing Today', content: airingToday.results, type: 'airing_today' },
        { title: 'On The Air', content: onTheAir.results, type: 'on_the_air' }
      ]);
      setRowsLoaded(9);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMultipleContent();
  }, [fetchMultipleContent]);

  return { contentRows, loading, error, rowsLoaded, refetch: fetchMultipleContent };
};