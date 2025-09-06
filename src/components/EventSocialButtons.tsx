import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, Calendar, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocialActions } from '@/hooks/useSocialActions';
import { useUserAuth } from '@/hooks/useUserAuth';

interface EventSocialButtonsProps {
  eventId: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const EventSocialButtons: React.FC<EventSocialButtonsProps> = ({
  eventId,
  className,
  variant = 'default'
}) => {
  const { user } = useUserAuth();
  const {
    toggleSave,
    getSaveState,
    setAttendance,
    getAttendanceState
  } = useSocialActions();

  const saveState = getSaveState(eventId);
  const attendanceState = getAttendanceState(eventId);

  if (!user) {
    return null;
  }

  const handleSave = () => {
    toggleSave(eventId);
  };

  const handleAttendance = (status: 'going' | 'maybe' | 'went') => {
    setAttendance(eventId, status);
  };

  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      "flex gap-2",
      isCompact ? "flex-col" : "flex-row flex-wrap",
      className
    )}>
      {/* Save Button */}
      <Button
        variant={saveState.saved ? "default" : "outline"}
        size={isCompact ? "sm" : "default"}
        onClick={handleSave}
        disabled={saveState.loading}
        className={cn(
          isCompact && "w-full justify-start",
          saveState.saved && "bg-primary"
        )}
      >
        <Bookmark className={cn(
          "h-4 w-4",
          !isCompact && "mr-2",
          isCompact && "mr-2",
          saveState.saved && "fill-current"
        )} />
        {!isCompact && (saveState.saved ? "Salvo" : "Salvar")}
        {isCompact && "Salvar"}
      </Button>

      {/* Attendance Buttons */}
      <div className={cn(
        "flex gap-2",
        isCompact && "flex-col"
      )}>
        <Button
          variant={attendanceState.status === 'going' ? "default" : "outline"}
          size={isCompact ? "sm" : "default"}
          onClick={() => handleAttendance('going')}
          disabled={attendanceState.loading}
          className={cn(
            isCompact && "w-full justify-start",
            attendanceState.status === 'going' && "bg-green-600 hover:bg-green-700"
          )}
        >
          <Check className={cn(
            "h-4 w-4",
            !isCompact && "mr-2",
            isCompact && "mr-2"
          )} />
          {!isCompact && "Vou"}
          {isCompact && "Vou"}
        </Button>

        <Button
          variant={attendanceState.status === 'maybe' ? "default" : "outline"}
          size={isCompact ? "sm" : "default"}
          onClick={() => handleAttendance('maybe')}
          disabled={attendanceState.loading}
          className={cn(
            isCompact && "w-full justify-start",
            attendanceState.status === 'maybe' && "bg-yellow-600 hover:bg-yellow-700"
          )}
        >
          <Clock className={cn(
            "h-4 w-4",
            !isCompact && "mr-2",
            isCompact && "mr-2"
          )} />
          {!isCompact && "Talvez"}
          {isCompact && "Talvez"}
        </Button>

        <Button
          variant={attendanceState.status === 'went' ? "default" : "outline"}
          size={isCompact ? "sm" : "default"}
          onClick={() => handleAttendance('went')}
          disabled={attendanceState.loading}
          className={cn(
            isCompact && "w-full justify-start",
            attendanceState.status === 'went' && "bg-blue-600 hover:bg-blue-700"
          )}
        >
          <Calendar className={cn(
            "h-4 w-4",
            !isCompact && "mr-2",
            isCompact && "mr-2"
          )} />
          {!isCompact && "Fui"}
          {isCompact && "Fui"}
        </Button>
      </div>
    </div>
  );
};