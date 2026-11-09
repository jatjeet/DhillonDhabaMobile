import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface VegBadgeProps {
  isVeg: boolean;
  size?: number;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ isVeg, size = 16 }) => {
  const color = isVeg ? Colors.veg : Colors.nonVeg;
  const innerSize = size * 0.45;

  return (
    <View
      style={[
        styles.border,
        {
          width: size,
          height: size,
          borderColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            backgroundColor: color,
            borderRadius: isVeg ? innerSize / 2 : 1,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  border: {
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  inner: {},
});

