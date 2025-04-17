
import React, { useEffect, useState } from 'react';
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
import { Product, ProductVariant } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Plus, Trash, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product;
  onCancel?: () => void;
}

interface ProductFormData {
  name: string;
  reference?: string;
  unit?: string;
  imageUrl?: string;
  category?: string;
  variants?: ProductVariantFormData[];
}

interface ProductVariantFormData {
  id: string;
  variantName: string;
  reference: string;
  unit: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { categories } = useAppContext();
  const [hasVariants, setHasVariants] = useState<boolean>(
    initialData?.variants && initialData.variants.length > 0 ? true : false
  );
  const [variants, setVariants] = useState<ProductVariantFormData[]>(
    initialData?.variants || []
  );
  const [imagePreview, setImagePreview] = useState<string | undefined>(initialData?.imageUrl);
  
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
        reference: initialData.reference || '',
        unit: initialData.unit || '',
        imageUrl: initialData.imageUrl || '',
        category: initialData.category || '',
      });
      setVariants(initialData.variants || []);
      setHasVariants(initialData.variants && initialData.variants.length > 0);
      setImagePreview(initialData.imageUrl);
    }
  }, [initialData, form]);

  // Surveillance du champ imageUrl pour mettre à jour le prévisualiseur
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.imageUrl !== undefined) {
        setImagePreview(value.imageUrl);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const formattedData = { ...data };
      
      if (hasVariants && variants.length > 0) {
        formattedData.variants = variants;
        // Si on utilise des variantes, on supprime les champs reference et unit du produit principal
        delete formattedData.reference;
        delete formattedData.unit;
      } else {
        // Si on n'utilise pas de variantes, on s'assure de ne pas avoir de tableau variants
        delete formattedData.variants;
      }
      
      await onSubmit(formattedData);
      
      if (!initialData) {
        form.reset();
        setVariants([]);
        setHasVariants(false);
        setImagePreview(undefined);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde du produit",
      });
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariantFormData = {
      id: `var-${Date.now()}`,
      variantName: '',
      reference: '',
      unit: ''
    };
    setVariants([...variants, newVariant]);
  };

  const updateVariant = (index: number, field: keyof ProductVariantFormData, value: string) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setVariants(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = [...variants];
    updatedVariants.splice(index, 1);
    setVariants(updatedVariants);
    
    // Si plus aucune variante, désactiver l'option variantes
    if (updatedVariants.length === 0) {
      setHasVariants(false);
    }
  };

  const toggleVariants = (useVariants: boolean) => {
    setHasVariants(useVariants);
    if (useVariants && variants.length === 0) {
      addVariant();
    }
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    // Regex simple pour valider que la chaîne ressemble à une URL
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocole
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // nom de domaine
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OU adresse IP
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port et chemin
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // paramètres de requête
      '(\\#[-a-z\\d_]*)?$','i'); // fragment
    return urlPattern.test(url);
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

        <div className="flex items-center">
          <label className="text-sm font-medium flex items-center">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => toggleVariants(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            Ce produit possède plusieurs variantes
          </label>
        </div>

        {!hasVariants && (
          <>
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input placeholder="Référence du produit" required={!hasVariants} {...field} />
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
                    <Input placeholder="Unité de mesure" required={!hasVariants} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {hasVariants && (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Variantes du produit</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addVariant}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> Ajouter une variante
              </Button>
            </div>
            
            {variants.map((variant, index) => (
              <div key={variant.id} className="p-3 border rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Variante {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeVariant(index)}
                    className="text-xs h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Nom de la variante</label>
                    <Input
                      placeholder="ex: 16/21"
                      value={variant.variantName}
                      onChange={(e) => updateVariant(index, 'variantName', e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Référence</label>
                    <Input
                      placeholder="Référence de cette variante"
                      value={variant.reference}
                      onChange={(e) => updateVariant(index, 'reference', e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Unité</label>
                    <Input
                      placeholder="Unité de mesure pour cette variante"
                      value={variant.unit}
                      onChange={(e) => updateVariant(index, 'unit', e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {variants.length === 0 && (
              <div className="p-4 border border-dashed rounded-md text-center text-gray-500 text-sm">
                Aucune variante ajoutée. Cliquez sur "Ajouter une variante" pour commencer.
              </div>
            )}
          </div>
        )}

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl>
                <Input 
                  placeholder="URL de l'image du produit" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {imagePreview && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Aperçu de l'image:</p>
            <div className="relative h-32 border rounded p-1 flex items-center justify-center">
              <img 
                src={imagePreview} 
                alt="Aperçu du produit" 
                className="h-full max-h-32 object-contain" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  document.getElementById('image-error')?.classList.remove('hidden');
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = 'block';
                  document.getElementById('image-error')?.classList.add('hidden');
                }}
              />
              <div id="image-error" className="hidden text-center text-gray-400">
                <ImageIcon size={32} className="mx-auto mb-2" />
                <p className="text-xs">Impossible de charger l'image</p>
              </div>
            </div>
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
