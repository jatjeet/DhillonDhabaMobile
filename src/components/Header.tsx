import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../theme';
import { useDhaba } from '../context/DhabaContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onAddressPress?: () => void;
  showAddress?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onAddressPress, showAddress = true }) => {
  const { outlet, outletStatus, selectedAddress } = useDhaba();
  const { isDemoMode } = useAuth();

  const isOpen = outletStatus?.isOpen ?? true;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <Text style={styles.brandTitle} numberOfLines={1}>
            {outlet?.name?.toUpperCase() || 'DHILLON DHABA'}
          </Text>
          <Text style={styles.brandSubtitle} numberOfLines={1}>
            {outlet?.city
              ? `${outlet.city.toUpperCase()} • AUTHENTIC HIGHWAY FLAVOURS`
              : 'AUTHENTIC PUNJABI HIGHWAY FLAVOURS'}
          </Text>
        </View>

        <View style={styles.rightBadges}>
          {isDemoMode && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>DEMO</Text>
            </View>
          )}

          <View style={[styles.statusPill, { backgroundColor: isOpen ? '#E8F5E9' : '#FFEBEE' }]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOpen ? Colors.badgeOpen : Colors.badgeClosed },
              ]}
            />
            <Text style={[styles.statusText, { color: isOpen ? Colors.badgeOpen : Colors.badgeClosed }]}>
              {isOpen ? `${outletStatus?.estimatedWaitMinutes || 30} mins` : 'Closed'}
            </Text>
          </View>
        </View>
      </View>

      {showAddress && (
        <TouchableOpacity
          style={styles.addressRow}
          onPress={onAddressPress}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" size={18} color={Colors.primary} />
          <View style={styles.addressInfo}>
            <Text style={styles.addressLabel}>
              Deliver to: <Text style={styles.addressHighlight}>{selectedAddress?.label || 'Select Address'}</Text>
            </Text>
            <Text style={styles.addressLine} numberOfLines={1}>
              {selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : 'Tap to add or select delivery address'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branding: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 8.5,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginTop: -2,
  },
  rightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBadge: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  demoText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: 4,
  },
  addressInfo: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
  },
  addressLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  addressHighlight: {
    fontWeight: '700',
    color: Colors.text,
  },
  addressLine: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});

