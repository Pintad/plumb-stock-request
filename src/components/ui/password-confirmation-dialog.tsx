import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PasswordConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

export const PasswordConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
}: PasswordConfirmationDialogProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez saisir votre mot de passe',
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Obtenir l'email de l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de récupérer les informations utilisateur',
        });
        setIsVerifying(false);
        return;
      }

      // Vérifier le mot de passe en tentant une connexion
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Mot de passe incorrect',
          description: 'Le mot de passe saisi est incorrect',
        });
        setPassword('');
        setIsVerifying(false);
        return;
      }

      // Mot de passe correct, procéder à la suppression
      onConfirm();
      handleClose();
      
      toast({
        title: 'Suppression confirmée',
        description: `${itemName || 'L\'élément'} a été supprimé avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du mot de passe:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la vérification',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              Confirmez avec votre mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Saisissez votre mot de passe"
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
                disabled={isVerifying}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isVerifying}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isVerifying || !password}
          >
            {isVerifying ? 'Vérification...' : 'Confirmer la suppression'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};