export function formatDuration(ms) {
  if (!ms || ms <= 0) return '0m 00s';
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function formatDisplayDate(date) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const time = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isSameDay(date, now)) return `Today, ${time}`;
  if (isSameDay(date, yesterday)) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  })}, ${time}`;
}

export function mapSessionFromFirestore(id, raw) {
  const createdAt = raw.createdAt?.toDate ? raw.createdAt.toDate() : new Date();
  const accuracyRaw = typeof raw.stats?.accuracy === 'number' ? raw.stats.accuracy : 0;

  return {
    id,
    targetFruit: raw.targetFruit || 'Apple',
    accuracyPct: Math.round(accuracyRaw * 100),
    durationMs: raw.durationMs || 0,
    durationLabel: formatDuration(raw.durationMs || 0),
    totalTaps: raw.stats?.totalTaps || 0,
    correctTaps: raw.stats?.correctTaps || 0,
    incorrectTaps: raw.stats?.incorrectTaps || 0,
    backgroundTaps: raw.stats?.backgroundTaps || 0,
    displayDate: formatDisplayDate(createdAt),
    createdAt,
  };
}

export function buildChartDataFromSessions(sessions, color) {
  const ordered = [...sessions].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  return ordered.map((item, index) => ({
    value: item.accuracyPct,
    label: '',
    frontColor: index === ordered.length - 1 ? color : undefined,
  }));
}

export function getAccuracyAverage(sessions, fallback = 0) {
  if (!sessions.length) return fallback;
  const total = sessions.reduce((sum, item) => sum + item.accuracyPct, 0);
  return Math.round(total / sessions.length);
}
