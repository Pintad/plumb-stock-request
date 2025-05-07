
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { ShoppingCart, ClipboardList, ListChecks, LayoutDashboard, LogOut, Tag, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Header = () => {
  const { user, logout, cart, isAdmin } = useAppContext();
  const location = useLocation();
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/c40b3b5e-ab31-4815-a5c0-845fdff4a728.png" 
              alt="Pintade Logo" 
              className="h-10 w-auto" 
              loading="eager" 
            />
            <span className="ml-2 text-xl font-bold">Pintade</span>
          </Link>
          
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                }`}
              >
                Catalogue
              </Link>
              <Link 
                to="/my-orders" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/my-orders' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                }`}
              >
                Mes demandes
              </Link>
              {isAdmin && (
                <>
                  <Link 
                    to="/admin" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') && location.pathname === '/admin' 
                        ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/orders" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/admin/orders' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                    }`}
                  >
                    Commandes
                  </Link>
                  <Link 
                    to="/admin/products" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/admin/products' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                    }`}
                  >
                    Produits
                  </Link>
                  <Link 
                    to="/admin/categories" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/admin/categories' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                    }`}
                  >
                    Catégories
                  </Link>
                  <Link 
                    to="/admin/projects" 
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/admin/projects' ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
                    }`}
                  >
                    Affaires
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user && !isAdmin && (
            <Link to="/cart" className="relative">
              <Button variant="outline" size="icon" className="rounded-full border-amber-300 hover:bg-amber-50">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
              </Button>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-amber-100 text-gray-800">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role === 'admin' ? 'Administrateur' : 'Ouvrier'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Menu mobile */}
                <div className="md:hidden">
                  <DropdownMenuItem asChild>
                    <Link to="/" className="flex cursor-pointer items-center">
                      <img 
                        src="/lovable-uploads/c40b3b5e-ab31-4815-a5c0-845fdff4a728.png" 
                        alt="Pintade Icon" 
                        className="mr-2 h-4 w-4" 
                      />
                      <span>Catalogue</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders" className="flex cursor-pointer items-center">
                      <ListChecks className="mr-2 h-4 w-4" />
                      <span>Mes demandes</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex cursor-pointer items-center">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/orders" className="flex cursor-pointer items-center">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          <span>Commandes</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/products" className="flex cursor-pointer items-center">
                          <img 
                            src="/lovable-uploads/c40b3b5e-ab31-4815-a5c0-845fdff4a728.png" 
                            alt="Pintade Icon" 
                            className="mr-2 h-4 w-4" 
                          />
                          <span>Produits</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/categories" className="flex cursor-pointer items-center">
                          <Tag className="mr-2 h-4 w-4" />
                          <span>Catégories</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/projects" className="flex cursor-pointer items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Affaires</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                </div>
                
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
