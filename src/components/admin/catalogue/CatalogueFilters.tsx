import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCatalogueManagement } from '@/hooks/useCatalogueManagement';

interface CatalogueFiltersProps {
  filters: {
    search: string;
    categorie: string;
    sur_categorie: string;
    keywords: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const CatalogueFilters: React.FC<CatalogueFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { categories, surCategories } = useCatalogueManagement();

  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      categorie: '',
      sur_categorie: '',
      keywords: ''
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filtres et Recherche</h3>
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
          >
            Effacer
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.categorie || 'all'}
            onValueChange={(value) => updateFilter('categorie', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((categorie) => (
                <SelectItem key={categorie} value={categorie}>
                  {categorie}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sur_categorie || 'all'}
            onValueChange={(value) => updateFilter('sur_categorie', value === 'all' ? '' : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sur-catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sur-catégories</SelectItem>
              {surCategories.map((surCategorie) => (
                <SelectItem key={surCategorie} value={surCategorie}>
                  {surCategorie}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Mots-clés..."
            value={filters.keywords}
            onChange={(e) => updateFilter('keywords', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};