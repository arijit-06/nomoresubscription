import { useEffect, useRef } from 'react';
import { subscribeToWatchlist, subscribeToProgress } from '../services/supabase';

// Hook to manage Supabase subscriptions with proper cleanup
export const useWatchlistSubscription = (
  userId: string | null,
  profileId: string | null,
  callback: (payload: any) => void
) => {
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!userId || !profileId) return;
    
    // Subscribe to watchlist changes
    subscriptionRef.current = subscribeToWatchlist(userId, profileId, callback);
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId, profileId, callback]);

  // Manual cleanup method
  const cleanup = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  };

  return { cleanup };
};

export const useProgressSubscription = (
  userId: string | null,
  profileId: string | null,
  callback: (payload: any) => void
) => {
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!userId || !profileId) return;
    
    subscriptionRef.current = subscribeToProgress(userId, profileId, callback);
    
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [userId, profileId, callback]);

  const cleanup = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  };

  return { cleanup };
};