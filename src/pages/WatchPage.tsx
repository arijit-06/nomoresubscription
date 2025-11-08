import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { generateEmbedUrl, generateTVEmbedUrl } from '../services/vidking';

const WatchContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  display: flex;
  flex-direction: column;
`;

const VideoPlayer = styled.iframe`
  width: 100%;
  height: 100vh;
  border: none;
`;

const WatchPage: React.FC = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();

  if (!type || !id) {
    return <div>Invalid video parameters</div>;
  }

  const videoUrl = season && episode 
    ? generateTVEmbedUrl(parseInt(id), parseInt(season), parseInt(episode))
    : generateEmbedUrl(parseInt(id), type as 'movie' | 'tv');

  return (
    <WatchContainer>
      <VideoPlayer 
        src={videoUrl}
        allowFullScreen
        title={`Playing ${type} ${id}`}
      />
    </WatchContainer>
  );
};

export default WatchPage;