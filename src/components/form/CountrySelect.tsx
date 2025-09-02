import { useFormContext, Controller } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BaseFormFieldProps } from "@/lib/forms";

const COUNTRIES = [
  // Países Lusófonos (prioritários)
  { value: 'BR', label: 'Brasil', flag: '🇧🇷' },
  { value: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { value: 'AO', label: 'Angola', flag: '🇦🇴' },
  { value: 'MZ', label: 'Moçambique', flag: '🇲🇿' },
  { value: 'CV', label: 'Cabo Verde', flag: '🇨🇻' },
  { value: 'GW', label: 'Guiné-Bissau', flag: '🇬🇼' },
  { value: 'ST', label: 'São Tomé e Príncipe', flag: '🇸🇹' },
  { value: 'TL', label: 'Timor-Leste', flag: '🇹🇱' },
  
  // América do Sul (prioritária)
  { value: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { value: 'BO', label: 'Bolívia', flag: '🇧🇴' },
  { value: 'CL', label: 'Chile', flag: '🇨🇱' },
  { value: 'CO', label: 'Colômbia', flag: '🇨🇴' },
  { value: 'EC', label: 'Equador', flag: '🇪🇨' },
  { value: 'GF', label: 'Guiana Francesa', flag: '🇬🇫' },
  { value: 'GY', label: 'Guiana', flag: '🇬🇾' },
  { value: 'PY', label: 'Paraguai', flag: '🇵🇾' },
  { value: 'PE', label: 'Peru', flag: '🇵🇪' },
  { value: 'SR', label: 'Suriname', flag: '🇸🇷' },
  { value: 'UY', label: 'Uruguai', flag: '🇺🇾' },
  { value: 'VE', label: 'Venezuela', flag: '🇻🇪' },
  
  // Demais países (ordem alfabética)
  { value: 'AF', label: 'Afeganistão', flag: '🇦🇫' },
  { value: 'ZA', label: 'África do Sul', flag: '🇿🇦' },
  { value: 'AL', label: 'Albânia', flag: '🇦🇱' },
  { value: 'DE', label: 'Alemanha', flag: '🇩🇪' },
  { value: 'AD', label: 'Andorra', flag: '🇦🇩' },
  { value: 'AG', label: 'Antígua e Barbuda', flag: '🇦🇬' },
  { value: 'SA', label: 'Arábia Saudita', flag: '🇸🇦' },
  { value: 'DZ', label: 'Argélia', flag: '🇩🇿' },
  { value: 'AM', label: 'Armênia', flag: '🇦🇲' },
  { value: 'AU', label: 'Austrália', flag: '🇦🇺' },
  { value: 'AT', label: 'Áustria', flag: '🇦🇹' },
  { value: 'AZ', label: 'Azerbaijão', flag: '🇦🇿' },
  { value: 'BS', label: 'Bahamas', flag: '🇧🇸' },
  { value: 'BH', label: 'Bahrein', flag: '🇧🇭' },
  { value: 'BD', label: 'Bangladesh', flag: '🇧🇩' },
  { value: 'BB', label: 'Barbados', flag: '🇧🇧' },
  { value: 'BY', label: 'Belarus', flag: '🇧🇾' },
  { value: 'BE', label: 'Bélgica', flag: '🇧🇪' },
  { value: 'BZ', label: 'Belize', flag: '🇧🇿' },
  { value: 'BJ', label: 'Benin', flag: '🇧🇯' },
  { value: 'BT', label: 'Butão', flag: '🇧🇹' },
  { value: 'BA', label: 'Bósnia e Herzegovina', flag: '🇧🇦' },
  { value: 'BW', label: 'Botsuana', flag: '🇧🇼' },
  { value: 'BN', label: 'Brunei', flag: '🇧🇳' },
  { value: 'BG', label: 'Bulgária', flag: '🇧🇬' },
  { value: 'BF', label: 'Burkina Faso', flag: '🇧🇫' },
  { value: 'BI', label: 'Burundi', flag: '🇧🇮' },
  { value: 'KH', label: 'Camboja', flag: '🇰🇭' },
  { value: 'CM', label: 'Camarões', flag: '🇨🇲' },
  { value: 'CA', label: 'Canadá', flag: '🇨🇦' },
  { value: 'QA', label: 'Catar', flag: '🇶🇦' },
  { value: 'KZ', label: 'Cazaquistão', flag: '🇰🇿' },
  { value: 'TD', label: 'Chade', flag: '🇹🇩' },
  { value: 'CZ', label: 'Chéquia', flag: '🇨🇿' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'CY', label: 'Chipre', flag: '🇨🇾' },
  { value: 'SG', label: 'Singapura', flag: '🇸🇬' },
  { value: 'KP', label: 'Coreia do Norte', flag: '🇰🇵' },
  { value: 'KR', label: 'Coreia do Sul', flag: '🇰🇷' },
  { value: 'CI', label: 'Costa do Marfim', flag: '🇨🇮' },
  { value: 'CR', label: 'Costa Rica', flag: '🇨🇷' },
  { value: 'HR', label: 'Croácia', flag: '🇭🇷' },
  { value: 'CU', label: 'Cuba', flag: '🇨🇺' },
  { value: 'DK', label: 'Dinamarca', flag: '🇩🇰' },
  { value: 'DJ', label: 'Djibuti', flag: '🇩🇯' },
  { value: 'DM', label: 'Dominica', flag: '🇩🇲' },
  { value: 'EG', label: 'Egito', flag: '🇪🇬' },
  { value: 'SV', label: 'El Salvador', flag: '🇸🇻' },
  { value: 'AE', label: 'Emirados Árabes Unidos', flag: '🇦🇪' },
  { value: 'ER', label: 'Eritreia', flag: '🇪🇷' },
  { value: 'SK', label: 'Eslováquia', flag: '🇸🇰' },
  { value: 'SI', label: 'Eslovênia', flag: '🇸🇮' },
  { value: 'ES', label: 'Espanha', flag: '🇪🇸' },
  { value: 'US', label: 'Estados Unidos', flag: '🇺🇸' },
  { value: 'EE', label: 'Estônia', flag: '🇪🇪' },
  { value: 'SZ', label: 'Eswatini', flag: '🇸🇿' },
  { value: 'ET', label: 'Etiópia', flag: '🇪🇹' },
  { value: 'FJ', label: 'Fiji', flag: '🇫🇯' },
  { value: 'PH', label: 'Filipinas', flag: '🇵🇭' },
  { value: 'FI', label: 'Finlândia', flag: '🇫🇮' },
  { value: 'FR', label: 'França', flag: '🇫🇷' },
  { value: 'GA', label: 'Gabão', flag: '🇬🇦' },
  { value: 'GM', label: 'Gâmbia', flag: '🇬🇲' },
  { value: 'GH', label: 'Gana', flag: '🇬🇭' },
  { value: 'GE', label: 'Geórgia', flag: '🇬🇪' },
  { value: 'GD', label: 'Granada', flag: '🇬🇩' },
  { value: 'GR', label: 'Grécia', flag: '🇬🇷' },
  { value: 'GT', label: 'Guatemala', flag: '🇬🇹' },
  { value: 'GN', label: 'Guiné', flag: '🇬🇳' },
  { value: 'GQ', label: 'Guiné Equatorial', flag: '🇬🇶' },
  { value: 'HT', label: 'Haiti', flag: '🇭🇹' },
  { value: 'HN', label: 'Honduras', flag: '🇭🇳' },
  { value: 'HU', label: 'Hungria', flag: '🇭🇺' },
  { value: 'YE', label: 'Iêmen', flag: '🇾🇪' },
  { value: 'MH', label: 'Ilhas Marshall', flag: '🇲🇭' },
  { value: 'SB', label: 'Ilhas Salomão', flag: '🇸🇧' },
  { value: 'IN', label: 'Índia', flag: '🇮🇳' },
  { value: 'ID', label: 'Indonésia', flag: '🇮🇩' },
  { value: 'IR', label: 'Irã', flag: '🇮🇷' },
  { value: 'IQ', label: 'Iraque', flag: '🇮🇶' },
  { value: 'IE', label: 'Irlanda', flag: '🇮🇪' },
  { value: 'IS', label: 'Islândia', flag: '🇮🇸' },
  { value: 'IL', label: 'Israel', flag: '🇮🇱' },
  { value: 'IT', label: 'Itália', flag: '🇮🇹' },
  { value: 'JM', label: 'Jamaica', flag: '🇯🇲' },
  { value: 'JP', label: 'Japão', flag: '🇯🇵' },
  { value: 'JO', label: 'Jordânia', flag: '🇯🇴' },
  { value: 'KW', label: 'Kuwait', flag: '🇰🇼' },
  { value: 'LA', label: 'Laos', flag: '🇱🇦' },
  { value: 'LS', label: 'Lesoto', flag: '🇱🇸' },
  { value: 'LV', label: 'Letônia', flag: '🇱🇻' },
  { value: 'LB', label: 'Líbano', flag: '🇱🇧' },
  { value: 'LR', label: 'Libéria', flag: '🇱🇷' },
  { value: 'LY', label: 'Líbia', flag: '🇱🇾' },
  { value: 'LI', label: 'Liechtenstein', flag: '🇱🇮' },
  { value: 'LT', label: 'Lituânia', flag: '🇱🇹' },
  { value: 'LU', label: 'Luxemburgo', flag: '🇱🇺' },
  { value: 'MK', label: 'Macedônia do Norte', flag: '🇲🇰' },
  { value: 'MG', label: 'Madagascar', flag: '🇲🇬' },
  { value: 'MY', label: 'Malásia', flag: '🇲🇾' },
  { value: 'MW', label: 'Malaui', flag: '🇲🇼' },
  { value: 'MV', label: 'Maldivas', flag: '🇲🇻' },
  { value: 'ML', label: 'Mali', flag: '🇲🇱' },
  { value: 'MT', label: 'Malta', flag: '🇲🇹' },
  { value: 'MA', label: 'Marrocos', flag: '🇲🇦' },
  { value: 'MU', label: 'Maurício', flag: '🇲🇺' },
  { value: 'MR', label: 'Mauritânia', flag: '🇲🇷' },
  { value: 'MX', label: 'México', flag: '🇲🇽' },
  { value: 'MM', label: 'Mianmar', flag: '🇲🇲' },
  { value: 'FM', label: 'Micronésia', flag: '🇫🇲' },
  { value: 'MD', label: 'Moldávia', flag: '🇲🇩' },
  { value: 'MC', label: 'Mônaco', flag: '🇲🇨' },
  { value: 'MN', label: 'Mongólia', flag: '🇲🇳' },
  { value: 'ME', label: 'Montenegro', flag: '🇲🇪' },
  { value: 'NA', label: 'Namíbia', flag: '🇳🇦' },
  { value: 'NR', label: 'Nauru', flag: '🇳🇷' },
  { value: 'NP', label: 'Nepal', flag: '🇳🇵' },
  { value: 'NI', label: 'Nicarágua', flag: '🇳🇮' },
  { value: 'NE', label: 'Níger', flag: '🇳🇪' },
  { value: 'NG', label: 'Nigéria', flag: '🇳🇬' },
  { value: 'NO', label: 'Noruega', flag: '🇳🇴' },
  { value: 'NZ', label: 'Nova Zelândia', flag: '🇳🇿' },
  { value: 'OM', label: 'Omã', flag: '🇴🇲' },
  { value: 'NL', label: 'Países Baixos', flag: '🇳🇱' },
  { value: 'PW', label: 'Palau', flag: '🇵🇼' },
  { value: 'PA', label: 'Panamá', flag: '🇵🇦' },
  { value: 'PG', label: 'Papua-Nova Guiné', flag: '🇵🇬' },
  { value: 'PK', label: 'Paquistão', flag: '🇵🇰' },
  { value: 'PL', label: 'Polônia', flag: '🇵🇱' },
  { value: 'GB', label: 'Reino Unido', flag: '🇬🇧' },
  { value: 'CF', label: 'República Centro-Africana', flag: '🇨🇫' },
  { value: 'CG', label: 'República do Congo', flag: '🇨🇬' },
  { value: 'CD', label: 'República Democrática do Congo', flag: '🇨🇩' },
  { value: 'DO', label: 'República Dominicana', flag: '🇩🇴' },
  { value: 'RO', label: 'Romênia', flag: '🇷🇴' },
  { value: 'RU', label: 'Rússia', flag: '🇷🇺' },
  { value: 'RW', label: 'Ruanda', flag: '🇷🇼' },
  { value: 'KN', label: 'São Cristóvão e Névis', flag: '🇰🇳' },
  { value: 'SM', label: 'San Marino', flag: '🇸🇲' },
  { value: 'VC', label: 'São Vicente e Granadinas', flag: '🇻🇨' },
  { value: 'LC', label: 'Santa Lúcia', flag: '🇱🇨' },
  { value: 'SN', label: 'Senegal', flag: '🇸🇳' },
  { value: 'SL', label: 'Serra Leoa', flag: '🇸🇱' },
  { value: 'RS', label: 'Sérvia', flag: '🇷🇸' },
  { value: 'SC', label: 'Seicheles', flag: '🇸🇨' },
  { value: 'SO', label: 'Somália', flag: '🇸🇴' },
  { value: 'LK', label: 'Sri Lanka', flag: '🇱🇰' },
  { value: 'SD', label: 'Sudão', flag: '🇸🇩' },
  { value: 'SS', label: 'Sudão do Sul', flag: '🇸🇸' },
  { value: 'SE', label: 'Suécia', flag: '🇸🇪' },
  { value: 'CH', label: 'Suíça', flag: '🇨🇭' },
  { value: 'TJ', label: 'Tajiquistão', flag: '🇹🇯' },
  { value: 'TZ', label: 'Tanzânia', flag: '🇹🇿' },
  { value: 'TH', label: 'Tailândia', flag: '🇹🇭' },
  { value: 'TG', label: 'Togo', flag: '🇹🇬' },
  { value: 'TO', label: 'Tonga', flag: '🇹🇴' },
  { value: 'TT', label: 'Trinidad e Tobago', flag: '🇹🇹' },
  { value: 'TN', label: 'Tunísia', flag: '🇹🇳' },
  { value: 'TM', label: 'Turcomenistão', flag: '🇹🇲' },
  { value: 'TR', label: 'Turquia', flag: '🇹🇷' },
  { value: 'TV', label: 'Tuvalu', flag: '🇹🇻' },
  { value: 'UA', label: 'Ucrânia', flag: '🇺🇦' },
  { value: 'UG', label: 'Uganda', flag: '🇺🇬' },
  { value: 'UZ', label: 'Uzbequistão', flag: '🇺🇿' },
  { value: 'VU', label: 'Vanuatu', flag: '🇻🇺' },
  { value: 'VA', label: 'Vaticano', flag: '🇻🇦' },
  { value: 'VN', label: 'Vietnã', flag: '🇻🇳' },
  { value: 'ZM', label: 'Zâmbia', flag: '🇿🇲' },
  { value: 'ZW', label: 'Zimbábue', flag: '🇿🇼' },
];

interface CountrySelectProps extends BaseFormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
}

export function CountrySelect({
  name,
  label = "País",
  placeholder = "Selecione o país",
  disabled,
  required,
}: CountrySelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={fieldError ? "border-destructive" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {fieldError && (
        <p className="text-sm text-destructive" role="alert">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}