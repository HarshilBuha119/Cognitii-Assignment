import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Images} from '../../../assets/images/images';
import {Color} from '../../../assets/images/theme';

function getFruitImage(targetFruit) {
  if (targetFruit === 'Apple') return Images.Apple;
  if (targetFruit === 'Banana') return Images.Banana;
  if (targetFruit === 'Grape') return Images.Grape;
  if (targetFruit === 'Carrot') return Images.Carrot;
  return Images.Apple;
}

export default function RecentSessionCard({session}) {
  const accuracyColor =
    session.accuracyPct >= 90
      ? Color.secondary
      : session.accuracyPct >= 75
      ? Color.primary
      : Color.onSurfaceVariant;

  return (
    <View style={styles.card}>
      
      {/* TOP */}
      <View style={styles.topRow}>
        <View style={styles.chip}>
          <Ionicons name="calendar-outline" size={18} color={Color.primary} />
          <Text style={styles.chipText}>{session.displayDate}</Text>
        </View>

        <Text style={[styles.accuracy, {color: accuracyColor}]}>
          {session.accuracyPct}%
        </Text>
      </View>

      {/* BOTTOM */}
      <View style={styles.bottomRow}>
        <View style={styles.imageBox}>
          <Image
            source={getFruitImage(session.targetFruit)}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.title}>
            Sort: {session.targetFruit}
          </Text>
          <Text style={styles.subtitle}>
            Duration: {session.durationLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16, // IMPORTANT (was wrong before)
    backgroundColor: Color.surface, // exact from design

    borderWidth: 1,
    borderColor: Color.outlineVariant + '20', // very light border

    shadowColor: Color.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 2,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.surfaceLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  chipText: {
    marginLeft: 5,
    fontSize: 12,
    color: Color.primary,
    fontFamily: 'PlusJakartaSans-Bold',
  },

  accuracy: {
    fontSize: 24, // FIXED (was too big)
    fontFamily: 'PlusJakartaSans-Bold',
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },

  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Color.surfaceBright, // NOT pure white
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,

    borderWidth: 1,
    borderColor: Color.outlineVariant + '30',
  },

  image: {
    width: 44,
    height: 44,
  },

  title: {
    fontSize: 18, // matches text-lg
    fontFamily: 'PlusJakartaSans-Bold',
    color: Color.onSurface,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});