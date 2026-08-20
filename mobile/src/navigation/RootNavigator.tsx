import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { NoteListScreen } from '../screens/NoteListScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { NoteDetailScreen } from '../screens/NoteDetailScreen';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Notelet' }} />
        <Stack.Screen name="NoteList" component={NoteListScreen} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} options={{ title: '' }} />
        <Stack.Screen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
