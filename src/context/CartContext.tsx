'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { CartItem, Product, ProductVariant } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'roxy_fashion_bag_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse cart storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to write cart storage:', e);
    }
  }, [items, isLoaded]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const addItem = (product: Product, variant?: ProductVariant | null, quantity = 1) => {
    const variantId = variant?.id || null;
    const cartItemId = `${product.id}-${variantId || 'simple'}`;
    const price = variant?.sale_price || variant?.regular_price || product.sale_price || product.regular_price;
    const regularPrice = variant?.regular_price || product.regular_price;
    const maxStock = variant ? variant.stock_quantity : product.stock_quantity;
    const image = variant?.image_url || product.main_image;

    const newItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      variantId,
      name: product.name_en,
      slug: product.slug,
      sku: variant?.sku || product.sku,
      price: Number(price),
      regularPrice: Number(regularPrice),
      quantity,
      maxStock: Number(maxStock),
      size: variant?.size_name,
      color: variant?.color_name_en,
      image,
    };

    setItems((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        const updatedQty = Math.min(existing.quantity + quantity, existing.maxStock || 99);
        return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: updatedQty } : i));
      }
      return [...prev, newItem];
    });

    setLastAddedItem(newItem);
    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const validQty = Math.min(quantity, i.maxStock || 99);
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
