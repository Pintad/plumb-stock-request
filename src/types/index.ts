export interface ProductVariant {
  id: string;
  variantName: string;
  reference: string;
  unit: string;
  stock?: number; // Adding stock property
}

export interface Product {
  id: string;
  name: string;
  reference?: string;
  unit?: string;
  imageUrl?: string;
  category?: string;
  superCategory?: string; // Nouvelle propriété pour la sur-catégorie
  keywords?: string; // Nouvelle propriété pour les mots-clés
  variants?: ProductVariant[];
  selectedVariantId?: string;
  stock?: number; // Adding stock property
}

export interface CartItem extends Product {
  quantity: number;
  completed?: boolean;
  selectedVariantId?: string;
  cartItemId?: string; // Added unique cart item identifier
}

export interface Order {
  // Supabase fields (as they are in the DB)
  commandeid: string;
  clientname: string;
  datecommande: string | null;
  articles: CartItem[];
  termine: string;
  messagefournisseur: string | null;
  affaire_id?: string;
  titre_affichage: string;   // Correctly typed as non-optional string
  date_mise_a_disposition?: string | null; // Nouvelle date souhaitée

  // Frontend fields for UI rendering
  archived?: boolean;
  projectCode?: string; // store affaire code here for filtering convenience
  status?: 'pending' | 'processed' | 'completed';
  
  // Nouveaux champs pour l'affichage
  displayTitle: string;   // Will use titre_affichage
  projectName?: string;
  orderNumber?: number;
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
  created_at?: string;
}

export interface CatalogueItem {
  id: string;
  designation: string;
  reference?: string;
  unite?: string;
  categorie?: string;
  sur_categorie?: string; // Nouvelle propriété
  image_url?: string;
  variante?: string;
  keywords?: string; // Nouvelle propriété pour les mots-clés
}

// Nouvelles interfaces pour la structure hiérarchique
export interface SuperCategory {
  name: string;
  categories: string[];
  productCount: number;
}

export interface CategoryHierarchy {
  superCategories: SuperCategory[];
  uncategorizedCategories: string[];
}
