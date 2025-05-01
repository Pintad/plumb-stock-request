
import { Product, CartItem } from '../types';
import { toast } from '@/components/ui/use-toast';

export const addToCart = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  product: Product,
  quantity: number
) => {
  // Vérifier si le produit est déjà dans le panier
  // Pour les produits avec variantes, on vérifie aussi l'ID de variante
  const existingItemIndex = cart.findIndex(item => 
    item.id === product.id && 
    (
      (!item.selectedVariantId && !product.selectedVariantId) ||
      (item.selectedVariantId === product.selectedVariantId)
    )
  );

  if (existingItemIndex !== -1) {
    // Mise à jour de la quantité si le produit existe déjà
    const updatedCart = [...cart];
    updatedCart[existingItemIndex].quantity += quantity;
    setCart(updatedCart);
  } else {
    // Create a unique compound ID for the cart item that includes variant information
    const cartItemId = product.selectedVariantId 
      ? `${product.id}-${product.selectedVariantId}`
      : product.id;
      
    // Ajout d'un nouveau produit au panier
    const newItem: CartItem = {
      ...product,
      cartItemId,
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

export const removeFromCart = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  cartItemId: string
) => {
  setCart(cart.filter(item => item.cartItemId !== cartItemId));
};

export const updateCartItemQuantity = (
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  cartItemId: string,
  quantity: number
) => {
  if (quantity <= 0) {
    removeFromCart(cart, setCart, cartItemId);
    return;
  }

  const updatedCart = cart.map(item =>
    item.cartItemId === cartItemId ? { ...item, quantity } : item
  );
  setCart(updatedCart);
};

export const clearCart = (
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
) => {
  setCart([]);
};
