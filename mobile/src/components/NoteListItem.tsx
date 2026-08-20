import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Note } from '../types/domain';
import { truncate } from '../utils/format';

export function NoteListItem({ note, onPress }: { note: Note; onPress: () => void }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.textColumn}>
        <Text style={styles.title} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={styles.preview} numberOfLines={1}>
          {truncate(note.description, 80)}
        </Text>
      </View>
      {note.isPinned && <Text style={styles.pin}>⭐</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e2e6',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
  },
  preview: {
    fontSize: 13,
    color: '#8a8a8e',
    marginTop: 2,
  },
  pin: {
    marginLeft: 8,
    fontSize: 16,
  },
});
