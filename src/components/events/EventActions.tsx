import React, { useState } from "react";
import { SaveButton, AttendanceButtons, EventSocial } from "@/components/events";
import { PublicAuthDialog } from "@/components/auth/PublicAuthDialog";

interface EventActionsProps {
  eventId: string;
  className?: string;
}

export function EventActions({ eventId, className }: EventActionsProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAuthRequired = () => {
    setShowAuthDialog(true);
  };

  const handleAttendanceChanged = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-4">
        {/* Botões de ação */}
        <div className="flex items-center gap-2 flex-wrap">
          <SaveButton
            eventId={eventId}
            onAuthRequired={handleAuthRequired}
          />
          <AttendanceButtons
            eventId={eventId}
            onAuthRequired={handleAuthRequired}
            onChanged={handleAttendanceChanged}
          />
        </div>

        {/* Informações sociais do evento */}
        <EventSocial 
          eventId={eventId} 
          refreshKey={refreshKey}
        />
      </div>

      {/* Modal de autenticação */}
      <PublicAuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        defaultTab="signin"
      />
    </div>
  );
}