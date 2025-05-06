
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TopItemData {
  name: string;
  count: number;
  quantity: number;
}

interface TopItemsListProps {
  topItemsData: TopItemData[];
  isLoading: boolean;
}

const TopItemsList = ({ topItemsData, isLoading }: TopItemsListProps) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Articles les plus commandés</h2>
        <Link to="/admin/top-items" className="text-sm text-amber-600 hover:underline">
          Voir tous les articles →
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : topItemsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-4 px-6 font-medium text-gray-600">Article</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">Demandes</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-600">
                      <div className="flex items-center justify-end">
                        <span>Quantité totale</span>
                        <TrendingUp className="ml-2 h-4 w-4 text-amber-500" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topItemsData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-6">{item.name}</td>
                      <td className="py-3 px-6 text-right">{item.count}</td>
                      <td className="py-3 px-6 text-right font-semibold">
                        <span className="bg-amber-100 text-amber-800 py-1 px-2 rounded-full">
                          {item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Aucun article n'a été commandé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopItemsList;
