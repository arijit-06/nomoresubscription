import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { Profile, CreateProfileData } from '../types/user.types';
import { AVATAR_OPTIONS, AGE_RATINGS } from '../utils/constants';
import LoadingSpinner from '../components/Layout/LoadingSpinner';

const ProfilesContainer = styled.div`
  min-height: 100vh;
  background: var(--background-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-4xl);
`;

const Logo = styled.h1`
  color: var(--netflix-red);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
  letter-spacing: -0.02em;
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-md);
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
`;

const ProfilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-xl);
  max-width: 800px;
  width: 100%;
  margin-bottom: var(--spacing-3xl);
`;

const ProfileCard = styled.div<{ isAddNew?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  position: relative;
  
  &:hover {
    transform: scale(1.05);
  }

  ${props => props.isAddNew && `
    border: 2px dashed var(--border-color);
    
    &:hover {
      border-color: var(--netflix-red);
    }
  `}
`;

const Avatar = styled.div<{ src?: string; isAddNew?: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.isAddNew ? `
    background: var(--background-tertiary);
    color: var(--text-muted);
    font-size: var(--font-size-4xl);
  ` : `
    background-image: url(${props.src});
    background-size: cover;
    background-position: center;
    background-color: var(--background-tertiary);
  `}
`;

const ProfileName = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  text-align: center;
  margin-bottom: var(--spacing-sm);
`;

const ProfileActions = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  opacity: 0;
  transition: opacity var(--transition-fast);
  
  ${ProfileCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: var(--background-tertiary);
  color: var(--text-primary);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--netflix-red);
  }
`;

const Modal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-lg);
`;

const ModalContent = styled.div`
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
`;

const ModalTitle = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: var(--font-size-xl);
  cursor: pointer;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const Label = styled.label`
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
`;

const Input = styled.input`
  padding: var(--spacing-md);
  background: var(--background-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  
  &:focus {
    border-color: var(--netflix-red);
    outline: none;
  }
`;

const Select = styled.select`
  padding: var(--spacing-md);
  background: var(--background-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  
  &:focus {
    border-color: var(--netflix-red);
    outline: none;
  }
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-sm);
  max-height: 200px;
  overflow-y: auto;
`;

const AvatarOption = styled.div<{ selected?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: var(--radius-md);
  background-image: url(${props => `/avatars/${props.children}`});
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border: 2px solid ${props => props.selected ? 'var(--netflix-red)' : 'transparent'};
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--netflix-red);
    transform: scale(1.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover:not(:disabled) { background: #c82333; }
        `;
      case 'secondary':
        return `
          background: var(--background-tertiary);
          color: var(--text-primary);
          &:hover:not(:disabled) { background: var(--netflix-medium-gray); }
        `;
      default:
        return `
          background: var(--netflix-red);
          color: white;
          &:hover:not(:disabled) { background: #c11119; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProfilesPage: React.FC = () => {
  const { profiles, loading, selectProfile, createProfile, updateProfile, deleteProfile } = useProfile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<CreateProfileData>({
    name: '',
    avatar: AVATAR_OPTIONS[0],
    ageRating: 'adult'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Loading profiles..." />;
  }

  const handleProfileClick = (profile: Profile) => {
    selectProfile(profile);
    navigate('/');
  };

  const handleAddProfile = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      avatar: AVATAR_OPTIONS[0],
      ageRating: 'adult'
    });
    setIsModalOpen(true);
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      avatar: profile.avatar,
      ageRating: profile.ageRating
    });
    setIsModalOpen(true);
  };

  const handleDeleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the last profile');
      return;
    }
    
    if (confirm('Are you sure you want to delete this profile?')) {
      try {
        await deleteProfile(profileId);
      } catch (error) {
        alert('Failed to delete profile');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Profile name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingProfile) {
        await updateProfile({
          id: editingProfile.id,
          ...formData
        });
      } else {
        await createProfile(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(editingProfile ? 'Failed to update profile' : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <ProfilesContainer>
      <Header>
        <Logo>NETFLIX</Logo>
        <Title>Who's watching?</Title>
        <Subtitle>Select a profile to continue</Subtitle>
      </Header>

      <ProfilesGrid>
        {profiles.map((profile) => (
          <ProfileCard key={profile.id}>
            <Avatar src={`/avatars/${profile.avatar}`} />
            <ProfileName>{profile.name}</ProfileName>
            <ProfileActions>
              <ActionButton onClick={() => handleEditProfile(profile)}>
                <FaEdit />
              </ActionButton>
              <ActionButton onClick={() => handleDeleteProfile(profile.id)}>
                <FaTrash />
              </ActionButton>
            </ProfileActions>
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                cursor: 'pointer' 
              }}
              onClick={() => handleProfileClick(profile)}
            />
          </ProfileCard>
        ))}
        
        {profiles.length < 5 && (
          <ProfileCard isAddNew onClick={handleAddProfile}>
            <Avatar isAddNew>
              <FaPlus />
            </Avatar>
            <ProfileName>Add Profile</ProfileName>
          </ProfileCard>
        )}
      </ProfilesGrid>

      <Button variant="secondary" onClick={handleLogout}>
        Sign Out
      </Button>

      <Modal isOpen={isModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingProfile ? 'Edit Profile' : 'Add Profile'}
            </ModalTitle>
            <CloseButton onClick={() => setIsModalOpen(false)}>
              ×
            </CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Profile Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter profile name"
                maxLength={20}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Avatar</Label>
              <AvatarGrid>
                {AVATAR_OPTIONS.map((avatar) => (
                  <AvatarOption
                    key={avatar}
                    selected={formData.avatar === avatar}
                    onClick={() => setFormData({ ...formData, avatar })}
                  >
                    {avatar}
                  </AvatarOption>
                ))}
              </AvatarGrid>
            </FormGroup>

            <FormGroup>
              <Label>Age Rating</Label>
              <Select
                value={formData.ageRating}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ageRating: e.target.value as 'kids' | 'teen' | 'adult' 
                })}
              >
                {Object.entries(AGE_RATINGS).map(([key, rating]) => (
                  <option key={key} value={key}>
                    {rating.label} - {rating.description}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <ButtonGroup>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (editingProfile ? 'Updating...' : 'Creating...') 
                  : (editingProfile ? 'Update Profile' : 'Create Profile')
                }
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </ProfilesContainer>
  );
};

export default ProfilesPage;