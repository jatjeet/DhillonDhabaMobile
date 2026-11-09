import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  CartItemResponseDto,
  MenuItemSummaryDto,
  VariantDto,
  AddonOptionDto,
  CartSummaryDto,
} from '../types';
import { cartApi } from '../api/cartApi';
import { getStoredTokens, getDemoMode } from '../api/client';

interface CartContextType {
  items: CartItemResponseDto[];
  itemCount: number;
  itemTotal: number;
  deliveryFee: number;
  packagingFee: number;
  discountAmount: number;
  taxes: number;
  totalAmount: number;
  appliedCoupon: string | null;
  orderType: 'delivery' | 'pickup';
  specialInstructions: string;
  setOrderType: (type: 'delivery' | 'pickup') => void;
  setSpecialInstructions: (note: string) => void;
  addItem: (
    item: MenuItemSummaryDto,
    variant?: VariantDto | null,
    selectedAddons?: AddonOptionDto[],
    note?: string
  ) => Promise<void> | void;
  updateQuantity: (cartItemId: number, delta: number) => Promise<void> | void;
  removeItem: (cartItemId: number) => Promise<void> | void;
  applyCouponCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCouponCode: () => void;
  clearCart: () => Promise<void> | void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemResponseDto[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [serverSummary, setServerSummary] = useState<CartSummaryDto | null>(null);

  // Sync cart with backend on startup if user is authenticated
  useEffect(() => {
    syncCartWithBackend();
  }, []);

  const syncCartWithBackend = async () => {
    try {
      const isDemo = await getDemoMode();
      if (isDemo) return;
      const { accessToken } = await getStoredTokens();
      if (!accessToken) return;

      const [cart, summary] = await Promise.all([cartApi.getCart(), cartApi.getSummary()]);
      if (cart.items && cart.items.length > 0) {
        setItems(cart.items);
      }
      if (cart.appliedCouponCode) {
        setAppliedCoupon(cart.appliedCouponCode);
      }
      if (summary) {
        setServerSummary(summary);
      }
    } catch {
      // Guest or offline mode
    }
  };

  const itemCount = useMemo(() => {
    return items.reduce((acc, it) => acc + it.quantity, 0);
  }, [items]);

  const itemTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.lineTotal, 0);
  }, [items]);

  const packagingFee = useMemo(() => {
    if (serverSummary && items.length > 0) return serverSummary.packagingFee;
    return items.length > 0 ? 10 : 0;
  }, [serverSummary, items.length]);

  const rawDeliveryFee = useMemo(() => {
    if (orderType === 'pickup' || items.length === 0) return 0;
    if (serverSummary) return serverSummary.deliveryFee;
    // Free delivery above ₹499
    if (itemTotal >= 499) return 0;
    return 40;
  }, [orderType, items.length, itemTotal, serverSummary]);

  const { discountAmount, deliveryFee } = useMemo(() => {
    let disc = serverSummary?.discountAmount || 0;
    let delFee = rawDeliveryFee;
    return { discountAmount: disc, deliveryFee: delFee };
  }, [serverSummary, rawDeliveryFee]);

  const taxes = useMemo(() => {
    if (serverSummary && items.length > 0) return serverSummary.taxes;
    // 5% GST on food item total
    return Number((itemTotal * 0.05).toFixed(2));
  }, [serverSummary, itemTotal]);

  const totalAmount = useMemo(() => {
    if (items.length === 0) return 0;
    if (serverSummary && orderType === 'delivery') return serverSummary.totalAmount;
    const total = itemTotal + packagingFee + deliveryFee + taxes - discountAmount;
    return Math.max(0, Number(total.toFixed(2)));
  }, [items.length, serverSummary, orderType, itemTotal, packagingFee, deliveryFee, taxes, discountAmount]);

  const addItem = async (
    item: MenuItemSummaryDto,
    variant?: VariantDto | null,
    selectedAddons: AddonOptionDto[] = [],
    note?: string
  ) => {
    const selectedVariant =
      variant || (item.variants.length > 0 ? item.variants.find(v => v.isDefault) || item.variants[0] : null);
    const variantPrice = selectedVariant ? selectedVariant.price : item.basePrice;
    const addonsDelta = selectedAddons.reduce((sum, a) => sum + a.priceDelta, 0);
    const unitPrice = variantPrice + addonsDelta;

    // Check if live backend can receive the item
    try {
      const isDemo = await getDemoMode();
      const { accessToken } = await getStoredTokens();
      if (!isDemo && accessToken) {
        const res = await cartApi.addItem({
          itemId: item.id,
          variantId: selectedVariant?.id || null,
          quantity: 1,
          addons: selectedAddons.map(a => a.id),
          itemNote: note || null,
        });
        setItems(res.items);
        const summary = await cartApi.getSummary();
        setServerSummary(summary);
        return;
      }
    } catch (err) {
      console.warn('Backend addItem sync skipped, updating locally:', err);
    }

    // Local in-memory fallback (e.g. for guest checkout before login)
    const addonIds = selectedAddons.map(a => a.id).sort().join('-');
    const existingIndex = items.findIndex(
      it =>
        it.itemId === item.id &&
        it.variantId === (selectedVariant?.id || null) &&
        it.addons.map(a => a.id).sort().join('-') === addonIds &&
        (it.itemNote || '') === (note || '')
    );

    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].lineTotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      const newItem: CartItemResponseDto = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        itemId: item.id,
        itemName: item.name,
        itemImageUrl: item.imageUrl,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null,
        quantity: 1,
        unitPrice,
        addons: selectedAddons.map(a => ({ id: a.id, name: a.name, priceDelta: a.priceDelta })),
        lineTotal: unitPrice,
        itemNote: note || null,
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = async (cartItemId: number, delta: number) => {
    const target = items.find(it => it.id === cartItemId);
    const newQty = target ? target.quantity + delta : 0;

    try {
      const isDemo = await getDemoMode();
      const { accessToken } = await getStoredTokens();
      if (!isDemo && accessToken) {
        if (newQty <= 0) {
          const res = await cartApi.removeItem(cartItemId);
          setItems(res.items);
        } else {
          const res = await cartApi.updateItem(cartItemId, { quantity: newQty });
          setItems(res.items);
        }
        const summary = await cartApi.getSummary();
        setServerSummary(summary);
        return;
      }
    } catch (err) {
      console.warn('Backend updateItem sync skipped, updating locally:', err);
    }

    setItems(prev => {
      return prev
        .map(it => {
          if (it.id === cartItemId) {
            const nextQty = it.quantity + delta;
            return {
              ...it,
              quantity: nextQty,
              lineTotal: nextQty * it.unitPrice,
            };
          }
          return it;
        })
        .filter(it => it.quantity > 0);
    });
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const isDemo = await getDemoMode();
      const { accessToken } = await getStoredTokens();
      if (!isDemo && accessToken) {
        const res = await cartApi.removeItem(cartItemId);
        setItems(res.items);
        const summary = await cartApi.getSummary();
        setServerSummary(summary);
        return;
      }
    } catch (err) {
      console.warn('Backend removeItem sync skipped:', err);
    }
    setItems(prev => prev.filter(it => it.id !== cartItemId));
  };

  const applyCouponCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const normalized = code.trim().toUpperCase();

    try {
      const summary = await cartApi.applyCoupon(normalized);
      setServerSummary(summary);
      setAppliedCoupon(normalized);
      return {
        success: true,
        message: `Coupon '${normalized}' applied! You save ₹${summary.discountAmount.toFixed(2)}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid or expired coupon code.',
      };
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    setServerSummary(prev => (prev ? { ...prev, discountAmount: 0, appliedCouponCode: null } : null));
  };

  const clearCart = async () => {
    try {
      const isDemo = await getDemoMode();
      const { accessToken } = await getStoredTokens();
      if (!isDemo && accessToken) {
        await cartApi.clearCart();
      }
    } catch {
      // Ignore clear failure
    }
    setItems([]);
    setAppliedCoupon(null);
    setSpecialInstructions('');
    setServerSummary(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        itemTotal,
        deliveryFee,
        packagingFee,
        discountAmount,
        taxes,
        totalAmount,
        appliedCoupon,
        orderType,
        specialInstructions,
        setOrderType,
        setSpecialInstructions,
        addItem,
        updateQuantity,
        removeItem,
        applyCouponCode,
        removeCouponCode,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
