
import { Product } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const addProductToSupabase = async (product: Product): Promise<boolean> => {
  try {
    let categoryId = null;
    
    if (product.category) {
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('name', product.category)
        .maybeSingle();
      
      if (existingCategories) {
        categoryId = existingCategories.id;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({ name: product.category })
          .select()
          .single();
        
        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
      }
    }

    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        name: product.name,
        reference: product.reference,
        unit: product.unit,
        category_id: categoryId,
        image_url: product.imageUrl
      })
      .select()
      .single();
    
    if (productError) throw productError;
    
    if (product.variants && product.variants.length > 0) {
      const variantsToInsert = product.variants.map(variant => ({
        product_id: newProduct.id,
        variant_name: variant.variantName,
        reference: variant.reference,
        unit: variant.unit
      }));
      
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);
      
      if (variantError) throw variantError;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
    return false;
  }
};

export const updateProductInSupabase = async (product: Product): Promise<boolean> => {
  try {
    let categoryId = null;
    
    if (product.category) {
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .eq('name', product.category)
        .maybeSingle();
      
      if (existingCategories) {
        categoryId = existingCategories.id;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({ name: product.category })
          .select()
          .single();
        
        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
      }
    }

    const { error: productError } = await supabase
      .from('products')
      .update({
        name: product.name,
        reference: product.reference || null,
        unit: product.unit || null,
        category_id: categoryId,
        image_url: product.imageUrl || null
      })
      .eq('id', product.id);
    
    if (productError) throw productError;

    if (product.variants && product.variants.length > 0) {
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', product.id);
      
      const variantsToInsert = product.variants.map(variant => ({
        product_id: product.id,
        variant_name: variant.variantName,
        reference: variant.reference,
        unit: variant.unit
      }));
      
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert);
      
      if (variantError) throw variantError;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return false;
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  try {
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);
    
    if (variantError) {
      console.error("Erreur lors de la suppression des variantes:", variantError);
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return false;
  }
};
