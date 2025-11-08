import { useCallback } from 'react';
import { useContent } from '../context/ContentContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';

export const useWatchlist = () => {
  const { user } = useAuth();
  const { selectedProfile } = useProfile();
  const { 
    watchlist, 
    addToWatchlist: addToWatchlistContext, 
    removeFromWatchlist: removeFromWatchlistContext,
    isInWatchlist: isInWatchlistContext,
    loading,
    error 
  } = useContent();

  const addToWatchlist = useCallback(async (contentId: number, contentType: 'movie' | 'tv') => {
    if (!user || !selectedProfile) {
      throw new Error('User not authenticated or no profile selected');
    }
    
    return addToWatchlistContext(contentId, contentType);
  }, [user, selectedProfile, addToWatchlistContext]);

  const removeFromWatchlist = useCallback(async (contentId: number, contentType: 'movie' | 'tv') => {
    if (!user || !selectedProfile) {
      throw new Error('User not authenticated or no profile selected');
    }
    
    return removeFromWatchlistContext(contentId, contentType);
  }, [user, selectedProfile, removeFromWatchlistContext]);

  const toggleWatchlist = useCallback(async (contentId: number, contentType: 'movie' | 'tv') => {
    if (isInWatchlistContext(contentId, contentType)) {
      await removeFromWatchlist(contentId, contentType);
    } else {
      await addToWatchlist(contentId, contentType);
    }
  }, [addToWatchlist, removeFromWatchlist, isInWatchlistContext]);

  const isInWatchlist = useCallback((contentId: number, contentType: 'movie' | 'tv') => {
    return isInWatchlistContext(contentId, contentType);
  }, [isInWatchlistContext]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    loading,
    error
  };
};