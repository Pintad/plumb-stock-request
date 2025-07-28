import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CatalogueItem {
  id: string;
  designation: string;
  categorie?: string;
  sur_categorie?: string;
  variante?: string;
  reference?: string;
  unite?: string;
  image_url?: string;
  keywords?: string;
}

interface CatalogueFilters {
  search: string;
  categorie: string;
  sur_categorie: string;
  keywords: string;
}

export const useCatalogueManagement = () => {
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CatalogueFilters>({
    search: '',
    categorie: '',
    sur_categorie: '',
    keywords: ''
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('catalogue')
        .select('*')
        .order('designation', { ascending: true });

      if (error) throw error;
      setCatalogueItems(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<CatalogueItem, 'id'>) => {
    try {
      const { error } = await supabase
        .from('catalogue')
        .insert([item]);

      if (error) throw error;
      toast.success('Article ajouté avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout de l\'article');
      return false;
    }
  };

  const updateItem = async (id: string, updates: Partial<CatalogueItem>) => {
    try {
      const { error } = await supabase
        .from('catalogue')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Article mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour de l\'article');
      return false;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('catalogue')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Article supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'article');
      return false;
    }
  };

  const filteredItems = useMemo(() => {
    return catalogueItems.filter(item => {
      const matchesSearch = !filters.search || 
        item.designation?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.variante?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategorie = !filters.categorie || item.categorie === filters.categorie;
      const matchesSurCategorie = !filters.sur_categorie || item.sur_categorie === filters.sur_categorie;
      const matchesKeywords = !filters.keywords || 
        item.keywords?.toLowerCase().includes(filters.keywords.toLowerCase());

      return matchesSearch && matchesCategorie && matchesSurCategorie && matchesKeywords;
    });
  }, [catalogueItems, filters]);

  const refreshItems = () => {
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Extraction des valeurs uniques pour les filtres
  const categories = useMemo(() => 
    [...new Set(catalogueItems.map(item => item.categorie).filter(Boolean))], 
    [catalogueItems]
  );

  const surCategories = useMemo(() => 
    [...new Set(catalogueItems.map(item => item.sur_categorie).filter(Boolean))], 
    [catalogueItems]
  );

  return {
    catalogueItems: filteredItems,
    loading,
    filters,
    setFilters,
    categories,
    surCategories,
    addItem,
    updateItem,
    deleteItem,
    refreshItems
  };
};