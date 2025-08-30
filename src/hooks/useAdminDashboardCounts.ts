import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardCount {
  kind: string;
  total: number;
  last_7d: number;
}

interface AdminDashboardCounts {
  contacts: DashboardCount;
  newsletter: DashboardCount;
  job_applications: DashboardCount;
}

export const useAdminDashboardCounts = () => {
  const [counts, setCounts] = useState<AdminDashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('v_admin_dashboard_counts')
          .select('*');

        if (error) throw error;

        // Transform array to object for easier access
        const countsMap = (data || []).reduce((acc, item) => {
          acc[item.kind] = item;
          return acc;
        }, {} as Record<string, DashboardCount>);

        setCounts({
          contacts: countsMap.contacts || { kind: 'contacts', total: 0, last_7d: 0 },
          newsletter: countsMap.newsletter || { kind: 'newsletter', total: 0, last_7d: 0 },
          job_applications: countsMap.job_applications || { kind: 'job_applications', total: 0, last_7d: 0 },
        });
      } catch (err) {
        console.error('Error fetching admin dashboard counts:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return { counts, loading, error };
};