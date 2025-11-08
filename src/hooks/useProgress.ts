import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { ViewingProgress } from '../types/content.types';
import { saveViewingProgress, getContentProgress } from '../services/supabase';

export const useProgress = () => {
  const { user } = useAuth();
  const { selectedProfile } = useProfile();

  const saveProgress = useCallback(async (
    contentId: number,
    contentType: 'movie' | 'tv',
    progress: number,
    duration: number,
    season?: number,
    episode?: number
  ): Promise<ViewingProgress> => {
    if (!user || !selectedProfile) {
      throw new Error('User not authenticated or no profile selected');
    }

    return saveViewingProgress(
      user.uid,
      selectedProfile.id,
      contentId,
      contentType,
      progress,
      duration,
      season,
      episode
    );
  }, [user, selectedProfile]);

  const getProgress = useCallback(async (
    contentId: number,
    contentType: 'movie' | 'tv',
    season?: number,
    episode?: number
  ): Promise<ViewingProgress | null> => {
    if (!user || !selectedProfile) {
      return null;
    }

    return getContentProgress(
      user.uid,
      selectedProfile.id,
      contentId,
      contentType,
      season,
      episode
    );
  }, [user, selectedProfile]);

  const calculateProgressPercentage = useCallback((progress: number, duration: number): number => {
    if (duration === 0) return 0;
    return Math.min(100, Math.max(0, (progress / duration) * 100));
  }, []);

  const isCompleted = useCallback((progress: number, duration: number): boolean => {
    return duration > 0 && (progress / duration) >= 0.9;
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getRemainingTime = useCallback((progress: number, duration: number): number => {
    return Math.max(0, duration - progress);
  }, []);

  const shouldShowContinueWatching = useCallback((progress: number, duration: number): boolean => {
    const progressPercentage = calculateProgressPercentage(progress, duration);
    return progressPercentage > 5 && progressPercentage < 90; // Show if watched more than 5% but less than 90%
  }, [calculateProgressPercentage]);

  return {
    saveProgress,
    getProgress,
    calculateProgressPercentage,
    isCompleted,
    formatTime,
    getRemainingTime,
    shouldShowContinueWatching
  };
};