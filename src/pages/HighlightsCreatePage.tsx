import { RequireAuth } from '@/components/RequireAuth';
import AdminHighlightEditor from '@/pages/AdminHighlightEditor';

export default function HighlightsCreatePage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminHighlightEditor />
    </RequireAuth>
  );
}