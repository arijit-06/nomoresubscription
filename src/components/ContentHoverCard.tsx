import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlay, FaPlus, FaThumbsUp } from 'react-icons/fa';
import { Content } from '../types/content.types';

const HoverCard = styled.div`
  position: absolute;
  top: -50%;
  left: -10%;
  width: 120%;
  background: var(--background-secondary);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  z-index: 10;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  pointer-events: none;
`;

const CardImage = styled.div`
  width: 100%;
  height: 140px;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
`;

const CardContent = styled.div`
  padding: var(--spacing-md);
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
`;

const ActionButton = styled.button<{ variant?: 'primary' }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: ${props => props.variant === 'primary' ? 'white' : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'black' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: white;
    transform: scale(1.1);
  }
`;

const CardTitle = styled.h4`
  color: white;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
`;

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
`;

const MatchScore = styled.span`
  color: var(--netflix-green);
  font-weight: var(--font-weight-semibold);
`;

const CardContainer = styled.div`
  position: relative;
  
  &:hover ${HoverCard} {
    opacity: 1;
    transform: scale(1);
    pointer-events: all;
  }
`;

interface ContentHoverCardProps {
  content: Content;
  children: React.ReactNode;
  onPlay: (content: Content) => void;
}

const ContentHoverCard: React.FC<ContentHoverCardProps> = ({ content, children, onPlay }) => {
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

  const getMatchScore = (): number => {
    return Math.floor(Math.random() * 40) + 60; // 60-99% match
  };

  return (
    <CardContainer>
      {children}
      <HoverCard>
        <CardImage
          style={{
            backgroundImage: `url(${getImageUrl(content.backdrop_path || content.poster_path)})`
          }}
        />
        <CardContent>
          <CardActions>
            <ActionButton variant="primary" onClick={() => onPlay(content)}>
              <FaPlay size={12} />
            </ActionButton>
            <ActionButton>
              <FaPlus size={12} />
            </ActionButton>
            <ActionButton>
              <FaThumbsUp size={12} />
            </ActionButton>
          </CardActions>
          <CardTitle>{getContentTitle(content)}</CardTitle>
          <CardMeta>
            <MatchScore>{getMatchScore()}% Match</MatchScore>
            <span>{getContentYear(content)}</span>
            <span>{content.vote_average?.toFixed(1)} ⭐</span>
          </CardMeta>
        </CardContent>
      </HoverCard>
    </CardContainer>
  );
};

export default ContentHoverCard;