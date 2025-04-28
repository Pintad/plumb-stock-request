
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order, CartItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/context/AppContext';
import OrderArticlesList from './OrderArticlesList';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ProductSearch from '@/components/ProductSearch';
import { Plus, Trash2 } from 'lucide-react';

interface OrderEditModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const OrderEditModal = ({ order, isOpen, onClose }: OrderEditModalProps) => {
  const { updateOrder } = useAppContext();
  const [articles, setArticles] = useState<CartItem[]>(order.articles);
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

  const handleAddProduct = (product: CartItem) => {
    const existingArticleIndex = articles.findIndex(article => 
      article.id === product.id && 
      article.selectedVariantId === product.selectedVariantId
    );

    if (existingArticleIndex !== -1) {
      const updatedArticles = [...articles];
      updatedArticles[existingArticleIndex].quantity += product.quantity;
      setArticles(updatedArticles);
    } else {
      setArticles([...articles, product]);
    }
    setIsProductSearchOpen(false);
  };

  const handleRemoveArticle = (index: number) => {
    const updatedArticles = [...articles];
    updatedArticles.splice(index, 1);
    setArticles(updatedArticles);
  };

  const handleSave = async () => {
    if (articles.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La commande doit contenir au moins un article",
      });
      return;
    }

    try {
      const updatedOrder = {
        ...order,
        articles,
      };
      await updateOrder(updatedOrder);
      toast({
        title: "Commande modifiée",
        description: "La commande a été mise à jour avec succès",
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier la commande",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier la commande #{order.orderNumber || order.commandeid}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Articles</h3>
            <Sheet open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Ajouter un article
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Ajouter un article</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <ProductSearch onProductSelected={handleAddProduct} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="space-y-2">
            {articles.map((article, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div>
                  <div className="font-medium">{article.name}</div>
                  <div className="text-sm text-gray-500">
                    Quantité: {article.quantity} - Réf: {article.reference}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveArticle(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {articles.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Aucun article dans la commande
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditModal;
