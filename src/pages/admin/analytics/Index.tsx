import AdminAnalytics from "../../AdminAnalytics";
import { withAdminAuth } from '@/components/withAdminAuth';

export default withAdminAuth(AdminAnalytics, 'admin');