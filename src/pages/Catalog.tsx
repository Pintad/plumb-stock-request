
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Header } from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import ProductSearch from '@/components/ProductSearch';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Filter } from 'lucide-react';
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

const Catalog = () => {
  const { products, cart } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Extraire des catégories simples depuis les noms de produits
  useEffect(() => {
    const categories = new Set<string>();
    products.forEach(product => {
      // Extraire le premier mot comme catégorie simple
      const firstWord = product.name.split(' ')[0];
      if (firstWord.length > 2) { // Ignorer les mots trop courts
        categories.add(firstWord);
      }
    });
    setUniqueCategories(Array.from(categories).sort());
  }, [products]);

  // Filtrer les produits basés sur la recherche et les catégories
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    
    const filtered = products.filter(product => {
      // Filtre par terme de recherche
      const matchesSearch = term === '' ||
        product.name.toLowerCase().includes(term) ||
        product.reference.toLowerCase().includes(term);
      
      // Filtre par catégories sélectionnées
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.some(category => 
          product.name.toLowerCase().startsWith(category.toLowerCase())
        );
      
      return matchesSearch && matchesCategory;
    });
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategories]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className="flex-1 container px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <ProductSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </div>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                  <SheetDescription>
                    Filtrer les produits par catégorie
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <div className="space-y-4">
                    {uniqueCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
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
        
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500 mb-2">Aucun produit ne correspond à votre recherche</p>
            <Button variant="ghost" onClick={() => {setSearchTerm(''); setSelectedCategories([])}}>
              Réinitialiser la recherche
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{filteredProducts.length} produits trouvés</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Catalog;
