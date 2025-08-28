import AdminCommentsManagement from "../../AdminCommentsManagement";
import { withAdminAuth } from '@/components/withAdminAuth';

export default withAdminAuth(AdminCommentsManagement, 'admin');