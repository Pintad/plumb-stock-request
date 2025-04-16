
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import AuthGuard from "@/components/AuthGuard";

// Pages
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Route publique */}
            <Route path="/login" element={<Login />} />
            
            {/* Routes pour les ouvriers */}
            <Route path="/" element={<AuthGuard><Catalog /></AuthGuard>} />
            <Route path="/cart" element={<AuthGuard><Cart /></AuthGuard>} />
            <Route path="/my-orders" element={<AuthGuard><MyOrders /></AuthGuard>} />
            
            {/* Routes pour les administrateurs */}
            <Route path="/admin" element={<AuthGuard requireAdmin><Dashboard /></AuthGuard>} />
            <Route path="/admin/orders" element={<AuthGuard requireAdmin><AdminOrders /></AuthGuard>} />
            <Route path="/admin/products" element={<AuthGuard requireAdmin><AdminProducts /></AuthGuard>} />
            
            {/* Redirection index */}
            <Route path="/index" element={<Navigate to="/" replace />} />
            
            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
