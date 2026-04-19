import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Images } from '../../../assets/images/images';
import { Color } from '../../../assets/images/theme';

function GameSidebar({
    minutes,
    seconds,
    isWarningTime,
    targetFruit,
    stats,
    accuracyPct,
    isSaving,
    sidebarWidth,
    cameraPermissionDenied,
    onClosePress,
}) {
    return (
        <View style={[styles.sidebar, sidebarWidth ? { width: sidebarWidth } : null]}>
            <View style={styles.topRow}>
                <Text style={styles.topTitle}>Game</Text>
                <Pressable
                    onPress={onClosePress}
                    disabled={isSaving}
                    hitSlop={12}
                    style={({pressed}) => [
                        styles.closeButton,
                        pressed && !isSaving ? styles.closeButtonPressed : null,
                        isSaving ? styles.closeButtonDisabled : null,
                    ]}>
                    <Ionicons name="close" size={18} color={Color.onSurface} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sidebarSection}>
                    <Text style={styles.sectionLabel}>TIME</Text>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="alarm-outline" size={20} color="#79a9ff" />
                        <Text style={[styles.timer, isWarningTime && styles.timerWarning]}>
                            {minutes}:{seconds}
                        </Text>
                    </View>
                    {isWarningTime ? (
                        <Text style={styles.warningText}>Hurry up!</Text>
                    ) : (
                        <Text style={styles.helperText}>Keep spotting fruits.</Text>
                    )}
                </View>

                <View style={styles.sidebarSection}>
                    <Text style={styles.sectionLabel}>TARGET</Text>
                    <View style={styles.targetBadge}>
                        <Image
                            source={Images[targetFruit]}
                            style={styles.targetImage}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.targetName}>{targetFruit}</Text>
                </View>

                <View style={styles.sidebarSection}>
                    <Text style={styles.sectionLabel}>SCORE</Text>

                    <View style={styles.statRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
                        <Text style={styles.statText}>{stats.correctTaps}</Text>
                        <Text style={styles.statHint}>Correct</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Ionicons name="close-circle" size={18} color="#f87171" />
                        <Text style={styles.statText}>{stats.incorrectTaps}</Text>
                        <Text style={styles.statHint}>Wrong</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Ionicons name="scan-circle" size={18} color="#facc15" />
                        <Text style={styles.statText}>{accuracyPct}%</Text>
                        <Text style={styles.statHint}>Accuracy</Text>
                    </View>

                    <View style={styles.statRow}>
                        <Ionicons name="finger-print" size={18} color="#c4b5fd" />
                        <Text style={styles.statText}>{stats.totalTaps}</Text>
                        <Text style={styles.statHint}>Taps</Text>
                    </View>
                </View>

                {isSaving ? (
                    <View style={styles.sidebarSection}>
                        <Text style={styles.savingText}>Saving session...</Text>
                    </View>
                ) : null}

                {cameraPermissionDenied ? (
                    <View style={styles.sidebarSection}>
                        <Text style={styles.cameraNoteText}>Camera permission is off. Gameplay tracking continues.</Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}

export default React.memo(GameSidebar, (prev, next) => (
    prev.minutes === next.minutes &&
    prev.seconds === next.seconds &&
    prev.isWarningTime === next.isWarningTime &&
    prev.targetFruit === next.targetFruit &&
    prev.accuracyPct === next.accuracyPct &&
    prev.isSaving === next.isSaving &&
    prev.sidebarWidth === next.sidebarWidth &&
    prev.cameraPermissionDenied === next.cameraPermissionDenied &&
    prev.onClosePress === next.onClosePress &&
    prev.stats.totalTaps === next.stats.totalTaps &&
    prev.stats.correctTaps === next.stats.correctTaps &&
    prev.stats.incorrectTaps === next.stats.incorrectTaps &&
    prev.stats.backgroundTaps === next.stats.backgroundTaps
));

const styles = StyleSheet.create({
    sidebar: {
        width: 180,
        flexGrow: 0,
        flexShrink: 0,
        paddingVertical: 18,
        paddingHorizontal: 12,
        backgroundColor: Color.surfaceLow,
        borderTopRightRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: 'rgba(21, 28, 39, 0.2)',
        shadowOpacity: 0.8,
        shadowOffset: { width: 4, height: 0 },
        shadowRadius: 16,
    },
    topRow: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topTitle: {
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 14,
        color: Color.onSurface,
    },
    closeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.75)',
    },
    closeButtonPressed: {
        transform: [{ scale: 0.96 }],
        opacity: 0.85,
    },
    closeButtonDisabled: {
        opacity: 0.4,
    },
    sidebarSection: {
        marginBottom: 18,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.65)',
    },
    sectionLabel: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: 11,
        letterSpacing: 1,
        color: Color.onSurfaceVariant,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    timer: {
        marginLeft: 6,
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 20,
        color: Color.onSurface,
    },
    timerWarning: {
        color: '#f97316',
    },
    warningText: {
        marginTop: 4,
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 11,
        color: '#f97316',
    },
    helperText: {
        marginTop: 4,
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: 11,
        color: Color.onSurfaceVariant,
    },
    targetBadge: {
        marginTop: 10,
        alignSelf: 'center',
        width: 78,
        height: 78,
        borderRadius: 28,
        backgroundColor: Color.surface,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(21, 28, 39, 0.18)',
        shadowOpacity: 0.9,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
    },
    targetImage: {
        width: 60,
        height: 60,
    },
    targetName: {
        marginTop: 8,
        alignSelf: 'center',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: 13,
        color: Color.onSurface,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statText: {
        marginLeft: 6,
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: 14,
        color: Color.onSurface,
    },
    statHint: {
        marginLeft: 4,
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: 11,
        color: Color.onSurfaceVariant,
    },
    savingText: {
        marginTop: 6,
        fontFamily: 'PlusJakartaSans-Medium',
        fontSize: 12,
        color: Color.primary,
        textAlign: 'center',
    },
    cameraNoteText: {
        marginTop: 4,
        textAlign: 'center',
        color: Color.onSurfaceVariant,
        fontSize: 11,
        fontFamily: 'PlusJakartaSans-Regular',
    },
});
