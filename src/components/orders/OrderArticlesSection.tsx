
import React from 'react';
import { CartItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import OrderArticlesList from './OrderArticlesList';

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

  return (
    <div className="border-t pt-4">
      <p className="font-medium mb-2">Articles</p>
      {isAdmin ? (
        <div className="space-y-2">
          {articles.map((article, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
              <div className="flex items-center gap-2">
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
                    Réf: {article.variants?.find(v => v.id === article.selectedVariantId)?.reference || article.reference} - Qté: {article.quantity}
                  </div>
                </label>
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
