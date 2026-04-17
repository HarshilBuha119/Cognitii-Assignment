import firestore from '@react-native-firebase/firestore';

export const saveGameSession = async ({
  targetFruit,
  stats,
  taps,
  fruitSpawns,
}) => {
  return firestore().collection('sessions').add({
    createdAt: firestore.FieldValue.serverTimestamp(),
    targetFruit,
    durationMs: 120000,
    stats: {
      totalTaps: stats.totalTaps || 0,
      correctTaps: stats.correctTaps || 0,
      incorrectTaps: stats.incorrectTaps || 0,
      backgroundTaps: stats.backgroundTaps || 0,
      accuracy: stats.accuracy || 0,
    },
    taps: taps || [],
    fruitSpawns: fruitSpawns || [],
  });
};