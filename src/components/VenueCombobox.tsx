import React, { useState } from 'react';
import { ComboboxAsync, ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';
import { useVenueSearch } from '@/hooks/useVenueSearch';

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
  const { searchVenues } = useVenueSearch();

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
        placeholder="Busque ou crie um local..."
        emptyText="Nenhum local encontrado"
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