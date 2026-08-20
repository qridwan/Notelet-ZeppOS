import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useDatabaseReady } from './src/hooks/useDatabaseReady';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const { ready, error } = useDatabaseReady();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Database error: {error.message}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return <RootNavigator />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: '#c0392b',
    padding: 20,
    textAlign: 'center',
  },
});
