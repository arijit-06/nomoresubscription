import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';
import { setupProgressTracking, saveProgress } from '../services/vidking';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  background: black;
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 1001;
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
  border-radius: var(--radius-lg);
`;

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  contentId?: string;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoUrl, 
  contentId,
  mediaType = 'movie',
  season,
  episode
}) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isOpen && contentId) {
      cleanupRef.current = setupProgressTracking((event) => {
        const { data } = event;
        
        if (data.event === 'timeupdate' || data.event === 'pause' || data.event === 'ended') {
          if (data.currentTime > 0) {
            saveProgress(contentId, mediaType, data.currentTime, season, episode);
          }
        }
        
        console.log('Player Event:', data);
      });
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [isOpen, contentId, mediaType, season, episode]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
    }
    onClose();
  };

  return (
    <ModalOverlay onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>
          <FaTimes size={18} />
        </CloseButton>
        
        <VideoFrame
          src={videoUrl}
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen"
          title="Video Player"
        />
      </ModalContent>
    </ModalOverlay>
  );
};

export default VideoModal;