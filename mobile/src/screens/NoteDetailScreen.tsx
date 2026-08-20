import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { folderService } from '../services/folders/folderService';
import { noteService } from '../services/notes/noteService';
import { Note } from '../types/domain';
import { formatUpdatedAt } from '../utils/format';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NoteDetail'>;
type Route = RouteProp<RootStackParamList, 'NoteDetail'>;

// FR-MOB-007: title, description, folder, and last-updated must all be visible.
export function NoteDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { noteId } = useRoute<Route>().params;
  const [note, setNote] = useState<Note | null>(null);
  const [folderName, setFolderName] = useState('Uncategorized');

  const reload = useCallback(() => {
    noteService.getById(noteId).then(async (result) => {
      setNote(result);
      if (result?.folderId) {
        const folder = await folderService
          .list()
          .then((folders) => folders.find((f) => f.id === result.folderId));
        setFolderName(folder?.name ?? 'Uncategorized');
      } else {
        setFolderName('Uncategorized');
      }
    });
  }, [noteId]);

  useFocusEffect(reload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        note ? (
          <Text
            style={styles.headerAction}
            onPress={() => navigation.navigate('NoteEditor', { noteId: note.id })}
          >
            Edit
          </Text>
        ) : null,
    });
  }, [navigation, note]);

  function confirmDelete() {
    if (!note) return;
    Alert.alert('Delete note?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await noteService.delete(note.id);
          navigation.goBack();
        },
      },
    ]);
  }

  if (!note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.meta}>Note not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.meta}>
        {folderName} · Updated {formatUpdatedAt(note.updatedAt)}
      </Text>
      <Text style={styles.description}>{note.description}</Text>
      <Text style={styles.deleteAction} onPress={confirmDelete}>
        Delete note
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  meta: {
    fontSize: 13,
    color: '#8a8a8e',
    marginTop: 6,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1c1c1e',
  },
  headerAction: {
    fontSize: 15,
    color: '#409eff',
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  deleteAction: {
    marginTop: 32,
    fontSize: 15,
    color: '#e0554b',
    fontWeight: '600',
  },
});
