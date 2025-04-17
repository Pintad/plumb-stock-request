
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { parseCSV, showImportSuccess, showImportError } from './csvUtils';

/**
 * Load projects from CSV content and store them in Supabase
 */
export const loadProjectsFromCSV = async (
  csvContent: string,
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
) => {
  try {
    const { headers, lines } = parseCSV(csvContent);
    
    const codeIndex = headers.findIndex(h => h === 'code');
    const nameIndex = headers.findIndex(h => h === 'nom' || h === 'name');
    
    if (codeIndex === -1 || nameIndex === -1) {
      throw new Error("Format CSV invalide: colonnes manquantes (code, nom)");
    }
    
    const projectsToInsert = parseProjectsFromCSV(lines, codeIndex, nameIndex);
    const newProjects = await insertProjectsIntoSupabase(projectsToInsert);
    
    if (newProjects.length === 0) {
      throw new Error("Aucune affaire valide n'a pu être importée");
    }
    
    setProjects(prev => [...prev, ...newProjects]);
    showImportSuccess(newProjects.length, "affaires");
    
  } catch (error) {
    showImportError(error);
  }
};

/**
 * Parse projects from CSV lines
 */
const parseProjectsFromCSV = (
  lines: string[],
  codeIndex: number,
  nameIndex: number
) => {
  const projectsToInsert: { code: string; name: string }[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    
    if (values.length >= Math.max(codeIndex, nameIndex) + 1) {
      const projectCode = values[codeIndex];
      const projectName = values[nameIndex];
      
      projectsToInsert.push({
        code: projectCode,
        name: projectName
      });
    }
  }
  
  return projectsToInsert;
};

/**
 * Insert projects into Supabase database
 */
const insertProjectsIntoSupabase = async (
  projectsToInsert: { code: string; name: string }[]
) => {
  const newProjects: Project[] = [];
  
  if (projectsToInsert.length > 0) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(projectsToInsert)
        .select();
      
      if (error) {
        console.error("Erreur lors de l'insertion des projets:", error);
        throw new Error(`Erreur lors de l'insertion des projets: ${error.message}`);
      }
      
      if (data) {
        for (const project of data) {
          newProjects.push({
            id: project.id,
            code: project.code,
            name: project.name
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'insertion des projets:", error);
      throw error;
    }
  }
  
  return newProjects;
};
