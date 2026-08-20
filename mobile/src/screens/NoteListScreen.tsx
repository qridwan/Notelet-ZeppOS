import { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { EmptyState } from '../components/EmptyState';
import { NoteListItem } from '../components/NoteListItem';
import { noteService } from '../services/notes/noteService';
import { Note } from '../types/domain';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NoteList'>;
type Route = RouteProp<RootStackParamList, 'NoteList'>;

const EMPTY_MESSAGES = {
  folder: 'No notes yet. Create your first note.',
  pinned: 'No pinned notes.',
  recent: 'No notes yet.',
};

export function NoteListScreen() {
  const navigation = useNavigation<Nav>();
  const { source } = useRoute<Route>().params;
  const [notes, setNotes] = useState<Note[]>([]);

  const title = source.type === 'folder' ? source.title : source.type === 'pinned' ? 'Pinned' : 'Recent';

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  const reload = useCallback(() => {
    if (source.type === 'folder') {
      noteService.listByFolder(source.folderId).then(setNotes);
    } else if (source.type === 'pinned') {
      noteService.listPinned().then(setNotes);
    } else {
      noteService.listRecent().then(setNotes);
    }
  }, [source]);

  useFocusEffect(reload);

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteListItem
            note={item}
            onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
          />
        )}
        ListEmptyComponent={<EmptyState message={EMPTY_MESSAGES[source.type]} />}
      />

      {source.type === 'folder' && (
        <Pressable
          style={styles.fab}
          onPress={() =>
            navigation.navigate('NoteEditor', { folderId: source.folderId })
          }
        >
          <Text style={styles.fabLabel}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#409eff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabLabel: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
  },
});
