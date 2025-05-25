
import React from 'react';
import { Folder, Tag } from 'lucide-react';

interface MobileCategoryBadgeProps {
  activeCategory: string | 'all';
  activeSuperCategory?: string;
}

const MobileCategoryBadge: React.FC<MobileCategoryBadgeProps> = ({ 
  activeCategory, 
  activeSuperCategory 
}) => {
  const getDisplayText = () => {
    if (activeCategory === 'all' && !activeSuperCategory) {
      return "Toutes les catégories";
    }
    if (activeSuperCategory && activeCategory === 'all') {
      return activeSuperCategory;
    }
    if (activeSuperCategory && activeCategory !== 'all') {
      return `${activeSuperCategory} > ${activeCategory}`;
    }
    return activeCategory;
  };

  const getIcon = () => {
    if (activeSuperCategory && activeCategory !== 'all') {
      return <Tag className="h-5 w-5 mr-2 text-gray-500" />;
    }
    return <Folder className="h-5 w-5 mr-2 text-gray-500" />;
  };

  return (
    <div className="md:hidden mb-4">
      <div className="bg-white rounded-lg p-3 flex items-center">
        {getIcon()}
        <span className="font-medium">
          {getDisplayText()}
        </span>
      </div>
    </div>
  );
};

export default MobileCategoryBadge;
