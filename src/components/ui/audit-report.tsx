import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { generateAuditReport, AuditIssue } from "@/utils/uiAudit";

interface AuditReportProps {
  showDetails?: boolean;
}

export function AuditReport({ showDetails = false }: AuditReportProps) {
  const report = generateAuditReport();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P0': return 'destructive';
      case 'P1': return 'warning';
      case 'P2': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'P0': return <AlertTriangle className="w-4 h-4" />;
      case 'P1': return <Clock className="w-4 h-4" />;
      case 'P2': return <TrendingUp className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const renderIssueCard = (issue: AuditIssue) => (
    <Card key={`${issue.page}-${issue.component}`} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {issue.page} - {issue.component}
          </CardTitle>
          <Badge variant={getSeverityColor(issue.severity) as any} className="flex items-center gap-1">
            {getSeverityIcon(issue.severity)}
            {issue.severity}
          </Badge>
        </div>
        <CardDescription className="text-sm">
          {issue.description}
        </CardDescription>
      </CardHeader>
      
      {showDetails && (
        <CardContent className="pt-0">
          <div className="space-y-2 text-sm">
            {issue.evidence && (
              <div>
                <span className="font-medium text-muted-foreground">Evidência:</span>
                <p className="text-muted-foreground">{issue.evidence}</p>
              </div>
            )}
            {issue.solution && (
              <div>
                <span className="font-medium text-primary">Solução:</span>
                <p>{issue.solution}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Impacto na UX:</span>
              <p className="text-muted-foreground">{issue.impactOnUX}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              P0 - Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{report.summary.P0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              P1 - Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{report.summary.P1}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              P2 - Melhorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.summary.P2}</div>
          </CardContent>
        </Card>
      </div>

      {/* Issues by Priority */}
      {showDetails && (
        <>
          {/* P0 Issues */}
          {report.issues.P0.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Issues Críticos (P0)
              </h3>
              {report.issues.P0.map(renderIssueCard)}
            </div>
          )}

          {/* P1 Issues */}
          {report.issues.P1.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Issues Importantes (P1)
              </h3>
              {report.issues.P1.map(renderIssueCard)}
            </div>
          )}

          {/* P2 Issues */}
          {report.issues.P2.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Melhorias (P2)
              </h3>
              {report.issues.P2.map(renderIssueCard)}
            </div>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendações Prioritárias</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}