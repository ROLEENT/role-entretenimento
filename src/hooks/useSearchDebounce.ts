import { useState, useEffect, useCallback } from 'react';

interface UseSearchDebounceProps {
  initialValue?: string;
  delay?: number;
  onSearch: (value: string) => void;
}

export const useSearchDebounce = ({ 
  initialValue = '', 
  delay = 300, 
  onSearch 
}: UseSearchDebounceProps) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, delay]);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const setValue = useCallback((value: string) => {
    setInputValue(value);
    setDebouncedValue(value);
  }, []);

  return {
    inputValue,
    debouncedValue,
    handleInputChange,
    setValue,
  };
};