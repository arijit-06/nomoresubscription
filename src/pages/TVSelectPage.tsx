import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlay } from 'react-icons/fa';
import * as tmdbService from '../services/tmdb';

const Container = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding: var(--spacing-xl);
`;

const Header = styled.div`
  margin-bottom: var(--spacing-xl);
  
  h1 {
    color: var(--text-primary);
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-md);
  }
`;

const SelectionContainer = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
`;

const SelectBox = styled.select`
  padding: var(--spacing-md);
  background: var(--background-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  min-width: 150px;
`;

const PlayButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--netflix-red);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background var(--transition-normal);
  
  &:hover {
    background: var(--netflix-red-dark);
  }
  
  &:disabled {
    background: var(--text-muted);
    cursor: not-allowed;
  }
`;

const TVSelectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTVDetails = async () => {
      if (!id) return;
      
      try {
        const details = await tmdbService.getDetails(parseInt(id), 'tv');
        setTvDetails(details);
        
        // Fetch first season data
        if (details.seasons && details.seasons.length > 0) {
          const firstSeason = details.seasons.find(s => s.season_number === 1) || details.seasons[0];
          const seasonDetails = await tmdbService.getSeasonDetails(parseInt(id), firstSeason.season_number);
          setSeasonData(seasonDetails);
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (error) {
        console.error('Failed to fetch TV details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTVDetails();
  }, [id]);

  useEffect(() => {
    const fetchSeasonData = async () => {
      if (!id || !selectedSeason) return;
      
      try {
        const seasonDetails = await tmdbService.getSeasonDetails(parseInt(id), selectedSeason);
        setSeasonData(seasonDetails);
        setSelectedEpisode(1);
      } catch (error) {
        console.error('Failed to fetch season details:', error);
      }
    };

    if (tvDetails) {
      fetchSeasonData();
    }
  }, [selectedSeason, id, tvDetails]);

  const handlePlay = () => {
    if (!id || !tvDetails) return;
    
    const seriesName = tvDetails.name.replace(/[^a-zA-Z0-9]/g, '_');
    navigate(`/${seriesName}/${id}/${selectedSeason}/${selectedEpisode}`);
  };

  if (loading) {
    return (
      <Container>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          Loading...
        </div>
      </Container>
    );
  }

  if (!tvDetails) {
    return (
      <Container>
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          TV show not found
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <h1>{tvDetails.name}</h1>
      </Header>

      <SelectionContainer>
        <div>
          <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            Season
          </label>
          <SelectBox
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
          >
            {tvDetails.seasons?.filter(s => s.season_number > 0).map((season: any) => (
              <option key={season.season_number} value={season.season_number}>
                Season {season.season_number}
              </option>
            ))}
          </SelectBox>
        </div>

        <div>
          <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-xs)' }}>
            Episode
          </label>
          <SelectBox
            value={selectedEpisode}
            onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
          >
            {seasonData?.episodes?.map((episode: any) => (
              <option key={episode.episode_number} value={episode.episode_number}>
                Episode {episode.episode_number}: {episode.name}
              </option>
            ))}
          </SelectBox>
        </div>

        <div style={{ alignSelf: 'flex-end' }}>
          <PlayButton onClick={handlePlay}>
            <FaPlay />
            Play
          </PlayButton>
        </div>
      </SelectionContainer>
    </Container>
  );
};

export default TVSelectPage;