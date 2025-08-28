import AdminArtistsList from './List';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminArtistsIndex() {
  return <AdminArtistsList />;
}

export default withAdminAuth(AdminArtistsIndex, 'editor');