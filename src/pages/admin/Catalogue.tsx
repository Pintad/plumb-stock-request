import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogueTable } from '@/components/admin/catalogue/CatalogueTable';
import { CatalogueFilters } from '@/components/admin/catalogue/CatalogueFilters';
import { AddCatalogueForm } from '@/components/admin/catalogue/AddCatalogueForm';
import { CatalogueEditPanel } from '@/components/admin/catalogue/CatalogueEditPanel';
import { useCatalogueManagement } from '@/hooks/useCatalogueManagement';

const Catalogue: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const {
    catalogueItems,
    loading,
    filters,
    setFilters,
    addItem,
    updateItem,
    deleteItem,
    refreshItems
  } = useCatalogueManagement();

  const handleEdit = (item: any) => {
    setEditingItem(item);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
  };

  const handleSave = async (data: any) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
      setEditingItem(null);
    } else {
      await addItem(data);
      setShowAddForm(false);
    }
    refreshItems();
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    refreshItems();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Catalogue</h1>
          <p className="text-muted-foreground">
            Gérez vos articles, catégories et références
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvel Article
        </Button>
      </div>

      <CatalogueFilters filters={filters} onFiltersChange={setFilters} />

      <Card>
        <CardHeader>
          <CardTitle>Articles du Catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          <CatalogueTable
            items={catalogueItems}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {showAddForm && (
        <AddCatalogueForm
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingItem && (
        <CatalogueEditPanel
          item={editingItem}
          onSave={handleSave}
          onCancel={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default Catalogue;