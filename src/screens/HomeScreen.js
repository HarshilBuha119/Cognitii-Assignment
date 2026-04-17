// src/screens/HomeScreen.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { Color } from '../../assets/images/theme';
import HomeTopBar from '../components/home/HomeTopBar';
import AccuracyTrendsCard from '../components/home/AccuracyTrendsCard';
import FruitSelector from '../components/home/FruitSelector';
import RecentSessionCard from '../components/home/RecentSessionCard';
import {
  mapSessionFromFirestore,
  buildChartDataFromSessions,
  getAccuracyAverage,
} from '../utils/sessionData';

export default function HomeScreen() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToPortrait();
    }, []),
  );

  const [targetFruit, setTargetFruit] = useState('Carrot');
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const unsub = firestore()
      .collection('sessions')
      .orderBy('createdAt', 'desc')
      .limit(7)
      .onSnapshot(
        snap => {
          setSessions(
            snap.docs.map(doc => mapSessionFromFirestore(doc.id, doc.data())),
          );
          setLoadingSessions(false);
        },
        err => {
          console.log('sessions error', err);
          setLoadingSessions(false);
        },
      );
    return unsub;
  }, []);

  const avgAccuracy = useMemo(() => getAccuracyAverage(sessions, 0), [sessions]);

  const chartData = useMemo(
    () => buildChartDataFromSessions(sessions, Color.primary),
    [sessions],
  );

  const handlePressIn = () =>
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
    }).start();

  const handlePressOut = () =>
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();

  const handleStart = () => {
    Orientation.lockToLandscape();
    navigation.navigate('Game', { targetFruit });
  };

  const handleViewMore = () => {
    navigation.navigate('Tabs', { screen: 'History' });
  }

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={Color.bg} barStyle="dark-content" />

      <HomeTopBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Page header */}
        <View style={styles.pageHeaderRow}>
          <View style={styles.headerContent}>
            <Text style={styles.pageTitle}>Learning History</Text>
            <Text style={styles.pageSubtitle}>
              Review Little Explorer's recent activity and track their
              progress over time.
            </Text>
          </View>
        </View>

        <AccuracyTrendsCard chartData={chartData} avgAccuracy={avgAccuracy} />

        <FruitSelector targetFruit={targetFruit} onSelect={setTargetFruit} />

        {/* Recent Sessions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
        </View>

        {loadingSessions ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Color.primary} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="analytics-outline" size={32} color={Color.outlineVariant} />
            <Text style={styles.emptyText}>Play a game to see your progress here.</Text>
          </View>
        ) : (
          sessions.slice(0, 4).map(s => <RecentSessionCard key={s.id} session={s} />)
        )}

        <TouchableOpacity style={styles.loadMoreBtn} activeOpacity={0.9} onPress={handleViewMore}>
          <Text style={styles.loadMoreText}>View More Sessions</Text>
        </TouchableOpacity>

        {/* Start Game CTA */}
        <Animated.View style={[styles.ctaWrapper, { transform: [{ scale: buttonScale }] }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handleStart}
            style={styles.startBtn}>
            <Text style={styles.startBtnText}>Start Game</Text>
            <View style={styles.startBtnIcon}>
              <Ionicons name="play" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Color.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  pageHeaderRow: { marginBottom: 18 },
  headerContent: { flex: 1 },
  pageTitle: { fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, color: Color.primary },
  pageSubtitle: { marginTop: 4, fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: Color.onSurfaceVariant },
  sectionTitle: { marginTop: 24, marginBottom: 12, fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: Color.onSurface },

  sectionHeaderRow: { marginTop: 2 },
  loadingBox: { marginTop: 20, paddingVertical: 20, alignItems: 'center' },
  emptyBox: {
    marginTop: 12,
    borderRadius: 20,
    padding: 20,
    backgroundColor: Color.surface,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Medium',
    textAlign: 'center',
  },
  loadMoreBtn: { marginTop: 20, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DDD' },
  loadMoreText: { color: Color.primary, fontWeight: '600' },

  ctaWrapper: { marginTop: 2 },
  startBtn: { marginTop: 20, backgroundColor: Color.primary, padding: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  startBtnIcon: { marginLeft: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15, padding: 5 },
  bottomSpacer: { height: 28 },
});