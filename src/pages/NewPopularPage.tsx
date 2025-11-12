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

const TabContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
`;

const Tab = styled.button<{ active: boolean }>`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: ${props => props.active ? 'var(--netflix-red)' : 'transparent'};
  border: 1px solid ${props => props.active ? 'var(--netflix-red)' : 'var(--border-color)'};
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--netflix-red);
  }
`;

const ContentSection = styled.div`
  margin-bottom: var(--spacing-3xl);
`;

const SectionTitle = styled.h2`
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

const NewPopularPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [newMovies, setNewMovies] = useState<Content[]>([]);
  const [newTVShows, setNewTVShows] = useState<Content[]>([]);
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
    loadNewContent();
  }, [selectedLanguage]);

  const loadNewContent = async () => {
    try {
      setLoading(true);
      
      // Get newest movies (now playing and upcoming)
      const nowPlayingMovies = await tmdbService.getNowPlaying();
      const upcomingMovies = await tmdbService.getUpcoming();
      
      // Get newest TV shows (airing today and on the air)
      const airingTodayShows = await tmdbService.getAiringToday();
      const onTheAirShows = await tmdbService.getOnTheAir();
      
      // Combine and filter by language
      let allNewMovies = [...nowPlayingMovies.results, ...upcomingMovies.results];
      let allNewTVShows = [...airingTodayShows.results, ...onTheAirShows.results];
      
      if (selectedLanguage) {
        allNewMovies = allNewMovies.filter(movie => 
          movie.original_language === selectedLanguage
        );
        allNewTVShows = allNewTVShows.filter(show => 
          show.original_language === selectedLanguage
        );
      }
      
      // Sort by release date (newest first) and remove duplicates
      const uniqueMovies = Array.from(
        new Map(allNewMovies.map(movie => [movie.id, movie])).values()
      ).sort((a, b) => 
        new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime()
      );
      
      const uniqueTVShows = Array.from(
        new Map(allNewTVShows.map(show => [show.id, show])).values()
      ).sort((a, b) => 
        new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime()
      );
      
      setNewMovies(uniqueMovies.slice(0, 20));
      setNewTVShows(uniqueTVShows.slice(0, 20));
    } catch (error) {
      console.error('Error loading new content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (content: Content) => {
    const type = content.title ? 'movie' : 'tv';
    if (type === 'movie') {
      const title = (content.title || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
      navigate(`/${title}/${content.id}`);
    } else {
      navigate(`/tv/${content.id}`);
    }
  };

  const getImageUrl = (path: string | null): string => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  if (loading) {
    return (
      <BrowseContainer>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Loading new & popular content...
        </div>
      </BrowseContainer>
    );
  }

  return (
    <BrowseContainer>
      <Header>
        <Title>New & Popular</Title>
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
        <TabContainer>
          <Tab 
            active={activeTab === 'movies'} 
            onClick={() => setActiveTab('movies')}
          >
            New Movies
          </Tab>
          <Tab 
            active={activeTab === 'tv'} 
            onClick={() => setActiveTab('tv')}
          >
            New TV Shows
          </Tab>
        </TabContainer>
      </Header>

      {activeTab === 'movies' && (
        <ContentSection>
          <SectionTitle>Latest Movie Releases</SectionTitle>
          <ContentGrid>
            {newMovies.map((movie: Content) => (
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
        </ContentSection>
      )}

      {activeTab === 'tv' && (
        <ContentSection>
          <SectionTitle>Latest TV Show Episodes</SectionTitle>
          <ContentGrid>
            {newTVShows.map((show: Content) => (
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
        </ContentSection>
      )}
    </BrowseContainer>
  );
};

export default NewPopularPage;