import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useV5Analytics } from '@/hooks/useV5Analytics';
import { useV5Preferences } from '@/hooks/useV5Preferences';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MousePointer, Star, Settings } from 'lucide-react';

export function V5MigrationDashboard() {
  const { analytics, getAdoptionRate, getCompletionRate, getAverageRating } = useV5Analytics();
  const { preference, resetPreferences } = useV5Preferences();

  const adoptionRate = getAdoptionRate();
  const v4CompletionRate = getCompletionRate('v4');
  const v5CompletionRate = getCompletionRate('v5');
  const v4Rating = getAverageRating('v4');
  const v5Rating = getAverageRating('v5');

  const clickData = [
    { name: 'V4', clicks: analytics.v4Clicks, color: '#64748b' },
    { name: 'V5', clicks: analytics.v5Clicks, color: '#3b82f6' }
  ];

  const sessionData = [
    { name: 'V4', sessions: analytics.v4Sessions, completions: analytics.formCompletions.v4 },
    { name: 'V5', sessions: analytics.v5Sessions, completions: analytics.formCompletions.v5 }
  ];

  const COLORS = ['#64748b', '#3b82f6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Migração V5</h2>
          <p className="text-muted-foreground">
            Acompanhe a adoção e performance da nova versão V5
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={preference === 'always-v5' ? 'default' : 'secondary'}>
            Preferência: {
              preference === 'always-v5' ? 'V5' :
              preference === 'always-v4' ? 'V4' :
              preference === 'ask-each-time' ? 'Perguntar' :
              'Não definida'
            }
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={resetPreferences}
          >
            <Settings className="h-4 w-4 mr-2" />
            Reset Preferências
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Adoção V5</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adoptionRate}%</div>
            <Progress value={adoptionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.v4Clicks + analytics.v5Clicks}</div>
            <p className="text-xs text-muted-foreground">
              V4: {analytics.v4Clicks} | V5: {analytics.v5Clicks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{v5CompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              V5 vs V4: {v4CompletionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{v5Rating}/5</div>
            <p className="text-xs text-muted-foreground">
              V4: {v4Rating}/5 | Feedbacks: {analytics.userFeedback.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Cliques</CardTitle>
            <CardDescription>V4 vs V5 por tipo de edição</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={clickData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="clicks"
                >
                  {clickData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessões vs Conclusões</CardTitle>
            <CardDescription>Performance de cada versão</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#64748b" name="Sessões" />
                <Bar dataKey="completions" fill="#3b82f6" name="Conclusões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback */}
      {analytics.userFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Recente</CardTitle>
            <CardDescription>Comentários dos usuários sobre as versões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.userFeedback.slice(-5).reverse().map((feedback, index) => (
                <div key={index} className="border-l-4 border-primary/20 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={feedback.version === 'v5' ? 'default' : 'secondary'}>
                      {feedback.version.toUpperCase()}
                    </Badge>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feedback.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  {feedback.comment && (
                    <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}