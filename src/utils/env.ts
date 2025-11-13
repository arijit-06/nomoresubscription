// Environment variable validation and security
const requiredEnvVars = [
  'VITE_TMDB_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Validate all required environment variables are present
export const validateEnvVars = () => {
  const missing: string[] = [];
  
  requiredEnvVars.forEach(key => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
};

// Secure environment variable access
export const env = {
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY,
  TMDB_BASE_URL: import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p',
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VIDKING_BASE_URL: import.meta.env.VITE_VIDKING_BASE_URL || 'https://www.vidking.net/embed',
} as const;

// Initialize validation on app start
validateEnvVars();