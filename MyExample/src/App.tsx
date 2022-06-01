import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RoomScreen} from './RoomScreen';
import {HomeScreen} from './HomeScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Meet',
            headerStyle: {
              backgroundColor: '#131121',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Room"
          options={({route}: any) => ({
            title: `Комната: ${route.params.roomId}`,
            headerStyle: {
              backgroundColor: '#131121',
            },
            presentation: 'modal',
            headerTintColor: '#fff',
          })}
          component={RoomScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
