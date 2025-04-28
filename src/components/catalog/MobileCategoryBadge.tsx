
import React from 'react';
import { Folder } from 'lucide-react';

interface MobileCategoryBadgeProps {
  activeCategory: string | 'all';
}

const MobileCategoryBadge: React.FC<MobileCategoryBadgeProps> = ({ activeCategory }) => {
  return (
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
  );
};

export default MobileCategoryBadge;
