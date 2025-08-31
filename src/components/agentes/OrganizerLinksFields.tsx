import { useFormContext } from "react-hook-form";
import { RHFInput } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, ExternalLink, Instagram, Globe } from "lucide-react";

interface OrganizerLinksFieldsProps {
  className?: string;
}

export function OrganizerLinksFields({ className }: OrganizerLinksFieldsProps) {
  const linkFields = [
    {
      key: "website",
      label: "Website Principal",
      placeholder: "https://meusite.com",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      key: "links.facebook",
      label: "Facebook",
      placeholder: "https://facebook.com/pagina",
      icon: <ExternalLink className="h-4 w-4" />,
    },
    {
      key: "links.linkedin",
      label: "LinkedIn",
      placeholder: "https://linkedin.com/company/empresa",
      icon: <ExternalLink className="h-4 w-4" />,
    },
    {
      key: "links.youtube",
      label: "YouTube",
      placeholder: "https://youtube.com/@canal",
      icon: <ExternalLink className="h-4 w-4" />,
    },
    {
      key: "links.tiktok",
      label: "TikTok",
      placeholder: "https://tiktok.com/@usuario",
      icon: <ExternalLink className="h-4 w-4" />,
    },
    {
      key: "links.twitter",
      label: "X (Twitter)",
      placeholder: "https://x.com/usuario",
      icon: <ExternalLink className="h-4 w-4" />,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Links Adicionais
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          URLs para redes sociais e outros links relevantes.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkFields.map((field) => (
          <div key={field.key} className="relative">
            <div className="absolute left-3 top-8 z-10">
              {field.icon}
            </div>
            <RHFInput
              name={field.key}
              label={field.label}
              placeholder={field.placeholder}
              type="url"
              className="pl-10"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}