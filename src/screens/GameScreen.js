// src/screens/GameScreen.js
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {Images} from '../../assets/images/images';

const GAME_DURATION_MS = 0.1 * 60 * 1000;
const SPAWN_INTERVAL_MS = 1000;
const FRUIT_SIZE = 84;
const SIDEBAR_WIDTH = 124;

const FRUIT_TYPES = ['Apple', 'Banana', 'Grape', 'Carrot'];

const POSITIONS = [
  {x: 0.12, y: 0.22},
  {x: 0.27, y: 0.58},
  {x: 0.45, y: 0.25},
  {x: 0.61, y: 0.68},
  {x: 0.79, y: 0.31},
  {x: 0.48, y: 0.8},
];

export default function GameScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const targetFruit = route.params?.targetFruit || 'Carrot';

  const [playAreaSize, setPlayAreaSize] = useState({width: 0, height: 0});
  const [timeLeftMs, setTimeLeftMs] = useState(GAME_DURATION_MS);
  const [fruits, setFruits] = useState([]);
  const [tappedId, setTappedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [stats, setStats] = useState({
    totalTaps: 0,
    correctTaps: 0,
    incorrectTaps: 0,
    backgroundTaps: 0,
    accuracy: 0,
  });

  const gameStartedRef = useRef(false);
  const gameEndedRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const spawnIntervalRef = useRef(null);

  const wrongFlashAnim = useRef(new Animated.Value(0)).current;
  const fruitScaleAnim = useRef(new Animated.Value(1)).current;

  const tapsRef = useRef([]);
  const fruitSpawnsRef = useRef([]);

  useEffect(() => {
    StatusBar.setHidden(true);
    Orientation.lockToLandscape();

    return () => {
      clearAllIntervals();
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, []);

  const clearAllIntervals = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
  };

  const calculateAccuracy = (correct, total) => {
    if (total === 0) {
      return 0;
    }
    return correct / total;
  };

  const triggerWrongFlash = useCallback(() => {
    wrongFlashAnim.setValue(0);

    Animated.sequence([
      Animated.timing(wrongFlashAnim, {
        toValue: 0.35,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(wrongFlashAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [wrongFlashAnim]);

  const triggerFruitBounce = useCallback(() => {
    fruitScaleAnim.setValue(1);

    Animated.sequence([
      Animated.timing(fruitScaleAnim, {
        toValue: 1.22,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(fruitScaleAnim, {
        toValue: 0.92,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(fruitScaleAnim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fruitScaleAnim]);

  const generateFruits = useCallback(
    (width, height) => {
      const shuffledPositions = [...POSITIONS].sort(() => Math.random() - 0.5);
      const count = Math.floor(Math.random() * 3) + 3;
      const now = Date.now();

      const generated = shuffledPositions.slice(0, count).map((pos, index) => {
        const type =
          FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];

        const x = pos.x * width;
        const y = pos.y * height;

        return {
          id: `${now}-${index}`,
          type,
          isTarget: type === targetFruit,
          x,
          y,
          consumed: false,
          visibleAt: now,
        };
      });

      fruitSpawnsRef.current.push(
        ...generated.map(item => ({
          id: item.id,
          type: item.type,
          isTarget: item.isTarget,
          x: item.x,
          y: item.y,
          visibleAt: item.visibleAt,
        })),
      );

      return generated;
    },
    [targetFruit],
  );

  const startGame = useCallback(() => {
    if (
      gameStartedRef.current ||
      playAreaSize.width === 0 ||
      playAreaSize.height === 0
    ) {
      return;
    }

    gameStartedRef.current = true;
    gameEndedRef.current = false;

    setTimeLeftMs(GAME_DURATION_MS);
    setStats({
      totalTaps: 0,
      correctTaps: 0,
      incorrectTaps: 0,
      backgroundTaps: 0,
      accuracy: 0,
    });

    tapsRef.current = [];
    fruitSpawnsRef.current = [];

    const initialFruits = generateFruits(playAreaSize.width, playAreaSize.height);
    setFruits(initialFruits);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftMs(prev => {
        const next = prev - 1000;
        return next <= 0 ? 0 : next;
      });
    }, 1000);

    spawnIntervalRef.current = setInterval(() => {
      setFruits(generateFruits(playAreaSize.width, playAreaSize.height));
    }, SPAWN_INTERVAL_MS);
  }, [generateFruits, playAreaSize.height, playAreaSize.width]);

  useEffect(() => {
    if (playAreaSize.width > 0 && playAreaSize.height > 0) {
      startGame();
    }
  }, [playAreaSize, startGame]);

  const saveSessionToFirestore = useCallback(
    async finalStats => {
      const payload = {
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
      };

      await firestore().collection('sessions').add(payload);
    },
    [targetFruit],
  );

  useEffect(() => {
    const finishGame = async () => {
      if (timeLeftMs !== 0 || gameEndedRef.current) {
        return;
      }

      gameEndedRef.current = true;
      clearAllIntervals();
      setFruits([]);

      const finalStats = {
        ...stats,
        accuracy: calculateAccuracy(stats.correctTaps, stats.totalTaps),
      };

      try {
        setIsSaving(true);
        await saveSessionToFirestore(finalStats);
      } catch (error) {
        console.log('Failed to save session:', error);
      } finally {
        setIsSaving(false);
        navigation.replace('Summary', {
          stats: finalStats,
          targetFruit,
        });
      }
    };

    finishGame();
  }, [navigation, saveSessionToFirestore, stats, targetFruit, timeLeftMs]);

  const onPlayAreaLayout = event => {
    const {width, height} = event.nativeEvent.layout;
    setPlayAreaSize({width, height});
  };

  const updateStats = useCallback(type => {
    setStats(prev => {
      const totalTaps = prev.totalTaps + 1;
      const correctTaps = prev.correctTaps + (type === 'correct' ? 1 : 0);
      const incorrectTaps = prev.incorrectTaps + (type === 'incorrect' ? 1 : 0);
      const backgroundTaps =
        prev.backgroundTaps + (type === 'background' ? 1 : 0);

      return {
        totalTaps,
        correctTaps,
        incorrectTaps,
        backgroundTaps,
        accuracy: calculateAccuracy(correctTaps, totalTaps),
      };
    });
  }, []);

  const handleBackgroundTap = useCallback(
    event => {
      if (!gameStartedRef.current || gameEndedRef.current) {
        return;
      }

      const {locationX, locationY, pageX, pageY} = event.nativeEvent;

      tapsRef.current.push({
        timestamp: Date.now(),
        x: locationX,
        y: locationY,
        pageX,
        pageY,
        type: 'background',
      });

      updateStats('background');
    },
    [updateStats],
  );

  const handleFruitTap = useCallback(
    (fruit, event) => {
      if (!gameStartedRef.current || gameEndedRef.current) {
        return;
      }

      event.stopPropagation();

      const tappedFruit = fruits.find(item => item.id === fruit.id);
      if (!tappedFruit || tappedFruit.consumed) {
        return;
      }

      const {locationX, locationY, pageX, pageY} = event.nativeEvent;
      const tapType = fruit.isTarget ? 'correct' : 'incorrect';

      tapsRef.current.push({
        timestamp: Date.now(),
        x: fruit.x,
        y: fruit.y,
        tapX: locationX,
        tapY: locationY,
        pageX,
        pageY,
        type: tapType,
        fruitId: fruit.id,
        fruitType: fruit.type,
        isTarget: fruit.isTarget,
      });

      setTappedId(fruit.id);
      triggerFruitBounce();

      if (!fruit.isTarget) {
        triggerWrongFlash();
      }

      setFruits(prev =>
        prev.map(item =>
          item.id === fruit.id ? {...item, consumed: true} : item,
        ),
      );

      updateStats(tapType);

      setTimeout(() => {
        setTappedId(null);
      }, 250);
    },
    [fruits, triggerFruitBounce, triggerWrongFlash, updateStats],
  );

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const isWarningTime = totalSeconds <= 30;
  const accuracyPct = Math.round(stats.accuracy * 100);

  return (
    <View
      style={[
        styles.root,
        {
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <View style={styles.sidebar}>
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>TIME</Text>
            <Ionicons name="alarm-outline" size={20} color="#79a9ff" />
          </View>
          <Text style={[styles.timer, isWarningTime && styles.timerWarning]}>
            {minutes}:{seconds}
          </Text>
          {isWarningTime ? (
            <Text style={styles.warningText}>Hurry up!</Text>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>TARGET</Text>
          <View style={styles.targetBadge}>
            <Image
              source={Images[targetFruit]}
              style={styles.targetImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.targetName}>{targetFruit}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.label}>SCORE</Text>

          <View style={styles.statRow}>
            <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
            <Text style={styles.statText}>{stats.correctTaps}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="close-circle" size={18} color="#f87171" />
            <Text style={styles.statText}>{stats.incorrectTaps}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="scan-circle" size={18} color="#facc15" />
            <Text style={styles.statText}>{accuracyPct}%</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="finger-print" size={18} color="#c4b5fd" />
            <Text style={styles.statText}>{stats.totalTaps}</Text>
          </View>
        </View>

        {isSaving ? (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          </>
        ) : null}
      </View>

      <Pressable
        style={styles.playArea}
        onLayout={onPlayAreaLayout}
        onPressIn={handleBackgroundTap}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            styles.flashOverlay,
            {opacity: wrongFlashAnim},
          ]}
        />

        {fruits.map(fruit => {
          const isTapped = tappedId === fruit.id;
          const imageSource = Images[fruit.type];

          return (
            <Pressable
              key={fruit.id}
              style={[
                styles.fruitWrapper,
                {
                  left: fruit.x - FRUIT_SIZE / 2,
                  top: fruit.y - FRUIT_SIZE / 2,
                },
              ]}
              onPressIn={event => handleFruitTap(fruit, event)}>
              <Animated.View
                style={[
                  styles.fruitBubble,
                  fruit.isTarget && styles.targetGlow,
                  fruit.consumed && styles.consumedFruit,
                  isTapped && {transform: [{scale: fruitScaleAnim}]},
                ]}>
                <Image
                  source={imageSource}
                  style={styles.fruitImage}
                  resizeMode="contain"
                />
              </Animated.View>
            </Pressable>
          );
        })}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#07111f',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#0b1728',
    borderRightWidth: 1,
    borderRightColor: '#18304f',
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  section: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#18304f',
    marginVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7ea6d9',
    letterSpacing: 1.2,
  },
  timer: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f8fbff',
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: '#fb923c',
  },
  warningText: {
    marginTop: 4,
    color: '#fb923c',
    fontSize: 10,
    fontWeight: '700',
  },
  targetBadge: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#14253f',
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  targetImage: {
    width: 40,
    height: 40,
  },
  targetName: {
    color: '#d9eafe',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6,
  },
  statText: {
    color: '#eef6ff',
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'left',
  },
  savingText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
  },
  playArea: {
    flex: 1,
    backgroundColor: '#081423',
    overflow: 'hidden',
  },
  flashOverlay: {
    backgroundColor: '#ef4444',
    zIndex: 5,
  },
  fruitWrapper: {
    position: 'absolute',
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruitBubble: {
    width: FRUIT_SIZE,
    height: FRUIT_SIZE,
    borderRadius: FRUIT_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetGlow: {
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(96,165,250,0.45)',
  },
  consumedFruit: {
    opacity: 0.35,
  },
  fruitImage: {
    width: FRUIT_SIZE - 24,
    height: FRUIT_SIZE - 24,
  },
});