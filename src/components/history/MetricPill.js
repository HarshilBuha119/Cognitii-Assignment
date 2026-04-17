import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Color } from '../../../assets/images/theme';

export default function MetricPill({ icon, label, value, color }) {
    return (
        <View style={styles.metricPill}>
            <Ionicons name={icon} size={14} color={color} />
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    metricPill: {
        width: '22%',
        backgroundColor: Color.surfaceLow,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        alignItems:"center"
    },
    metricValue: {
        marginTop: 6,
        fontSize: 16,
        color: Color.onSurface,
        fontFamily: 'PlusJakartaSans-Bold',
    },
    metricLabel: {
        marginTop: 2,
        fontSize: 11,
        color: Color.onSurfaceVariant,
        fontFamily: 'PlusJakartaSans-Medium',
    },
});
