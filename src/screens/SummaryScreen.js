import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Color } from '../../assets/images/theme';
import SummaryStatCard from '../components/summary/SummaryStatCard';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SummaryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // SummaryScreen.js — top of component, replace the existing stats destructuring
  const {
    stats = {},
    targetFruit,
    saving: initialSaving = false,
  } = route.params || {};
  const [isSaving, setIsSaving] = useState(initialSaving);

  // Add this useEffect — clears saving state after 2s (Firestore write is fast)
  useEffect(() => {
    if (!initialSaving) return;
    const t = setTimeout(() => setIsSaving(false), 2000);
    return () => clearTimeout(t);
  }, [initialSaving]);
  const {
    totalTaps = 0,
    correctTaps = 0,
    accuracy = 0,
    durationMs = 0,
  } = stats;

  const accuracyPct = Math.round(accuracy * 100);
  const grade = getGrade(accuracy);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  useEffect(() => {
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: accuracyPct,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [accuracyPct, progressAnim]);

  const size = 180;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const handleViewProgress = () => {
    navigation.navigate('Tabs', { screen: 'History' });
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.starWrap}>
          <Ionicons name="star" size={36} color={Color.primary} />
        </View>

        <Text style={styles.heroTitle}>{grade.title}</Text>
        <Text style={styles.heroSubtitle}>
          You completed the Fruit Match challenge.
        </Text>
      </View>

      {/* GRID */}
      {isSaving ? (
        <View style={styles.calculatingWrap}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.calculatingText}>Calculating results...</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {/* ACCURACY */}
          <View style={styles.accuracyCard}>
            <Text style={styles.accuracyHeading}>Accuracy</Text>

            <View style={styles.ringOuter}>
              <Svg width={size} height={size}>
                <Circle
                  stroke={Color.ringBg}
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                />

                <AnimatedCircle
                  stroke={Color.primary}
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  originX={size / 2}
                  originY={size / 2}
                  rotation="-90"
                />
              </Svg>

              <View style={styles.ringInner}>
                <Text style={styles.ringValue}>{accuracyPct}%</Text>
                <Text style={styles.ringCaption}>{grade.caption}</Text>
              </View>
            </View>
          </View>

          {/* RIGHT SIDE */}
          <View style={styles.rightCol}>
            <View style={styles.row}>
              <SummaryStatCard
                icon={
                  <Ionicons
                    name="hand-left-outline"
                    size={22}
                    color={Color.secondary}
                  />
                }
                value={totalTaps}
                label="Total Taps"
              />

              <SummaryStatCard
                icon={
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={Color.success}
                  />
                }
                value={correctTaps}
                label="Correct Taps"
              />
            </View>

            {/* TIME CARD */}
            <View style={styles.timeCard}>
              <View style={styles.timeLeft}>
                <View style={styles.timeIcon}>
                  <Ionicons
                    name="timer-outline"
                    size={20}
                    color={Color.primary}
                  />
                </View>
                <View>
                  <Text style={styles.timeLabel}>Time Played</Text>
                  <Text style={styles.timeValue}>
                    {formatDuration(durationMs)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
      {/* BUTTONS */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => {
          Orientation.lockToLandscape();
          navigation.replace('Game', { targetFruit }); // pass targetFruit back!
        }}
      >
        <Ionicons name="refresh-outline" size={18} color="#fff" />
        <Text style={styles.primaryText}>Play Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => {
          Orientation.lockToPortrait();
          navigation.navigate('Tabs', { screen: 'PlayTab' });
        }}
      >
        <Ionicons name="home-outline" size={18} color={Color.primary} />
        <Text style={styles.secondaryText}>Go Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tertiaryBtn} onPress={handleViewProgress}>
        <Text style={styles.tertiaryText}>See Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* HELPERS */
function getGrade(a) {
  if (a >= 0.9) return { title: 'Amazing!', caption: 'Excellent!' };
  if (a >= 0.75) return { title: 'Great Job!', caption: 'Awesome!' };
  if (a >= 0.5) return { title: 'Good Effort!', caption: 'Nice try!' };
  return { title: 'Keep Going!', caption: 'Try again!' };
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.bg,
    paddingHorizontal: 20,
  },
  tertiaryBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
  },
  tertiaryText: {
    color: Color.onSurfaceVariant,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Medium',
    textDecorationLine: 'underline',
  },
  hero: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },

  starWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Color.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 34,
    color: Color.primary,
    fontFamily: 'PlusJakartaSans-Bold',
  },

  heroSubtitle: {
    marginTop: 6,
    fontSize: 16,
    color: Color.onSurfaceVariant,
    textAlign: 'center',
  },
  calculatingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  calculatingText: {
    marginTop: 16,
    fontSize: 16,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },

  accuracyCard: {
    flex: 1,
    backgroundColor: Color.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },

  accuracyHeading: {
    fontSize: 16,
    marginBottom: 16,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Bold',
  },

  ringOuter: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringInner: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringValue: {
    fontSize: 36,
    color: Color.primary,
    fontFamily: 'PlusJakartaSans-Bold',
  },

  ringCaption: {
    fontSize: 14,
    color: Color.onSurfaceVariant,
  },

  rightCol: {
    flex: 1,
    justifyContent: 'space-between',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeCard: {
    marginTop: 12,
    backgroundColor: Color.ringBg,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  timeLabel: {
    fontSize: 12,
    color: Color.onSurfaceVariant,
  },

  timeValue: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans-Bold',
  },

  fruitBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtn: {
    marginTop: 30,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },

  secondaryBtn: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Color.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryText: {
    color: Color.primary,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
