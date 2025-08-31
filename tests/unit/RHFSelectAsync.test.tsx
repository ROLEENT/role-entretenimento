import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import RHFSelectAsync from '@/components/form/RHFSelectAsync';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: 1, name: 'São Paulo' },
            { id: 2, name: 'Rio de Janeiro' },
            { id: 3, name: 'Belo Horizonte' }
          ],
          error: null
        }))
      }))
    }))
  }
}));

function TestWrapper({ 
  defaultValues = {},
  onSubmit = vi.fn(),
  selectProps = {}
}: {
  defaultValues?: any;
  onSubmit?: (data: any) => void;
  selectProps?: any;
}) {
  const methods = useForm({
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} data-testid="test-form">
        <RHFSelectAsync
          name="cityId"
          label="Cidade"
          query={{
            table: "cities",
            fields: "id,name",
            orderBy: "name"
          }}
          mapRow={(row) => ({ value: row.id, label: row.name })}
          parseValue={(v) => Number(v)}
          serializeValue={(v) => String(v ?? "")}
          placeholder="Selecione uma cidade"
          {...selectProps}
        />
        
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
        
        <div data-testid="form-values">
          {JSON.stringify(methods.getValues())}
        </div>
      </form>
    </FormProvider>
  );
}

describe('RHFSelectAsync Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label and loading state initially', () => {
    render(<TestWrapper />);
    
    expect(screen.getByLabelText('Cidade')).toBeInTheDocument();
    expect(screen.getByText('Selecione uma cidade')).toBeInTheDocument();
  });

  it('should load options asynchronously and allow selection', async () => {
    const onSubmit = vi.fn();
    render(<TestWrapper onSubmit={onSubmit} />);
    
    // Wait for options to load
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Open the select
    fireEvent.click(screen.getByRole('combobox'));
    
    // Wait for options to appear
    await waitFor(() => {
      expect(screen.getByText('São Paulo')).toBeInTheDocument();
    });

    // Select an option
    fireEvent.click(screen.getByText('São Paulo'));
    
    // Verify selection
    await waitFor(() => {
      expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
    });
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        cityId: 1 // Should be parsed as number
      });
    });
  });

  it('should handle API errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock API error
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: null,
          error: { message: 'API Error' }
        }))
      }))
    } as any);

    render(<TestWrapper />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
    });
  });

  it('should handle empty results', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock empty results
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      }))
    } as any);

    render(<TestWrapper />);
    
    // Open select
    fireEvent.click(screen.getByRole('combobox'));
    
    // Should show no results message
    await waitFor(() => {
      expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
    });
  });

  it('should support search functionality', async () => {
    render(<TestWrapper />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Open select
    fireEvent.click(screen.getByRole('combobox'));
    
    // Wait for search input
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/buscar/i);
      expect(searchInput).toBeInTheDocument();
      
      // Type in search
      fireEvent.change(searchInput, { target: { value: 'São' } });
    });
  });

  it('should handle disabled state', () => {
    render(<TestWrapper selectProps={{ disabled: true }} />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should handle default values', async () => {
    render(<TestWrapper defaultValues={{ cityId: 1 }} />);
    
    // Wait for component to load and show selected value
    await waitFor(() => {
      expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
    });
  });
});