export const GAME_DURATION_MS = 0.2 * 60 * 1000;
export const SPAWN_INTERVAL_MS = 1000;
export const FRUIT_SIZE = 84;

export const FRUIT_TYPES = ['Apple', 'Banana', 'Grape', 'Carrot'];

export function calculateAccuracy(correct, total) {
  if (total === 0) return 0;
  return correct / total;
}

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function isTooClose(candidate, placed, minDistance) {
  return placed.some(item => {
    const dx = candidate.x - item.x;
    const dy = candidate.y - item.y;
    return Math.sqrt(dx * dx + dy * dy) < minDistance;
  });
}

// export function generateFruits(width, height, targetFruit) {
//   const count = Math.floor(Math.random() * 3) + 3;
//   const now = Date.now();
//   const padding = FRUIT_SIZE * 0.6;
//   const minDistance = FRUIT_SIZE * 1.15;
//   const placed = [];

//   const minX = padding;
//   const maxX = Math.max(minX + 1, width - padding);
//   const minY = padding;
//   const maxY = Math.max(minY + 1, height - padding);

//   return Array.from({length: count}).map((_, index) => {
//     const type = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
//     let candidate = null;

//     for (let attempt = 0; attempt < 12; attempt += 1) {
//       const nextCandidate = {
//         x: randomInRange(minX, maxX),
//         y: randomInRange(minY, maxY),
//       };

//       if (!isTooClose(nextCandidate, placed, minDistance)) {
//         candidate = nextCandidate;
//         break;
//       }
//     }

//     if (!candidate) {
//       candidate = {
//         x: randomInRange(minX, maxX),
//         y: randomInRange(minY, maxY),
//       };
//     }

//     placed.push(candidate);

//     return {
//       id: `${now}-${index}`,
//       type,
//       isTarget: type === targetFruit,
//       x: candidate.x,
//       y: candidate.y,
//       consumed: false,
//       visibleAt: now,
//     };
//   });
// }

// src/utils/gameEngine.js — replace generateFruits entirely

const lastPositionMap = {};

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateFruits(width, height, targetFruit) {
  const now = Date.now();
  const padding = FRUIT_SIZE * 0.6;

  const fixedPositions = [
    { x: width * 0.3, y: height * 0.2 },
    { x: width * 0.2, y: height * 0.85 },
    { x: width * 0.8, y: height * 0.8 },
    { x: width * 0.5, y: height * 0.7 },
  ].map(pos => ({
    x: Math.min(Math.max(pos.x, padding), width - padding),
    y: Math.min(Math.max(pos.y, padding), height - padding),
  }));

  // Proper unbiased shuffle
  let shuffledTypes = fisherYatesShuffle(FRUIT_TYPES);

  // Guarantee no fruit lands in the same slot as last round
  for (let pass = 0; pass < 10; pass++) {
    let dirty = false;
    for (let i = 0; i < shuffledTypes.length; i++) {
      if (lastPositionMap[shuffledTypes[i]] !== i) continue;
      const j = shuffledTypes.findIndex(
        (other, k) =>
          k !== i &&
          lastPositionMap[shuffledTypes[i]] !== k &&
          lastPositionMap[other] !== i,
      );
      if (j !== -1) {
        [shuffledTypes[i], shuffledTypes[j]] = [
          shuffledTypes[j],
          shuffledTypes[i],
        ];
        dirty = true;
        break;
      }
    }
    if (!dirty) break;
  }

  // Save positions for next round
  shuffledTypes.forEach((fruit, i) => {
    lastPositionMap[fruit] = i;
  });

  // Also delete old dead code at top of file:
  // randomInRange, isTooClose, and the commented-out old generateFruits

  return fixedPositions.map((pos, index) => ({
    id: `${now}-${index}`,
    type: shuffledTypes[index],
    isTarget: shuffledTypes[index] === targetFruit,
    x: pos.x,
    y: pos.y,
    consumed: false,
    visibleAt: now,
  }));
}
