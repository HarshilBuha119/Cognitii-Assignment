import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BarChart } from 'react-native-gifted-charts';
import { Color } from '../../../assets/images/theme';

export default function AccuracyTrendsCard({
  chartData,
  avgAccuracy,
  loading,
}) {
  return (
    <View style={styles.cardLarge}>
      <View style={styles.trendHeaderRow}>
        <View>
          <Text style={styles.trendTitle}>Accuracy Trends</Text>
          <Text style={styles.trendSubtitle}>Last 7 Sessions</Text>
        </View>

        <View style={styles.avgBadge}>
          <Ionicons name="trending-up" size={14} color={Color.primary} />
          <Text style={styles.avgBadgeValue}>{avgAccuracy}% Avg</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {/* 🔄 LOADING STATE */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Color.primary} />
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        ) : chartData.length === 0 ? (
          /* 📭 EMPTY STATE */
          <View style={styles.emptyChart}>
            <Ionicons
              name="bar-chart-outline"
              size={32}
              color={Color.outlineVariant}
            />
            <Text style={styles.emptyChartText}>No sessions yet</Text>
            <Text style={styles.emptyChartSub}>
              Play a game to see your accuracy trend here.
            </Text>
          </View>
        ) : (
          /* 📊 CHART */
          <BarChart
            data={chartData}
            barWidth={28}
            spacing={15}
            roundedBottom={false}
            capRadius={15}
            hideRules={false}
            rulesType="solid"
            rulesColor="rgba(0,0,0,0.05)"
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={4}
            maxValue={100}
            frontColor={Color.primary}
            isAnimated
            animationDuration={800}
            height={140}
            yAxisLabelTexts={['0%', '25%', '50%', '75%', '100%']}
            yAxisTextStyle={styles.chartYText}
            xAxisLabelTextStyle={styles.chartXText}
            showFractionalValues={false}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardLarge: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: Color.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  trendHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  trendTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: Color.onSurface,
  },
  trendSubtitle: {
    fontSize: 13,
    color: Color.onSurfaceVariant,
  },
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  avgBadgeValue: {
    marginLeft: 5,
    color: Color.primary,
    fontWeight: '700',
  },
  chartContainer: {
    marginLeft: -20,
    marginTop: 10,
    paddingLeft: 10,
    overflow: 'hidden',
  },
  chartYText: { color: Color.onSurfaceVariant, fontSize: 10 },
  chartXText: {
    color: Color.onSurfaceVariant,
    fontSize: 10,
    width: 20,
    textAlign: 'center',
  },
  emptyChart: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: Color.onSurface,
  },
  emptyChartSub: {
    marginTop: 4,
    fontSize: 12,
    color: Color.onSurfaceVariant,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  loadingContainer: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Color.onSurfaceVariant,
    fontFamily: 'PlusJakartaSans-Medium',
  },
});
