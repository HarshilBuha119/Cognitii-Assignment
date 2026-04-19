// src/screens/GameScreen.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, StatusBar, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { Camera, useCameraPermission } from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Color } from '../../assets/images/theme';
import GameSidebar from '../components/game/GameSidebar';
import FruitPlayArea from '../components/game/FruitPlayArea';
import {
  GAME_DURATION_MS,
  SPAWN_INTERVAL_MS,
  calculateAccuracy,
  generateFruits as buildFruitBatch,
} from '../utils/gameEngine';
import { saveGameSession } from '../services/firestore';
import { useTargetFruitCamera } from '../hooks/useTargetFruitCamera';

let hasRequestedCameraPermissionOnce = false;

export default function GameScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const targetFruit = route.params?.targetFruit ?? 'Carrot';
  // Stable session ID — generated once per mount, used for camera upload path
  const sessionId = useRef(`session_${Date.now()}`).current;
  const { hasPermission, requestPermission } = useCameraPermission();

  const sidebarWidth = useMemo(
    () => Math.max(160, Math.min(220, Math.round(Math.min(windowWidth, windowHeight) * 0.26))),
    [windowWidth, windowHeight],
  );

  const [playAreaSize, setPlayAreaSize] = useState({ width: 0, height: 0 });
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
  const [fruits, setFruits] = useState([]);
  const [isTargetVisible, setIsTargetVisible] = useState(false);
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
  const fruitsRef = useRef([]);
  const tappedTimeoutRef = useRef(null);

  const wrongFlashAnim = useRef(new Animated.Value(0)).current;
  const fruitScaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Camera hook ─────────────────────────────────────────────────────────────
  const { cameraRef, cameraDevice, capturedImageUrls } = useTargetFruitCamera(
    isTargetVisible,
    sessionId,
  );

  // Request camera permission once per app runtime.
  useEffect(() => {
    if (!hasPermission && !hasRequestedCameraPermissionOnce) {
      hasRequestedCameraPermissionOnce = true;
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // ─── Orientation ─────────────────────────────────────────────────────────────
  useEffect(() => {
    StatusBar.setHidden(true);
    Orientation.lockToLandscape();
    const t = setTimeout(() => Orientation.lockToLandscape(), 150);
    return () => {
      clearTimeout(t);
      clearIntervals();
      clearTimeout(tappedTimeoutRef.current);
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const clearIntervals = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (spawnRef.current) { clearInterval(spawnRef.current); spawnRef.current = null; }
  };

  const markOpenSpawnsAsDisappeared = useCallback((timestamp = Date.now()) => {
    fruitSpawnsRef.current = fruitSpawnsRef.current.map(spawn => (
      spawn.disappearedAt == null ? { ...spawn, disappearedAt: timestamp } : spawn
    ));
  }, []);

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
    const now = Date.now();
    markOpenSpawnsAsDisappeared(now);
    const generated = buildFruitBatch(width, height, targetFruit);
    fruitsRef.current = generated;
    fruitSpawnsRef.current.push(
      ...generated.map(({ id, type, isTarget, x, y, visibleAt }) => ({
        id, type, isTarget, x, y, visibleAt, disappearedAt: null,
      })),
    );
    setIsTargetVisible(generated.some(f => f.isTarget && !f.consumed));
    return generated;
  }, [markOpenSpawnsAsDisappeared, targetFruit]);

  const finalizeSession = useCallback(async ({ endedReason = 'completed', navigateToSummary = false } = {}) => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    gameStartedRef.current = false;
    clearIntervals();
    clearTimeout(tappedTimeoutRef.current);
    markOpenSpawnsAsDisappeared(Date.now());
    setIsTargetVisible(false);

    const finalStats = {
      ...stats,
      durationMs: GAME_DURATION_MS,
      accuracy: calculateAccuracy(stats.correctTaps, stats.totalTaps),
    };

    try {
      setIsSaving(true);
      await saveGameSession({
        sessionId,
        targetFruit,
        level: 1,
        completed: endedReason === 'completed',
        endedReason,
        stats: finalStats,
        taps: tapsRef.current,
        fruitSpawns: fruitSpawnsRef.current,
        cameraCaptures: capturedImageUrls.current,
      });
    } catch (e) {
      console.warn('Failed to save session:', e);
    } finally {
      setIsSaving(false);
      setFruits([]);
      if (navigateToSummary) {
        navigation.replace('Summary', { stats: finalStats, targetFruit });
      } else {
        navigation.replace('Tabs', { screen: 'PlayTab' });
      }
    }
  }, [capturedImageUrls, markOpenSpawnsAsDisappeared, navigation, sessionId, stats, targetFruit]);

  // ─── Start game ──────────────────────────────────────────────────────────────
  const startGame = useCallback((width, height) => {
    if (gameStartedRef.current) return;
    gameStartedRef.current = true;
    gameEndedRef.current = false;

    setTimeLeftMs(GAME_DURATION_MS);
    setStats({ totalTaps: 0, correctTaps: 0, incorrectTaps: 0, backgroundTaps: 0, accuracy: 0 });
    tapsRef.current = [];
    fruitSpawnsRef.current = [];
    fruitsRef.current = [];
    setIsTargetVisible(false);

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

  // ─── Play area layout ─────────────────────────────────────────────────────────
  useEffect(() => {
    const { width, height } = playAreaSize;
    if (width === 0 || height === 0) return;

    const prev = prevSizeRef.current;
    if (Math.abs(prev.width - width) > 50 && gameStartedRef.current) {
      clearIntervals();
      gameStartedRef.current = false;
    }
    prevSizeRef.current = { width, height };
    startGame(width, height);
  }, [playAreaSize, startGame]);

  const onPlayAreaLayout = useCallback(({ nativeEvent: { layout: { width, height } } }) => {
    setPlayAreaSize(prev =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  }, []);

  useEffect(() => {
    if (timeLeftMs !== 0 || gameEndedRef.current) return;
    finalizeSession({ endedReason: 'completed', navigateToSummary: true });
  }, [finalizeSession, timeLeftMs]);

  const handleCloseGame = useCallback(() => {
    finalizeSession({ endedReason: 'closed', navigateToSummary: false });
  }, [finalizeSession]);

  // ─── Tap handlers ─────────────────────────────────────────────────────────────
  const updateStats = useCallback(type => {
    setStats(prev => {
      const totalTaps = prev.totalTaps + 1;
      const correctTaps = prev.correctTaps + (type === 'correct' ? 1 : 0);
      const incorrectTaps = prev.incorrectTaps + (type === 'incorrect' ? 1 : 0);
      const backgroundTaps = prev.backgroundTaps + (type === 'background' ? 1 : 0);
      return {
        totalTaps, correctTaps, incorrectTaps, backgroundTaps,
        accuracy: calculateAccuracy(correctTaps, totalTaps),
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
    const currentFruits = fruitsRef.current;
    const target = currentFruits.find(f => f.id === fruit.id);
    if (!target || target.consumed) return;

    const nextFruits = currentFruits.map(f => (
      f.id === fruit.id ? { ...f, consumed: true } : f
    ));
    fruitsRef.current = nextFruits;
    setFruits(nextFruits);
    setIsTargetVisible(nextFruits.some(f => f.isTarget && !f.consumed));

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
    clearTimeout(tappedTimeoutRef.current);
    tappedTimeoutRef.current = setTimeout(() => setTappedId(null), 250);
  }, [triggerFruitBounce, triggerWrongFlash, updateStats]);

  // ─── Derived display values ───────────────────────────────────────────────────
  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const isWarningTime = totalSeconds <= 30;
  const accuracyPct = Math.round(stats.accuracy * 100);

  return (
    <View style={[styles.root, { paddingLeft: insets.left, paddingRight: insets.right }]}>
      {/* Hidden front camera — only active when target is visible */}
      {cameraDevice && hasPermission && (
        <Camera
          ref={cameraRef}
          style={styles.hiddenCamera}
          device={cameraDevice}
          isActive={isTargetVisible && hasPermission}
          photo
        />
      )}

      <GameSidebar
        minutes={minutes}
        seconds={seconds}
        isWarningTime={isWarningTime}
        targetFruit={targetFruit}
        stats={stats}
        accuracyPct={accuracyPct}
        isSaving={isSaving}
        sidebarWidth={sidebarWidth}
        cameraPermissionDenied={!hasPermission}
        onClosePress={handleCloseGame}
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
  // 1×1 off-screen — invisible but Camera must be mounted to use takePhoto()
  hiddenCamera: {
    width: 1,
    height: 1,
    position: 'absolute',
    top: -1,
    left: -1,
  },
});