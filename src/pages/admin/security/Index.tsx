import { RoleManagement } from '@/components/admin/RoleManagement';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminSecurity() {
  return <RoleManagement />;
}

export default withAdminAuth(AdminSecurity, 'admin');