import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface CatalogueEditPanelProps {
  item: GroupedCatalogueItem;
  onSave: (data: any) => void;
  onCancel: () => void;
  isNewItem?: boolean;
}

export const CatalogueEditPanel: React.FC<CatalogueEditPanelProps> = ({
  item,
  onSave,
  onCancel,
  isNewItem = false
}) => {
  const [formData, setFormData] = useState({
    designation: '',
    categorie: '',
    sur_categorie: '',
    image_url: '',
    keywords: ''
  });

  const [variants, setVariants] = useState<CatalogueVariant[]>([]);
  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        designation: item.designation || '',
        categorie: item.categorie || '',
        sur_categorie: item.sur_categorie || '',
        image_url: item.image_url || '',
        keywords: item.keywords || ''
      });

      setVariants(item.variants || []);

      if (item.keywords) {
        setKeywordsList(item.keywords.split(',').map((k: string) => k.trim()).filter(Boolean));
      }
    }
  }, [item]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywordsList.includes(newKeyword.trim())) {
      setKeywordsList(prev => [...prev, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywordsList(prev => prev.filter(k => k !== keyword));
  };

  const addVariant = () => {
    const newVariant = {
      id: `temp-${Date.now()}`,
      variante: '',
      reference: '',
      unite: 'U'
    };
    setVariants(prev => [...prev, newVariant]);
  };

  const updateVariant = (index: number, field: keyof CatalogueVariant, value: string) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const finalData = {
      ...formData,
      keywords: keywordsList.join(', '),
      variants: variants
    };
    onSave(finalData);
  };

  const unites = ['U', 'ML', 'L', 'KG', 'G', 'Carton', 'Pack', 'Boîte', 'Pièce'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isNewItem ? 'Ajouter un nouvel article' : 'Modifier l\'article'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Image du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={formData.image_url} alt="Produit" />
                  <AvatarFallback>IMG</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="image_url">URL de l'image</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

           {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informations principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Nom du produit"
                />
              </div>
            </CardContent>
          </Card>

          {/* Variantes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Variantes</CardTitle>
                <Button onClick={addVariant} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une variante
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variante {index + 1}</span>
                    {variants.length > 1 && (
                      <Button
                        onClick={() => removeVariant(index)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nom de la variante</Label>
                      <Input
                        value={variant.variante || ''}
                        onChange={(e) => updateVariant(index, 'variante', e.target.value)}
                        placeholder="Couleur, taille..."
                      />
                    </div>

                    <div>
                      <Label>Référence</Label>
                      <Input
                        value={variant.reference || ''}
                        onChange={(e) => updateVariant(index, 'reference', e.target.value)}
                        placeholder="REF-001"
                      />
                    </div>

                    <div>
                      <Label>Unité</Label>
                      <Select
                        value={variant.unite || 'U'}
                        onValueChange={(value) => updateVariant(index, 'unite', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Unité" />
                        </SelectTrigger>
                        <SelectContent>
                          {unites.map((unite) => (
                            <SelectItem key={unite} value={unite}>
                              {unite}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Catégories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Catégories</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sur_categorie">Sur-catégorie</Label>
                <Input
                  id="sur_categorie"
                  value={formData.sur_categorie}
                  onChange={(e) => handleInputChange('sur_categorie', e.target.value)}
                  placeholder="Catégorie principale"
                />
              </div>

              <div>
                <Label htmlFor="categorie">Catégorie</Label>
                <Input
                  id="categorie"
                  value={formData.categorie}
                  onChange={(e) => handleInputChange('categorie', e.target.value)}
                  placeholder="Sous-catégorie"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mots-clés */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Mots-clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Ajouter un mot-clé"
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {keywordsList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywordsList.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {isNewItem ? 'Ajouter' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
};