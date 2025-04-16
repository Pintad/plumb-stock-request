
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Product } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  reference: string;
  unit: string;
  imageUrl?: string;
  category?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { categories } = useAppContext();
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || '',
      reference: initialData?.reference || '',
      unit: initialData?.unit || '',
      imageUrl: initialData?.imageUrl || '',
      category: initialData?.category || '',
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        reference: initialData.reference,
        unit: initialData.unit,
        imageUrl: initialData.imageUrl || '',
        category: initialData.category || '',
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Aucune catégorie</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl>
                <Input placeholder="URL de l'image du produit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(form.watch('imageUrl') || initialData?.imageUrl) && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Aperçu de l'image:</p>
            <img 
              src={form.watch('imageUrl') || initialData?.imageUrl} 
              alt="Aperçu du produit" 
              className="h-32 object-contain border rounded p-1" 
            />
          </div>
        )}

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
