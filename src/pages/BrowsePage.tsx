import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const BrowseContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding: var(--spacing-4xl) var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderContent = styled.div`
  text-align: center;
  color: var(--text-primary);
  
  h1 {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-lg);
  }
  
  p {
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
  }
`;

const BrowsePage: React.FC = () => {
  const { category } = useParams<{ category: string }>();

  return (
    <BrowseContainer>
      <PlaceholderContent>
        <h1>Browse {category}</h1>
        <p>This page will show content filtered by category: {category}</p>
      </PlaceholderContent>
    </BrowseContainer>
  );
};

export default BrowsePage;