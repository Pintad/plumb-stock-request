
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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead className="text-right">Quantité</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles && articles.length > 0 ? (
            articles.map((article, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{article.name}</div>
                </TableCell>
                <TableCell className="font-mono">{article.reference}</TableCell>
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
