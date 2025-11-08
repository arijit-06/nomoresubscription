import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, isValidPassword } from '../utils/helpers';

const SignupContainer = styled.div`
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

const SignupCard = styled.div`
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

const PasswordStrength = styled.div<{ strength: number }>`
  margin-top: var(--spacing-xs);
  
  .strength-bar {
    height: 4px;
    background: var(--background-tertiary);
    border-radius: var(--radius-sm);
    overflow: hidden;
    
    .strength-fill {
      height: 100%;
      transition: all var(--transition-fast);
      width: ${props => (props.strength / 4) * 100}%;
      background: ${props => {
        if (props.strength <= 1) return '#ff4444';
        if (props.strength <= 2) return '#ffaa00';
        if (props.strength <= 3) return '#88cc00';
        return '#00cc44';
      }};
    }
  }
  
  .strength-text {
    font-size: var(--font-size-xs);
    color: var(--text-muted);
    margin-top: var(--spacing-xs);
  }
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

const LoginLink = styled.p`
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

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    password?: string; 
    confirmPassword?: string; 
    general?: string 
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await signup(email, password);
      navigate('/');
    } catch (error: any) {
      setErrors({ general: error.message || 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      if (error.message !== 'Login cancelled.') {
        setErrors({ general: error.message || 'Google signup failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <SignupContainer>
      <SignupCard>
        <Logo>NETFLIX</Logo>
        <Title>Sign Up</Title>
        
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
            {password && (
              <PasswordStrength strength={passwordStrength}>
                <div className="strength-bar">
                  <div className="strength-fill" />
                </div>
                <div className="strength-text">
                  Password strength: {getPasswordStrengthText(passwordStrength)}
                </div>
              </PasswordStrength>
            )}
          </InputGroup>

          <InputGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              hasError={!!errors.confirmPassword}
              disabled={isLoading}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </PasswordToggle>
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </InputGroup>

          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <FaGoogle />
          Continue with Google
        </Button>

        <LoginLink>
          Already have an account? <Link to="/login">Sign in now</Link>
        </LoginLink>
      </SignupCard>
    </SignupContainer>
  );
};

export default Signup;