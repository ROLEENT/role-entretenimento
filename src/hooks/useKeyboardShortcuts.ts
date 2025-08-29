import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  onSave: () => void;
  onCancel: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onSave,
  onCancel,
  onDuplicate,
  onDelete,
  enabled = true
}: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      // Only allow Ctrl+S in inputs
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
      return;
    }

    // Ctrl+S - Save
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      onSave();
    }
    
    // Escape - Cancel
    else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
    
    // D - Duplicate (only if not in input)
    else if (e.key.toLowerCase() === 'd' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      onDuplicate();
    }
    
    // Delete - Delete (only if not in input)
    else if (e.key === 'Delete' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      onDelete();
    }
  }, [enabled, onSave, onCancel, onDuplicate, onDelete]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {};
};