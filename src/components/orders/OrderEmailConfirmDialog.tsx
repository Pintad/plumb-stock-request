
import React from 'react'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface OrderEmailConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

const OrderEmailConfirmDialog = ({ 
  isOpen, 
  onOpenChange, 
  onConfirm 
}: OrderEmailConfirmDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation d'envoi</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir notifier l'utilisateur que sa commande est prête ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Oui, envoyer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default OrderEmailConfirmDialog
