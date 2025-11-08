import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-primary);
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid var(--background-tertiary);
  border-top: 4px solid var(--netflix-red);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
`;

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = 'Loading...', 
  size = 'medium' 
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small': return '30px';
      case 'large': return '70px';
      default: return '50px';
    }
  };

  return (
    <SpinnerContainer>
      <div className="flex flex-col items-center">
        <Spinner style={{ width: getSpinnerSize(), height: getSpinnerSize() }} />
        {text && <LoadingText>{text}</LoadingText>}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;