# Netflix Clone

A pixel-perfect Netflix clone built with React, TypeScript, and modern web technologies. Features complete user authentication, profile management, content browsing, video playback, and watchlist functionality.

## 🚀 Features

- **Authentication System**
  - Email/password signup and login
  - Google OAuth integration
  - Persistent sessions
  - Protected routes

- **Profile Management**
  - Multiple user profiles (up to 5 per account)
  - Custom avatars and names
  - Age rating restrictions
  - Profile switching

- **Content Browsing**
  - Hero banner with auto-rotating content
  - Multiple content rows (Trending, Popular, etc.)
  - Hover effects and animations
  - Responsive design (mobile to 4K)

- **Video Playback**
  - Vidking API integration
  - Progress tracking and resume
  - Custom player controls
  - Episode navigation for TV shows

- **Watchlist & Progress**
  - Add/remove content from watchlist
  - Real-time sync across devices
  - Continue watching functionality
  - Progress persistence

- **Search & Discovery**
  - Real-time search with debouncing
  - Filter by movies/TV shows
  - Genre-based browsing
  - Personalized recommendations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Styled Components, CSS Grid/Flexbox
- **Routing**: React Router DOM v6
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Authentication**: Firebase Auth
- **Database**: Supabase
- **Content API**: TMDB (The Movie Database)
- **Video Player**: Vidking API

## 📋 Prerequisites

Before running this project, you need to obtain API keys from:

1. **TMDB API**: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. **Firebase**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
3. **Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd netflix-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys in the `.env` file:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
   VITE_TMDB_IMAGE_BASE=https://image.tmdb.org/t/p

   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id

   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   VITE_VIDKING_BASE_URL=https://www.vidking.net/embed
   ```

4. **Set up Supabase database**
   
   Create the following tables in your Supabase project:

   **profiles table:**
   ```sql
   CREATE TABLE profiles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     userid TEXT NOT NULL,
     name TEXT NOT NULL,
     avatar TEXT NOT NULL,
     agerating TEXT NOT NULL CHECK (agerating IN ('kids', 'teen', 'adult')),
     createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

   **watchlist table:**
   ```sql
   CREATE TABLE watchlist (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     userid TEXT NOT NULL,
     profileid UUID REFERENCES profiles(id) ON DELETE CASCADE,
     contentid INTEGER NOT NULL,
     contenttype TEXT NOT NULL CHECK (contenttype IN ('movie', 'tv')),
     addedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(userid, profileid, contentid, contenttype)
   );
   ```

   **viewing_progress table:**
   ```sql
   CREATE TABLE viewing_progress (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     userid TEXT NOT NULL,
     profileid UUID REFERENCES profiles(id) ON DELETE CASCADE,
     contentid INTEGER NOT NULL,
     contenttype TEXT NOT NULL CHECK (contenttype IN ('movie', 'tv')),
     progress REAL NOT NULL DEFAULT 0,
     duration REAL NOT NULL DEFAULT 0,
     timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     season INTEGER,
     episode INTEGER,
     completed BOOLEAN DEFAULT FALSE,
     UNIQUE(userid, profileid, contentid, contenttype, season, episode)
   );
   ```

5. **Configure Firebase Authentication**
   - Enable Email/Password authentication
   - Enable Google OAuth provider
   - Add your domain to authorized domains

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
netflix-clone/
├── public/
│   └── netflix-logo.svg
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Auth/           # Authentication components
│   │   ├── Browse/         # Content browsing components
│   │   ├── Layout/         # Layout components
│   │   ├── Player/         # Video player components
│   │   ├── Profile/        # Profile management components
│   │   └── Search/         # Search components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── styles/             # Global styles and variables
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── App.tsx             # Main App component
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## 🎨 Design System

The project uses a comprehensive design system with:

- **Colors**: Netflix brand colors (red, black, grays)
- **Typography**: Netflix Sans font family with responsive sizing
- **Spacing**: Consistent spacing scale using CSS custom properties
- **Components**: Reusable styled components with variants
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with breakpoints

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

3. Configure your web server for SPA routing

## 🧪 Testing Checklist

- [ ] User registration and login
- [ ] Profile creation and management
- [ ] Content browsing and navigation
- [ ] Video playback functionality
- [ ] Watchlist add/remove operations
- [ ] Search functionality
- [ ] Responsive design on different devices
- [ ] Cross-browser compatibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes only. Netflix is a trademark of Netflix, Inc.

## 🆘 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure all environment variables are correctly set
2. **CORS Issues**: Check Firebase and Supabase domain configurations
3. **Build Errors**: Clear node_modules and reinstall dependencies
4. **Video Playback**: Verify Vidking API integration and content availability

### Getting Help

- Check the browser console for error messages
- Verify API key permissions and quotas
- Ensure database tables are created correctly
- Test with different content IDs

## 🔮 Future Enhancements

- [ ] Offline content caching
- [ ] Advanced recommendation algorithm
- [ ] Social features (sharing, reviews)
- [ ] Multiple language support
- [ ] Download functionality
- [ ] Parental controls
- [ ] Analytics and metrics
- [ ] Admin dashboard

---

Built with ❤️ using modern web technologies