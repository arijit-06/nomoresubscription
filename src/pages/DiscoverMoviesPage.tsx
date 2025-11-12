import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Content } from '../types/content.types';
import ContentHoverCard from '../components/ContentHoverCard';
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

const DiscoverMoviesPage: React.FC = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    loadMovieContent();
  }, []);

  const loadMovieContent = async () => {
    try {
      setLoading(true);
      
      const [topRated, popular, genres] = await Promise.all([
        tmdbService.getTopRated('movie'),
        tmdbService.getPopular('movie'),
        tmdbService.getGenres('movie')
      ]);

      const topRatedContent = topRated.results.filter(item => item.vote_average >= 8.0).slice(0, 12);
      const midRatedContent = popular.results.filter(item => item.vote_average >= 6.0 && item.vote_average < 8.0).slice(0, 12);
      const underRatedContent = popular.results.filter(item => item.vote_average >= 4.0 && item.vote_average < 6.0).slice(0, 12);

      const randomGenres = genres.genres.sort(() => 0.5 - Math.random()).slice(0, 3);
      const genreContent: { [key: string]: Content[] } = {};
      
      for (const genre of randomGenres) {
        const genreMovies = await tmdbService.getByGenre('movie', genre.id);
        genreContent[genre.name] = genreMovies.results.slice(0, 8);
      }

      setContent({
        topRated: topRatedContent,
        midRated: midRatedContent,
        underRated: underRatedContent,
        genres: genreContent
      });
    } catch (error) {
      console.error('Error loading movie content:', error);
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
      <DiscoverContainer>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Loading movies...
        </div>
      </DiscoverContainer>
    );
  }

  return (
    <DiscoverContainer>
      <Header>
        <Title>Discover Movies</Title>
      </Header>

      <RatingSection>
        <SectionTitle>
          Top Rated Movies
          <RatingBadge tier="top">8.0+ ⭐</RatingBadge>
        </SectionTitle>
        <ContentGrid>
          {content.topRated.map((movie) => (
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
      </RatingSection>

      <RatingSection>
        <SectionTitle>
          Popular Movies
          <RatingBadge tier="mid">6.0-7.9 ⭐</RatingBadge>
        </SectionTitle>
        <ContentGrid>
          {content.midRated.map((movie) => (
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
      </RatingSection>

      <RatingSection>
        <SectionTitle>
          Hidden Gems
          <RatingBadge tier="under">4.0-5.9 ⭐</RatingBadge>
        </SectionTitle>
        <ContentGrid>
          {content.underRated.map((movie) => (
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
      </RatingSection>

      {Object.entries(content.genres).map(([genreName, genreContent]) => (
        <GenreSection key={genreName}>
          <GenreTitle>{genreName} Movies</GenreTitle>
          <ContentGrid>
            {genreContent.map((movie) => (
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
      ))}
    </DiscoverContainer>
  );
};

export default DiscoverMoviesPage;