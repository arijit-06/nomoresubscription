export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  ageRating: 'kids' | 'teen' | 'adult';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ProfileState {
  profiles: Profile[];
  selectedProfile: Profile | null;
  loading: boolean;
  error: string | null;
}

export type AgeRating = 'kids' | 'teen' | 'adult';

export interface CreateProfileData {
  name: string;
  avatar: string;
  ageRating: AgeRating;
}

export interface UpdateProfileData extends Partial<CreateProfileData> {
  id: string;
}