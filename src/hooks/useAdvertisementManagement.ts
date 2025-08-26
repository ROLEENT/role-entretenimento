import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { listAdvertisements, getAdvertisement, upsertAdvertisement, deleteAdvertisement, updateAdStatus } from '@/lib/repositories/advertisements';

export interface Advertisement {
  id?: string;
  title: string;
  cta_text: string;
  description?: string;
  image_url?: string;
  cta_url?: string;
  type: string;
  position?: number;
  gradient_from?: string;
  gradient_to?: string;
  badge_text?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useAdvertisementManagement = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  
  const { toast } = useToast();

  const fetchAdvertisements = async () => {
    setLoading(true);
    try {
      const { data, count } = await listAdvertisements({
        q: searchQuery,
        status: statusFilter,
        page: currentPage,
        pageSize
      });
      setAdvertisements(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar anúncios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAdvertisement = async (adData: Omit<Advertisement, 'id'>) => {
    try {
      const newAd = await upsertAdvertisement(adData);
      await fetchAdvertisements();
      toast({
        title: "Sucesso",
        description: "Anúncio criado com sucesso",
      });
      return newAd;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar anúncio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAdvertisement = async (id: string, adData: Partial<Advertisement>) => {
    try {
      const updatedAd = await upsertAdvertisement({ id, ...adData });
      await fetchAdvertisements();
      toast({
        title: "Sucesso",
        description: "Anúncio atualizado com sucesso",
      });
      return updatedAd;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar anúncio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeAdvertisement = async (id: string) => {
    try {
      await deleteAdvertisement(id);
      await fetchAdvertisements();
      toast({
        title: "Sucesso",
        description: "Anúncio removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover anúncio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateAdStatus(id, status);
      await fetchAdvertisements();
      toast({
        title: "Sucesso",
        description: "Status do anúncio atualizado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status do anúncio",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [searchQuery, statusFilter, currentPage]);

  return {
    advertisements,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalCount,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    createAdvertisement,
    updateAdvertisement,
    removeAdvertisement,
    updateStatus,
    refreshAdvertisements: fetchAdvertisements,
  };
};