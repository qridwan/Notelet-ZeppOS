import { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { folderService } from '../services/folders/folderService';
import { noteService } from '../services/notes/noteService';
import { Folder } from '../types/domain';
import { ValidationError } from '../utils/validation';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'NoteEditor'>;
type Route = RouteProp<RootStackParamList, 'NoteEditor'>;

const UNCATEGORIZED = { id: null, name: 'Uncategorized' };

// FR-MOB-004/005: create and edit share one form — a note's title, description,
// folder, and pinned status are all editable in the same place.
export function NoteEditorScreen() {
  const navigation = useNavigation<Nav>();
  const { noteId, folderId } = useRoute<Route>().params ?? {};

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folderId ?? null);
  const [isPinned, setIsPinned] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    folderService.list().then(setFolders);
  }, []);

  useEffect(() => {
    if (!noteId) return;
    noteService.getById(noteId).then((note) => {
      if (!note) return;
      setTitle(note.title);
      setDescription(note.description);
      setSelectedFolderId(note.folderId);
      setIsPinned(note.isPinned);
    });
  }, [noteId]);

  async function onSave() {
    try {
      if (noteId) {
        await noteService.update(noteId, {
          title,
          description,
          folderId: selectedFolderId,
          isPinned,
        });
      } else {
        await noteService.create({
          title,
          description,
          folderId: selectedFolderId,
          isPinned,
        });
      }
      navigation.goBack();
    } catch (error) {
      if (error instanceof ValidationError) {
        Alert.alert('Cannot save note', error.message);
      } else {
        throw error;
      }
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: noteId ? 'Edit Note' : 'New Note',
      headerRight: () => (
        <Text style={styles.saveAction} onPress={onSave}>
          Save
        </Text>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, noteId, title, description, selectedFolderId, isPinned]);

  const selectedFolder =
    [UNCATEGORIZED, ...folders].find((f) => f.id === selectedFolderId) ?? UNCATEGORIZED;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        autoFocus={!noteId}
      />
      <TextInput
        style={styles.descriptionInput}
        value={description}
        onChangeText={setDescription}
        placeholder="Write your note…"
        multiline
        textAlignVertical="top"
      />

      <Pressable style={styles.row} onPress={() => setPickerVisible(true)}>
        <Text style={styles.rowLabel}>Folder</Text>
        <Text style={styles.rowValue}>{selectedFolder.name}</Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Pinned</Text>
        <Switch value={isPinned} onValueChange={setIsPinned} />
      </View>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <FlatList
          data={[UNCATEGORIZED, ...folders]}
          keyExtractor={(item) => item.id ?? 'uncategorized'}
          renderItem={({ item }) => (
            <Pressable
              style={styles.pickerRow}
              onPress={() => {
                setSelectedFolderId(item.id);
                setPickerVisible(false);
              }}
            >
              <Text style={styles.pickerLabel}>{item.name}</Text>
              {item.id === selectedFolderId && <Text>✓</Text>}
            </Pressable>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e2e6',
  },
  rowLabel: {
    fontSize: 15,
    color: '#1c1c1e',
  },
  rowValue: {
    fontSize: 15,
    color: '#8a8a8e',
  },
  saveAction: {
    fontSize: 15,
    color: '#409eff',
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e2e6',
  },
  pickerLabel: {
    fontSize: 16,
  },
});
