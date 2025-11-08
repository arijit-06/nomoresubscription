import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/helpers';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0.7)
  ), url('https://assets.nflxext.com/ffe/siteui/vlv3/9f46b569-aff7-4975-9b8e-3212e4637f16/453ba2a1-6138-4e3c-9a06-b66f9a2832e4/US-en-20240415-popsignuptwoweeks-perspective_alpha_website_large.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
`;

const LoginCard = styled.div`
  background: rgba(0, 0, 0, 0.85);
  padding: var(--spacing-4xl) var(--spacing-3xl);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(10px);
`;

const Logo = styled.h1`
  color: var(--netflix-red);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  letter-spacing: -0.02em;
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xl);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: var(--spacing-md);
  background: var(--background-tertiary);
  border: 1px solid ${props => props.hasError ? 'var(--netflix-red)' : 'var(--border-color)'};
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);

  &:focus {
    border-color: var(--netflix-red);
    box-shadow: 0 0 0 2px rgba(229, 9, 20, 0.2);
  }

  &::placeholder {
    color: var(--text-muted);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  
  &:hover {
    color: var(--text-secondary);
  }
`;

const ErrorMessage = styled.p`
  color: var(--netflix-red);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);

  ${props => props.variant === 'secondary' ? `
    background: transparent;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover:not(:disabled) {
      background: var(--background-tertiary);
    }
  ` : `
    background: var(--netflix-red);
    color: var(--netflix-white);
    
    &:hover:not(:disabled) {
      background: #c11119;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: var(--spacing-lg) 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }
  
  span {
    padding: 0 var(--spacing-md);
    color: var(--text-muted);
    font-size: var(--font-size-sm);
  }
`;

const SignupLink = styled.p`
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-lg);
  
  a {
    color: var(--netflix-red);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      if (error.message !== 'Login cancelled.') {
        setErrors({ general: error.message || 'Google login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>NETFLIX</Logo>
        <Title>Sign In</Title>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={!!errors.email}
              disabled={isLoading}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hasError={!!errors.password}
              disabled={isLoading}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <FaGoogle />
          Continue with Google
        </Button>

        <SignupLink>
          New to Netflix? <Link to="/signup">Sign up now</Link>
        </SignupLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;