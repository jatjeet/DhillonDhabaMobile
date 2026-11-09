import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  CartItemResponseDto,
  MenuItemSummaryDto,
  VariantDto,
  AddonOptionDto,
} from '../types';
import { availableCoupons } from '../api/mockData';

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
  ) => void;
  updateQuantity: (cartItemId: number, delta: number) => void;
  removeItem: (cartItemId: number) => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCouponCode: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemResponseDto[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  const itemCount = useMemo(() => {
    return items.reduce((acc, it) => acc + it.quantity, 0);
  }, [items]);

  const itemTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.lineTotal, 0);
  }, [items]);

  const packagingFee = useMemo(() => {
    return items.length > 0 ? 20 : 0;
  }, [items.length]);

  const rawDeliveryFee = useMemo(() => {
    if (orderType === 'pickup' || items.length === 0) return 0;
    // Free delivery above ₹499
    if (itemTotal >= 499) return 0;
    return 40;
  }, [orderType, items.length, itemTotal]);

  const { discountAmount, deliveryFee } = useMemo(() => {
    let disc = 0;
    let delFee = rawDeliveryFee;

    if (appliedCoupon && items.length > 0) {
      const coupon = availableCoupons.find(
        c => c.code.toUpperCase() === appliedCoupon.toUpperCase()
      );
      if (coupon) {
        if (coupon.waiveDelivery) {
          delFee = 0;
        } else if (coupon.flatDiscount && itemTotal >= (coupon.minOrder || 0)) {
          disc = Math.min(coupon.flatDiscount, itemTotal);
        } else if (coupon.discountPercentage && itemTotal >= (coupon.minOrder || 0)) {
          const calculated = (itemTotal * coupon.discountPercentage) / 100;
          disc = Math.min(calculated, coupon.maxDiscount || calculated);
        }
      }
    }

    return { discountAmount: disc, deliveryFee: delFee };
  }, [appliedCoupon, items.length, itemTotal, rawDeliveryFee]);

  const taxes = useMemo(() => {
    // 5% GST on food item total
    return Number(((itemTotal * 0.05)).toFixed(2));
  }, [itemTotal]);

  const totalAmount = useMemo(() => {
    if (items.length === 0) return 0;
    const total = itemTotal + packagingFee + deliveryFee + taxes - discountAmount;
    return Math.max(0, Number(total.toFixed(2)));
  }, [items.length, itemTotal, packagingFee, deliveryFee, taxes, discountAmount]);

  const addItem = (
    item: MenuItemSummaryDto,
    variant?: VariantDto | null,
    selectedAddons: AddonOptionDto[] = [],
    note?: string
  ) => {
    const selectedVariant = variant || (item.variants.length > 0 ? item.variants.find(v => v.isDefault) || item.variants[0] : null);
    const variantPrice = selectedVariant ? selectedVariant.price : item.basePrice;
    const addonsDelta = selectedAddons.reduce((sum, a) => sum + a.priceDelta, 0);
    const unitPrice = variantPrice + addonsDelta;

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

  const updateQuantity = (cartItemId: number, delta: number) => {
    setItems(prev => {
      return prev
        .map(it => {
          if (it.id === cartItemId) {
            const newQty = it.quantity + delta;
            return {
              ...it,
              quantity: newQty,
              lineTotal: newQty * it.unitPrice,
            };
          }
          return it;
        })
        .filter(it => it.quantity > 0);
    });
  };

  const removeItem = (cartItemId: number) => {
    setItems(prev => prev.filter(it => it.id !== cartItemId));
  };

  const applyCouponCode = (code: string): { success: boolean; message: string } => {
    const normalized = code.trim().toUpperCase();
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === normalized);

    if (!coupon) {
      return { success: false, message: 'Invalid coupon code' };
    }

    if (coupon.minOrder && itemTotal < coupon.minOrder) {
      return {
        success: false,
        message: `Add ₹${coupon.minOrder - itemTotal} more to apply this coupon`,
      };
    }

    setAppliedCoupon(coupon.code);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setSpecialInstructions('');
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

