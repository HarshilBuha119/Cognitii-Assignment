// App.js
import React from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import {Color} from './assets/images/theme';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const renderPlayTabIcon = ({color, size}: {color: string; size: number}) => (
  <Ionicons name="game-controller-outline" size={size} color={color} />
);

const renderHistoryTabIcon = ({color, size}: {color: string; size: number}) => (
  <Ionicons name="time-outline" size={size} color={color} />
);

// Bottom tabs: Play + History only
function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="PlayTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: Color.primary,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: 'rgba(21, 28, 39, 0.15)',
          shadowOpacity: 0.9,
          shadowOffset: {width: 0, height: -4},
          shadowRadius: 16,
          borderTopLeftRadius: 35,
          borderTopRightRadius: 35,
        },
        tabBarActiveTintColor: Color.surface,
        tabBarInactiveTintColor: '#A1A1B5',
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: 11,
        },
      }}>
      {/* Simple “Play” launcher tab (shows history but focused on playing) */}
      <Tab.Screen
        name="PlayTab"
        component={HomeScreen}
        options={{
          title: 'Play',
          tabBarIcon: renderPlayTabIcon,
        }}
      />
      {/* History tab using the same screen, but navigation still works */}
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: renderHistoryTabIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{headerShown: false}}>
            {/* Tabs (Play / History) */}
            <RootStack.Screen name="Tabs" component={Tabs} />

            {/* Full-screen game flow, outside tabs */}
            <RootStack.Screen name="Game" component={GameScreen} />
            <RootStack.Screen name="Summary" component={SummaryScreen} />
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});