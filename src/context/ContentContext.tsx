import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Content, ContentRow, WatchlistItem, ViewingProgress } from '../types/content.types';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import {
  getWatchlist,
  getViewingProgress,
  addToWatchlist as addToWatchlistService,
  removeFromWatchlist as removeFromWatchlistService,
  isInWatchlist as checkInWatchlist,
  subscribeToWatchlist,
  subscribeToProgress,
} from '../services/supabase';

interface ContentState {
  watchlist: WatchlistItem[];
  viewingProgress: ViewingProgress[];
  contentRows: ContentRow[];
  searchResults: Content[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

interface ContentContextType extends ContentState {
  addToWatchlist: (contentId: number, contentType: 'movie' | 'tv') => Promise<void>;
  removeFromWatchlist: (contentId: number, contentType: 'movie' | 'tv') => Promise<void>;
  isInWatchlist: (contentId: number, contentType: 'movie' | 'tv') => boolean;
  getContentProgress: (contentId: number, contentType: 'movie' | 'tv', season?: number, episode?: number) => ViewingProgress | null;
  setSearchResults: (results: Content[]) => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  refreshWatchlist: () => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

type ContentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WATCHLIST'; payload: WatchlistItem[] }
  | { type: 'SET_VIEWING_PROGRESS'; payload: ViewingProgress[] }
  | { type: 'ADD_TO_WATCHLIST'; payload: WatchlistItem }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: { contentId: number; contentType: 'movie' | 'tv' } }
  | { type: 'UPDATE_PROGRESS'; payload: ViewingProgress }
  | { type: 'SET_SEARCH_RESULTS'; payload: Content[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const contentReducer = (state: ContentState, action: ContentAction): ContentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload, loading: false };
    case 'SET_VIEWING_PROGRESS':
      return { ...state, viewingProgress: action.payload, loading: false };
    case 'ADD_TO_WATCHLIST':
      return {
        ...state,
        watchlist: [action.payload, ...state.watchlist],
        error: null
      };
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(
          item => !(item.contentId === action.payload.contentId && 
                   item.contentType === action.payload.contentType)
        ),
        error: null
      };
    case 'UPDATE_PROGRESS':
      const existingIndex = state.viewingProgress.findIndex(
        p => p.contentId === action.payload.contentId &&
             p.contentType === action.payload.contentType &&
             p.season === action.payload.season &&
             p.episode === action.payload.episode
      );
      
      if (existingIndex >= 0) {
        const updated = [...state.viewingProgress];
        updated[existingIndex] = action.payload;
        return { ...state, viewingProgress: updated };
      } else {
        return {
          ...state,
          viewingProgress: [action.payload, ...state.viewingProgress]
        };
      }
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'CLEAR_SEARCH':
      return { ...state, searchResults: [], searchQuery: '' };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: ContentState = {
  watchlist: [],
  viewingProgress: [],
  contentRows: [],
  searchResults: [],
  searchQuery: '',
  loading: false,
  error: null,
};

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(contentReducer, initialState);
  const { user } = useAuth();
  const { selectedProfile } = useProfile();

  // Load user data when profile changes
  useEffect(() => {
    if (user && selectedProfile) {
      loadWatchlist();
      loadViewingProgress();
      setupSubscriptions();
    } else {
      dispatch({ type: 'SET_WATCHLIST', payload: [] });
      dispatch({ type: 'SET_VIEWING_PROGRESS', payload: [] });
    }
  }, [user, selectedProfile]);

  const setupSubscriptions = () => {
    if (!user || !selectedProfile) return;

    // Subscribe to watchlist changes
    const watchlistSubscription = subscribeToWatchlist(
      user.uid,
      selectedProfile.id,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'ADD_TO_WATCHLIST', payload: payload.new });
        } else if (payload.eventType === 'DELETE') {
          dispatch({
            type: 'REMOVE_FROM_WATCHLIST',
            payload: {
              contentId: payload.old.contentId,
              contentType: payload.old.contentType
            }
          });
        }
      }
    );

    // Subscribe to progress changes
    const progressSubscription = subscribeToProgress(
      user.uid,
      selectedProfile.id,
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_PROGRESS', payload: payload.new });
        }
      }
    );

    // Cleanup subscriptions
    return () => {
      watchlistSubscription.unsubscribe();
      progressSubscription.unsubscribe();
    };
  };

  const loadWatchlist = async (): Promise<void> => {
    if (!user || !selectedProfile) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const watchlist = await getWatchlist(user.uid, selectedProfile.id);
      dispatch({ type: 'SET_WATCHLIST', payload: watchlist });
    } catch (error: any) {
      console.error('Error loading watchlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load watchlist' });
    }
  };

  const loadViewingProgress = async (): Promise<void> => {
    if (!user || !selectedProfile) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const progress = await getViewingProgress(user.uid, selectedProfile.id);
      dispatch({ type: 'SET_VIEWING_PROGRESS', payload: progress });
    } catch (error: any) {
      console.error('Error loading viewing progress:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load viewing progress' });
    }
  };

  const addToWatchlist = async (contentId: number, contentType: 'movie' | 'tv'): Promise<void> => {
    if (!user || !selectedProfile) throw new Error('User not authenticated');

    try {
      const item = await addToWatchlistService(user.uid, selectedProfile.id, contentId, contentType);
      dispatch({ type: 'ADD_TO_WATCHLIST', payload: item });
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add to watchlist' });
      throw error;
    }
  };

  const removeFromWatchlist = async (contentId: number, contentType: 'movie' | 'tv'): Promise<void> => {
    if (!user || !selectedProfile) throw new Error('User not authenticated');

    try {
      await removeFromWatchlistService(user.uid, selectedProfile.id, contentId, contentType);
      dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: { contentId, contentType } });
    } catch (error: any) {
      console.error('Error removing from watchlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove from watchlist' });
      throw error;
    }
  };

  const isInWatchlist = (contentId: number, contentType: 'movie' | 'tv'): boolean => {
    return state.watchlist.some(
      item => item.contentId === contentId && item.contentType === contentType
    );
  };

  const getContentProgress = (
    contentId: number,
    contentType: 'movie' | 'tv',
    season?: number,
    episode?: number
  ): ViewingProgress | null => {
    return state.viewingProgress.find(
      p => p.contentId === contentId &&
           p.contentType === contentType &&
           p.season === season &&
           p.episode === episode
    ) || null;
  };

  const setSearchResults = (results: Content[]): void => {
    dispatch({ type: 'SET_SEARCH_RESULTS', payload: results });
  };

  const setSearchQuery = (query: string): void => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const clearSearch = (): void => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

  const refreshWatchlist = async (): Promise<void> => {
    await loadWatchlist();
  };

  const refreshProgress = async (): Promise<void> => {
    await loadViewingProgress();
  };

  const value: ContentContextType = {
    ...state,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    getContentProgress,
    setSearchResults,
    setSearchQuery,
    clearSearch,
    refreshWatchlist,
    refreshProgress,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};