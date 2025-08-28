import VenuesList from './List';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminVenuesIndex() {
  return <VenuesList />;
}

export default withAdminAuth(AdminVenuesIndex, 'editor');