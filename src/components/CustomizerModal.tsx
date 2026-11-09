import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuItemSummaryDto, VariantDto, AddonOptionDto } from '../types';
import { Colors, Spacing, BorderRadius } from '../theme';
import { VegBadge } from './VegBadge';
import { useCart } from '../context/CartContext';

interface CustomizerModalProps {
  visible: boolean;
  item: MenuItemSummaryDto | null;
  onClose: () => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  visible,
  item,
  onClose,
}) => {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<VariantDto | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<AddonOptionDto[]>([]);
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (item) {
      const def = item.variants.find(v => v.isDefault) || (item.variants.length > 0 ? item.variants[0] : null);
      setSelectedVariant(def);
      setSelectedAddons([]);
      setNote('');
    }
  }, [item]);

  if (!item) return null;

  const handleToggleAddon = (option: AddonOptionDto, maxSelect: number) => {
    const isSelected = selectedAddons.some(a => a.id === option.id);
    if (isSelected) {
      setSelectedAddons(prev => prev.filter(a => a.id !== option.id));
    } else {
      if (maxSelect === 1) {
        // If single select, replace
        setSelectedAddons([option]);
      } else {
        if (selectedAddons.length < maxSelect) {
          setSelectedAddons(prev => [...prev, option]);
        }
      }
    }
  };

  const currentPrice =
    (selectedVariant ? selectedVariant.price : item.basePrice) +
    selectedAddons.reduce((sum, a) => sum + a.priceDelta, 0);

  const handleAddToCart = () => {
    addItem(item, selectedVariant, selectedAddons, note);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <VegBadge isVeg={item.isVeg} size={16} />
              <Text style={styles.headerTitle}>{item.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Portion / Variant Selection */}
            {item.variants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Portion</Text>
                <Text style={styles.sectionSubtitle}>Choose 1 option</Text>

                {item.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <TouchableOpacity
                      key={variant.id}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() => setSelectedVariant(variant)}
                    >
                      <View style={styles.radioRow}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={isSelected ? Colors.primary : Colors.textMuted}
                        />
                        <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                          {variant.name}
                        </Text>
                      </View>
                      <Text style={styles.optionPrice}>₹{variant.price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Addon Groups */}
            {item.addonGroups.map(group => (
              <View key={group.id} style={styles.section}>
                <View style={styles.addonHeaderRow}>
                  <Text style={styles.sectionTitle}>{group.name}</Text>
                  {group.isRequired && <Text style={styles.requiredPill}>Required</Text>}
                </View>
                <Text style={styles.sectionSubtitle}>
                  {group.maxSelect === 1
                    ? 'Select up to 1 option'
                    : `Select up to ${group.maxSelect} options`}
                </Text>

                {group.options.map(option => {
                  const isSelected = selectedAddons.some(a => a.id === option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() => handleToggleAddon(option, group.maxSelect)}
                    >
                      <View style={styles.radioRow}>
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={isSelected ? Colors.primary : Colors.textMuted}
                        />
                        <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                          {option.name}
                        </Text>
                      </View>
                      <Text style={styles.optionPrice}>+₹{option.priceDelta}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Special Instructions Note */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cooking Instructions</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="E.g., Less spicy, extra onions, crispy roti..."
                placeholderTextColor={Colors.textLight}
                value={note}
                onChangeText={setNote}
                maxLength={200}
              />
            </View>
          </ScrollView>

          {/* Sticky Bottom Add to Cart Bar */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.totalPrice}>₹{currentPrice}</Text>
            </View>

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Text style={styles.addToCartText}>Add Item</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  addonHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requiredPill: {
    fontSize: 10,
    backgroundColor: '#FFEBEE',
    color: Colors.primaryDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  optionRowSelected: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.accent,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionName: {
    fontSize: 14,
    color: Colors.text,
  },
  optionNameSelected: {
    fontWeight: '700',
    color: Colors.text,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  addToCartBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

