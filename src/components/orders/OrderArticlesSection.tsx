
import React, { useState } from 'react';
import { CartItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import OrderArticlesList from './OrderArticlesList';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface OrderArticlesSectionProps {
  articles: CartItem[];
  isAdmin: boolean;
  onItemCompletionToggle: (index: number) => void;
}

const OrderArticlesSection = ({ articles, isAdmin, onItemCompletionToggle }: OrderArticlesSectionProps) => {
  if (!articles || articles.length === 0) {
    return <p className="text-muted-foreground">Aucun article dans cette commande</p>;
  }

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

  return (
    <div className="border-t pt-4">
      <p className="font-medium mb-2">Articles</p>
      {isAdmin ? (
        <div className="space-y-2">
          {articles.map((article, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-3 flex-1">
                <Checkbox 
                  checked={article.completed} 
                  onCheckedChange={() => onItemCompletionToggle(index)}
                  id={`article-${index}`}
                />
                <label 
                  htmlFor={`article-${index}`}
                  className={`flex-grow cursor-pointer ${article.completed ? 'line-through text-gray-500' : ''}`}
                >
                  <div className="font-medium">{formatArticleDisplay(article)}</div>
                  <div className="text-sm text-muted-foreground">
                    Réf: {article.variants?.find(v => v.id === article.selectedVariantId)?.reference || article.reference}
                  </div>
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg px-3 py-1 bg-gray-100 rounded-md">
                  {article.quantity} <span className="text-sm text-gray-600 ml-1">{getArticleUnit(article)}</span>
                </span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="ml-2"
                      onClick={(e) => {
                        // Empêcher la propagation pour éviter que le clic active la checkbox
                        e.stopPropagation();
                      }}
                    >
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <OrderArticlesList articles={articles} />
      )}
    </div>
  );
};

export default OrderArticlesSection;
