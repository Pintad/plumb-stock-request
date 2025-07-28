import React, { useState } from 'react';
import { Project } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectEditDialogProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

const ProjectEditDialog = ({ project, isOpen, onClose, onSave }: ProjectEditDialogProps) => {
  const [formData, setFormData] = useState({ code: '', name: '' });

  React.useEffect(() => {
    if (project) {
      setFormData({ code: project.code, name: project.name });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project && formData.code.trim() && formData.name.trim()) {
      onSave({
        ...project,
        code: formData.code.trim(),
        name: formData.name.trim(),
      });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ code: '', name: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'affaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code de l'affaire</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="Ex: C250011"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'affaire</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: RESTRUCTURATION ENERGETIQUE - MAIRIE DE HERBIGNAC"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit">
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectEditDialog;