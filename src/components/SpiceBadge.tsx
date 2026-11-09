import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

interface SpiceBadgeProps {
  spiceLevel: 'mild' | 'medium' | 'spicy' | string;
}

export const SpiceBadge: React.FC<SpiceBadgeProps> = ({ spiceLevel }) => {
  const level = spiceLevel.toLowerCase();

  let text = 'Mild';
  let color = Colors.spicyMild;
  let chilis = '🌶️';

  if (level === 'medium') {
    text = 'Medium';
    color = Colors.spicyMedium;
    chilis = '🌶️🌶️';
  } else if (level === 'spicy' || level === 'hot') {
    text = 'Spicy';
    color = Colors.spicyHot;
    chilis = '🌶️🌶️🌶️';
  }

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={styles.chilis}>{chilis}</Text>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFF',
    gap: 4,
  },
  chilis: {
    fontSize: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

