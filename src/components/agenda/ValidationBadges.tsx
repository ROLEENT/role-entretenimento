import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ValidationBadgesProps {
  formData: any;
  mode: 'create' | 'edit';
}

interface ValidationIssue {
  key: string;
  label: string;
  severity: 'error' | 'warning';
  check: (data: any) => boolean;
}

export const ValidationBadges = ({ formData, mode }: ValidationBadgesProps) => {
  const validationIssues: ValidationIssue[] = [
    {
      key: 'no-cover',
      label: 'Sem capa',
      severity: 'warning',
      check: (data) => !data.item?.cover_url
    },
    {
      key: 'no-city',
      label: 'Sem cidade',
      severity: 'error',
      check: (data) => !data.item?.city
    },
    {
      key: 'inverted-dates',
      label: 'Datas invertidas',
      severity: 'error',
      check: (data) => {
        const startAt = data.item?.start_at;
        const endAt = data.item?.end_at;
        if (!startAt || !endAt) return false;
        return new Date(startAt) >= new Date(endAt);
      }
    },
    {
      key: 'duplicate-slug',
      label: 'Slug duplicado',
      severity: 'error',
      check: (data) => {
        // This would be checked against server in real implementation
        return false; // Placeholder
      }
    },
    {
      key: 'invalid-occurrence',
      label: 'Ocorrência inválida',
      severity: 'error',
      check: (data) => {
        return data.occurrences?.some((occ: any) => {
          if (!occ.start_at || !occ.end_at) return true;
          const start = new Date(occ.start_at);
          const end = new Date(occ.end_at);
          const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
          return diffMinutes < 15;
        }) || false;
      }
    },
    {
      key: 'tier-zero-price',
      label: 'Tier com preço 0',
      severity: 'warning',
      check: (data) => {
        return data.ticket_tiers?.some((tier: any) => 
          tier.price <= 0
        ) || false;
      }
    }
  ];

  const activeIssues = validationIssues.filter(issue => issue.check(formData));
  const errors = activeIssues.filter(issue => issue.severity === 'error');
  const warnings = activeIssues.filter(issue => issue.severity === 'warning');

  if (activeIssues.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-700 font-medium">
          Todos os campos estão válidos
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activeIssues.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">
              Problemas detectados ({errors.length} erros, {warnings.length} avisos)
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeIssues.map((issue) => (
              <Badge
                key={issue.key}
                variant={issue.severity === 'error' ? 'destructive' : 'secondary'}
                className={issue.severity === 'error' 
                  ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                }
              >
                {issue.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface PublishErrorSummaryProps {
  errors: string[];
  onClose: () => void;
}

export const PublishErrorSummary = ({ errors, onClose }: PublishErrorSummaryProps) => {
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>Não é possível publicar:</strong>
            <ul className="mt-1 text-sm list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={onClose}
            className="text-destructive-foreground hover:text-destructive-foreground/80"
          >
            ×
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
};