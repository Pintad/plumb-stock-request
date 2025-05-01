import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
const Login = () => {
  const {
    login,
    isAdmin,
    user,
    session,
    isLoading
  } = useAppContext();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!isLoading && user && session) {
      navigate(isAdmin ? '/admin' : '/');
    }
  }, [user, session, isAdmin, navigate, isLoading]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await login(username, password);
      if (success) {
        // Redirection sera gérée par l'effet ci-dessus
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Identifiants incorrects"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Une erreur est survenue lors de la tentative de connexion"
      });
      console.error("Erreur de connexion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si la page est en cours de chargement (vérification de session)
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plumbing-blue"></div>
      </div>;
  }

  // Si l'utilisateur est déjà connecté, ne pas afficher le formulaire de connexion
  if (user && session) {
    return null; // L'effet s'occupera de la redirection
  }
  return <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-plumbing-blue">Pintade</CardTitle>
          <CardDescription>
            Application de gestion de stock pour plomberie et chauffage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Identifiant</Label>
              <Input id="username" type="text" placeholder="Votre identifiant" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" placeholder="Votre mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-plumbing-blue hover:bg-blue-600" disabled={isSubmitting}>
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default Login;
