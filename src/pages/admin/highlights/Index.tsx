import AdminHighlightsList from './List';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminHighlightsIndex() {
  return <AdminHighlightsList />;
}

export default withAdminAuth(AdminHighlightsIndex, 'editor');