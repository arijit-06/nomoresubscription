import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  AuthError
} from 'firebase/auth';
import { User } from '../types/user.types';
import { env } from '../utils/env';

// Input validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6 && password.length <= 128;
};

const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  // Validate inputs
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validatePassword(password)) {
    throw new Error('Password must be 6-128 characters');
  }
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(result.user);
  } catch (error) {
    const authError = error as AuthError;
    // Sanitize error messages to prevent information leakage
    switch (authError.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new Error('Invalid email or password');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Please try again later.');
      default:
        throw new Error('Authentication failed');
    }
  }
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  // Validate inputs
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }
  if (!validatePassword(password)) {
    throw new Error('Password must be 6-128 characters');
  }
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(result.user);
  } catch (error) {
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/email-already-in-use':
        throw new Error('Email already registered');
      case 'auth/weak-password':
        throw new Error('Password is too weak');
      default:
        throw new Error('Registration failed');
    }
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return mapFirebaseUser(result.user);
  } catch (error) {
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in cancelled');
      case 'auth/popup-blocked':
        throw new Error('Popup blocked. Please allow popups and try again.');
      default:
        throw new Error('Google sign-in failed');
    }
  }
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
};

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email!,
  displayName: firebaseUser.displayName || undefined,
  photoURL: firebaseUser.photoURL || undefined,
  emailVerified: firebaseUser.emailVerified,
});

export default app;