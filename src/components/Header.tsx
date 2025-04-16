
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, LogOut, User, Package, LayoutDashboard, FileText } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const Header = () => {
  const { user, logout, cart, isAdmin } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) return null;
  
  const navItems = isAdmin 
    ? [
        { title: 'Tableau de bord', path: '/admin', icon: <LayoutDashboard className="mr-2" size={20} /> },
        { title: 'Demandes', path: '/admin/orders', icon: <FileText className="mr-2" size={20} /> },
        { title: 'Produits', path: '/admin/products', icon: <Package className="mr-2" size={20} /> },
      ]
    : [
        { title: 'Catalogue', path: '/', icon: <Package className="mr-2" size={20} /> },
        { title: 'Panier', path: '/cart', icon: <ShoppingCart className="mr-2" size={20} /> },
        { title: 'Mes Demandes', path: '/my-orders', icon: <FileText className="mr-2" size={20} /> },
      ];
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="flex items-center mb-6">
                    <User className="h-6 w-6 text-plumbing-blue mr-2" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{isAdmin ? 'Administrateur' : 'Ouvrier'}</p>
                    </div>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <nav className="space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setOpen(false)}
                        className={`flex items-center py-2 px-3 rounded-md w-full ${
                          location.pathname === item.path
                            ? "bg-plumbing-lightBlue text-plumbing-blue"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {item.icon}
                        {item.title}
                        {item.path === '/cart' && cartItemsCount > 0 && (
                          <Badge className="ml-auto bg-plumbing-blue">{cartItemsCount}</Badge>
                        )}
                      </Link>
                    ))}
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      variant="ghost" 
                      className="flex items-center w-full justify-start" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2" size={20} />
                      Déconnexion
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <Link to={isAdmin ? "/admin" : "/"} className="font-bold text-plumbing-blue text-xl flex items-center">
              PlumbStock
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-2 ${
                  location.pathname === item.path
                    ? "text-plumbing-blue font-medium"
                    : "text-gray-600 hover:text-plumbing-blue"
                }`}
              >
                {item.title}
                {item.path === '/cart' && cartItemsCount > 0 && (
                  <Badge className="ml-2 bg-plumbing-blue">{cartItemsCount}</Badge>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center">
            {!isAdmin && (
              <Link to="/cart" className="mr-4 lg:hidden relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-plumbing-blue">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            )}
            <div className="hidden lg:block">
              <Button variant="ghost" onClick={handleLogout} className="flex items-center">
                <LogOut className="mr-2" size={18} />
                Déconnexion
              </Button>
            </div>
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
