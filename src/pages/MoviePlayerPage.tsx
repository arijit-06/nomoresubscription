import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft } from 'react-icons/fa';
import { generateEmbedUrl, setupProgressTracking, saveProgress, getProgress } from '../services/vidking';
import * as tmdbService from '../services/tmdb';

const PlayerContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: black;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 1);
    transform: scale(1.1);
  }
`;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  font-size: 18px;
`;

const MoviePlayerPage: React.FC = () => {
  const { movieName, tmdbId } = useParams<{ movieName: string; tmdbId: string }>();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tmdbId) return;

    const setupPlayer = async () => {
      try {
        const savedProgress = getProgress(tmdbId, 'movie');
        const url = generateEmbedUrl(parseInt(tmdbId), 'movie', { progress: savedProgress });
        setVideoUrl(url);

        // Setup progress tracking
        const cleanup = setupProgressTracking((event) => {
          const { data } = event;
          if (data.event === 'timeupdate' || data.event === 'pause' || data.event === 'ended') {
            if (data.currentTime > 0) {
              saveProgress(tmdbId, 'movie', data.currentTime);
            }
          }
        });

        return cleanup;
      } catch (error) {
        console.error('Error setting up player:', error);
      } finally {
        setLoading(false);
      }
    };

    const cleanup = setupPlayer();
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(fn => fn && fn());
      }
    };
  }, [tmdbId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <LoadingContainer>
        Loading player...
      </LoadingContainer>
    );
  }

  return (
    <PlayerContainer>
      <BackButton onClick={handleBack}>
        <FaArrowLeft size={20} />
      </BackButton>
      
      <VideoFrame
        src={videoUrl}
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen"
        title={`Playing: ${movieName?.replace(/_/g, ' ')}`}
      />
    </PlayerContainer>
  );
};

export default MoviePlayerPage;