import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Content } from '../types/content.types';
import LoadingSpinner from '../components/Layout/LoadingSpinner';
import ContentHoverCard from '../components/ContentHoverCard';
import EpisodeSelectModal from '../components/EpisodeSelectModal';
import * as tmdbService from '../services/tmdb';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
`;

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--navbar-height);
  background: linear-gradient(180deg, rgba(0,0,0,0.7) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-2xl);
  z-index: var(--z-fixed);
  transition: background-color var(--transition-normal);
`;

const Logo = styled.h1`
  color: var(--netflix-red);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
`;

const NavMenu = styled.ul`
  display: flex;
  gap: var(--spacing-lg);
  list-style: none;
`;

const NavItem = styled.li`
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-fast);
  
  &:hover {
    color: var(--text-secondary);
  }
`;

const HeroSection = styled.section`
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    77deg,
    rgba(0, 0, 0, 0.6) 0%,
    transparent 85%
  );
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  max-width: 500px;
  padding: 0 var(--spacing-2xl);
  margin-top: var(--navbar-height);
`;

const HeroTitle = styled.h1`
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-tight);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-3xl);
  }
`;

const HeroDescription = styled.p`
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-xl);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const HeroButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  ${props => props.variant === 'secondary' ? `
    background: rgba(109, 109, 110, 0.7);
    color: var(--text-primary);
    
    &:hover {
      background: rgba(109, 109, 110, 0.4);
    }
  ` : `
    background: var(--netflix-white);
    color: var(--netflix-black);
    
    &:hover {
      background: rgba(255, 255, 255, 0.75);
    }
  `}
`;

const ContentSection = styled.section`
  padding: var(--spacing-2xl);
  margin-top: -100px;
  position: relative;
  z-index: 3;
`;

const ContentRow = styled.div`
  margin-bottom: var(--spacing-3xl);
`;

const RowTitle = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
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

const ErrorMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--text-secondary);
  text-align: center;
  
  h2 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-lg);
  }
`;

const RetryButton = styled.button`
  background: var(--netflix-red);
  color: var(--netflix-white);
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background: #c11119;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [contentRows, setContentRows] = useState<any[]>([]);
  const [heroContent, setHeroContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [episodeModal, setEpisodeModal] = useState({ 
    isOpen: false, 
    tvShowId: 0, 
    tvShowName: '' 
  });


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

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const trending = await tmdbService.getTrending('day');
      const popularMovies = await tmdbService.getPopular('movie');
      const popularTV = await tmdbService.getPopular('tv');
      
      const rows = [
        { title: 'Trending Now', content: trending.results },
        { title: 'Popular Movies', content: popularMovies.results },
        { title: 'Popular TV Shows', content: popularTV.results },
      ];
      
      setContentRows(rows);
      
      if (trending.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * trending.results.length);
        setHeroContent(trending.results[randomIndex]);
      }
    } catch (err: any) {
      console.error('Failed to load content:', err);
      setError(`Failed to load content: ${err.response?.data?.status_message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading NoMoreSubscription..." />;
  }

  if (error) {
    return (
      <HomeContainer>
        <ErrorMessage>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <p>Check your internet connection and try again</p>
          <RetryButton onClick={loadContent}>Retry</RetryButton>
        </ErrorMessage>
      </HomeContainer>
    );
  }

  if (contentRows.length === 0) {
    return (
      <HomeContainer>
        <ErrorMessage>
          <h2>No Content Available</h2>
          <p>Unable to load content at this time</p>
          <RetryButton onClick={loadContent}>Try Again</RetryButton>
        </ErrorMessage>
      </HomeContainer>
    );
  }

  const getImageUrl = (path: string | null, size: string = 'w1280'): string => {
    if (!path) return '';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const getContentTitle = (content: Content): string => {
    return content.title || content.name || 'Unknown Title';
  };

  return (
    <HomeContainer>
      <Navbar>
        <Logo>
          <img src="/nomoresubscription.png" alt="NoMoreSubscription" style={{ height: '32px' }} />
        </Logo>
        <NavMenu>
          <NavItem onClick={() => navigate('/')}>Home</NavItem>
          <NavItem onClick={() => navigate('/browse/tv')}>TV Shows</NavItem>
          <NavItem onClick={() => navigate('/browse/movies')}>Movies</NavItem>
          <NavItem onClick={() => navigate('/browse/new')}>New & Popular</NavItem>
          <NavItem onClick={() => navigate('/discover')}>Discover</NavItem>
          <NavItem onClick={() => navigate('/my-list')}>My List</NavItem>
          <NavItem onClick={() => navigate('/search')}>Search</NavItem>
        </NavMenu>
      </Navbar>

      {heroContent && (
        <HeroSection
          style={{
            backgroundImage: `url(${getImageUrl(heroContent.backdrop_path, 'original')})`
          }}
        >
          <HeroOverlay />
          <HeroContent>
            <HeroTitle>{getContentTitle(heroContent)}</HeroTitle>
            <HeroDescription>{heroContent.overview}</HeroDescription>
            <HeroButtons>
              <HeroButton onClick={() => handlePlay(heroContent)}>
                ▶ Play
              </HeroButton>
              <HeroButton variant="secondary" onClick={() => handlePlay(heroContent)}>
                ℹ More Info
              </HeroButton>
            </HeroButtons>
          </HeroContent>
        </HeroSection>
      )}

      <ContentSection>
        {contentRows.map((row, index) => (
          <ContentRow key={index}>
            <RowTitle>{row.title}</RowTitle>
            <ContentGrid>
              {row.content.slice(0, 12).map((content: Content) => (
                <ContentHoverCard
                  key={content.id}
                  content={content}
                  onPlay={handlePlay}
                >
                  <ContentCard
                    style={{
                      backgroundImage: `url(${getImageUrl(content.backdrop_path || content.poster_path)})`
                    }}
                    title={getContentTitle(content)}
                    onClick={() => handlePlay(content)}
                  />
                </ContentHoverCard>
              ))}
            </ContentGrid>
          </ContentRow>
        ))}
      </ContentSection>
      
      <EpisodeSelectModal
        isOpen={episodeModal.isOpen}
        onClose={closeEpisodeModal}
        tvShowId={episodeModal.tvShowId}
        tvShowName={episodeModal.tvShowName}
      />
    </HomeContainer>
  );
};

export default HomePage;