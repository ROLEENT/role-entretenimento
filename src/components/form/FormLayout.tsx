"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FormSection, { FORM_SECTIONS } from "./FormSection";

interface FormLayoutProps {
  children?: ReactNode;
  sections?: Array<{
    key: keyof typeof FORM_SECTIONS;
    content: ReactNode;
    defaultOpen?: boolean;
  }>;
  className?: string;
}

export default function FormLayout({ children, sections, className }: FormLayoutProps) {
  if (sections) {
    return (
      <div className={`space-y-4 ${className}`}>
        {sections.map(({ key, content, defaultOpen = false }) => {
          const section = FORM_SECTIONS[key];
          return (
            <FormSection
              key={section.id}
              id={section.id}
              title={section.title}
              description={section.description}
              defaultOpen={defaultOpen}
            >
              {content}
            </FormSection>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}