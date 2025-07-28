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

interface CatalogueVariant {
  id: string;
  variante?: string;
  reference?: string;
  unite?: string;
}

interface GroupedCatalogueItem {
  id: string; // ID du premier item du groupe
  designation: string;
  categorie?: string;
  sur_categorie?: string;
  image_url?: string;
  keywords?: string;
  variants: CatalogueVariant[];
}

interface CatalogueFilters {
  search: string;
  categorie: string;
  sur_categorie: string;
  keywords: string;
}

const ITEMS_PER_PAGE = 20;

// Fonction pour grouper les articles par designation, keywords et image_url
const groupCatalogueItems = (items: CatalogueItem[]): GroupedCatalogueItem[] => {
  const groupMap = new Map<string, GroupedCatalogueItem>();
  
  items.forEach(item => {
    // Créer une clé de groupement basée sur designation, keywords et image_url
    const groupKey = `${item.designation}|${item.keywords || ''}|${item.image_url || ''}`;
    
    if (!groupMap.has(groupKey)) {
      // Créer un nouveau groupe
      groupMap.set(groupKey, {
        id: item.id,
        designation: item.designation,
        categorie: item.categorie,
        sur_categorie: item.sur_categorie,
        image_url: item.image_url,
        keywords: item.keywords,
        variants: []
      });
    }
    
    // Ajouter la variante au groupe
    const group = groupMap.get(groupKey)!;
    group.variants.push({
      id: item.id,
      variante: item.variante,
      reference: item.reference,
      unite: item.unite
    });
  });
  
  return Array.from(groupMap.values()).sort((a, b) => a.designation.localeCompare(b.designation));
};

export const useCatalogueManagement = () => {
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedCatalogueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<CatalogueFilters>({
    search: '',
    categorie: '',
    sur_categorie: '',
    keywords: ''
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Récupérer TOUS les articles avec pagination
      let allItems: CatalogueItem[] = [];
      let from = 0;
      const limit = 1000; // Limite par batch
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('catalogue')
          .select('*')
          .range(from, from + limit - 1)
          .order('designation', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          allItems = [...allItems, ...data];
          from += limit;
          hasMore = data.length === limit; // Continue si on a récupéré le maximum
        } else {
          hasMore = false;
        }
      }

      console.log(`📦 Total d'articles récupérés: ${allItems.length}`);
      setCatalogueItems(allItems);
      
      // Grouper les articles par designation, keywords et image_url
      const grouped = groupCatalogueItems(allItems);
      console.log(`🔗 Articles groupés: ${grouped.length} groupes`);
      setGroupedItems(grouped);
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
    return groupedItems.filter(item => {
      const matchesSearch = !filters.search || 
        item.designation?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.variants.some(v => 
          v.reference?.toLowerCase().includes(filters.search.toLowerCase()) ||
          v.variante?.toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesCategorie = !filters.categorie || item.categorie === filters.categorie;
      const matchesSurCategorie = !filters.sur_categorie || item.sur_categorie === filters.sur_categorie;
      const matchesKeywords = !filters.keywords || 
        item.keywords?.toLowerCase().includes(filters.keywords.toLowerCase());

      return matchesSearch && matchesCategorie && matchesSurCategorie && matchesKeywords;
    });
  }, [groupedItems, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const refreshItems = () => {
    fetchItems();
  };

  // Ne charger qu'une seule fois au montage
  useEffect(() => {
    fetchItems();
  }, []); // Pas de dépendances pour éviter les re-fetches

  // Extraction des valeurs uniques pour les filtres
  const categories = useMemo(() => 
    [...new Set(catalogueItems.map(item => item.categorie).filter(Boolean))], 
    [catalogueItems]
  );

  const surCategories = useMemo(() => 
    [...new Set(catalogueItems.map(item => item.sur_categorie).filter(Boolean))], 
    [catalogueItems]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    catalogueItems: paginatedItems,
    filteredItems,
    loading,
    filters,
    setFilters,
    categories,
    surCategories,
    currentPage,
    totalPages,
    handlePageChange,
    addItem,
    updateItem,
    deleteItem,
    refreshItems
  };
};