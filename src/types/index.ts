
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
  commandeid: number;
  clientname: string | null;
  datecommande: string | null;
  produit: string | null;
  reference: string | null;
  quantite: number | null;
  termine: string | null;
  messagefournisseur: string | null;
  
  // Frontend application fields (derived/mapped from DB)
  id?: string;
  userId?: string;
  userName?: string;
  date?: string;
  items?: CartItem[];
  status?: 'pending' | 'processed' | 'completed';
  projectCode?: string;
  archived?: boolean;
  message?: string;
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
