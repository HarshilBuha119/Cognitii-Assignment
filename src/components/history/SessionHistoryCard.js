import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Images} from '../../../assets/images/images';
import {Color} from '../../../assets/images/theme';
import MetricPill from './MetricPill';

function getFruitImage(targetFruit) {
  if (targetFruit === 'Apple') return Images.Apple;
  if (targetFruit === 'Banana') return Images.Banana;
  if (targetFruit === 'Grape') return Images.Grape;
  if (targetFruit === 'Carrot') return Images.Carrot;
  return Images.Apple;
}

export default function SessionHistoryCard({item}) {
  const accuracyColor =
    item.accuracyPct >= 90
      ? Color.success
      : item.accuracyPct >= 75
      ? Color.primary
      : Color.danger;

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.dateChip}>
          <Ionicons name="calendar-outline" size={12} color={Color.primary} />
          <Text style={styles.dateChipText}>{item.displayDate}</Text>
        </View>

        <Text style={[styles.accuracyText, {color: accuracyColor}]}>Avg:{item.accuracyPct}%</Text>
      </View>

      <View style={styles.cardMiddleRow}>
        <View style={styles.fruitBadge}>
          <Image source={getFruitImage(item.targetFruit)} style={styles.fruitImage} resizeMode="contain" />
        </View>

        <View style={styles.targetWrap}>
          <Text style={styles.targetText}>Target: {item.targetFruit}</Text>
          <Text style={styles.durationText}>Duration: {item.durationLabel}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <MetricPill icon="hand-left-outline" label="Total" value={item.totalTaps} color={Color.onSurface} />
        <MetricPill icon="checkmark-circle-outline" label="Correct" value={item.correctTaps} color={Color.success} />
        <MetricPill icon="close-circle-outline" label="Wrong" value={item.incorrectTaps} color={Color.danger} />
        <MetricPill icon="remove-circle-outline" label="BG" value={item.backgroundTaps} color={Color.warning} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Color.surface,
    borderRadius: 28,
    padding: 16,
    marginBottom: 14,
    shadowColor: 'rgba(21, 28, 39, 0.12)',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 8},
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.surfaceLow,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateChipText: {
    marginLeft: 6,
    fontSize: 11,
    color: Color.primary,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  accuracyText: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  fruitBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.surfaceLow,
    marginRight: 12,
  },
  fruitImage: {
    width: 34,
    height: 34,
  },
  targetWrap: {flex: 1},
  targetText: {
    fontSize: 16,
    color: Color.onSurface,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  durationText: {
    marginTop: 4,
    fontSize: 13,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'space-between',
  },
});
