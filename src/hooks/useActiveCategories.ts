import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  kind: string;
  color?: string;
}

export const useActiveCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .rpc('get_categories_by_kind', { p_kind: 'ambos' });

        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        // Filter out "Vitrine Cultural" and inactive categories
        const activeCategories = (data || [])
          .filter((cat: any) => 
            cat.is_active && 
            cat.name !== 'Vitrine Cultural'
          )
          .map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            kind: cat.kind,
            color: cat.color
          }));

        setCategories(activeCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading };
};