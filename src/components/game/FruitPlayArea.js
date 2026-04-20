import React, {useMemo} from 'react';
import {Pressable, Animated, StyleSheet, Image, View, Text} from 'react-native';
import {Images} from '../../../assets/images/images';
import {Color} from '../../../assets/images/theme';
import {FRUIT_SIZE} from '../../utils/gameEngine';

const FruitItem = React.memo(function FruitItem({
  fruit,
  isTapped,
  fruitScaleAnim,
  onFruitTap,
}) {
  const imageSource = Images[fruit.type];

  const wrapperStyle = useMemo(
    () => [
      styles.fruitWrapper,
      {
        left: fruit.x - FRUIT_SIZE / 2,
        top: fruit.y - FRUIT_SIZE / 2,
      },
    ],
    [fruit.x, fruit.y],
  );

  const bubbleStyle = useMemo(
    () => [
      styles.fruitBubble,
      fruit.isTarget && styles.targetGlow,
      fruit.consumed && styles.consumedFruit,
      isTapped && {transform: [{scale: fruitScaleAnim}]},
    ],
    [fruit.consumed, fruit.isTarget, fruitScaleAnim, isTapped],
  );

  return (
    <Pressable style={wrapperStyle} onPress={event => onFruitTap(fruit, event)}>
      <Animated.View style={bubbleStyle}>
        <Image source={imageSource} style={styles.fruitImage} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
});

function FruitPlayArea({
  fruits,
  tappedId,
  fruitScaleAnim,
  wrongFlashAnim,
  onPlayAreaLayout,
  onBackgroundTap,
  onFruitTap,
  countdown,
}) {
  const isCountingDown = countdown !== null;

  return (
    <Pressable
      style={styles.playArea}
      onLayout={onPlayAreaLayout}
      onPress={isCountingDown ? null : onBackgroundTap}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.flashOverlay,
          {opacity: wrongFlashAnim},
        ]}
      />

      {fruits.map(fruit => (
        <FruitItem
          key={fruit.id}
          fruit={fruit}
          isTapped={tappedId === fruit.id}
          fruitScaleAnim={fruitScaleAnim}
          onFruitTap={isCountingDown ? () => {} : onFruitTap}
        />
      ))}

      {isCountingDown && (
        <View style={styles.countdownOverlay} pointerEvents="none">
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>
              {countdown === 0 ? 'GO!' : countdown}
            </Text>
            {countdown !== 0 && (
              <Text style={styles.countdownSub}>Get ready...</Text>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default React.memo(FruitPlayArea);

const styles = StyleSheet.create({
  playArea: {
    flex: 1,
    margin: 16,
    marginLeft: 14,
    borderRadius: 32,
    backgroundColor: Color.surface,
    overflow: 'hidden',
    shadowColor: 'rgba(21, 28, 39, 0.18)',
    shadowOpacity: 0.9,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 24,
  },
  flashOverlay: {
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
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
    borderRadius: 999,
    backgroundColor: Color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(21, 28, 39, 0.18)',
    shadowOpacity: 0.8,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 20,
  },
  targetGlow: {
    shadowColor: 'rgba(124, 58, 237, 0.8)',
    shadowRadius: 26,
  },
  consumedFruit: {
    opacity: 0.2,
  },
  fruitImage: {
    width: FRUIT_SIZE * 0.72,
    height: FRUIT_SIZE * 0.72,
  },
  countdownOverlay: {
    top: "25%",
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 32,
  },
  countdownBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.primary,
    width: 160,
    height: 160,
    borderRadius: 80,
    shadowColor: Color.primary,
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 24,
    elevation: 12,
  },
  countdownText: {
    fontSize: 72,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#ffffff',
    lineHeight: 80,
  },
  countdownSub: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
});
