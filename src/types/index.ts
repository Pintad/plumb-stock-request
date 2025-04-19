
export interface Order {
  // Supabase fields (as they are in the DB)
  commandeid: string;
  clientname: string;
  datecommande: string | null;
  articles: CartItem[];
  terme: string;
  messagefournisseur: string | null;

  // Frontend fields for UI rendering
  archived?: boolean;
  archiveclient?: boolean; // added the property here with correct casing
  projectCode?: string;
  status?: 'pending' | 'processed' | 'completed';
}
