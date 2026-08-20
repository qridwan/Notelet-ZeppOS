import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { NoteListItem } from '../components/NoteListItem';
import { noteService } from '../services/notes/noteService';
import { Note } from '../types/domain';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Search'>;

// FR-MOB-008: search runs entirely offline against the local database, no
// network round-trip involved.
export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      noteService.search(trimmed).then(setResults);
    }, 150);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search titles, notes, folders"
        autoFocus
        returnKeyType="search"
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteListItem
            note={item}
            onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
          />
        )}
        ListEmptyComponent={
          <EmptyState message={query.trim() ? 'No matching notes.' : 'Start typing to search.'} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#d0d0d5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
});
