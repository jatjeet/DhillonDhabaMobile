import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useDhaba } from '../../context/DhabaContext';
import { meApi } from '../../api/meApi';
import { CreateAddressDto, AddressResponseDto } from '../../types';

export const AddressManagerScreen = ({ navigation }: any) => {
  const { addresses, selectedAddress, setSelectedAddress, reloadAddresses } = useDhaba();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [line1, setLine1] = useState<string>('');
  const [line2, setLine2] = useState<string>('');
  const [city, setCity] = useState<string>('Jalandhar');
  const [state, setState] = useState<string>('Punjab');
  const [pincode, setPincode] = useState<string>('144001');
  const [isDefault, setIsDefault] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveAddress = async () => {
    if (!line1.trim() || !pincode.trim()) {
      Alert.alert('Required Fields', 'Please enter Address Line 1 and a 6-digit Pincode.');
      return;
    }

    try {
      setIsSaving(true);
      const dto: CreateAddressDto = {
        label,
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault,
      };

      const created = await meApi.createAddress(dto);
      await reloadAddresses();
      setSelectedAddress(created);
      setIsAddModalOpen(false);

      // Reset form
      setLine1('');
      setLine2('');
      Alert.alert('Address Saved', 'Your new address was added successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = (id: number) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await meApi.deleteAddress(id);
            await reloadAddresses();
          } catch {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: number) => {
    try {
      await meApi.setDefaultAddress(id);
      await reloadAddresses();
    } catch {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Add Address CTA */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsAddModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color={Colors.primary} />
          <Text style={styles.addBtnText}>Add New Delivery Address</Text>
        </TouchableOpacity>

        {addresses.map(addr => {
          const isSelected = selectedAddress?.id === addr.id;

          return (
            <View key={addr.id} style={[styles.card, isSelected && styles.cardSelected]}>
              <View style={styles.cardTop}>
                <View style={styles.labelRow}>
                  <Ionicons
                    name={
                      addr.label.toLowerCase() === 'home'
                        ? 'home'
                        : addr.label.toLowerCase() === 'work'
                        ? 'briefcase'
                        : 'location'
                    }
                    size={16}
                    color={Colors.primary}
                  />
                  <Text style={styles.label}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>DEFAULT</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteAddress(addr.id)}
                  style={styles.deleteIcon}
                >
                  <Ionicons name="trash-outline" size={16} color={Colors.badgeClosed} />
                </TouchableOpacity>
              </View>

              <Text style={styles.addressLine1}>{addr.line1}</Text>
              {addr.line2 ? <Text style={styles.addressLine2}>{addr.line2}</Text> : null}
              <Text style={styles.addressCity}>
                {addr.city}, {addr.state} - {addr.pincode}
              </Text>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                  onPress={() => setSelectedAddress(addr)}
                >
                  <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                    {isSelected ? 'Selected for Delivery' : 'Deliver Here'}
                  </Text>
                </TouchableOpacity>

                {!addr.isDefault && (
                  <TouchableOpacity onPress={() => handleSetDefault(addr.id)}>
                    <Text style={styles.makeDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {addresses.length === 0 && (
          <View style={styles.emptyWrap}>
            <Ionicons name="location-outline" size={54} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySubtitle}>
              Save your home or workplace address for faster Dhillon Dhaba food deliveries.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Delivery Address</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Address Type Selector */}
              <Text style={styles.inputLabel}>Address Type</Text>
              <View style={styles.labelPicker}>
                {(['Home', 'Work', 'Other'] as const).map(l => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.pickerTab, label === l && styles.pickerTabActive]}
                    onPress={() => setLabel(l)}
                  >
                    <Text
                      style={[styles.pickerTabText, label === l && styles.pickerTabTextActive]}
                    >
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>House No. / Flat / Building / Street *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="E.g., Flat 402, Royal Palms Residency"
                value={line1}
                onChangeText={setLine1}
              />

              <Text style={styles.inputLabel}>Area / Sector / Landmark</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="E.g., Near Phagwara Toll Plaza / GT Road"
                value={line2}
                onChangeText={setLine2}
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Pincode *</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.defaultCheckRow}
                onPress={() => setIsDefault(!isDefault)}
              >
                <Ionicons
                  name={isDefault ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isDefault ? Colors.primary : Colors.textMuted}
                />
                <Text style={styles.defaultCheckText}>Set as my default address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveAddress}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    gap: 12,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  scroll: {
    flex: 1,
    padding: Spacing.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    borderStyle: 'dashed',
    paddingVertical: 14,
    marginBottom: Spacing.md,
    gap: 8,
  },
  addBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  cardSelected: {
    borderColor: Colors.accent,
    borderWidth: 1.5,
    backgroundColor: '#FFFDF7',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },
  defaultPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.badgeOpen,
  },
  deleteIcon: {
    padding: 4,
  },
  addressLine1: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  addressLine2: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addressCity: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  selectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F5F5F5',
  },
  selectBtnActive: {
    backgroundColor: Colors.primary,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  selectBtnTextActive: {
    color: '#FFFFFF',
  },
  makeDefaultText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyWrap: {
    alignItems: 'center',
    marginTop: 60,
    padding: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 8,
    marginBottom: 4,
  },
  labelPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  pickerTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F5F5F5',
  },
  pickerTabActive: {
    backgroundColor: Colors.primary,
  },
  pickerTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  pickerTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    padding: 10,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
  },
  row: {
    flexDirection: 'row',
  },
  defaultCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: 8,
  },
  defaultCheckText: {
    fontSize: 13,
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

