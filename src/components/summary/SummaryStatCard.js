import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Color} from '../../../assets/images/theme';

export default function SummaryStatCard({icon, value, label}) {
  return (
    <View style={styles.card}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: Color.ringBg,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },

  value: {
    fontSize: 26,
    marginTop: 6,
    fontFamily: 'PlusJakartaSans-Bold',
    color: Color.onSurface,
  },

  label: {
    fontSize: 12,
    marginTop: 4,
    color: Color.onSurfaceVariant,
  },
});