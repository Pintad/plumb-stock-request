
import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';

interface ProductFormData {
  name: string;
  reference: string;
  unit: string;
  image?: FileList;
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || '',
      reference: initialData?.reference || '',
      unit: initialData?.unit || '',
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        reference: initialData.reference,
        unit: initialData.unit,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      if (!initialData) {
        form.reset();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du produit",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Désignation</FormLabel>
              <FormControl>
                <Input placeholder="Nom du produit" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Référence</FormLabel>
              <FormControl>
                <Input placeholder="Référence du produit" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unité</FormLabel>
              <FormControl>
                <Input placeholder="Unité de mesure" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Image{initialData?.imageUrl ? " (Laisser vide pour conserver l'image actuelle)" : ""}</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </FormControl>
              {initialData?.imageUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Image actuelle:</p>
                  <img 
                    src={initialData.imageUrl} 
                    alt={initialData.name} 
                    className="h-20 object-contain border rounded p-1" 
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between pt-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" className={onCancel ? "" : "w-full"}>
            {initialData ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
