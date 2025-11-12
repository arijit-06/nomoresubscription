import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaTimes, FaPlay } from 'react-icons/fa';
import * as tmdbService from '../services/tmdb';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  width: 50vw;
  min-width: 500px;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: var(--font-size-lg);
  
  &:hover {
    color: var(--netflix-red);
  }
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  text-align: center;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const SelectionContainer = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  align-items: flex-end;
`;

const SelectBox = styled.select`
  flex: 1;
  padding: var(--spacing-md);
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-md);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  option {
    padding: var(--spacing-sm);
    background: var(--background-primary);
    color: var(--text-primary);
  }
`;

const PlayButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
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

const LoadingText = styled.div`
  color: var(--text-secondary);
  text-align: center;
  padding: var(--spacing-lg);
`;

interface EpisodeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tvShowId: number;
  tvShowName: string;
}

const EpisodeSelectModal: React.FC<EpisodeSelectModalProps> = ({
  isOpen,
  onClose,
  tvShowId,
  tvShowName
}) => {
  const navigate = useNavigate();
  const [tvDetails, setTvDetails] = useState<any>(null);
  const [seasonData, setSeasonData] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && tvShowId) {
      fetchTVDetails();
    }
  }, [isOpen, tvShowId]);

  useEffect(() => {
    if (tvDetails && selectedSeason) {
      fetchSeasonData();
    }
  }, [selectedSeason, tvDetails]);

  const fetchTVDetails = async () => {
    try {
      setLoading(true);
      const details = await tmdbService.getDetails(tvShowId, 'tv');
      setTvDetails(details);
      
      if (details.seasons && details.seasons.length > 0) {
        const firstSeason = details.seasons.find(s => s.season_number === 1) || details.seasons[0];
        setSelectedSeason(firstSeason.season_number);
      }
    } catch (error) {
      console.error('Failed to fetch TV details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonData = async () => {
    try {
      const seasonDetails = await tmdbService.getSeasonDetails(tvShowId, selectedSeason);
      setSeasonData(seasonDetails);
      setSelectedEpisode(1);
    } catch (error) {
      console.error('Failed to fetch season details:', error);
    }
  };

  const handlePlay = () => {
    const seriesName = tvShowName.replace(/[^a-zA-Z0-9]/g, '_');
    navigate(`/${seriesName}/${tvShowId}/${selectedSeason}/${selectedEpisode}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        
        <Title>{tvShowName}</Title>
        
        {loading ? (
          <LoadingText>Loading episodes...</LoadingText>
        ) : (
          <>
            <SelectionContainer>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                  Season
                </label>
                <SelectBox
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                >
                  {tvDetails?.seasons?.filter(s => s.season_number > 0).map((season: any) => (
                    <option key={season.season_number} value={season.season_number}>
                      Season {season.season_number}
                    </option>
                  ))}
                </SelectBox>
              </div>

              <div style={{ flex: 2, minWidth: '300px' }}>
                <label style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)' }}>
                  Episode
                </label>
                <SelectBox
                  value={selectedEpisode}
                  onChange={(e) => setSelectedEpisode(parseInt(e.target.value))}
                >
                  {seasonData?.episodes?.map((episode: any) => {
                    const episodeName = episode.name || 'Untitled';
                    const truncatedName = episodeName.length > 30 ? episodeName.substring(0, 30) + '...' : episodeName;
                    return (
                      <option key={episode.episode_number} value={episode.episode_number}>
                        Ep {episode.episode_number}: {truncatedName}
                      </option>
                    );
                  })}
                </SelectBox>
              </div>
            </SelectionContainer>

            <PlayButton onClick={handlePlay} disabled={!seasonData}>
              <FaPlay />
              Play Episode
            </PlayButton>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default EpisodeSelectModal;