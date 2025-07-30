

import React, { useState, useEffect, useRef } from 'react';
import { Order } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

interface OrderManagerProps {
  order: Order;
  onClose: () => void;
  isOpen?: boolean;
}

const OrderManager = ({ order: initialOrder, onClose, isOpen = true }: OrderManagerProps) => {
  const { updateOrderStatus, isAdmin, loadOrders } = useAppContext();
  const [order, setOrder] = useState(initialOrder);
  const [message, setMessage] = useState(initialOrder.messagefournisseur || '');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Utiliser useEffect pour écouter les changements en temps réel
  useEffect(() => {
    // Mettre à jour l'état local quand l'order change (props)
    setOrder(initialOrder);
    setMessage(initialOrder.messagefournisseur || '');
  }, [initialOrder]);

  useEffect(() => {
    // Réplication désactivée - pas de souscription temps réel
    console.log('Real-time subscription disabled for OrderManager');
  }, [order.commandeid, loadOrders]);

  // Gestion des cases cochées des articles (etat local)
  // Initialement aucune case cochée
  const initialCheckedState = order.articles ? order.articles.map(() => false) : [];
  const [checkedState, setCheckedState] = useState<boolean[]>(initialCheckedState);

  // Fonction pour toggle la case cochée à l'indice donné
  const toggleChecked = (index: number) => {
    const newChecked = [...checkedState];
    newChecked[index] = !newChecked[index];
    setCheckedState(newChecked);
  };

  // Use only the stored display title from the database without fallback
  const displayTitle = order.titre_affichage || "[ERREUR: Titre manquant]";

  const handleStatusChange = async () => {
    await updateOrderStatus(
      order.commandeid,
      order.termine === 'Non' ? 'Oui' : 'Non',
      message
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="order-dialog-description">
        <DialogHeader>
          <DialogTitle>{displayTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4" id="order-dialog-description">
          <div>
            <p className="text-sm font-medium mb-1">Client</p>
            <p>{order.clientname}</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Articles</p>
            {isAdmin ? (
              // Affichage checklist pour magasinier
              <ul className="space-y-2">
                {order.articles && order.articles.length > 0 ? (
                  order.articles.map((article, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Checkbox
                        checked={checkedState[index]}
                        onCheckedChange={() => toggleChecked(index)}
                      />
                      <span>{article.name} - {article.quantity}</span>
                    </li>
                  ))
                ) : (
                  <p>Aucun article</p>
                )}
              </ul>
            ) : (
              // Affichage classique liste articles non admin
              <ul className="list-disc pl-5">
                {order.articles && order.articles.length > 0 ? (
                  order.articles.map((article, index) => (
                    <li key={index}>
                      {article.name} - {article.quantity}
                    </li>
                  ))
                ) : (
                  <p>Aucun article</p>
                )}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-medium mb-1">Message magasinier</p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajouter un message..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleStatusChange}>
              Marquer comme {order.termine === 'Non' ? 'terminé' : 'non terminé'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderManager;

