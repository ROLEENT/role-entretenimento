import { AuditLogger } from '@/components/admin/AuditLogger';
import { withAdminAuth } from '@/components/withAdminAuth';

function AdminAudit() {
  return <AuditLogger />;
}

export default withAdminAuth(AdminAudit, 'admin');