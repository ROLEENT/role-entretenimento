import { RequireAuth } from '@/components/RequireAuth';
import HighlightsListPage from '@/pages/HighlightsListPage';

export default function AdminHighlightsIndex() {
  return (
    <RequireAuth requiredRole="admin">
      <HighlightsListPage />
    </RequireAuth>
  );
}