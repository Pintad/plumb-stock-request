
import { Project } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { parseCSV, showImportSuccess, showImportError } from './csvUtils';

/**
 * Load projects from CSV content and store them in Supabase
 */
export const loadProjectsFromCSV = async (
  csvContent: string,
  addProject: (project: Project) => void
) => {
  try {
    const { headers, lines } = parseCSV(csvContent);
    
    const codeIndex = headers.findIndex(h => h === 'code');
    const nameIndex = headers.findIndex(h => h === 'nom' || h === 'name');
    
    if (codeIndex === -1 || nameIndex === -1) {
      console.error("Headers:", headers);
      throw new Error("Format CSV invalide: colonnes manquantes ('code', 'nom'). Colonnes trouvées: " + headers.join(', '));
    }
    
    const projectsToInsert = parseProjectsFromCSV(lines, codeIndex, nameIndex);
    
    if (projectsToInsert.length === 0) {
      throw new Error("Aucune affaire valide n'a pu être extraite du fichier CSV");
    }
    
    const newProjects = await insertProjectsIntoSupabase(projectsToInsert);
    
    if (newProjects.length === 0) {
      throw new Error("Aucune affaire valide n'a pu être importée");
    }
    
    // Add each project individually using the addProject function
    newProjects.forEach(project => {
      addProject(project);
    });
    
    // Synchroniser avec la base de données pour s'assurer que tous les projets sont à jour
    const { data: allProjects, error: fetchError } = await supabase
      .from('projects')
      .select('*');
    
    if (fetchError) {
      console.error("Erreur lors de la récupération des projets:", fetchError);
    }
    
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
  
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(value => value.trim());
    
    if (values.length >= Math.max(codeIndex, nameIndex) + 1) {
      const projectCode = values[codeIndex];
      const projectName = values[nameIndex];
      
      if (projectCode && projectName) {
        projectsToInsert.push({
          code: projectCode,
          name: projectName
        });
      }
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
