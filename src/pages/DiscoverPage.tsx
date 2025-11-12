import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Content } from '../types/content.types';
import ContentHoverCard from '../components/ContentHoverCard';
import EpisodeSelectModal from '../components/EpisodeSelectModal';
import * as tmdbService from '../services/tmdb';

const DiscoverContainer = styled.div`
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

const RatingSection = styled.div`
  margin-bottom: var(--spacing-3xl);
`;

const SectionTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const RatingBadge = styled.span<{ tier: 'top' | 'mid' | 'under' }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: ${props => {
    switch(props.tier) {
      case 'top': return 'linear-gradient(45deg, #FFD700, #FFA500)';
      case 'mid': return 'linear-gradient(45deg, #C0C0C0, #808080)';
      case 'under': return 'linear-gradient(45deg, #CD7F32, #8B4513)';
    }
  }};
  color: black;
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

const GenreSection = styled.div`
  margin-bottom: var(--spacing-3xl);
`;

const GenreTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-lg);
  opacity: 0.8;
`;

const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');
  const [content, setContent] = useState<{
    topRated: Content[];
    midRated: Content[];
    underRated: Content[];
    genres: { [key: string]: Content[] };
  }>({
    topRated: [],
    midRated: [],
    underRated: [],
    genres: {}
  });
  const [loading, setLoading] = useState(true);
  const [episodeModal, setEpisodeModal] = useState({ 
    isOpen: false, 
    tvShowId: 0, 
    tvShowName: '' 
  });

  useEffect(() => {
    loadDiscoverContent();
  }, [activeTab]);

  const loadDiscoverContent = async () => {
    try {
      setLoading(true);
      
      const [topRated, popular, genres] = await Promise.all([
        tmdbService.getTopRated(activeTab),
        tmdbService.getPopular(activeTab),
        tmdbService.getGenres(activeTab)
      ]);

      // Top rated (8.0+), Mid rated (6.0-7.9), Under rated (4.0-5.9)
      const topRatedContent = topRated.results.filter(item => item.vote_average >= 8.0).slice(0, 12);
      const midRatedContent = popular.results.filter(item => item.vote_average >= 6.0 && item.vote_average < 8.0).slice(0, 12);
      const underRatedContent = popular.results.filter(item => item.vote_average >= 4.0 && item.vote_average < 6.0).slice(0, 12);

      // Random genres
      const randomGenres = genres.genres.sort(() => 0.5 - Math.random()).slice(0, 3);
      const genreContent: { [key: string]: Content[] } = {};
      
      for (const genre of randomGenres) {
        const genreMovies = await tmdbService.getByGenre(activeTab, genre.id);
        genreContent[genre.name] = genreMovies.results.slice(0, 8);
      }

      setContent({
        topRated: topRatedContent,
        midRated: midRatedContent,
        underRated: underRatedContent,
        genres: genreContent
      });
    } catch (error) {
      console.error('Error loading discover content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (content: Content) => {
    const type = activeTab;
    if (type === 'movies') {
      const title = (content.title || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_');
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

  if (loading) {
    return (
      <DiscoverContainer>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Loading discover content...
        </div>
      </DiscoverContainer>
    );
  }

  return (
    <DiscoverContainer>
      <Header>
        <Title>Discover</Title>
        <TabContainer>
          <Tab 
            active={activeTab === 'movies'} 
            onClick={() => setActiveTab('movies')}
          >
            Movies
          </Tab>
          <Tab 
            active={activeTab === 'tv'} 
            onClick={() => setActiveTab('tv')}
          >
            TV Shows
          </Tab>
        </TabContainer>
      </Header>

      <RatingSection>
        <SectionTitle>
          Top Rated
          <RatingBadge tier="top">8.0+ ⭐</RatingBadge>
        </SectionTitle>
        <ContentGrid>
          {content.topRated.map((item) => (
            <ContentHoverCard
              key={item.id}
              content={item}
              onPlay={handlePlay}
            >
              <ContentCard
                style={{
                  backgroundImage: `url(${getImageUrl(item.backdrop_path || item.poster_path)})`
                }}
                onClick={() => handlePlay(item)}
              />
            </ContentHoverCard>
          ))}
        </ContentGrid>
      </RatingSection>

      <RatingSection>
        <SectionTitle>
          Popular Picks
          <RatingBadge tier="mid">6.0-7.9 ⭐</RatingBadge>
        </SectionTitle>
        <ContentGrid>
          {content.midRated.map((item) => (
            <ContentHoverCard
              key={item.id}
              content={item}
              onPlay={handlePlay}
            >
              <ContentCard
                style={{
                  backgroundImage: `url(${getImageUrl(item.backdrop_path || item.poster_path)})`
                }}
                onClick={() => handlePlay(item)}
              />
            </ContentHoverCard>
          ))}
        </ContentGrid>
      </RatingSection>

      <RatingSection>
        <SectionTitle>
          Hidden Gems
          <RatingBadge tier="under">4.0-5.9 ⭐</RatingBadge>
        </SectionTitle>
        <ContentGrid>
          {content.underRated.map((item) => (
            <ContentHoverCard
              key={item.id}
              content={item}
              onPlay={handlePlay}
            >
              <ContentCard
                style={{
                  backgroundImage: `url(${getImageUrl(item.backdrop_path || item.poster_path)})`
                }}
                onClick={() => handlePlay(item)}
              />
            </ContentHoverCard>
          ))}
        </ContentGrid>
      </RatingSection>

      {Object.entries(content.genres).map(([genreName, genreContent]) => (
        <GenreSection key={genreName}>
          <GenreTitle>{genreName}</GenreTitle>
          <ContentGrid>
            {genreContent.map((item) => (
              <ContentHoverCard
                key={item.id}
                content={item}
                onPlay={handlePlay}
              >
                <ContentCard
                  style={{
                    backgroundImage: `url(${getImageUrl(item.backdrop_path || item.poster_path)})`
                  }}
                  onClick={() => handlePlay(item)}
                />
              </ContentHoverCard>
            ))}
          </ContentGrid>
        </GenreSection>
      ))}

      <EpisodeSelectModal
        isOpen={episodeModal.isOpen}
        onClose={closeEpisodeModal}
        tvShowId={episodeModal.tvShowId}
        tvShowName={episodeModal.tvShowName}
      />
    </DiscoverContainer>
  );
};

export default DiscoverPage;