import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RHFSelect from '@/components/form/RHFSelect';

// Test schema
const testSchema = z.object({
  testSelect: z.string().optional(),
  numberSelect: z.number().optional(),
});

type TestFormData = z.infer<typeof testSchema>;

// Test wrapper component
function TestWrapper({ 
  defaultValues = {}, 
  onSubmit = vi.fn(),
  selectProps = {}
}: {
  defaultValues?: Partial<TestFormData>;
  onSubmit?: (data: TestFormData) => void;
  selectProps?: any;
}) {
  const methods = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} data-testid="test-form">
        <RHFSelect
          name="testSelect"
          label="Test Select"
          options={[
            { value: '', label: 'Selecione...' },
            { value: 'option1', label: 'Opção 1' },
            { value: 'option2', label: 'Opção 2' },
            { value: 'option3', label: 'Opção 3' },
          ]}
          placeholder="Escolha uma opção"
          {...selectProps}
        />
        
        <RHFSelect
          name="numberSelect"
          label="Number Select"
          options={[
            { value: 1, label: 'Um' },
            { value: 2, label: 'Dois' },
            { value: 3, label: 'Três' },
          ]}
          parseValue={(v) => Number(v)}
          serializeValue={(v) => String(v ?? "")}
          placeholder="Escolha um número"
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

describe('RHFSelect Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with label and options', () => {
    render(<TestWrapper />);
    
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
    expect(screen.getByText('Escolha uma opção')).toBeInTheDocument();
  });

  it('should update form state when value changes', async () => {
    const onSubmit = vi.fn();
    render(<TestWrapper onSubmit={onSubmit} />);
    
    const select = screen.getByLabelText('Test Select');
    
    // Change value
    fireEvent.change(select, { target: { value: 'option1' } });
    
    // Verify the select value changed
    expect(select).toHaveValue('option1');
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        testSelect: 'option1',
        numberSelect: undefined
      });
    });
  });

  it('should handle default values correctly', () => {
    render(<TestWrapper defaultValues={{ testSelect: 'option2' }} />);
    
    const select = screen.getByLabelText('Test Select');
    expect(select).toHaveValue('option2');
  });

  it('should handle number values with parseValue/serializeValue', async () => {
    const onSubmit = vi.fn();
    render(<TestWrapper onSubmit={onSubmit} />);
    
    const numberSelect = screen.getByLabelText('Number Select');
    
    // Change to number option
    fireEvent.change(numberSelect, { target: { value: '2' } });
    
    expect(numberSelect).toHaveValue('2');
    
    // Submit form
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        testSelect: '',
        numberSelect: 2 // Should be parsed as number
      });
    });
  });

  it('should show validation errors', async () => {
    const schema = z.object({
      testSelect: z.string().min(1, 'Campo obrigatório'),
    });

    function ValidationTestWrapper() {
      const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues: { testSelect: '' },
      });

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => {})}>
            <RHFSelect
              name="testSelect"
              label="Required Select"
              options={[
                { value: '', label: 'Selecione...' },
                { value: 'option1', label: 'Opção 1' },
              ]}
            />
            <button type="submit">Submit</button>
          </form>
        </FormProvider>
      );
    }

    render(<ValidationTestWrapper />);
    
    // Submit without selecting
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    
    await waitFor(() => {
      expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
    });
  });

  it('should handle disabled state', () => {
    render(<TestWrapper selectProps={{ disabled: true }} />);
    
    const select = screen.getByLabelText('Test Select');
    expect(select).toBeDisabled();
  });

  it('should propagate multiple value changes correctly', async () => {
    const onSubmit = vi.fn();
    render(<TestWrapper onSubmit={onSubmit} />);
    
    const select = screen.getByLabelText('Test Select');
    
    // Multiple changes
    fireEvent.change(select, { target: { value: 'option1' } });
    expect(select).toHaveValue('option1');
    
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(select).toHaveValue('option2');
    
    fireEvent.change(select, { target: { value: 'option3' } });
    expect(select).toHaveValue('option3');
    
    // Submit final value
    fireEvent.click(screen.getByTestId('submit-button'));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        testSelect: 'option3',
        numberSelect: undefined
      });
    });
  });

  it('should update form values display in real-time', async () => {
    render(<TestWrapper />);
    
    const select = screen.getByLabelText('Test Select');
    const valuesDisplay = screen.getByTestId('form-values');
    
    // Initial state
    expect(valuesDisplay).toHaveTextContent('{"testSelect":""}');
    
    // Change value
    fireEvent.change(select, { target: { value: 'option1' } });
    
    await waitFor(() => {
      expect(valuesDisplay).toHaveTextContent('{"testSelect":"option1"}');
    });
  });
});