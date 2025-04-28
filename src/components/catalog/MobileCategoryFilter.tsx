
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface MobileCategoryFilterProps {
  categories: string[];
  products: any[];
  activeCategory: string | 'all';
  setCategory: (category: string | 'all') => void;
}

const MobileCategoryFilter: React.FC<MobileCategoryFilterProps> = ({
  categories,
  products,
  activeCategory,
  setCategory
}) => {
  // Calculate count of products per category
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = products.filter(p => p.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Catégories
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Catégories</SheetTitle>
          <SheetDescription>
            Filtrer les produits par catégorie
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 py-1">
              <Checkbox 
                id="category-all"
                checked={activeCategory === 'all'}
                onCheckedChange={() => setCategory('all')}
              />
              <Label htmlFor="category-all">Toutes les catégories</Label>
            </div>
            <div className="h-px bg-gray-200 my-1"></div>
            {categories.map(category => (
              <div key={category} className="flex items-center space-x-2 py-1">
                <Checkbox 
                  id={`category-${category}`} 
                  checked={activeCategory === category}
                  onCheckedChange={() => setCategory(category)}
                />
                <Label htmlFor={`category-${category}`}>
                  {category} ({categoryCounts[category]})
                </Label>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileCategoryFilter;
