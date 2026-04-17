// src/screens/SummaryScreen.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function SummaryScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { stats, targetFruit } = route.params || {};
  const {
    totalTaps = 0,
    correctTaps = 0,
    incorrectTaps = 0,
    backgroundTaps = 0,
    accuracy = 0,
  } = stats || {};

  const accuracyPct = (accuracy * 100).toFixed(1);
  const grade = getGrade(accuracy);

  useEffect(() => {
    Orientation.unlockAllOrientations();
    Orientation.lockToPortrait();
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handlePlayAgain = () => {
    Orientation.lockToLandscape();
    navigation.replace('Game', { targetFruit: targetFruit || 'Carrot' });
  };

  const handleGoHome = () => {
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>SESSION COMPLETE</Text>

        <View style={styles.gradeIconWrapper}>
          <Ionicons
            name={grade.iconName}
            size={40}
            color={grade.iconColor}
          />
        </View>

        <Text style={styles.gradeLabel}>{grade.label}</Text>
      </View>

      {/* Stats card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <Text style={styles.cardTitle}>Your Stats</Text>

        <StatRow
          iconName="pricetag-outline"
          iconColor="#fb923c"
          label="Target fruit"
          value={targetFruit || 'Carrot'}
          valueStyle={styles.accentValue}
        />
        <View style={styles.separator} />

        <StatRow
          iconName="hand-left-outline"
          iconColor="#e2e8f0"
          label="Total taps"
          value={totalTaps}
        />
        <StatRow
          iconName="checkmark-circle-outline"
          iconColor="#22c55e"
          label="Correct taps"
          value={correctTaps}
          valueStyle={styles.greenValue}
        />
        <StatRow
          iconName="close-circle-outline"
          iconColor="#ef4444"
          label="Incorrect taps"
          value={incorrectTaps}
          valueStyle={styles.redValue}
        />
        <StatRow
          iconName="remove-circle-outline"
          iconColor="#e5e7eb"
          label="Background taps"
          value={backgroundTaps}
        />

        <View style={styles.separator} />

        {/* Accuracy bar */}
        <View style={styles.accuracyRow}>
          <View style={styles.accuracyLeft}>
            <MaterialCommunityIcons name="bullseye-arrow"
              size={18}
              color="#e4e4ff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <Text style={[styles.statValue, styles.accuracyValue]}>
            {accuracyPct}%
          </Text>
        </View>

        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${accuracyPct}%`],
                }),
                backgroundColor: getAccuracyColor(accuracy),
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonsRow, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleGoHome}>
          <View style={styles.buttonInnerRow}>
            <Ionicons
              name="home-outline"
              size={18}
              color="#94a3b8"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.secondaryButtonText}>Home</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handlePlayAgain}>
          <View style={styles.buttonInnerRow}>
            <Ionicons
              name="play-circle"
              size={18}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function StatRow({ iconName, iconColor, label, value, valueStyle }) {
  return (
    <View style={styles.statRow}>
      <Ionicons
        name={iconName}
        size={18}
        color={iconColor}
        style={styles.statIcon}
      />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueStyle]}>{String(value)}</Text>
    </View>
  );
}

function getGrade(accuracy) {
  if (accuracy >= 0.9) {
    return {
      iconName: 'trophy-outline',
      iconColor: '#fbbf24',
      label: 'Outstanding!',
    };
  }
  if (accuracy >= 0.75) {
    return {
      iconName: 'star-outline',
      iconColor: '#facc15',
      label: 'Great job!',
    };
  }
  if (accuracy >= 0.5) {
    return {
      iconName: 'thumbs-up-outline',
      iconColor: '#22c55e',
      label: 'Good effort!',
    };
  }
  return {
    iconName: 'fitness-outline',
    iconColor: '#38bdf8',
    label: 'Keep practising!',
  };
}

function getAccuracyColor(accuracy) {
  if (accuracy >= 0.75) return '#22c55e';
  if (accuracy >= 0.5) return '#f97316';
  return '#ef4444';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b1a',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
  },

  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#4a6a9c',
    marginBottom: 12,
  },
  gradeIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b172b',
    borderWidth: 1,
    borderColor: '#1f2a3f',
    marginBottom: 8,
  },
  gradeLabel: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f0f6ff',
    letterSpacing: -0.3,
  },

  card: {
    backgroundColor: '#0c1428',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e2d4a',
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4a6a9c',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  statIcon: {
    width: 22,
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  accentValue: {
    color: '#f97316',
  },
  greenValue: {
    color: '#22c55e',
  },
  redValue: {
    color: '#ef4444',
  },

  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  accuracyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accuracyValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#e2e8f0',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#1e2d4a',
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
  },
  separator: {
    height: 1,
    backgroundColor: '#1e2d4a',
    marginVertical: 6,
  },

  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 99,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#1e2d4a',
    backgroundColor: '#0c1428',
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
});