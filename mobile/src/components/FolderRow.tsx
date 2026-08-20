import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Folder } from '../types/domain';

export function FolderRow({
  folder,
  onPress,
  onLongPress,
}: {
  folder: Folder;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable style={styles.container} onPress={onPress} onLongPress={onLongPress}>
      <Text style={styles.icon}>📁</Text>
      <Text style={styles.label}>{folder.name}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function NavRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e2e6',
  },
  icon: {
    fontSize: 18,
    width: 28,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
  },
  chevron: {
    fontSize: 18,
    color: '#c0c0c5',
  },
});
