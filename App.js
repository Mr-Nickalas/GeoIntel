import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MainScreen from './src/screens/MainScreen';
import { colors } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <MainScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.browserBar,
  },
});
