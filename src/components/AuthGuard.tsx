
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Spinner } from './ui/spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAppContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
      return;
    }
    
    if (!loading && requireAdmin && !isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate, requireAdmin, loading]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!user) return null;
  if (requireAdmin && !isAdmin) return null;
  
  return <>{children}</>;
};

export default AuthGuard;
