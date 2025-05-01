
import React from 'react';
import { CartItem } from '@/types';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
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
            <TableHead className="w-[55%]">Article</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
            <TableHead className="w-[50px]"></TableHead>
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
                <TableCell className="text-right">
                  <span className="font-bold text-lg px-3 py-1 bg-gray-100 rounded-md">
                    {article.quantity}
                  </span>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">Aucun article</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrderArticlesList;
