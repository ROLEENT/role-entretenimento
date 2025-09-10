import { useState } from 'react';
import { Heart, Users, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocialActions, AttendanceStatus } from '@/hooks/useSocialActions';
import { cn } from '@/lib/utils';

interface EventSocialActionsProps {
  eventId: string;
  className?: string;
  compact?: boolean;
}

export function EventSocialActions({ eventId, className, compact = false }: EventSocialActionsProps) {
  const { toggleSave, setAttendance, isLoading } = useSocialActions();
  const [saved, setSaved] = useState(false);
  const [attendance, setAttendanceState] = useState<AttendanceStatus | null>(null);

  const handleSave = async () => {
    const result = await toggleSave(eventId);
    if (result !== false) {
      setSaved(result);
    }
  };

  const handleAttendance = async (status: AttendanceStatus) => {
    const result = await setAttendance(eventId, status);
    if (result) {
      setAttendanceState(status);
    }
  };

  const isSaveLoading = isLoading(`save-${eventId}`);
  const isAttendanceLoading = isLoading(`attendance-${eventId}`);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          variant={saved ? "default" : "outline"}
          size="sm"
          onClick={handleSave}
          disabled={isSaveLoading}
          className="gap-2"
        >
          {isSaveLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Heart className={cn("h-3 w-3", saved && "fill-current text-rose-500")} />
          )}
          {saved ? "Salvo" : "Salvar"}
        </Button>

        <div className="flex gap-1">
          <Button
            variant={attendance === 'going' ? "default" : "outline"}
            size="sm"
            onClick={() => handleAttendance('going')}
            disabled={isAttendanceLoading}
            className="px-2"
          >
            {isAttendanceLoading && attendance === 'going' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserCheck className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant={attendance === 'maybe' ? "default" : "outline"}
            size="sm"
            onClick={() => handleAttendance('maybe')}
            disabled={isAttendanceLoading}
            className="px-2"
          >
            {isAttendanceLoading && attendance === 'maybe' ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Users className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <Button
        variant={saved ? "default" : "outline"}
        onClick={handleSave}
        disabled={isSaveLoading}
        className="gap-2 flex-1 min-w-[120px]"
      >
        {isSaveLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={cn("h-4 w-4", saved && "fill-current")} />
        )}
        {saved ? "Salvo" : "Salvar"}
      </Button>

      <div className="flex gap-2 flex-1">
        <Button
          variant={attendance === 'going' ? "default" : "outline"}
          onClick={() => handleAttendance('going')}
          disabled={isAttendanceLoading}
          className="gap-2 flex-1"
        >
          {isAttendanceLoading && attendance === 'going' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserCheck className="h-4 w-4" />
          )}
          Vou
        </Button>
        
        <Button
          variant={attendance === 'maybe' ? "default" : "outline"}
          onClick={() => handleAttendance('maybe')}
          disabled={isAttendanceLoading}
          className="gap-2 flex-1"
        >
          {isAttendanceLoading && attendance === 'maybe' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          Talvez
        </Button>
        
        <Button
          variant={attendance === 'went' ? "default" : "outline"}
          onClick={() => handleAttendance('went')}
          disabled={isAttendanceLoading}
          className="gap-2 flex-1"
        >
          {isAttendanceLoading && attendance === 'went' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserX className="h-4 w-4" />
          )}
          Fui
        </Button>
      </div>
    </div>
  );
}