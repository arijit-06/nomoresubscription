import React from 'react';
import styled from 'styled-components';
import { useWatchlist } from '../hooks/useWatchlist';
import LoadingSpinner from '../components/Layout/LoadingSpinner';

const MyListContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  padding: var(--spacing-4xl) var(--spacing-xl);
`;

const Header = styled.div`
  margin-bottom: var(--spacing-3xl);
  
  h1 {
    color: var(--text-primary);
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    color: var(--text-secondary);
    font-size: var(--font-size-lg);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: var(--text-secondary);
  
  h2 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-md);
  }
  
  p {
    font-size: var(--font-size-base);
  }
`;

const MyListPage: React.FC = () => {
  const { watchlist, loading, error } = useWatchlist();

  if (loading) {
    return <LoadingSpinner text="Loading your list..." />;
  }

  return (
    <MyListContainer>
      <Header>
        <h1>My List</h1>
        <p>Movies and TV shows you've added to your list</p>
      </Header>

      {error && (
        <div style={{ color: 'var(--netflix-red)', marginBottom: 'var(--spacing-lg)' }}>
          Error: {error}
        </div>
      )}

      {watchlist.length === 0 ? (
        <EmptyState>
          <h2>Your list is empty</h2>
          <p>Add movies and TV shows to your list to see them here</p>
        </EmptyState>
      ) : (
        <div>
          <p style={{ color: 'var(--text-primary)' }}>
            You have {watchlist.length} item{watchlist.length !== 1 ? 's' : ''} in your list
          </p>
          {/* Content grid will be implemented here */}
        </div>
      )}
    </MyListContainer>
  );
};

export default MyListPage;