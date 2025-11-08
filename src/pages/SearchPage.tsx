import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch } from 'react-icons/fa';
import { Content } from '../types/content.types';
import * as tmdbService from '../services/tmdb';
import { debounce } from '../utils/helpers';

const SearchContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding: var(--spacing-4xl) var(--spacing-xl);
`;

const SearchHeader = styled.div`
  max-width: 800px;
  margin: 0 auto var(--spacing-3xl);
`;

const SearchInputContainer = styled.div`
  position: relative;
  margin-bottom: var(--spacing-xl);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-lg) 60px;
  background: var(--background-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  
  &:focus {
    border-color: var(--netflix-red);
    outline: none;
  }
  
  &::placeholder {
    color: var(--text-muted);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: var(--font-size-lg);
`;

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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

  const handlePlay = (content: Content) => {
    const type = content.media_type || (content.title ? 'movie' : 'tv');
    if (type === 'movie') {
      const url = `https://www.vidking.net/embed/movie/${content.id}?autoPlay=true&color=e50914`;
      window.open(url, '_blank');
    } else {
      navigate(`/tv/${content.id}`);
    }
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
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search for movies and TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchInputContainer>
      </SearchHeader>

      <ResultsContainer>
        {loading && <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Searching...</div>}
        
        {!loading && query && results.length === 0 && (
          <NoResults>
            <h2>No results found</h2>
            <p>Try searching for something else</p>
          </NoResults>
        )}
        
        {results.length > 0 && (
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
        )}
      </ResultsContainer>
    </SearchContainer>
  );
};

export default SearchPage;