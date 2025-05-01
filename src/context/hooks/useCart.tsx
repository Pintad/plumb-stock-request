
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
      // Create a unique compound ID for the cart item that includes variant information
      const cartItemId = product.selectedVariantId 
        ? `${product.id}-${product.selectedVariantId}`
        : product.id;
        
      const newItem: CartItem = {
        ...product,
        cartItemId, // Add a unique ID specifically for cart operations
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

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
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
