
import React from 'react';
import { CartItem } from '@/types';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface OrderArticlesListProps {
  articles: CartItem[];
  isMobile?: boolean;
}

const OrderArticlesList = ({ articles, isMobile = false }: OrderArticlesListProps) => {
  const formatArticleDisplay = (article: CartItem) => {
    const parts = [
      article.category,
      article.name,
      article.variants?.find(v => v.id === article.selectedVariantId)?.variantName
    ].filter(Boolean);
    return parts.join(' - ');
  };

  // Récupère l'unité appropriée (du variant sélectionné ou de l'article principal)
  const getArticleUnit = (article: CartItem) => {
    if (article.selectedVariantId && article.variants) {
      const selectedVariant = article.variants.find(v => v.id === article.selectedVariantId);
      return selectedVariant?.unit || article.unit || '';
    }
    return article.unit || '';
  };

  if (!articles || articles.length === 0) {
    return <p className="text-center text-gray-500">Aucun article</p>;
  }

  // Affichage mobile optimisé - format carte verticale
  if (isMobile) {
    return (
      <div className="space-y-3">
        {articles.map((article, index) => (
          <div 
            key={article.cartItemId || `${article.id}-${article.selectedVariantId || ''}-${index}`}
            className="bg-gray-50 rounded-lg p-3 space-y-2"
          >
            {/* Ligne 1: Nom de l'article */}
            <div className="flex justify-between items-start">
              <div className="font-medium text-sm flex-1 mr-2">
                {formatArticleDisplay(article)}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0">
                  <div className="p-4">
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={article.name}
                        className="w-full h-auto object-contain max-h-48"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-100 text-gray-500 text-xs">
                        Pas d'image disponible
                      </div>
                    )}
                    <p className="mt-2 text-xs font-medium">{formatArticleDisplay(article)}</p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Ligne 2: Référence */}
            <div className="text-xs text-gray-600">
              <span className="font-medium">Réf:</span> {article.variants?.find(v => v.id === article.selectedVariantId)?.reference || article.reference}
            </div>
            
            {/* Ligne 3: Quantité */}
            <div className="flex justify-end">
              <span className="font-bold text-base px-2 py-1 bg-white rounded border">
                {article.quantity} <span className="text-xs text-gray-600 ml-1">{getArticleUnit(article)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Affichage desktop - tableau classique
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-medium text-sm">Article</th>
            <th className="text-left py-2 px-3 font-medium text-sm">Référence</th>
            <th className="text-right py-2 px-3 font-medium text-sm">Quantité</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article, index) => (
            <tr key={article.cartItemId || `${article.id}-${article.selectedVariantId || ''}-${index}`} className="border-b">
              <td className="py-3 px-3">
                <div className="font-medium">{formatArticleDisplay(article)}</div>
              </td>
              <td className="py-3 px-3 font-mono text-sm">
                {article.variants?.find(v => v.id === article.selectedVariantId)?.reference || article.reference}
              </td>
              <td className="py-3 px-3 text-right">
                <span className="font-bold text-lg px-3 py-1 bg-gray-100 rounded-md">
                  {article.quantity} <span className="text-sm text-gray-600 ml-1">{getArticleUnit(article)}</span>
                </span>
              </td>
              <td className="py-3 px-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <div className="p-4">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.name}
                          className="w-full h-auto object-contain max-h-60"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-500">
                          Pas d'image disponible
                        </div>
                      )}
                      <p className="mt-2 text-sm font-medium">{formatArticleDisplay(article)}</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderArticlesList;
