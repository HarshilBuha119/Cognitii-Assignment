import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const Stack = createNativeStackNavigator();
const testFirestore = async () => {
  try {
    await firestore().collection('sessions').add({
      createdAt: firestore.FieldValue.serverTimestamp(),
      test: true,
    });
    console.log('Firestore working');
  } catch (e) {
    console.log('Firestore error:', e);
  }
};

export default function App() {
  useEffect(() => {
    testFirestore();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
            <Stack.Screen options={{ headerShown: false }} name="Game" component={GameScreen} />
            <Stack.Screen options={{ headerShown: false }} name="Summary" component={SummaryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}