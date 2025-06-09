
import React from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  imageUrl?: string;
  name: string;
}

const ProductImage: React.FC<ProductImageProps> = ({ imageUrl, name }) => {
  return (
    <div className="mb-4 bg-gray-50 rounded-md p-4 flex justify-center">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name} 
          className="h-32 object-contain"
        />
      ) : (
        <Package size={48} className="text-gray-400" />
      )}
    </div>
  );
};

export default ProductImage;
