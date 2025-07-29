
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false, requireSuperAdmin = false }) => {
  const { user, isAdmin, isSuperAdmin, session, isLoading } = useAppContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Ne pas rediriger immédiatement pendant le chargement
    if (isLoading) return;
    
    // Rediriger si aucun utilisateur n'est connecté
    if (!user || !session) {
      navigate('/login');
      return;
    }
    
    // Rediriger si un administrateur est requis mais que l'utilisateur n'en est pas un
    if (requireAdmin && !isAdmin && !isSuperAdmin) {
      navigate('/');
      return;
    }
    
    // Rediriger si un super-administrateur est requis mais que l'utilisateur n'en est pas un
    if (requireSuperAdmin && !isSuperAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, isSuperAdmin, session, navigate, requireAdmin, requireSuperAdmin, isLoading]);
  
  // Ne rien afficher pendant le chargement
  if (isLoading) return null;
  
  // Ne rien afficher si l'utilisateur n'est pas connecté
  if (!user || !session) return null;
  
  // Ne rien afficher si un administrateur est requis mais que l'utilisateur n'en est pas un
  if (requireAdmin && !isAdmin && !isSuperAdmin) return null;
  
  // Ne rien afficher si un super-administrateur est requis mais que l'utilisateur n'en est pas un
  if (requireSuperAdmin && !isSuperAdmin) return null;
  
  return <>{children}</>;
};

export default AuthGuard;
