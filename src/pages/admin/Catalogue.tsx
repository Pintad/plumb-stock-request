import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogueTable } from '@/components/admin/catalogue/CatalogueTable';
import { CatalogueFilters } from '@/components/admin/catalogue/CatalogueFilters';
import { CataloguePagination } from '@/components/admin/catalogue/CataloguePagination';
import { AddCatalogueForm } from '@/components/admin/catalogue/AddCatalogueForm';
import { CatalogueEditPanel } from '@/components/admin/catalogue/CatalogueEditPanel';
import { useCatalogueManagement } from '@/hooks/useCatalogueManagement';
import { useIsMobile } from '@/hooks/use-mobile';

const Catalogue: React.FC = () => {
  const isMobile = useIsMobile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const {
    catalogueItems,
    filteredItems,
    loading,
    filters,
    setFilters,
    currentPage,
    totalPages,
    handlePageChange,
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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      
      <main className={`flex-1 container ${isMobile ? 'px-2 py-3' : 'px-4 py-6'}`}>
        <div className={`flex justify-between items-center ${isMobile ? 'mb-3' : 'mb-6'}`}>
          <div>
            <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
              Gestion du Catalogue
            </h1>
            <p className="text-muted-foreground">
              Gérez vos articles, catégories et références
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isMobile ? 'Ajouter' : 'Nouvel Article'}
          </Button>
        </div>

        <CatalogueFilters filters={filters} onFiltersChange={setFilters} />

        <Card className="mt-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Articles du Catalogue</CardTitle>
              <div className="text-sm text-muted-foreground">
                {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''}
                {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CatalogueTable
              items={catalogueItems}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            
            <CataloguePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
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
      </main>
    </div>
  );
};

export default Catalogue;