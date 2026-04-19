import firestore from '@react-native-firebase/firestore';
import { GAME_DURATION_MS } from '../utils/gameEngine';

export const saveGameSession = async ({
  sessionId,
  targetFruit,
  level = 1,
  completed = true,
  endedReason = 'completed',
  stats,
  taps,
  fruitSpawns,
  cameraCaptures,
}) => {
  return firestore().collection('sessions').add({
    createdAt: firestore.FieldValue.serverTimestamp(),
    sessionId,
    targetFruit,
    level,
    completed,
    endedReason,
    durationMs: GAME_DURATION_MS,
    stats: {
      totalTaps: stats.totalTaps || 0,
      correctTaps: stats.correctTaps || 0,
      incorrectTaps: stats.incorrectTaps || 0,
      backgroundTaps: stats.backgroundTaps || 0,
      accuracy: stats.accuracy || 0,
    },
    taps: taps || [],
    fruitSpawns: fruitSpawns || [],
    cameraCaptures: cameraCaptures || [],
  });
};