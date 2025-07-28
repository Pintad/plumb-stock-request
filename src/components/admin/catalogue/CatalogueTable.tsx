import React from 'react';
import { Edit2, Trash2, Package, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PasswordConfirmationDialog } from '@/components/ui/password-confirmation-dialog';

interface CatalogueVariant {
  id: string;
  variante?: string;
  reference?: string;
  unite?: string;
}

interface GroupedCatalogueItem {
  id: string;
  designation: string;
  categorie?: string;
  sur_categorie?: string;
  image_url?: string;
  keywords?: string;
  variants: CatalogueVariant[];
}

interface CatalogueTableProps {
  items: GroupedCatalogueItem[];
  loading: boolean;
  onEdit: (item: GroupedCatalogueItem) => void;
  onDelete: (id: string) => void;
}

export const CatalogueTable: React.FC<CatalogueTableProps> = ({
  items,
  loading,
  onEdit,
  onDelete
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());
  const [deleteItem, setDeleteItem] = React.useState<{id: string, name: string, type: 'item' | 'variant'} | null>(null);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleConfirmDelete = () => {
    if (deleteItem) {
      onDelete(deleteItem.id);
      setDeleteItem(null);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">Aucun article trouvé</h3>
        <p className="text-sm text-muted-foreground">
          Ajoutez votre premier article au catalogue
        </p>
      </div>
    );
  }

  const renderKeywords = (keywords?: string) => {
    if (!keywords) return null;
    
    const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1">
        {keywordList.slice(0, 3).map((keyword, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {keyword}
          </Badge>
        ))}
        {keywordList.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{keywordList.length - 3}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead>Mots-clés</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <TableRow>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={item.image_url} alt={item.designation} />
                    <AvatarFallback>
                      <Package className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {expandedItems.has(item.id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                      <div className="font-medium">{item.designation}</div>
                    </div>
                    <div className="text-sm text-muted-foreground ml-6">
                      {item.variants.length} variante{item.variants.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.sur_categorie && (
                      <Badge variant="outline" className="text-xs">
                        {item.sur_categorie}
                      </Badge>
                    )}
                    {item.categorie && (
                      <div className="text-sm text-muted-foreground">
                        {item.categorie}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {item.variants.slice(0, 2).map((variant, index) => (
                      <code key={index} className="text-sm bg-muted px-2 py-1 rounded block">
                        {variant.reference || 'N/A'}
                      </code>
                    ))}
                    {item.variants.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{item.variants.length - 2} autres...
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {[...new Set(item.variants.map(v => v.unite || 'U'))].map((unite, index) => (
                      <Badge key={index} variant="secondary">
                        {unite}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {renderKeywords(item.keywords)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setDeleteItem({id: item.id, name: item.designation, type: 'item'})}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              
              {/* Lignes des variantes si développé */}
              {expandedItems.has(item.id) && item.variants.map((variant) => (
                <TableRow key={variant.id} className="bg-muted/50">
                  <TableCell className="pl-8">
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                      <Package className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="pl-8">
                    <div className="text-sm">
                      {variant.variante || 'Variante standard'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">—</div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      {variant.reference || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {variant.unite || 'U'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">—</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit({...item, variants: [variant]})}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeleteItem({id: variant.id, name: variant.variante || 'Variante', type: 'variant'})}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      
      <PasswordConfirmationDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleConfirmDelete}
        title={deleteItem?.type === 'item' ? "Supprimer l'article" : "Supprimer la variante"}
        description={
          deleteItem?.type === 'item' 
            ? "Cette action supprimera l'article et toutes ses variantes. Cette action est irréversible."
            : "Cette action supprimera cette variante. Cette action est irréversible."
        }
        itemName={deleteItem?.name}
      />
    </div>
  );
};