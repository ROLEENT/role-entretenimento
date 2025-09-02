import { useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useEventCompletionStatus, useVenueCompletionStatus } from './useCompletionStatus';

export interface StatusValidation {
  canPublish: boolean;
  suggestions: string[];
  warnings: string[];
  recommendedStatus: string;
  completionRequired: number; // minimum % required for this status
}

export const useIntelligentEventStatus = (form: UseFormReturn<any>) => {
  const formData = form.watch();
  const completion = useEventCompletionStatus(formData);

  const validation = useMemo((): StatusValidation => {
    const canPublish = completion.percentage >= 60;
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Critical validation for publishing
    if (!canPublish) {
      warnings.push(`Completude atual: ${completion.percentage}% (mínimo 60% para publicar)`);
      
      if (completion.recommendations.length > 0) {
        suggestions.push(...completion.recommendations.slice(0, 3)); // Top 3 suggestions
      }
    }

    // Additional validations for published status
    if (formData.status === 'published') {
      if (!formData.title?.trim()) {
        warnings.push('Título é obrigatório para publicação');
      }
      if (!formData.starts_at) {
        warnings.push('Data de início é obrigatória para publicação');
      }
      if (!formData.city_id) {
        warnings.push('Cidade é obrigatória para publicação');
      }
    }

    return {
      canPublish,
      suggestions,
      warnings,
      recommendedStatus: canPublish ? 'published' : 'draft',
      completionRequired: 60
    };
  }, [completion, formData]);

  const enforceStatus = useCallback(() => {
    const currentStatus = form.getValues('status');
    if (currentStatus === 'published' && !validation.canPublish) {
      form.setValue('status', 'draft');
      return true; // Status was changed
    }
    return false; // No change needed
  }, [form, validation.canPublish]);

  const suggestStatus = useCallback(() => {
    if (validation.canPublish && form.getValues('status') === 'draft') {
      return 'published';
    }
    return null;
  }, [validation.canPublish, form]);

  return {
    validation,
    completion,
    enforceStatus,
    suggestStatus
  };
};

export const useIntelligentVenueStatus = (form: UseFormReturn<any>) => {
  const formData = form.watch();
  const completion = useVenueCompletionStatus(formData);

  const validation = useMemo((): StatusValidation => {
    const canPublish = completion.percentage >= 60;
    const suggestions: string[] = [];
    const warnings: string[] = [];

    // Critical validation for publishing
    if (!canPublish) {
      warnings.push(`Completude atual: ${completion.percentage}% (mínimo 60% para ativar)`);
      
      if (completion.recommendations.length > 0) {
        suggestions.push(...completion.recommendations.slice(0, 3)); // Top 3 suggestions
      }
    }

    // Additional validations for active status
    if (formData.status === 'active') {
      if (!formData.name?.trim()) {
        warnings.push('Nome é obrigatório para ativação');
      }
      if (!formData.address?.trim()) {
        warnings.push('Endereço é obrigatório para ativação');
      }
    }

    return {
      canPublish,
      suggestions,
      warnings,
      recommendedStatus: canPublish ? 'active' : 'inactive',
      completionRequired: 60
    };
  }, [completion, formData]);

  const enforceStatus = useCallback(() => {
    const currentStatus = form.getValues('status');
    if (currentStatus === 'active' && !validation.canPublish) {
      form.setValue('status', 'inactive');
      return true; // Status was changed
    }
    return false; // No change needed
  }, [form, validation.canPublish]);

  const suggestStatus = useCallback(() => {
    if (validation.canPublish && form.getValues('status') === 'inactive') {
      return 'active';
    }
    return null;
  }, [validation.canPublish, form]);

  return {
    validation,
    completion,
    enforceStatus,
    suggestStatus
  };
};