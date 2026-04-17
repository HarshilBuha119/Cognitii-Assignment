import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Images } from '../../../assets/images/images';
import { Color } from '../../../assets/images/theme';

export default function HomeTopBar() {
    return (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconPill} activeOpacity={0.8}>
                
            </TouchableOpacity>

            <View style={styles.appBarCenter}>
                <Text style={styles.appBarTitle}>Fruit Learner</Text>
            </View>

            <View style={styles.avatarRing}>
                <Image source={Images.Cartoon} style={styles.avatarImage} resizeMode="cover" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    iconPill: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appBarCenter: { flex: 1, alignItems: 'center' },
    appBarTitle: {
        fontFamily: 'PlusJakartaSans-Bold',
        fontSize: 18,
        color: Color.primary,
    },
    avatarRing: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Color.primary,
    },
    avatarImage: { width: '100%', height: '100%' },
});
