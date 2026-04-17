// src/screens/HomeScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { Images } from '../../assets/images/images';

const FRUIT_PREVIEW = ['Apple', 'Banana', 'Grape', 'Carrot'];

export default function HomeScreen() {
  const navigation = useNavigation();
  useFocusEffect(() => {
    Orientation.lockToPortrait();
  });
  // selected target fruit (default Carrot)
  const [targetFruit, setTargetFruit] = useState('Carrot');

  // Button press scale animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handleStart = () => {
    // Lock landscape BEFORE navigating so the game screen opens in landscape
    Orientation.lockToLandscape();
    navigation.navigate('Game', { targetFruit });
  };

  const handleSelectFruit = fruit => {
    setTargetFruit(fruit);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#060b1a" barStyle="light-content" />
      {/* Background grid decoration */}
      <View style={styles.bgGrid} pointerEvents="none" />

      {/* Hero */}
      <View style={styles.heroSection}>
        <View style={styles.logoRing}>
          <Text style={styles.logoEmoji}>🎯</Text>
        </View>
        <Text style={styles.appTitle}>Fruit Focus</Text>
        <Text style={styles.appTagline}>
          Train your attention · Tap the right fruit
        </Text>
      </View>

      {/* Fruit preview strip (also acts as selector) */}
      <View style={styles.fruitStrip}>
        {FRUIT_PREVIEW.map(fruit => {
          const isTarget = fruit === targetFruit;
          return (
            <TouchableOpacity
              key={fruit}
              activeOpacity={0.8}
              onPress={() => handleSelectFruit(fruit)}
              style={[
                styles.fruitChip,
                isTarget && styles.fruitChipTarget,
              ]}>
              <Image
                source={Images[fruit]}
                style={styles.fruitChipImage}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.fruitChipLabel,
                  isTarget && styles.fruitChipLabelTarget,
                ]}>
                {fruit}
              </Text>
              {isTarget && (
                <View style={styles.targetPill}>
                  <Text style={styles.targetPillText}>TARGET</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* How to play */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>How to play</Text>
        <View style={styles.ruleRow}>
          <Text style={styles.ruleIcon}>👁</Text>
          <Text style={styles.ruleText}>
            Watch fruits appear on screen every second
          </Text>
        </View>
        <View style={styles.ruleRow}>
          <Text style={styles.ruleIcon}>👆</Text>
          <Text style={styles.ruleText}>
            Only tap the{' '}
            <Text style={styles.accent}>{targetFruit}</Text> — ignore everything
            else
          </Text>
        </View>
        <View style={styles.ruleRow}>
          <Text style={styles.ruleIcon}>⏱</Text>
          <Text style={styles.ruleText}>
            Game runs for 2 minutes — score as high as you can!
          </Text>
        </View>
      </View>

      {/* Start button */}
      <Animated.View
        style={[{ transform: [{ scale: buttonScale }] }, styles.buttonWrap]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleStart}
          style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Game</Text>
          <View style={styles.playIcon}>
            <Text style={{ fontSize: 14 }}>▶</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060b1a',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
  },
  bgGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: 'transparent',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0f2044',
    borderWidth: 2,
    borderColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoEmoji: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f0f6ff',
    letterSpacing: -0.5,
  },
  appTagline: {
    marginTop: 6,
    fontSize: 13,
    color: '#4a6a9c',
    letterSpacing: 0.3,
    fontWeight: '500',
  },

  // Fruit strip
  fruitStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  fruitChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0c1428',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#1e2d4a',
  },
  fruitChipTarget: {
    backgroundColor: '#0e1e3d',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  fruitChipImage: {
    width: 44,
    height: 44,
    marginBottom: 6,
  },
  fruitChipLabel: {
    fontSize: 11,
    color: '#4a6a9c',
    fontWeight: '600',
  },
  fruitChipLabelTarget: {
    color: '#93c5fd',
  },
  targetPill: {
    marginTop: 4,
    backgroundColor: '#1d4ed8',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  targetPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.8,
  },

  // Rules card
  rulesCard: {
    backgroundColor: '#0c1428',
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#1e2d4a',
  },
  rulesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4a6a9c',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  ruleIcon: {
    fontSize: 16,
    marginTop: 1,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    fontWeight: '500',
  },
  accent: {
    color: '#f97316',
    fontWeight: '700',
  },

  // Start button
  buttonWrap: {
    marginTop: 'auto',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 99,
    gap: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  playIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});