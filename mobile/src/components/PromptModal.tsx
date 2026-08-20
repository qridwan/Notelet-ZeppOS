import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type PromptModalProps = {
  visible: boolean;
  title: string;
  placeholder?: string;
  initialValue?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

// Cross-platform stand-in for a native text-input alert (iOS-only Alert.prompt
// isn't available on Android). Used for create/rename folder flows.
export function PromptModal({
  visible,
  title,
  placeholder,
  initialValue = '',
  confirmLabel = 'Save',
  onCancel,
  onConfirm,
}: PromptModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => {
                if (value.trim().length === 0) return;
                onConfirm(value);
              }}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '84%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 20,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  buttonText: {
    fontSize: 15,
    color: '#666',
  },
  confirmText: {
    color: '#409eff',
    fontWeight: '600',
  },
});
