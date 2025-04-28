
import React from 'react';
import { CartItem } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface OrderArticlesListProps {
  articles: CartItem[];
}

const OrderArticlesList = ({ articles }: OrderArticlesListProps) => {
  const formatArticleDisplay = (article: CartItem) => {
    const parts = [
      article.category,
      article.name,
      article.variants?.find(v => v.id === article.selectedVariantId)?.variantName
    ].filter(Boolean);
    return parts.join(' - ');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60%]">Article</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles && articles.length > 0 ? (
            articles.map((article, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{formatArticleDisplay(article)}</div>
                </TableCell>
                <TableCell className="font-mono">
                  {article.variants?.find(v => v.id === article.selectedVariantId)?.reference || article.reference}
                </TableCell>
                <TableCell className="text-right">{article.quantity}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center">Aucun article</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderArticlesList;
