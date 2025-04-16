
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { user, isAdmin } = useAppContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (requireAdmin && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate, requireAdmin]);
  
  if (!user) return null;
  if (requireAdmin && !isAdmin) return null;
  
  return <>{children}</>;
};

export default AuthGuard;
