
import React from 'react';
import { ClipboardList } from 'lucide-react';

const EmptyOrderState = () => {
  return (
    <div className="py-12 text-center">
      <div className="rounded-full bg-gray-200 w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <ClipboardList className="h-8 w-8 text-gray-500" />
      </div>
      <h2 className="text-xl font-medium mb-2">Aucune demande</h2>
      <p className="text-gray-500">
        Vous n'avez aucune demande de stock pour le moment
      </p>
    </div>
  );
};

export default EmptyOrderState;
