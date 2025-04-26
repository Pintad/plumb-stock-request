
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddProjectFormProps {
  newProject: { code: string; name: string };
  onProjectChange: (project: { code: string; name: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const AddProjectForm = ({ newProject, onProjectChange, onSubmit, onCancel }: AddProjectFormProps) => {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium mb-4">Ajouter une nouvelle affaire</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <Input 
            value={newProject.code} 
            onChange={(e) => onProjectChange({...newProject, code: e.target.value})}
            placeholder="Code de l'affaire"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <Input 
            value={newProject.name} 
            onChange={(e) => onProjectChange({...newProject, name: e.target.value})}
            placeholder="Nom de l'affaire"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onSubmit}>
          Ajouter
        </Button>
      </div>
    </div>
  );
};

export default AddProjectForm;
