
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAppContext();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleNavigateHome = () => {
    if (!user) {
      navigate("/login");
    } else if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-plumbing-blue">404</h1>
        <p className="text-xl text-gray-600 mb-6">Cette page n'existe pas</p>
        <Button 
          onClick={handleNavigateHome} 
          className="bg-plumbing-blue hover:bg-blue-600"
        >
          Revenir à l'accueil
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
