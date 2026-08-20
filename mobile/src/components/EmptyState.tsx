import { StyleSheet, Text, View } from 'react-native';

// SRS #50: every list needs a meaningful empty state, not a blank screen.
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  text: {
    color: '#8a8a8e',
    fontSize: 15,
    textAlign: 'center',
  },
});
