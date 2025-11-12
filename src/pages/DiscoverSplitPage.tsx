import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SplitContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  position: relative;
`;

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%);
  z-index: 100;
`;

const Logo = styled.h1`
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: -0.02em;
`;

const SplitSide = styled.div<{ side: 'left' | 'right' }>`
  flex: 1;
  height: 100vh;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.side === 'left' 
    ? 'linear-gradient(45deg, #1a1a1a 0%, #2d1b69 100%)'
    : 'linear-gradient(45deg, #2d1b69 0%, #1a1a1a 100%)'
  };
  
  &:hover {
    flex: 1.1;
  }
  
  &:hover::after {
    opacity: 0.1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.3);
    transition: opacity 0.3s ease;
  }
`;

const SideContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  color: white;
`;

const SideTitle = styled.h2`
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-md);
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
`;

const SideSubtitle = styled.p`
  font-size: var(--font-size-lg);
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
`;

const Divider = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 100vh;
  background: linear-gradient(180deg, transparent 0%, var(--netflix-red) 50%, transparent 100%);
  z-index: 50;
`;

const DiscoverSplitPage: React.FC = () => {
  const navigate = useNavigate();

  const handleMoviesClick = () => {
    navigate('/discover/movies');
  };

  const handleTVClick = () => {
    navigate('/discover/tv');
  };

  return (
    <SplitContainer>
      <Header>
        <Logo>Discover</Logo>
      </Header>
      
      <SplitSide side="left" onClick={handleMoviesClick}>
        <SideContent>
          <SideTitle>Movies</SideTitle>
          <SideSubtitle>Explore cinematic masterpieces</SideSubtitle>
        </SideContent>
      </SplitSide>
      
      <Divider />
      
      <SplitSide side="right" onClick={handleTVClick}>
        <SideContent>
          <SideTitle>TV Shows</SideTitle>
          <SideSubtitle>Discover binge-worthy series</SideSubtitle>
        </SideContent>
      </SplitSide>
    </SplitContainer>
  );
};

export default DiscoverSplitPage;