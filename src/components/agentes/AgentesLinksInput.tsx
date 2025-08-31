import { useFormContext } from "react-hook-form";
import { RHFInput } from "@/components/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Music, Play, Youtube } from "lucide-react";

interface AgentesLinksInputProps {
  name?: string;
}

export function AgentesLinksInput({ name = "links" }: AgentesLinksInputProps) {
  const { watch } = useFormContext();
  const links = watch(name) || {};

  const linkFields = [
    {
      key: "website",
      label: "Website",
      placeholder: "https://meusite.com",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      key: "spotify",
      label: "Spotify",
      placeholder: "https://open.spotify.com/artist/...",
      icon: <Music className="h-4 w-4" />,
    },
    {
      key: "soundcloud",
      label: "SoundCloud",
      placeholder: "https://soundcloud.com/usuario",
      icon: <Play className="h-4 w-4" />,
    },
    {
      key: "youtube",
      label: "YouTube",
      placeholder: "https://youtube.com/@usuario",
      icon: <Youtube className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkFields.map((field) => (
          <div key={field.key} className="relative">
            <div className="absolute left-3 top-8 z-10">
              {field.icon}
            </div>
            <RHFInput
              name={`${name}.${field.key}`}
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