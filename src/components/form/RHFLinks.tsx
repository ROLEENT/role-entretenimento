"use client";

import { ReactNode } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface Link {
  label: string;
  url: string;
}

interface RHFLinksProps {
  name: string;
  label?: string;
  disabled?: boolean;
}

export default function RHFLinks({ name, label, disabled }: RHFLinksProps) {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const fieldError = errors[name];
  const links = watch(name) || [];

  const addLink = () => {
    const newLinks = [...links, { label: "", url: "" }];
    setValue(name, newLinks);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_: any, i: number) => i !== index);
    setValue(name, newLinks);
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setValue(name, newLinks);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      
      <div className="space-y-3">
        {links.map((link: Link, index: number) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Label do link"
                value={link.label}
                onChange={(e) => updateLink(index, "label", e.target.value)}
                disabled={disabled}
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                disabled={disabled}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeLink(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addLink}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Link
        </Button>
      </div>
      
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}