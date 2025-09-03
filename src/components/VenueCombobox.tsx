import React, { useState } from 'react';
import { ComboboxAsync, ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';
import { useVenuesOptions } from '@/hooks/useVenuesOptions';

interface VenueComboboxProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function VenueCombobox({
  value,
  onValueChange,
  className,
  disabled = false,
}: VenueComboboxProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { searchVenues } = useVenuesOptions();

  const handleCreateNew = () => {
    setModalOpen(true);
  };

  const handleCreated = (newVenue: ComboboxAsyncOption) => {
    onValueChange(newVenue.value);
  };

  return (
    <>
      <ComboboxAsync
        value={value}
        onValueChange={onValueChange}
        onSearch={searchVenues}
        onCreateNew={handleCreateNew}
        placeholder="Busque por nome, cidade ou endereço..."
        emptyText="Nenhum local encontrado. Tente outros termos ou cadastre um novo."
        createNewText="Cadastrar novo local"
        className={className}
        disabled={disabled}
      />

      <AgentQuickCreateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        agentType="venue"
        onCreated={handleCreated}
      />
    </>
  );
}