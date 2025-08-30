import React from 'react';
import { useFocusManagement } from '@/hooks/useFocusManagement';

export const FocusManagementProvider: React.FC = () => {
  useFocusManagement();
  return null;
};