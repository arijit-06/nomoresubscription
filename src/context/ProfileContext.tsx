import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Profile, ProfileState, CreateProfileData, UpdateProfileData } from '../types/user.types';
import { useAuth } from './AuthContext';
import {
  getProfiles,
  createProfile as createProfileService,
  updateProfile as updateProfileService,
  deleteProfile as deleteProfileService,
} from '../services/supabase';
import { getSelectedProfile, setSelectedProfile, removeSelectedProfile } from '../utils/storage';

interface ProfileContextType extends ProfileState {
  createProfile: (profileData: CreateProfileData) => Promise<void>;
  updateProfile: (profileData: UpdateProfileData) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  selectProfile: (profile: Profile) => void;
  refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

type ProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROFILES'; payload: Profile[] }
  | { type: 'SET_SELECTED_PROFILE'; payload: Profile | null }
  | { type: 'ADD_PROFILE'; payload: Profile }
  | { type: 'UPDATE_PROFILE'; payload: Profile }
  | { type: 'REMOVE_PROFILE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROFILES':
      return { ...state, profiles: action.payload, loading: false };
    case 'SET_SELECTED_PROFILE':
      return { ...state, selectedProfile: action.payload };
    case 'ADD_PROFILE':
      return { 
        ...state, 
        profiles: [...state.profiles, action.payload],
        loading: false,
        error: null 
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.map(profile =>
          profile.id === action.payload.id ? action.payload : profile
        ),
        selectedProfile: state.selectedProfile?.id === action.payload.id 
          ? action.payload 
          : state.selectedProfile,
        loading: false,
        error: null
      };
    case 'REMOVE_PROFILE':
      return {
        ...state,
        profiles: state.profiles.filter(profile => profile.id !== action.payload),
        selectedProfile: state.selectedProfile?.id === action.payload 
          ? null 
          : state.selectedProfile,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: ProfileState = {
  profiles: [],
  selectedProfile: null,
  loading: false,
  error: null,
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { user } = useAuth();

  // Load profiles when user changes
  useEffect(() => {
    if (user) {
      loadProfiles();
    } else {
      dispatch({ type: 'SET_PROFILES', payload: [] });
      dispatch({ type: 'SET_SELECTED_PROFILE', payload: null });
      removeSelectedProfile();
    }
  }, [user]);

  // Auto-create guest profile if none exist
  useEffect(() => {
    if (user && state.profiles.length === 0 && !state.loading) {
      createGuestProfile();
    }
  }, [user, state.profiles.length, state.loading]);

  // Load selected profile from storage
  useEffect(() => {
    if (state.profiles.length > 0 && !state.selectedProfile) {
      const savedProfileId = getSelectedProfile();
      if (savedProfileId) {
        const savedProfile = state.profiles.find(p => p.id === savedProfileId);
        if (savedProfile) {
          dispatch({ type: 'SET_SELECTED_PROFILE', payload: savedProfile });
        }
      }
    }
  }, [state.profiles, state.selectedProfile]);

  const loadProfiles = async (): Promise<void> => {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const profiles = await getProfiles(user.uid);
      dispatch({ type: 'SET_PROFILES', payload: profiles });
    } catch (error: any) {
      console.error('Error loading profiles:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load profiles' });
    }
  };

  const createProfile = async (profileData: CreateProfileData): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    if (state.profiles.length >= 5) {
      throw new Error('Maximum of 5 profiles allowed');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const newProfile = await createProfileService(user.uid, profileData);
      dispatch({ type: 'ADD_PROFILE', payload: newProfile });
    } catch (error: any) {
      console.error('Error creating profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create profile' });
      throw error;
    }
  };

  const updateProfile = async (profileData: UpdateProfileData): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const updatedProfile = await updateProfileService(profileData);
      dispatch({ type: 'UPDATE_PROFILE', payload: updatedProfile });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' });
      throw error;
    }
  };

  const deleteProfile = async (profileId: string): Promise<void> => {
    if (state.profiles.length <= 1) {
      throw new Error('Cannot delete the last profile');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      await deleteProfileService(profileId);
      dispatch({ type: 'REMOVE_PROFILE', payload: profileId });

      // If deleted profile was selected, clear selection
      if (state.selectedProfile?.id === profileId) {
        removeSelectedProfile();
      }
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete profile' });
      throw error;
    }
  };

  const selectProfile = (profile: Profile): void => {
    dispatch({ type: 'SET_SELECTED_PROFILE', payload: profile });
    setSelectedProfile(profile.id);
  };

  const createGuestProfile = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const guestProfile = {
        name: 'Guest',
        avatar: 'avatar-1.png',
        ageRating: 'adult' as const
      };
      
      const newProfile = await createProfileService(user.uid, guestProfile);
      dispatch({ type: 'ADD_PROFILE', payload: newProfile });
      dispatch({ type: 'SET_SELECTED_PROFILE', payload: newProfile });
      setSelectedProfile(newProfile.id);
    } catch (error) {
      console.error('Failed to create guest profile:', error);
    }
  };

  const refreshProfiles = async (): Promise<void> => {
    await loadProfiles();
  };

  const value: ProfileContextType = {
    ...state,
    createProfile,
    updateProfile,
    deleteProfile,
    selectProfile,
    refreshProfiles,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};