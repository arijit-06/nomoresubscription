import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Content } from '../types/content.types';
import ContentHoverCard from '../components/ContentHoverCard';
import * as tmdbService from '../services/tmdb';

const BrowseContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding: 80px var(--spacing-xl) var(--spacing-xl);
`;

const Header = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const Title = styled.h1`
  color: var(--text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
`;

const FilterContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
`;

const GenreSection = styled.div`
  margin-bottom: var(--spacing-3xl);
`;

const GenreTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
`;

const ContentCard = styled.div`
  aspect-ratio: 16/9;
  background: var(--background-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-normal);
  background-size: cover;
  background-position: center;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const BrowseMoviesPage: React.FC = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [moviesByGenre, setMoviesByGenre] = useState<{ [key: number]: Content[] }>({});
  const [loading, setLoading] = useState(true);

  const languages = [
    { code: '', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' }
  ];

  useEffect(() => {
    loadGenresAndMovies();
  }, [selectedLanguage]);

  const loadGenresAndMovies = async () => {
    try {
      setLoading(true);
      const genresData = await tmdbService.getGenres('movie');
      setGenres(genresData.genres);

      const movieData: { [key: number]: Content[] } = {};
      
      for (const genre of genresData.genres.slice(0, 6)) {
        const movies = await tmdbService.getByGenre('movie', genre.id, 1);
        let filteredMovies = movies.results;
        
        if (selectedLanguage) {
          filteredMovies = movies.results.filter(movie => 
            movie.original_language === selectedLanguage
          );
        }
        
        movieData[genre.id] = filteredMovies.slice(0, 12);
      }
      
      setMoviesByGenre(movieData);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (content: Content) => {
    const title = (content.title || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    navigate(`/${title}/${content.id}`);
  };

  const getImageUrl = (path: string | null): string => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  if (loading) {
    return (
      <BrowseContainer>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Loading movies...
        </div>
      </BrowseContainer>
    );
  }

  return (
    <BrowseContainer>
      <Header>
        <Title>Movies</Title>
        <FilterContainer>
          <FilterSelect
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </FilterSelect>
        </FilterContainer>
      </Header>

      {genres.map(genre => (
        moviesByGenre[genre.id]?.length > 0 && (
          <GenreSection key={genre.id}>
            <GenreTitle>{genre.name}</GenreTitle>
            <ContentGrid>
              {moviesByGenre[genre.id].map((movie: Content) => (
                <ContentHoverCard
                  key={movie.id}
                  content={movie}
                  onPlay={handlePlay}
                >
                  <ContentCard
                    style={{
                      backgroundImage: `url(${getImageUrl(movie.backdrop_path || movie.poster_path)})`
                    }}
                    onClick={() => handlePlay(movie)}
                  />
                </ContentHoverCard>
              ))}
            </ContentGrid>
          </GenreSection>
        )
      ))}
    </BrowseContainer>
  );
};

export default BrowseMoviesPage;