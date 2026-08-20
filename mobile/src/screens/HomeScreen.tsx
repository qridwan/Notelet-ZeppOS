import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EmptyState } from '../components/EmptyState';
import { FolderRow, NavRow } from '../components/FolderRow';
import { PromptModal } from '../components/PromptModal';
import { folderService } from '../services/folders/folderService';
import { Folder } from '../types/domain';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [renaming, setRenaming] = useState<Folder | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = useCallback(() => {
    folderService.list().then(setFolders);
  }, []);

  useFocusEffect(reload);

  function onFolderLongPress(folder: Folder) {
    Alert.alert(folder.name, undefined, [
      { text: 'Rename', onPress: () => setRenaming(folder) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => confirmDeleteFolder(folder),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  // FR-MOB-003: deleting a folder must clearly warn that its notes move to
  // Uncategorized, not disappear.
  function confirmDeleteFolder(folder: Folder) {
    Alert.alert(
      'Delete folder?',
      'Notes inside this folder will be moved to Uncategorized.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await folderService.delete(folder.id);
            reload();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <NavRow icon="🔍" label="Search" onPress={() => navigation.navigate('Search')} />
            <NavRow
              icon="⭐"
              label="Pinned"
              onPress={() => navigation.navigate('NoteList', { source: { type: 'pinned' } })}
            />
            <NavRow
              icon="🕐"
              label="Recent"
              onPress={() => navigation.navigate('NoteList', { source: { type: 'recent' } })}
            />
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Folders</Text>
              <Pressable onPress={() => setCreating(true)}>
                <Text style={styles.addButton}>+ New</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <FolderRow
            folder={item}
            onPress={() =>
              navigation.navigate('NoteList', {
                source: { type: 'folder', folderId: item.id, title: item.name },
              })
            }
            onLongPress={() => onFolderLongPress(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState message="No folders yet. Create your first folder." />
        }
      />

      <PromptModal
        visible={creating}
        title="New folder"
        placeholder="Folder name"
        confirmLabel="Create"
        onCancel={() => setCreating(false)}
        onConfirm={async (name) => {
          setCreating(false);
          await folderService.create({ name });
          reload();
        }}
      />

      <PromptModal
        visible={renaming !== null}
        title="Rename folder"
        initialValue={renaming?.name}
        onCancel={() => setRenaming(null)}
        onConfirm={async (name) => {
          if (renaming) {
            await folderService.rename(renaming.id, { name });
          }
          setRenaming(null);
          reload();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8a8a8e',
    textTransform: 'uppercase',
  },
  addButton: {
    fontSize: 14,
    color: '#409eff',
    fontWeight: '600',
  },
});
