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

interface CatalogueEditPanelProps {
  item: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const CatalogueEditPanel: React.FC<CatalogueEditPanelProps> = ({
  item,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    designation: '',
    categorie: '',
    sur_categorie: '',
    variante: '',
    reference: '',
    unite: '',
    image_url: '',
    keywords: ''
  });

  const [keywordsList, setKeywordsList] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        designation: item.designation || '',
        categorie: item.categorie || '',
        sur_categorie: item.sur_categorie || '',
        variante: item.variante || '',
        reference: item.reference || '',
        unite: item.unite || '',
        image_url: item.image_url || '',
        keywords: item.keywords || ''
      });

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

  const handleSave = () => {
    const finalData = {
      ...formData,
      keywords: keywordsList.join(', ')
    };
    onSave(finalData);
  };

  const unites = ['U', 'ML', 'L', 'KG', 'G', 'Carton', 'Pack', 'Boîte', 'Pièce'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Modifier l'article</h2>
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
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="designation">Désignation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Nom du produit"
                />
              </div>

              <div>
                <Label htmlFor="variante">Variante</Label>
                <Input
                  id="variante"
                  value={formData.variante}
                  onChange={(e) => handleInputChange('variante', e.target.value)}
                  placeholder="Couleur, taille..."
                />
              </div>

              <div>
                <Label htmlFor="reference">Référence</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleInputChange('reference', e.target.value)}
                  placeholder="REF-001"
                />
              </div>

              <div>
                <Label htmlFor="unite">Unité</Label>
                <Select
                  value={formData.unite}
                  onValueChange={(value) => handleInputChange('unite', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une unité" />
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
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};