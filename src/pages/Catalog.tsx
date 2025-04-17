
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductSearch from '@/components/ProductSearch';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Catalog = () => {
  const { products, cart, categories, projects } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  
  // Filtrer les produits basés sur la recherche et les catégories
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      // Filtre par terme de recherche
      const matchesSearch = term === '' ||
        product.name.toLowerCase().includes(term) ||
        (product.reference && product.reference.toLowerCase().includes(term));
      
      // Filtre par catégories sélectionnées
      const matchesCategory = activeCategory === 'all' || 
        (product.category && 
          (activeCategory === product.category || selectedCategories.includes(product.category)));
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategories, activeCategory]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const setCategory = (category: string | 'all') => {
    setActiveCategory(category);
    // Effacer la recherche pour montrer tous les produits de la catégorie
    setSearchTerm('');
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Regrouper les produits par catégorie pour l'affichage
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = products.filter(p => p.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex flex-1 container px-4 py-6">
        {/* Sidebar for categories */}
        <div className="hidden md:block w-64 mr-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Catégories</h2>
          <div className="space-y-1">
            <button
              onClick={() => setCategory('all')}
              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                activeCategory === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
              }`}
            >
              Toutes les catégories ({products.length})
            </button>
            <div className="h-px bg-gray-200 my-2"></div>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setCategory(category)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex justify-between items-center ${
                  activeCategory === category ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{category}</span>
                <span className="text-xs text-gray-500 ml-1">{categoryCounts[category]}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <ProductSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </div>
            
            <div className="flex items-center gap-2">
              {/* Afficher le filtre pour mobile uniquement */}
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
              
              {cartItemsCount > 0 && (
                <Link to="/cart">
                  <Button className="bg-plumbing-blue hover:bg-blue-600 flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Panier ({cartItemsCount})
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Afficher la catégorie active sur mobile */}
          <div className="md:hidden mb-4">
            <div className="bg-white rounded-lg p-3 flex items-center">
              <Folder className="h-5 w-5 mr-2 text-gray-500" />
              <span className="font-medium">
                {activeCategory === 'all' 
                  ? "Toutes les catégories" 
                  : activeCategory}
              </span>
            </div>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-2">Aucun produit ne correspond à votre recherche</p>
              <Button variant="ghost" onClick={() => {setSearchTerm(''); setCategory('all');}}>
                Réinitialiser la recherche
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{filteredProducts.length} produits trouvés</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Catalog;
