import { RequireAuth } from '@/components/RequireAuth';
import AdminHighlightEditor from '@/pages/AdminHighlightEditor';

export default function AdminHighlightEdit() {
  return (
    <RequireAuth requiredRole="admin">
      <AdminHighlightEditor />
    </RequireAuth>
  );
}