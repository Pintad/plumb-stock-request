
import { useState, useEffect } from 'react';
import { CartItem, Product } from '../../types';
import { toast } from '@/components/ui/use-toast';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number) => {
    const existingItemIndex = cart.findIndex(item => 
      item.id === product.id && 
      (
        (!item.selectedVariantId && !product.selectedVariantId) ||
        (item.selectedVariantId === product.selectedVariantId)
      )
    );

    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        ...product,
        quantity,
        completed: false
      };
      setCart([...cart, newItem]);
    }

    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} × ${product.name}${product.selectedVariantId ? ` (${product.variants?.find(v => v.id === product.selectedVariantId)?.variantName})` : ''}`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
  };
};
