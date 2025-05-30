
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
  isMobile?: boolean;
}

const TopItemsList = ({ topItemsData, isLoading, isMobile = false }: TopItemsListProps) => {
  return (
    <div className={isMobile ? 'mt-6' : 'mt-8'}>
      <div className={`flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-4'}`}>
        <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Articles les plus commandés</h2>
        <Link to="/admin/top-items" className={`${isMobile ? 'text-xs' : 'text-sm'} text-amber-600 hover:underline`}>
          Voir tous les articles →
        </Link>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className={`flex justify-center ${isMobile ? 'py-8' : 'py-12'}`}>
              <div className={`animate-spin rounded-full ${isMobile ? 'h-8 w-8' : 'h-12 w-12'} border-b-2 border-gray-900`}></div>
            </div>
          ) : topItemsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className={`text-left ${isMobile ? 'py-2 px-3 text-xs' : 'py-4 px-6'} font-medium text-gray-600`}>Article</th>
                    <th className={`text-right ${isMobile ? 'py-2 px-3 text-xs' : 'py-4 px-6'} font-medium text-gray-600`}>Demandes</th>
                    <th className={`text-right ${isMobile ? 'py-2 px-3 text-xs' : 'py-4 px-6'} font-medium text-gray-600`}>
                      <div className="flex items-center justify-end">
                        <span>Quantité totale</span>
                        <TrendingUp className={`ml-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-amber-500`} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topItemsData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className={`${isMobile ? 'py-2 px-3 text-xs' : 'py-3 px-6'}`}>
                        <span className={isMobile ? 'truncate block max-w-[120px]' : ''}>{item.name}</span>
                      </td>
                      <td className={`${isMobile ? 'py-2 px-3 text-xs' : 'py-3 px-6'} text-right`}>{item.count}</td>
                      <td className={`${isMobile ? 'py-2 px-3 text-xs' : 'py-3 px-6'} text-right font-semibold`}>
                        <span className={`bg-amber-100 text-amber-800 ${isMobile ? 'py-0.5 px-1.5 text-xs' : 'py-1 px-2'} rounded-full`}>
                          {item.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={`${isMobile ? 'p-4 text-xs' : 'p-6'} text-center text-gray-500`}>
              Aucun article n'a été commandé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopItemsList;
