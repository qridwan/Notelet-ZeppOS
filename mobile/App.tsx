import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useDatabaseReady } from './src/hooks/useDatabaseReady';
import { folderService } from './src/services/folders/folderService';
import { noteService } from './src/services/notes/noteService';

// Phase 2 deliverable check (SRS §63): prove the offline SQLite database
// initializes and survives a create round-trip. Screen UI is Phase 3.
export default function App() {
  const { ready, error } = useDatabaseReady();
  const [summary, setSummary] = useState<string>('');

  useEffect(() => {
    if (!ready) return;

    (async () => {
      const folders = await folderService.list();
      const notes = await noteService.listRecent();
      setSummary(`${folders.length} folders, ${notes.length} notes on device`);
    })();
  }, [ready]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notelet</Text>
      {error && <Text style={styles.error}>DB error: {error.message}</Text>}
      {!error && <Text>{ready ? summary || 'Database ready' : 'Opening database…'}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  error: {
    color: '#c0392b',
  },
});
