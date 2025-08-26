import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, adminQueryInvalidation } from '@/lib/queryClient';
import { useAdminToast } from '@/hooks/useAdminToast';

// Types for pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Default pagination settings
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Organizers hooks
export function useOrganizers(params: PaginationParams = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, orderBy = 'created_at', orderDirection = 'desc' } = params;
  
  return useQuery({
    queryKey: queryKeys.organizers(page, search),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const startRange = (page - 1) * limit;
      const endRange = startRange + limit - 1;
      
      let query = supabase
        .from('organizers')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRange, endRange);
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for organizers
  });
}

export function useOrganizer(id: string) {
  return useQuery({
    queryKey: queryKeys.organizer(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateOrganizer() {
  const { showSuccess, showError } = useAdminToast();
  
  return useMutation({
    mutationFn: async (organizerData: any) => {
      const { data, error } = await supabase
        .from('organizers')
        .insert(organizerData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      adminQueryInvalidation.invalidateOrganizers();
      showSuccess('Organizador criado com sucesso!');
    },
    onError: (error) => {
      showError(error, 'Erro ao criar organizador');
    },
  });
}

export function useUpdateOrganizer() {
  const { showSuccess, showError } = useAdminToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('organizers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      adminQueryInvalidation.invalidateOrganizers();
      showSuccess('Organizador atualizado com sucesso!');
    },
    onError: (error) => {
      showError(error, 'Erro ao atualizar organizador');
    },
  });
}

export function useDeleteOrganizer() {
  const { showSuccess, showError } = useAdminToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organizers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      adminQueryInvalidation.invalidateOrganizers();
      adminQueryInvalidation.removeOrganizer(id);
      showSuccess('Organizador removido com sucesso!');
    },
    onError: (error) => {
      showError(error, 'Erro ao remover organizador');
    },
  });
}

// Venues hooks
export function useVenues(params: PaginationParams = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, orderBy = 'created_at', orderDirection = 'desc' } = params;
  
  return useQuery({
    queryKey: queryKeys.venues(page, search),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const startRange = (page - 1) * limit;
      const endRange = startRange + limit - 1;
      
      let query = supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRange, endRange);
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for venues (change less frequently)
  });
}

// Events hooks
export function useEvents(params: PaginationParams & { status?: string } = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, status, orderBy = 'date_start', orderDirection = 'desc' } = params;
  
  return useQuery({
    queryKey: queryKeys.events(page, search, status),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const startRange = (page - 1) * limit;
      const endRange = startRange + limit - 1;
      
      let query = supabase
        .from('events')
        .select('*, venues(name), organizers(name)', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRange, endRange);
      
      if (search) {
        query = query.ilike('title', `%${search}%`);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 30 * 1000, // 30 seconds for events (more dynamic)
  });
}

// Blog Posts hooks
export function useBlogPosts(params: PaginationParams & { status?: string } = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, status, orderBy = 'created_at', orderDirection = 'desc' } = params;
  
  return useQuery({
    queryKey: queryKeys.blogPosts(page, search, status),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const startRange = (page - 1) * limit;
      const endRange = startRange + limit - 1;
      
      let query = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRange, endRange);
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 60 * 1000, // 1 minute for blog posts
  });
}

// Comments hooks
export function useComments(params: PaginationParams & { approved?: boolean } = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, approved, orderBy = 'created_at', orderDirection = 'desc' } = params;
  
  return useQuery({
    queryKey: queryKeys.comments(page, approved ? 'approved' : 'pending'),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      // Use new hash-based admin function
      const { data: allData, error } = await supabase.rpc('get_blog_comments_admin_hash');
      
      if (error) throw error;
      
      let filteredData = allData || [];
      
      // Apply approved filter if provided
      if (approved !== undefined) {
        filteredData = filteredData.filter((comment: any) => comment.is_approved === approved);
      }
      
      // Apply search filter if provided
      if (search) {
        filteredData = filteredData.filter((comment: any) => 
          comment.author_name?.toLowerCase().includes(search.toLowerCase()) ||
          comment.content?.toLowerCase().includes(search.toLowerCase()) ||
          comment.post_title?.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Calculate total count after filtering
      const totalCount = filteredData.length;
      
      // Apply pagination manually since we're using RPC
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        data: paginatedData,
        count: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 30 * 1000, // 30 seconds for comments
  });
}

// Contact Messages hooks
export function useContactMessages(params: PaginationParams & { handled?: boolean } = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, handled, orderBy = 'created_at', orderDirection = 'desc' } = params;
  
  return useQuery({
    queryKey: queryKeys.contactMessages(page, handled),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const startRange = (page - 1) * limit;
      const endRange = startRange + limit - 1;
      
      let query = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRange, endRange);
      
      if (handled !== undefined) {
        query = query.eq('handled', handled);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 60 * 1000, // 1 minute for contact messages
  });
}

// Categories hooks
export function useCategories(params: PaginationParams = {}) {
  const { page = 1, limit = DEFAULT_PAGE_SIZE, search, orderBy = 'name', orderDirection = 'asc' } = params;
  
  return useQuery({
    queryKey: queryKeys.categories(page, search),
    queryFn: async (): Promise<PaginatedResponse<any>> => {
      const startRange = (page - 1) * limit;
      const endRange = startRange + limit - 1;
      
      let query = supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending: orderDirection === 'asc' })
        .range(startRange, endRange);
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const totalPages = Math.ceil((count || 0) / limit);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for categories (very stable)
  });
}