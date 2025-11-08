import { createClient } from '@supabase/supabase-js';
import { Profile, CreateProfileData, UpdateProfileData } from '../types/user.types';
import { WatchlistItem, ViewingProgress } from '../types/content.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Profile operations
export const getProfiles = async (userId: string): Promise<Profile[]> => {
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
  const profile = {
    userid: userId,
    name: profileData.name,
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
  const updateData = {
    name: updates.name,
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