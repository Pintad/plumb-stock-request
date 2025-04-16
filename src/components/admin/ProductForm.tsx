import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
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
import { useImageSearch } from '@/hooks/useImageSearch';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  reference: string;
  unit: string;
  image?: FileList;
  imageUrl?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [apiKey, setApiKey] = useState('');
  const { searchImage, isSearching } = useImageSearch({ apiKey });
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: initialData?.name || '',
      reference: initialData?.reference || '',
      unit: initialData?.unit || '',
      imageUrl: initialData?.imageUrl || '',
    }
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        reference: initialData.reference,
        unit: initialData.unit,
        imageUrl: initialData.imageUrl || '',
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

  const handleImageSearch = async () => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "Clé API manquante",
        description: "Veuillez d'abord entrer votre clé API Perplexity",
      });
      return;
    }

    const productName = form.getValues('name');
    if (!productName) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez d'abord entrer le nom du produit",
      });
      return;
    }

    const imageUrl = await searchImage(productName);
    if (imageUrl) {
      form.setValue('imageUrl', imageUrl);
      toast({
        title: "Image trouvée",
        description: "Une image a été trouvée pour ce produit",
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

        <div className="space-y-2">
          <FormLabel>Clé API Perplexity</FormLabel>
          <Input
            type="password"
            placeholder="Entrez votre clé API Perplexity"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input {...field} placeholder="URL de l'image" />
                  </FormControl>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleImageSearch}
                    disabled={isSearching}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? "Recherche..." : "Chercher"}
                  </Button>
                </div>
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
        </div>

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
