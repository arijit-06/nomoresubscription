import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Content } from '../types/content.types';
import EpisodeSelectModal from '../components/EpisodeSelectModal';
import * as tmdbService from '../services/tmdb';
import { debounce } from '../utils/helpers';

const SearchContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding-top: 80px;
`;

const SearchHeader = styled.div`
  position: sticky;
  top: 0;
  background: linear-gradient(180deg, var(--background-primary) 0%, rgba(20,20,20,0.95) 100%);
  padding: var(--spacing-lg) var(--spacing-xl);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid rgba(255,255,255,0.1);
`;

const SearchInputContainer = styled.div`
  position: relative;
  max-width: 600px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 50px;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:focus {
    background: rgba(255,255,255,0.15);
    border-color: var(--netflix-red);
    outline: none;
    box-shadow: 0 0 20px rgba(229,9,20,0.3);
  }
  
  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
`;

const ContentContainer = styled.div`
  padding: var(--spacing-xl);
`;

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const GenreSection = styled.div`
  margin-bottom: var(--spacing-3xl);
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-lg);
`;

const ContentCard = styled.div`
  aspect-ratio: 2/3;
  background: var(--background-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-normal);
  background-size: cover;
  background-position: center;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CardOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: var(--spacing-md);
  color: var(--text-primary);
`;

const CardTitle = styled.h3`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
`;

const CardYear = styled.p`
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
`;

const NoResults = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-4xl);
  
  h2 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-md);
  }
`;

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [episodeModal, setEpisodeModal] = useState({ 
    isOpen: false, 
    tvShowId: 0, 
    tvShowName: '' 
  });
  const [genreContent, setGenreContent] = useState<{ movies: Content[], tvShows: Content[] }>({ movies: [], tvShows: [] });
  const [contentLoading, setContentLoading] = useState(true);

  const searchContent = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await tmdbService.search(searchQuery);
      setResults(response.results.filter(item => item.poster_path));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchContent, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query]);

  useEffect(() => {
    loadGenreContent();
  }, []);

  const loadGenreContent = async () => {
    try {
      setContentLoading(true);
      const [popularMovies, popularTV] = await Promise.all([
        tmdbService.getPopular('movie'),
        tmdbService.getPopular('tv')
      ]);
      
      setGenreContent({
        movies: popularMovies.results.slice(0, 12),
        tvShows: popularTV.results.slice(0, 12)
      });
    } catch (error) {
      console.error('Failed to load genre content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const handlePlay = (content: Content) => {
    const type = content.media_type || (content.title ? 'movie' : 'tv');
    const title = (content.title || content.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
    
    if (type === 'movie') {
      navigate(`/${title}/${content.id}`);
    } else {
      setEpisodeModal({ 
        isOpen: true, 
        tvShowId: content.id, 
        tvShowName: content.name || 'Unknown Show' 
      });
    }
  };

  const closeEpisodeModal = () => {
    setEpisodeModal({ isOpen: false, tvShowId: 0, tvShowName: '' });
  };

  const getImageUrl = (path: string | null): string => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getContentTitle = (content: Content): string => {
    return content.title || content.name || 'Unknown Title';
  };

  const getContentYear = (content: Content): string => {
    const date = content.release_date || content.first_air_date;
    return date ? new Date(date).getFullYear().toString() : '';
  };

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchInputContainer>
          <SearchInput
            type="text"
            placeholder="Search movies, shows, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchInputContainer>
      </SearchHeader>

      <ContentContainer>
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--spacing-xl)' }}>Searching...</div>}
        
        {!loading && query && results.length === 0 && (
          <NoResults>
            <h2>No results found</h2>
            <p>Try searching for something else</p>
          </NoResults>
        )}
        
        {results.length > 0 && (
          <ResultsContainer>
            <ResultsGrid>
              {results.map((content) => (
                <ContentCard
                  key={content.id}
                  style={{
                    backgroundImage: `url(${getImageUrl(content.poster_path)})`
                  }}
                  onClick={() => handlePlay(content)}
                >
                  <CardOverlay>
                    <CardTitle>{getContentTitle(content)}</CardTitle>
                    <CardYear>{getContentYear(content)}</CardYear>
                  </CardOverlay>
                </ContentCard>
              ))}
            </ResultsGrid>
          </ResultsContainer>
        )}

        {!query && !contentLoading && (
          <ResultsContainer>
            <GenreSection>
              <SectionTitle>Popular Movies</SectionTitle>
              <ResultsGrid>
                {genreContent.movies.map((movie) => (
                  <ContentCard
                    key={movie.id}
                    style={{
                      backgroundImage: `url(${getImageUrl(movie.poster_path)})`
                    }}
                    onClick={() => handlePlay(movie)}
                  >
                    <CardOverlay>
                      <CardTitle>{getContentTitle(movie)}</CardTitle>
                      <CardYear>{getContentYear(movie)}</CardYear>
                    </CardOverlay>
                  </ContentCard>
                ))}
              </ResultsGrid>
            </GenreSection>

            <GenreSection>
              <SectionTitle>Popular TV Shows</SectionTitle>
              <ResultsGrid>
                {genreContent.tvShows.map((show) => (
                  <ContentCard
                    key={show.id}
                    style={{
                      backgroundImage: `url(${getImageUrl(show.poster_path)})`
                    }}
                    onClick={() => handlePlay(show)}
                  >
                    <CardOverlay>
                      <CardTitle>{getContentTitle(show)}</CardTitle>
                      <CardYear>{getContentYear(show)}</CardYear>
                    </CardOverlay>
                  </ContentCard>
                ))}
              </ResultsGrid>
            </GenreSection>
          </ResultsContainer>
        )}
      </ContentContainer>
      
      <EpisodeSelectModal
        isOpen={episodeModal.isOpen}
        onClose={closeEpisodeModal}
        tvShowId={episodeModal.tvShowId}
        tvShowName={episodeModal.tvShowName}
      />
    </SearchContainer>
  );
};

export default SearchPage;