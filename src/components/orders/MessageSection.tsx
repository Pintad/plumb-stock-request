
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageSectionProps {
  message: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
  isMobile?: boolean; // Added isMobile as optional prop
}

const MessageSection = ({ message, onChange, onSave, isMobile }: MessageSectionProps) => {
  return (
    <div className="border-t pt-4">
      <div className="mb-2">
        <p className={`font-medium mb-1 ${isMobile ? 'text-sm' : ''}`}>Message du magasinier</p>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mb-2`}>
          Ajoutez un commentaire ou une précision pour cette commande
        </p>
        <Textarea 
          value={message}
          onChange={onChange}
          placeholder="Ex: Produit manquant, laissé un mot au client..."
          className={`min-h-${isMobile ? '16' : '24'}`}
        />
      </div>
      <div className="flex justify-end mt-2">
        <Button onClick={onSave} size={isMobile ? "sm" : "default"}>
          Enregistrer le message
        </Button>
      </div>
    </div>
  );
};

export default MessageSection;
