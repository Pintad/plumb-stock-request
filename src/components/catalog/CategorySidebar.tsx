
import React from 'react';
import { Folder } from 'lucide-react';

interface CategorySidebarProps {
  categories: string[];
  products: any[];
  activeCategory: string | 'all';
  setCategory: (category: string | 'all') => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
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
  );
};

export default CategorySidebar;
