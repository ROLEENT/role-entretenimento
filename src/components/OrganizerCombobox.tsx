import { useState } from 'react';
import { ComboboxAsync, ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';
import { useEntityLookup } from '@/hooks/useEntityLookup';

interface OrganizerComboboxProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function OrganizerCombobox({
  value,
  onValueChange,
  className,
  disabled = false,
}: OrganizerComboboxProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { searchEntities: searchOrganizers } = useEntityLookup({ type: 'organizers' });

  const handleCreateNew = () => {
    setModalOpen(true);
  };

  const handleCreated = (newOrganizer: ComboboxAsyncOption) => {
    onValueChange(newOrganizer.value);
  };

  return (
    <>
      <ComboboxAsync
        value={value}
        onValueChange={onValueChange}
        onSearch={searchOrganizers}
        onCreateNew={handleCreateNew}
        placeholder="Busque ou crie um organizador..."
        emptyText="Nenhum organizador encontrado"
        createNewText="Cadastrar novo organizador"
        className={className}
        disabled={disabled}
      />

      <AgentQuickCreateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        agentType="organizer"
        onCreated={handleCreated}
      />
    </>
  );
}