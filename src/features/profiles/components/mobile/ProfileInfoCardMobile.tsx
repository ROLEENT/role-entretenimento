import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Building, Users, MapPin } from "lucide-react";
import { Profile } from "@/features/profiles/api";

interface ProfileInfoCardMobileProps {
  profile: Profile;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'artista':
      return Mic;
    case 'local':
      return Building;
    case 'organizador':
      return Users;
    default:
      return Users;
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'artista':
      return 'Artista';
    case 'local':
      return 'Local';
    case 'organizador':
      return 'Organizador';
    default:
      return type;
  }
}

function getCountryWithFlag(country: string | null) {
  if (!country) return null;
  
  const countryFlags: { [key: string]: string } = {
    'BR': '🇧🇷 Brasil',
    'US': '🇺🇸 Estados Unidos',
    'AR': '🇦🇷 Argentina',
    'UY': '🇺🇾 Uruguai',
    'PY': '🇵🇾 Paraguai',
    'CL': '🇨🇱 Chile',
    'BO': '🇧🇴 Bolívia',
    'PE': '🇵🇪 Peru',
    'EC': '🇪🇨 Equador',
    'CO': '🇨🇴 Colômbia',
    'VE': '🇻🇪 Venezuela',
    'GY': '🇬🇾 Guiana',
    'SR': '🇸🇷 Suriname',
    'GF': '🇬🇫 Guiana Francesa',
  };
  
  return countryFlags[country] || `${country}`;
}

export function ProfileInfoCardMobile({ profile }: ProfileInfoCardMobileProps) {
  const TypeIcon = getTypeIcon(profile.type);
  const typeLabel = getTypeLabel(profile.type);
  const countryWithFlag = getCountryWithFlag(profile.country);

  const infoItems = [
    {
      icon: TypeIcon,
      label: "Tipo",
      value: typeLabel,
    },
    ...(profile.category_name ? [{
      icon: Building,
      label: "Categoria",
      value: profile.category_name,
    }] : []),
    ...(countryWithFlag ? [{
      icon: MapPin,
      label: "País",
      value: countryWithFlag,
    }] : []),
  ];

  if (infoItems.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Informações</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {infoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}