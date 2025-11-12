import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Content } from '../types/content.types';
import ContentHoverCard from '../components/ContentHoverCard';
import EpisodeSelectModal from '../components/EpisodeSelectModal';
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

const BrowseTVPage: React.FC = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [showsByGenre, setShowsByGenre] = useState<{ [key: number]: Content[] }>({});
  const [loading, setLoading] = useState(true);
  const [episodeModal, setEpisodeModal] = useState({ 
    isOpen: false, 
    tvShowId: 0, 
    tvShowName: '' 
  });

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
    loadGenresAndShows();
  }, [selectedLanguage]);

  const loadGenresAndShows = async () => {
    try {
      setLoading(true);
      const genresData = await tmdbService.getGenres('tv');
      setGenres(genresData.genres);

      const showData: { [key: number]: Content[] } = {};
      
      for (const genre of genresData.genres.slice(0, 6)) {
        const shows = await tmdbService.getByGenre('tv', genre.id, 1);
        let filteredShows = shows.results;
        
        if (selectedLanguage) {
          filteredShows = shows.results.filter(show => 
            show.original_language === selectedLanguage
          );
        }
        
        showData[genre.id] = filteredShows.slice(0, 12);
      }
      
      setShowsByGenre(showData);
    } catch (error) {
      console.error('Error loading TV shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (content: Content) => {
    setEpisodeModal({ 
      isOpen: true, 
      tvShowId: content.id, 
      tvShowName: content.name || 'Unknown Show' 
    });
  };

  const closeEpisodeModal = () => {
    setEpisodeModal({ isOpen: false, tvShowId: 0, tvShowName: '' });
  };

  const getImageUrl = (path: string | null): string => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  if (loading) {
    return (
      <BrowseContainer>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Loading TV shows...
        </div>
      </BrowseContainer>
    );
  }

  return (
    <BrowseContainer>
      <Header>
        <Title>TV Shows</Title>
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
        showsByGenre[genre.id]?.length > 0 && (
          <GenreSection key={genre.id}>
            <GenreTitle>{genre.name}</GenreTitle>
            <ContentGrid>
              {showsByGenre[genre.id].map((show: Content) => (
                <ContentHoverCard
                  key={show.id}
                  content={show}
                  onPlay={handlePlay}
                >
                  <ContentCard
                    style={{
                      backgroundImage: `url(${getImageUrl(show.backdrop_path || show.poster_path)})`
                    }}
                    onClick={() => handlePlay(show)}
                  />
                </ContentHoverCard>
              ))}
            </ContentGrid>
          </GenreSection>
        )
      ))}
      
      <EpisodeSelectModal
        isOpen={episodeModal.isOpen}
        onClose={closeEpisodeModal}
        tvShowId={episodeModal.tvShowId}
        tvShowName={episodeModal.tvShowName}
      />
    </BrowseContainer>
  );
};

export default BrowseTVPage;