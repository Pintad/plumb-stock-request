import React, { useState } from 'react';
import { Plus, Download, Trash2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogueTable } from '@/components/admin/catalogue/CatalogueTable';
import { CatalogueFilters } from '@/components/admin/catalogue/CatalogueFilters';
import { CataloguePagination } from '@/components/admin/catalogue/CataloguePagination';
import { CatalogueImportExport } from '@/components/admin/catalogue/CatalogueImportExport';
import { CatalogueEditPanel } from '@/components/admin/catalogue/CatalogueEditPanel';
import { PasswordConfirmationDialog } from '@/components/ui/password-confirmation-dialog';
import { useCatalogueManagement } from '@/hooks/useCatalogueManagement';
import { useCatalogueOperations } from '@/hooks/useCatalogueOperations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/hooks/useAuth';
import { exportDataToExcel } from '@/lib/utils/excelUtils';
const Catalogue: React.FC = () => {
  const isMobile = useIsMobile();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const {
    user
  } = useAuth();
  const {
    catalogueItems,
    filteredItems,
    loading,
    filters,
    setFilters,
    currentPage,
    totalPages,
    handlePageChange,
    refreshItems
  } = useCatalogueManagement();
  const {
    addCatalogueItem,
    updateCatalogueItem,
    deleteCatalogueItem,
    deleteVariant,
    deleteAllCatalogueItems
  } = useCatalogueOperations();
  const handleEdit = (item: any) => {
    setEditingItem(item);
  };
  const handleCloseEdit = () => {
    setEditingItem(null);
  };
  const handleSave = async (data: any) => {
    if (editingItem) {
      await updateCatalogueItem(editingItem, data);
      setEditingItem(null);
    } else {
      await addCatalogueItem(data);
      setShowAddForm(false);
    }
    refreshItems();
  };
  const handleDelete = async (id: string) => {
    // Trouver l'item complet pour la suppression
    const itemToDelete = catalogueItems.find(item => item.id === id);
    if (itemToDelete) {
      await deleteCatalogueItem(itemToDelete);
    }
    refreshItems();
  };
  const handleExportCatalogue = async () => {
    try {
      const exportData = catalogueItems.map(item => ({
        designation: item.designation,
        categorie: item.categorie || '',
        sur_categorie: item.sur_categorie || '',
        variantes: item.variants.map(v => v.variante).join(', '),
        references: item.variants.map(v => v.reference).join(', '),
        unites: item.variants.map(v => v.unite).join(', '),
        keywords: item.keywords || '',
        image_url: item.image_url || ''
      }));
      const columns = [{
        header: 'Désignation',
        key: 'designation',
        width: 30
      }, {
        header: 'Catégorie',
        key: 'categorie',
        width: 20
      }, {
        header: 'Sur-catégorie',
        key: 'sur_categorie',
        width: 20
      }, {
        header: 'Variantes',
        key: 'variantes',
        width: 25
      }, {
        header: 'Références',
        key: 'references',
        width: 25
      }, {
        header: 'Unités',
        key: 'unites',
        width: 15
      }, {
        header: 'Mots-clés',
        key: 'keywords',
        width: 25
      }, {
        header: 'Image URL',
        key: 'image_url',
        width: 30
      }];
      await exportDataToExcel(exportData, columns, `catalogue-complet-${new Date().toISOString().split('T')[0]}`, 'Catalogue');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };
  const handleDeleteAllCatalogue = async () => {
    const success = await deleteAllCatalogueItems();
    if (success) {
      refreshItems();
    }
  };
  const isSuperAdmin = user?.role === 'superadmin';
  return <div className="min-h-screen flex flex-col bg-gray-100">
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
          <div className="flex items-center gap-2">
            <CatalogueImportExport onImportComplete={refreshItems} />
            {isSuperAdmin}
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isMobile ? 'Ajouter' : 'Nouvel Article'}
            </Button>
          </div>
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
            <CatalogueTable items={catalogueItems} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
            
            <CataloguePagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </CardContent>
        </Card>

        {showAddForm && <CatalogueEditPanel item={{
        id: '',
        designation: '',
        categorie: '',
        sur_categorie: 'RACCORD',
        image_url: '',
        keywords: '',
        variants: [{
          id: '',
          variante: '',
          reference: '',
          unite: 'U'
        }]
      }} onSave={handleSave} onCancel={() => setShowAddForm(false)} isNewItem={true} />}

        {editingItem && <CatalogueEditPanel item={editingItem} onSave={handleSave} onCancel={handleCloseEdit} />}

        {/* Zone de danger - Supprimer tout le catalogue */}
        {isSuperAdmin && <Card className="mt-8 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">⚠️</CardTitle>
              <p className="text-sm text-muted-foreground">
                Actions irréversibles qui affectent l'ensemble du catalogue
              </p>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowDeleteAllDialog(true)} variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Supprimer tout le catalogue
              </Button>
            </CardContent>
          </Card>}

        <PasswordConfirmationDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog} onConfirm={handleDeleteAllCatalogue} title="Supprimer tout le catalogue" description="Cette action est irréversible. Tous les articles du catalogue seront définitivement supprimés. Nous vous recommandons de télécharger le catalogue avant de procéder à la suppression." itemName="le catalogue complet" />
      </main>
    </div>;
};
export default Catalogue;