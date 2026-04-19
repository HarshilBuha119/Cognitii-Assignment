import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { Color } from '../../assets/images/theme';
import SessionHistoryCard from '../components/history/SessionHistoryCard';
import {mapSessionFromFirestore} from '../utils/sessionData';
import * as VisionCamera from 'react-native-vision-camera';
console.log('VisionCamera exports:', Object.keys(VisionCamera));

export default function HistoryScreen() {
  const PAGE_SIZE = 20;
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToPortrait();
    }, []),
  );

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const snapshot = await firestore()
          .collection('sessions')
          .orderBy('createdAt', 'desc')
          .limit(PAGE_SIZE)
          .get();

        const data = snapshot.docs.map(doc =>
          mapSessionFromFirestore(doc.id, doc.data()),
        );

        setSessions(data);
        setLastVisible(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (error) {
        console.log('History sessions error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  const loadMoreSessions = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    setLoadingMore(true);
    try {
      const snapshot = await firestore()
        .collection('sessions')
        .orderBy('createdAt', 'desc')
        .startAfter(lastVisible)
        .limit(PAGE_SIZE)
        .get();

      const nextData = snapshot.docs.map(doc =>
        mapSessionFromFirestore(doc.id, doc.data()),
      );

      setSessions(prev => [...prev, ...nextData]);
      setLastVisible(snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : lastVisible);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.log('History load more error:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, lastVisible, loadingMore]);

  const summary = useMemo(() => {
    if (!sessions.length) {
      return {
        totalSessions: 0,
        avgAccuracy: 0,
        totalTaps: 0,
      };
    }

    const totalSessions = sessions.length;
    const avgAccuracy = Math.round(
      sessions.reduce((sum, item) => sum + item.accuracyPct, 0) / totalSessions,
    );
    const totalTaps = sessions.reduce((sum, item) => sum + item.totalTaps, 0);

    return {
      totalSessions,
      avgAccuracy,
      totalTaps,
    };
  }, [sessions]);

  const renderHeader = () => (
    <>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Learning Archive</Text>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>
          Track each learning session and review performance over time.
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="albums-outline" size={18} color={Color.primary} />
          <Text style={styles.statValue}>{summary.totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="scan-circle-outline" size={18} color={Color.secondary} />
          <Text style={styles.statValue}>{summary.avgAccuracy}%</Text>
          <Text style={styles.statLabel}>Avg Accuracy</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="finger-print-outline" size={18} color={Color.warning} />
          <Text style={styles.statValue}>{summary.totalTaps}</Text>
          <Text style={styles.statLabel}>Total Taps</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>All Sessions</Text>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Ionicons
        name="time-outline"
        size={34}
        color={Color.outlineVariant}
      />
      <Text style={styles.emptyTitle}>No sessions yet</Text>
      <Text style={styles.emptyText}>
        Once the child plays the fruit game, session history will appear here.
      </Text>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor={Color.bg} barStyle="dark-content" />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Color.primary} />
          <Text style={styles.loaderText}>Loading history...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 28 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          renderItem={({item}) => <SessionHistoryCard item={item} />}
          onEndReached={loadMoreSessions}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Color.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Color.bg,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },

  hero: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    color: Color.primary,
    fontFamily: 'PlusJakartaSans-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    fontSize: 30,
    color: Color.onSurface,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Regular',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Color.surface,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    shadowColor: 'rgba(21, 28, 39, 0.10)',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    alignItems: 'center',
  },
  statValue: {
    marginTop: 10,
    fontSize: 18,
    color: Color.onSurface,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Medium',
    textAlign: 'center',
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 16,
    color: Color.onSurface,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Medium',
  },

  emptyWrap: {
    marginTop: 60,
    backgroundColor: Color.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    color: Color.onSurface,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: Color.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  footerLoader: {
    paddingVertical: 14,
    alignItems: 'center',
  },
});