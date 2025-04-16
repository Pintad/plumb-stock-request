
import { Product, CartItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const addToCart = (
  cart: CartItem[], 
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  product: Product, 
  quantity: number
) => {
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    updateCartItemQuantity(cart, setCart, product.id, existingItem.quantity + quantity);
  } else {
    setCart([...cart, { ...product, quantity }]);
  }
  
  toast({
    title: "Produit ajouté",
    description: `${quantity} ${product.name} ajouté au panier`,
  });
};

export const removeFromCart = (
  cart: CartItem[], 
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  productId: string
) => {
  setCart(cart.filter(item => item.id !== productId));
};

export const updateCartItemQuantity = (
  cart: CartItem[], 
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  productId: string, 
  quantity: number
) => {
  if (quantity <= 0) {
    removeFromCart(cart, setCart, productId);
    return;
  }
  
  setCart(
    cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    )
  );
};

export const clearCart = (
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
) => {
  setCart([]);
};
