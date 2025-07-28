import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CatalogueItem {
  id: string;
  designation: string;
  categorie?: string;
  sur_categorie?: string;
  variante?: string;
  reference?: string;
  unite?: string;
  image_url?: string;
  keywords?: string;
}

interface CatalogueTableProps {
  items: CatalogueItem[];
  loading: boolean;
  onEdit: (item: CatalogueItem) => void;
  onDelete: (id: string) => void;
}

export const CatalogueTable: React.FC<CatalogueTableProps> = ({
  items,
  loading,
  onEdit,
  onDelete
}) => {
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
            <TableRow key={item.id}>
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
                  <div className="font-medium">{item.designation}</div>
                  {item.variante && (
                    <div className="text-sm text-muted-foreground">
                      Variante: {item.variante}
                    </div>
                  )}
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
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {item.reference || 'N/A'}
                </code>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {item.unite || 'U'}
                </Badge>
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer "{item.designation}" ?
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(item.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};