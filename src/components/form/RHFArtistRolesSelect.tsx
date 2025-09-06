import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Briefcase } from "lucide-react";
import { useArtistRoles, useCreateArtistRole } from '@/hooks/useArtistRoles';
import { toast } from "sonner";

interface RHFArtistRolesSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  maxRoles?: number;
}

interface RoleOption {
  id: string;
  name: string;
  label: string;
  value: string;
}

export function RHFArtistRolesSelect({
  name,
  label = "Funções/Roles",
  placeholder = "Digite para buscar roles... Ex: DJ, Produtor, Vocalista",
  maxRoles = 5
}: RHFArtistRolesSelectProps) {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<RoleOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: roles, isLoading } = useArtistRoles(inputValue);
  const createRole = useCreateArtistRole();

  const handleInputChange = async (value: string) => {
    setInputValue(value);
    if (value.length > 0) {
      const roleOptions: RoleOption[] = (roles || []).map(role => ({
        id: role.id,
        name: role.name,
        label: role.name,
        value: role.id
      }));
      setSuggestions(roleOptions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addRole = (field: any, role: RoleOption) => {
    const currentRoles = field.value || [];
    if (currentRoles.length >= maxRoles) {
      toast.error(`Máximo de ${maxRoles} funções permitidas`);
      return;
    }
    
    const exists = currentRoles.some((g: RoleOption) => g.id === role.id);
    if (!exists) {
      field.onChange([...currentRoles, role]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeRole = (field: any, roleId: string) => {
    const currentRoles = field.value || [];
    field.onChange(currentRoles.filter((g: RoleOption) => g.id !== roleId));
  };

  const handleCreateRole = async (field: any, name: string) => {
    try {
      const result = await createRole.mutateAsync(name);
      const newRole: RoleOption = {
        id: result.id,
        name: result.name,
        label: result.name,
        value: result.id
      };
      addRole(field, newRole);
      toast.success(`Função "${name}" criada e adicionada!`);
    } catch (error) {
      toast.error('Erro ao criar função');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        if (suggestions.length > 0) {
          addRole(field, suggestions[0]);
        } else {
          handleCreateRole(field, inputValue.trim());
        }
      }
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            {label}
          </FormLabel>
          <FormControl>
            <div className="space-y-3">
              {/* Selected Roles */}
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {field.value.map((role: RoleOption) => (
                    <Badge key={role.id} variant="secondary" className="text-sm">
                      {role.name}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => removeRole(field, role.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="relative">
                <Input
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, field)}
                  placeholder={placeholder}
                  disabled={isLoading}
                />

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.length > 0 ? (
                      suggestions.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          onClick={() => addRole(field, role)}
                        >
                          {role.name}
                        </button>
                      ))
                    ) : inputValue.trim() ? (
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                        onClick={() => handleCreateRole(field, inputValue.trim())}
                      >
                        <Plus className="w-4 h-4" />
                        Criar "{inputValue}"
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Help text */}
              <p className="text-sm text-muted-foreground">
                Digite para buscar funções existentes ou criar novas. Máximo {maxRoles} funções.
              </p>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}