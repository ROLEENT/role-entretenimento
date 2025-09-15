import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, Star } from 'lucide-react';
import { V5FeedbackModal } from './V5FeedbackModal';

interface V5FeedbackButtonProps {
  version: 'v4' | 'v5';
  entityType?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function V5FeedbackButton({ 
  version, 
  entityType, 
  variant = 'ghost',
  size = 'sm',
  className 
}: V5FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={() => setIsModalOpen(true)}
              className={className}
            >
              <Star className="h-4 w-4" />
              {size !== 'sm' && <span className="ml-2">Feedback</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Como foi sua experiência com a interface {version.toUpperCase()}?</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <V5FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        version={version}
        entityType={entityType}
      />
    </>
  );
}