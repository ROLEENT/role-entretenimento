import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { Profile } from '@/hooks/useProfiles';

export default function CreateProfilePage() {
  const navigate = useNavigate();

  const handleSuccess = (profile: Profile) => {
    navigate(`/perfil/${profile.handle}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto py-8">
      <ProfileForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}