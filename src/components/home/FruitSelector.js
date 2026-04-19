import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Images } from '../../../assets/images/images';
import { Color } from '../../../assets/images/theme';

const FRUIT_PREVIEW = ['Carrot', 'Apple', 'Banana', 'Grape'];

export default function FruitSelector({ targetFruit, onSelect }) {
    return (
        <>
            <Text style={styles.sectionTitle}>Choose Target Fruit</Text>
            <View style={styles.fruitStrip}>
                {FRUIT_PREVIEW.map(fruit => {
                    const active = fruit === targetFruit;

                    return (
                        <TouchableOpacity
                            key={fruit}
                            activeOpacity={0.9}
                            onPress={() => onSelect(fruit)}
                            style={[styles.fruitChip, active && styles.fruitChipActive]}>
                            <View style={styles.fruitThumbWrap}>
                                <Image source={Images[fruit]} style={styles.fruitChipImage} resizeMode="contain" />
                            </View>

                            <Text style={[styles.fruitChipLabel, active && styles.fruitChipLabelActive]}>
                                {fruit}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        marginTop: 24,
        marginBottom: 12,
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 18,
        color: Color.onSurface,
    },
    fruitStrip: { flexDirection: 'row', justifyContent: 'space-between' },
    fruitChip: {
        width: '22%',
        alignItems: 'center',
        padding: 10,
        borderRadius: "100%",
        backgroundColor: Color.surface,
    },
    fruitChipActive: {
        backgroundColor: '#F3E8FF',
        borderWidth: 1,
        borderColor: Color.primary,
    },
    fruitThumbWrap: {
        width: 40,
        height: 40,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fruitChipImage: { width: 30, height: 30 },
    fruitChipLabel: { fontSize: 12, color: Color.onSurfaceVariant },
    fruitChipLabelActive: { color: Color.primary, fontWeight: '700' },
});
