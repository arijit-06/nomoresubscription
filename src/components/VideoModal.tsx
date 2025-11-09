import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

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
  position: relative;
  width: 90vw;
  height: 80vh;
  max-width: 1200px;
  background: var(--background-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 1001;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const VideoFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        <VideoFrame
          src={videoUrl}
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </ModalContent>
    </ModalOverlay>
  );
};

export default VideoModal;