export const GAME_DURATION_MS = 2 * 60 * 1000;
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

export function generateFruits(width, height, targetFruit) {
  const now = Date.now();
  const padding = FRUIT_SIZE * 0.6;

  // 4 fixed quadrant positions
  const fixedPositions = [
    { x: width * 0.3, y: height * 0.20 }, // top-left
    { x: width * 0.2, y: height * 0.85 }, // bottom-left
    { x: width * 0.8, y: height * 0.80 }, // bottom-right
    { x: width * 0.5, y: height * 0.7 }, // top-right
  ].map(pos => ({
    x: Math.min(Math.max(pos.x, padding), width - padding),
    y: Math.min(Math.max(pos.y, padding), height - padding),
  }));

  // Shuffle fruit types so each position gets a different random fruit
  const shuffledTypes = [...FRUIT_TYPES].sort(() => Math.random() - 0.5);

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


