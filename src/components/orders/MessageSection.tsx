
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageSectionProps {
  message: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

const MessageSection = ({ message, onChange, onSave }: MessageSectionProps) => {
  return (
    <div className="border-t pt-4">
      <div className="mb-2">
        <p className="font-medium mb-1">Message du magasinier</p>
        <p className="text-sm text-muted-foreground mb-2">
          Ajoutez un commentaire ou une précision pour cette commande
        </p>
        <Textarea 
          value={message}
          onChange={onChange}
          placeholder="Ex: Produit manquant, laissé un mot au client..."
          className="min-h-24"
        />
      </div>
      <div className="flex justify-end mt-2">
        <Button onClick={onSave}>
          Enregistrer le message
        </Button>
      </div>
    </div>
  );
};

export default MessageSection;
