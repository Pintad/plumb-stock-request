
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CustomItemFormProps {
  onAddCustomItem: (text: string, quantity: number) => void;
}

const CustomItemForm: React.FC<CustomItemFormProps> = ({ onAddCustomItem }) => {
  const [text, setText] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast({
        variant: "destructive",
        title: "Texte requis",
        description: "Veuillez saisir un texte pour l'article personnalisé",
      });
      return;
    }

    if (quantity < 1) {
      toast({
        variant: "destructive",
        title: "Quantité invalide",
        description: "La quantité doit être supérieure à 0",
      });
      return;
    }

    onAddCustomItem(text, quantity);
    setText('');
    setQuantity(1);
    
    toast({
      title: "Article ajouté",
      description: "L'article personnalisé a été ajouté au panier",
    });
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700">
          Ajouter un article personnalisé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="custom-text" className="block text-xs font-medium text-gray-600 mb-1">
              Description de l'article (commentaire, article non référencé...)
            </label>
            <Textarea
              id="custom-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Tuyau spécial 50cm, Pièce à commander sur mesure..."
              className="text-sm resize-none"
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label htmlFor="custom-quantity" className="block text-xs font-medium text-gray-600 mb-1">
                Quantité
              </label>
              <Input
                id="custom-quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="text-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              size="sm" 
              className="bg-plumbing-blue hover:bg-blue-600 mt-6"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomItemForm;
