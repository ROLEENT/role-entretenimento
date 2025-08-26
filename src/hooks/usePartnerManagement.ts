import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { listPartners, getPartner, upsertPartner, deletePartner, togglePartnerActive } from '@/lib/repositories/partners';

export interface Partner {
  id?: string;
  name: string;
  contact_email?: string;
  location: string;
  website?: string;
  instagram?: string;
  image_url?: string;
  featured: boolean;
  rating?: number;
  capacity?: string;
  types?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const usePartnerManagement = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  
  const { toast } = useToast();

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, count } = await listPartners({
        q: searchQuery,
        city: cityFilter,
        active: activeFilter,
        page: currentPage,
        pageSize
      });
      setPartners(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar parceiros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPartner = async (partnerData: Omit<Partner, 'id'>) => {
    try {
      const newPartner = await upsertPartner(partnerData);
      await fetchPartners();
      toast({
        title: "Sucesso",
        description: "Parceiro criado com sucesso",
      });
      return newPartner;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar parceiro",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePartner = async (id: string, partnerData: Partial<Partner>) => {
    try {
      const updatedPartner = await upsertPartner({ id, ...partnerData });
      await fetchPartners();
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso",
      });
      return updatedPartner;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar parceiro",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removePartner = async (id: string) => {
    try {
      await deletePartner(id);
      await fetchPartners();
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover parceiro",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await togglePartnerActive(id, isActive);
      await fetchPartners();
      toast({
        title: "Sucesso",
        description: `Parceiro ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao alterar status do parceiro",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [searchQuery, cityFilter, activeFilter, currentPage]);

  return {
    partners,
    loading,
    searchQuery,
    setSearchQuery,
    cityFilter,
    setCityFilter,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    totalCount,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    createPartner,
    updatePartner,
    removePartner,
    toggleActive,
    refreshPartners: fetchPartners,
  };
};