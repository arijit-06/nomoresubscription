import { createClient } from '@supabase/supabase-js';
import { Profile, CreateProfileData, UpdateProfileData } from '../types/user.types';
import { WatchlistItem, ViewingProgress } from '../types/content.types';
import { env } from '../utils/env';

// Input sanitization utility
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  }).trim();
};

// Validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Validate user ID format (Firebase UID)
const isValidUserId = (userId: string): boolean => {
  return /^[a-zA-Z0-9]{28}$/.test(userId) && userId.length === 28;
};

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Profile operations
export const getProfiles = async (userId: string): Promise<Profile[]> => {
  if (!isValidUserId(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: true });

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
  return data || [];
};

export const createProfile = async (userId: string, profileData: CreateProfileData): Promise<Profile> => {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new Error('Invalid user ID format');
  }
  
  if (!profileData.name || profileData.name.length > 50) {
    throw new Error('Profile name must be 1-50 characters');
  }
  
  const profile = {
    userid: userId,
    name: sanitizeInput(profileData.name),
    avatar: profileData.avatar,
    agerating: profileData.ageRating,
    createdat: new Date().toISOString(),
    updatedat: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (profileData: UpdateProfileData): Promise<Profile> => {
  const { id, ...updates } = profileData;
  
  // Validate inputs
  if (!isValidUUID(id)) {
    throw new Error('Invalid profile ID format');
  }
  
  if (updates.name && (updates.name.length === 0 || updates.name.length > 50)) {
    throw new Error('Profile name must be 1-50 characters');
  }
  
  const updateData = {
    name: updates.name ? sanitizeInput(updates.name) : undefined,
    avatar: updates.avatar,
    agerating: updates.ageRating,
    updatedat: new Date().toISOString()
  };
  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProfile = async (profileId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', profileId);

  if (error) throw error;
};

// Watchlist operations
export const getWatchlist = async (userId: string, profileId: string): Promise<WatchlistItem[]> => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('userid', userId)
    .eq('profileid', profileId)
    .order('addedat', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addToWatchlist = async (
  userId: string,
  profileId: string,
  contentId: number,
  contentType: 'movie' | 'tv'
): Promise<WatchlistItem> => {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new Error('Invalid user ID format');
  }
  if (!isValidUUID(profileId)) {
    throw new Error('Invalid profile ID format');
  }
  if (!Number.isInteger(contentId) || contentId <= 0) {
    throw new Error('Invalid content ID');
  }
  if (!['movie', 'tv'].includes(contentType)) {
    throw new Error('Invalid content type');
  }
  
  const item = {
    userid: userId,
    profileid: profileId,
    contentid: contentId,
    contenttype: contentType,
    addedat: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('watchlist')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromWatchlist = async (
  userId: string,
  profileId: string,
  contentId: number,
  contentType: 'movie' | 'tv'
): Promise<void> => {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('userid', userId)
    .eq('profileid', profileId)
    .eq('contentid', contentId)
    .eq('contenttype', contentType);

  if (error) throw error;
};

export const isInWatchlist = async (
  userId: string,
  profileId: string,
  contentId: number,
  contentType: 'movie' | 'tv'
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('id')
    .eq('userid', userId)
    .eq('profileid', profileId)
    .eq('contentid', contentId)
    .eq('contenttype', contentType)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
};

// Viewing progress operations
export const getViewingProgress = async (userId: string, profileId: string): Promise<ViewingProgress[]> => {
  const { data, error } = await supabase
    .from('viewing_progress')
    .select('*')
    .eq('userid', userId)
    .eq('profileid', profileId)
    .eq('completed', false)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const saveViewingProgress = async (
  userId: string,
  profileId: string,
  contentId: number,
  contentType: 'movie' | 'tv',
  progress: number,
  duration: number,
  season?: number,
  episode?: number
): Promise<ViewingProgress> => {
  const completed = progress / duration >= 0.9;
  
  const progressData = {
    userid: userId,
    profileid: profileId,
    contentid: contentId,
    contenttype: contentType,
    progress,
    duration,
    timestamp: new Date().toISOString(),
    season,
    episode,
    completed,
  };

  const { data, error } = await supabase
    .from('viewing_progress')
    .upsert(progressData, {
      onConflict: 'userid,profileid,contentid,contenttype,season,episode'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getContentProgress = async (
  userId: string,
  profileId: string,
  contentId: number,
  contentType: 'movie' | 'tv',
  season?: number,
  episode?: number
): Promise<ViewingProgress | null> => {
  let query = supabase
    .from('viewing_progress')
    .select('*')
    .eq('userid', userId)
    .eq('profileid', profileId)
    .eq('contentid', contentId)
    .eq('contenttype', contentType);

  if (season !== undefined) query = query.eq('season', season);
  if (episode !== undefined) query = query.eq('episode', episode);

  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Real-time subscriptions
export const subscribeToWatchlist = (
  userId: string,
  profileId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('watchlist_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'watchlist',
        filter: `userid=eq.${userId} AND profileid=eq.${profileId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToProgress = (
  userId: string,
  profileId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('progress_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'viewing_progress',
        filter: `userid=eq.${userId} AND profileid=eq.${profileId}`,
      },
      callback
    )
    .subscribe();
};