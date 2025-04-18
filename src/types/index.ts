
export interface ProductVariant {
  id: string;
  variantName: string;
  reference: string;
  unit: string;
}

export interface Product {
  id: string;
  name: string;
  reference?: string;
  unit?: string;
  imageUrl?: string;
  category?: string;
  variants?: ProductVariant[];
  selectedVariantId?: string;
}

export interface CartItem extends Product {
  quantity: number;
  completed?: boolean;
  selectedVariantId?: string;
}

export interface Order {
  // Supabase fields (as they are in the DB)
  commandeid: string;
  clientname: string;
  datecommande: string | null;
  articles: CartItem[];
  termine: string;
  messagefournisseur: string | null;
  
  // Frontend fields for UI rendering
  archived?: boolean;
  projectCode?: string;
  status?: 'pending' | 'processed' | 'completed';
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'worker' | 'admin';
}

export interface Project {
  id: string;
  code: string;
  name: string;
}

export interface CatalogueItem {
  id: string;
  designation: string;
  reference?: string;
  unite?: string;
  categorie?: string;
  image_url?: string;
  variante?: string;
}
