import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type CartContextValue = { itemIds: string[]; addItem: (id: string) => void; removeItem: (id: string) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'artopia_art_bag_v1';

function readCart(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string'))] : [];
  } catch { return []; }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemIds, setItemIds] = useState<string[]>(readCart);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(itemIds)); }, [itemIds]);
  const addItem = useCallback((id: string) => setItemIds((items) => items.includes(id) ? items : [...items, id]), []);
  const removeItem = useCallback((id: string) => setItemIds((items) => items.filter((item) => item !== id)), []);
  const clear = useCallback(() => setItemIds([]), []);
  const value = useMemo(() => ({ itemIds, addItem, removeItem, clear }), [itemIds, addItem, removeItem, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
