
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronRight, Folder, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useCategoryHierarchy } from '@/hooks/useCategoryHierarchy';
import { Product } from '@/types';

interface HierarchicalMobileCategoryFilterProps {
  products: Product[];
  activeCategory: string | 'all';
  activeSuperCategory?: string;
  setCategory: (category: string | 'all') => void;
  setSuperCategory?: (superCategory: string | undefined) => void;
}

const HierarchicalMobileCategoryFilter: React.FC<HierarchicalMobileCategoryFilterProps> = ({
  products,
  activeCategory,
  activeSuperCategory,
  setCategory,
  setSuperCategory
}) => {
  const { superCategories, uncategorizedCategories } = useCategoryHierarchy(products);
  const [expandedSuperCategories, setExpandedSuperCategories] = useState<Set<string>>(
    new Set(activeSuperCategory ? [activeSuperCategory] : [])
  );
  const [isOpen, setIsOpen] = useState(false);

  const toggleSuperCategory = (superCatName: string) => {
    const newExpanded = new Set(expandedSuperCategories);
    if (newExpanded.has(superCatName)) {
      newExpanded.delete(superCatName);
    } else {
      newExpanded.add(superCatName);
    }
    setExpandedSuperCategories(newExpanded);
  };

  const handleSuperCategoryClick = (superCatName: string) => {
    setSuperCategory?.(superCatName);
    setCategory('all');
    setIsOpen(false);
  };

  const handleCategoryClick = (category: string, superCategory?: string) => {
    setCategory(category);
    setSuperCategory?.(superCategory);
    setIsOpen(false);
  };

  const getCategoryCount = (category: string) => {
    return products.filter(p => p.category === category).length;
  };

  const getCurrentLabel = () => {
    if (activeCategory === 'all' && !activeSuperCategory) {
      return 'Toutes les catégories';
    }
    if (activeSuperCategory && activeCategory === 'all') {
      return activeSuperCategory;
    }
    if (activeSuperCategory && activeCategory !== 'all') {
      return `${activeSuperCategory} > ${activeCategory}`;
    }
    return activeCategory;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          {getCurrentLabel()}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Catégories</SheetTitle>
          <SheetDescription>
            Filtrer les produits par catégorie
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {/* Toutes les catégories */}
          <button
            onClick={() => {
              setCategory('all');
              setSuperCategory?.(undefined);
              setIsOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              activeCategory === 'all' && !activeSuperCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
            }`}
          >
            Toutes les catégories ({products.length})
          </button>
          
          <div className="h-px bg-gray-200 my-2"></div>

          {/* Sur-catégories avec leurs catégories */}
          {superCategories.map(superCat => (
            <div key={superCat.name} className="mb-1">
              <Collapsible 
                open={expandedSuperCategories.has(superCat.name)}
                onOpenChange={() => toggleSuperCategory(superCat.name)}
              >
                <div className="flex items-center">
                  <CollapsibleTrigger asChild>
                    <button
                      className={`flex-1 flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors hover:bg-gray-100 ${
                        activeSuperCategory === superCat.name ? 'bg-blue-50 text-blue-700 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <Folder className="h-4 w-4 mr-2" />
                        <span className="truncate">{superCat.name}</span>
                      </div>
                      <div className="flex items-center ml-2">
                        <span className="text-xs text-gray-500 mr-1">({superCat.productCount})</span>
                        {expandedSuperCategories.has(superCat.name) ? 
                          <ChevronDown className="h-3 w-3" /> : 
                          <ChevronRight className="h-3 w-3" />
                        }
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <button
                    onClick={() => handleSuperCategoryClick(superCat.name)}
                    className="ml-1 px-2 py-1 text-xs rounded hover:bg-blue-100 text-blue-600"
                  >
                    Tout
                  </button>
                </div>
                
                <CollapsibleContent className="ml-4 mt-1 space-y-1">
                  {superCat.categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryClick(category, superCat.name)}
                      className={`w-full text-left px-3 py-1 text-sm rounded-md transition-colors flex justify-between items-center ${
                        activeCategory === category && activeSuperCategory === superCat.name 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Tag className="h-3 w-3 mr-2" />
                        <span className="truncate">{category}</span>
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        ({getCategoryCount(category)})
                      </span>
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}

          {/* Catégories sans sur-catégorie */}
          {uncategorizedCategories.length > 0 && (
            <>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="text-xs text-gray-500 px-3 py-1 font-medium">Autres catégories</div>
              {uncategorizedCategories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex justify-between items-center ${
                    activeCategory === category && !activeSuperCategory 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">{category}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({getCategoryCount(category)})
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HierarchicalMobileCategoryFilter;
