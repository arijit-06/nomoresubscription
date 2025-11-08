// Netflix brand colors
export const COLORS = {
  NETFLIX_RED: '#E50914',
  NETFLIX_BLACK: '#141414',
  NETFLIX_DARK_GRAY: '#2F2F2F',
  NETFLIX_MEDIUM_GRAY: '#808080',
  NETFLIX_LIGHT_GRAY: '#B3B3B3',
  NETFLIX_WHITE: '#FFFFFF',
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1920,
} as const;

// Content row configurations
export const CONTENT_ROWS = [
  { title: 'Trending Now', type: 'trending' },
  { title: 'Top 10 in Your Country', type: 'popular', showRankings: true },
  { title: 'Popular on Netflix', type: 'popular' },
  { title: 'Continue Watching', type: 'continue' },
  { title: 'New Releases', type: 'upcoming' },
  { title: 'Action Movies', type: 'genre', genreId: 28 },
  { title: 'Drama Series', type: 'genre', genreId: 18, mediaType: 'tv' },
  { title: 'Comedies', type: 'genre', genreId: 35 },
  { title: 'Documentaries', type: 'genre', genreId: 99 },
] as const;

// Genre mappings
export const MOVIE_GENRES = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
} as const;

export const TV_GENRES = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
} as const;

// Avatar options
export const AVATAR_OPTIONS = [
  'avatar-1.png',
  'avatar-2.png',
  'avatar-3.png',
  'avatar-4.png',
  'avatar-5.png',
  'avatar-6.png',
  'avatar-7.png',
  'avatar-8.png',
  'avatar-9.png',
  'avatar-10.png',
  'avatar-11.png',
  'avatar-12.png',
  'avatar-13.png',
  'avatar-14.png',
  'avatar-15.png',
  'avatar-16.png',
  'avatar-17.png',
  'avatar-18.png',
  'avatar-19.png',
  'avatar-20.png',
] as const;

// Age rating configurations
export const AGE_RATINGS = {
  kids: {
    label: 'Kids',
    description: 'Content suitable for children',
    maxRating: 'G',
  },
  teen: {
    label: 'Teen',
    description: 'Content suitable for teenagers',
    maxRating: 'PG-13',
  },
  adult: {
    label: 'Adult',
    description: 'All content',
    maxRating: 'R',
  },
} as const;

// Navigation menu items
export const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'TV Shows', path: '/browse/tv' },
  { label: 'Movies', path: '/browse/movies' },
  { label: 'New & Popular', path: '/browse/new' },
  { label: 'My List', path: '/my-list' },
] as const;

// Player settings
export const PLAYER_SETTINGS = {
  PROGRESS_SAVE_INTERVAL: 10000, // 10 seconds
  COMPLETION_THRESHOLD: 0.9, // 90%
  NEXT_EPISODE_COUNTDOWN: 30, // 30 seconds
  SKIP_INTRO_DURATION: 90, // 90 seconds
  AUTO_ROTATE_INTERVAL: 5000, // 5 seconds
} as const;

// API settings
export const API_SETTINGS = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  SEARCH_DEBOUNCE: 300, // 300ms
  ITEMS_PER_PAGE: 20,
  ITEMS_PER_ROW: {
    MOBILE: 2,
    TABLET: 3,
    DESKTOP: 6,
  },
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  SELECTED_PROFILE: 'netflix_selected_profile',
  USER_PREFERENCES: 'netflix_user_preferences',
  VOLUME_LEVEL: 'netflix_volume_level',
  PLAYBACK_QUALITY: 'netflix_playback_quality',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_EMAIL: 'Please enter a valid email address',
    WEAK_PASSWORD: 'Password must be at least 6 characters long',
    USER_NOT_FOUND: 'No account found with this email',
    WRONG_PASSWORD: 'Incorrect password',
    EMAIL_IN_USE: 'An account with this email already exists',
    NETWORK_ERROR: 'Network error. Please check your connection',
  },
  CONTENT: {
    LOAD_FAILED: 'Failed to load content. Please try again',
    SEARCH_FAILED: 'Search failed. Please try again',
    NO_RESULTS: 'No results found',
  },
  PLAYER: {
    LOAD_FAILED: 'Failed to load video. Please try again',
    NETWORK_ERROR: 'Network error during playback',
    UNSUPPORTED_FORMAT: 'Video format not supported',
  },
  PROFILE: {
    CREATE_FAILED: 'Failed to create profile',
    UPDATE_FAILED: 'Failed to update profile',
    DELETE_FAILED: 'Failed to delete profile',
    MAX_PROFILES: 'Maximum of 5 profiles allowed',
  },
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    SIGNUP_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'Logged out successfully',
  },
  PROFILE: {
    CREATED: 'Profile created successfully',
    UPDATED: 'Profile updated successfully',
    DELETED: 'Profile deleted successfully',
  },
  WATCHLIST: {
    ADDED: 'Added to My List',
    REMOVED: 'Removed from My List',
  },
} as const;