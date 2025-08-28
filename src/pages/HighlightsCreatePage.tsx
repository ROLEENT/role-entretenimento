import { RequireAuth } from '@/components/RequireAuth';
import AdvancedHighlightEditor from '@/pages/AdvancedHighlightEditor';

export default function HighlightsCreatePage() {
  return (
    <RequireAuth requiredRole="admin">
      <AdvancedHighlightEditor />
    </RequireAuth>
  );
}