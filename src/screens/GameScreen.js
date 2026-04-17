import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, StatusBar, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import firestore from '@react-native-firebase/firestore';
import { Color } from '../../assets/images/theme';
import GameSidebar from '../components/game/GameSidebar';
import FruitPlayArea from '../components/game/FruitPlayArea';
import {
  GAME_DURATION_MS,
  SPAWN_INTERVAL_MS,
  calculateAccuracy,
  generateFruits as buildFruitBatch,
} from '../utils/gameEngine';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const targetFruit = route.params?.targetFruit || 'Carrot';
  const sidebarWidth = Math.max(
    96,
    Math.min(130, Math.round(Math.min(windowWidth, windowHeight) * 0.18)),
  );

  const [playAreaSize, setPlayAreaSize] = useState({ width: 0, height: 0 });
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
  const [fruits, setFruits] = useState([]);
  const [tappedId, setTappedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalTaps: 0, correctTaps: 0,
    incorrectTaps: 0, backgroundTaps: 0, accuracy: 0,
  });

  const gameStartedRef = useRef(false);
  const gameEndedRef = useRef(false);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const prevSizeRef = useRef({ width: 0, height: 0 });
  const tapsRef = useRef([]);
  const fruitSpawnsRef = useRef([]);

  const wrongFlashAnim = useRef(new Animated.Value(0)).current;
  const fruitScaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Orientation ────────────────────────────────────────────────────────────
  useEffect(() => {
    StatusBar.setHidden(true);
    Orientation.lockToLandscape();
    // Re-lock after 150ms to catch cases where we arrive from a portrait screen
    const t = setTimeout(() => Orientation.lockToLandscape(), 150);
    return () => {
      clearTimeout(t);
      clearIntervals();
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const clearIntervals = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
  };

  const triggerWrongFlash = useCallback(() => {
    wrongFlashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wrongFlashAnim, { toValue: 0.35, duration: 100, useNativeDriver: true }),
      Animated.timing(wrongFlashAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [wrongFlashAnim]);

  const triggerFruitBounce = useCallback(() => {
    fruitScaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(fruitScaleAnim, { toValue: 1.2, duration: 90, useNativeDriver: true }),
      Animated.timing(fruitScaleAnim, { toValue: 0.9, duration: 90, useNativeDriver: true }),
      Animated.timing(fruitScaleAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
  }, [fruitScaleAnim]);

  const spawnFruits = useCallback((width, height) => {
    const generated = buildFruitBatch(width, height, targetFruit);
    fruitSpawnsRef.current.push(...generated.map(({ id, type, isTarget, x, y, visibleAt }) => ({
      id, type, isTarget, x, y, visibleAt,
    })));
    return generated;
  }, [targetFruit]);

  // ─── Start game ──────────────────────────────────────────────────────────────
  const startGame = useCallback((width, height) => {
    if (gameStartedRef.current) return;
    gameStartedRef.current = true;
    gameEndedRef.current = false;

    setTimeLeftMs(GAME_DURATION_MS);
    setStats({ totalTaps: 0, correctTaps: 0, incorrectTaps: 0, backgroundTaps: 0, accuracy: 0 });
    tapsRef.current = [];
    fruitSpawnsRef.current = [];

    setFruits(spawnFruits(width, height));

    timerRef.current = setInterval(() => {
      setTimeLeftMs(prev => {
        const next = prev - 1000;
        return next <= 0 ? 0 : next;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      setFruits(spawnFruits(width, height));
    }, SPAWN_INTERVAL_MS);
  }, [spawnFruits]);

  // ─── Play area layout ────────────────────────────────────────────────────────
  // Single effect — handles both first mount and orientation change mid-game
  useEffect(() => {
    const { width, height } = playAreaSize;
    if (width === 0 || height === 0) return;

    const prev = prevSizeRef.current;
    const orientationFlipped = Math.abs(prev.width - width) > 50;

    if (orientationFlipped && gameStartedRef.current) {
      // Screen was rotated after game started — reset so it restarts cleanly
      clearIntervals();
      gameStartedRef.current = false;
    }

    prevSizeRef.current = { width, height };
    startGame(width, height);
  }, [playAreaSize, startGame]);

  const onPlayAreaLayout = ({ nativeEvent: { layout: { width, height } } }) => {
    setPlayAreaSize({ width, height });
  };

  // ─── Save & end game ─────────────────────────────────────────────────────────
  const saveSession = useCallback(async finalStats => {
    await firestore().collection('sessions').add({
      createdAt: firestore.FieldValue.serverTimestamp(),
      targetFruit,
      durationMs: GAME_DURATION_MS,
      stats: {
        totalTaps: finalStats.totalTaps,
        correctTaps: finalStats.correctTaps,
        incorrectTaps: finalStats.incorrectTaps,
        backgroundTaps: finalStats.backgroundTaps,
        accuracy: finalStats.accuracy,
      },
      taps: tapsRef.current,
      fruitSpawns: fruitSpawnsRef.current,
    });
  }, [targetFruit]);

  useEffect(() => {
    if (timeLeftMs !== 0 || gameEndedRef.current) return;

    const finish = async () => {
      gameEndedRef.current = true;
      clearIntervals();
      setFruits([]);

      const finalStats = {
        ...stats,
        durationMs: GAME_DURATION_MS,
        accuracy: calculateAccuracy(stats.correctTaps, stats.totalTaps),
      };

      try {
        setIsSaving(true);
        await saveSession(finalStats);
      } catch (e) {
        console.warn('Failed to save session:', e);
      } finally {
        setIsSaving(false);
        navigation.replace('Summary', { stats: finalStats, targetFruit });
      }
    };

    finish();
  }, [timeLeftMs]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ intentionally minimal deps — we only want this to fire when timer hits 0

  // ─── Tap handlers ────────────────────────────────────────────────────────────
  const updateStats = useCallback(type => {
    setStats(prev => {
      const totalTaps = prev.totalTaps + 1;
      const correctTaps = prev.correctTaps + (type === 'correct' ? 1 : 0);
      const incorrectTaps = prev.incorrectTaps + (type === 'incorrect' ? 1 : 0);
      const backgroundTaps = prev.backgroundTaps + (type === 'background' ? 1 : 0);
      return {
        totalTaps, correctTaps, incorrectTaps, backgroundTaps,
        accuracy: calculateAccuracy(correctTaps, totalTaps)
      };
    });
  }, []);

  const handleBackgroundTap = useCallback(event => {
    if (!gameStartedRef.current || gameEndedRef.current) return;
    const { locationX, locationY, pageX, pageY } = event.nativeEvent;
    tapsRef.current.push({ timestamp: Date.now(), x: locationX, y: locationY, pageX, pageY, type: 'background' });
    updateStats('background');
  }, [updateStats]);

  const handleFruitTap = useCallback((fruit, event) => {
    if (!gameStartedRef.current || gameEndedRef.current) return;
    event.stopPropagation();

    // Guard against double-taps on already consumed fruits
    setFruits(prev => {
      const target = prev.find(f => f.id === fruit.id);
      if (!target || target.consumed) return prev;
      return prev.map(f => f.id === fruit.id ? { ...f, consumed: true } : f);
    });

    const { locationX, locationY, pageX, pageY } = event.nativeEvent;
    const tapType = fruit.isTarget ? 'correct' : 'incorrect';

    tapsRef.current.push({
      timestamp: Date.now(),
      x: fruit.x, y: fruit.y,
      tapX: locationX, tapY: locationY,
      pageX, pageY,
      type: tapType, fruitId: fruit.id,
      fruitType: fruit.type, isTarget: fruit.isTarget,
    });

    setTappedId(fruit.id);
    triggerFruitBounce();
    if (!fruit.isTarget) triggerWrongFlash();
    updateStats(tapType);
    setTimeout(() => setTappedId(null), 250);
  }, [triggerFruitBounce, triggerWrongFlash, updateStats]);
  // Note: removed `fruits` from deps — we use the functional setFruits updater instead
  // which avoids stale closure issues and removes the need for fruits in the dep array

  // ─── Derived display values ──────────────────────────────────────────────────
  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const isWarningTime = totalSeconds <= 30;
  const accuracyPct = Math.round(stats.accuracy * 100);
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root,{ paddingLeft: insets.left, paddingRight: insets.right }]}>
      <GameSidebar
        minutes={minutes}
        seconds={seconds}
        isWarningTime={isWarningTime}
        targetFruit={targetFruit}
        stats={stats}
        accuracyPct={accuracyPct}
        isSaving={isSaving}
        sidebarWidth={sidebarWidth}
      />
      <FruitPlayArea
        fruits={fruits}
        tappedId={tappedId}
        fruitScaleAnim={fruitScaleAnim}
        wrongFlashAnim={wrongFlashAnim}
        onPlayAreaLayout={onPlayAreaLayout}
        onBackgroundTap={handleBackgroundTap}
        onFruitTap={handleFruitTap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Color.bg,
  },
});