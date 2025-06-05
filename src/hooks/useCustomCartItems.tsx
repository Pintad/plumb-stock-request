
import { useState, useEffect } from 'react';

export interface CustomCartItem {
  id: string;
  text: string;
  quantity: number;
  isCustom: true;
}

export const useCustomCartItems = () => {
  const [customItems, setCustomItems] = useState<CustomCartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('customCartItems');
    if (saved) {
      setCustomItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('customCartItems', JSON.stringify(customItems));
  }, [customItems]);

  const addCustomItem = (text: string, quantity: number = 1) => {
    if (!text.trim()) return;

    const newItem: CustomCartItem = {
      id: `custom-${Date.now()}-${Math.random()}`,
      text: text.trim(),
      quantity,
      isCustom: true
    };

    setCustomItems(prev => [...prev, newItem]);
  };

  const removeCustomItem = (id: string) => {
    setCustomItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCustomItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeCustomItem(id);
      return;
    }

    setCustomItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCustomItems = () => {
    setCustomItems([]);
  };

  return {
    customItems,
    addCustomItem,
    removeCustomItem,
    updateCustomItemQuantity,
    clearCustomItems
  };
};
