
import { Project } from '../../types';
import { parseCSV, showImportSuccess, showImportError } from './csvUtils';

/**
 * Load projects from CSV content and store them locally
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
    
    // Generate locally stored projects
    const newProjects: Project[] = [];
    
    for (const projectData of projectsToInsert) {
      const newProject = {
        id: `project-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        code: projectData.code,
        name: projectData.name
      };
      
      newProjects.push(newProject);
      // Add each project individually using the addProject function
      addProject(newProject);
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
