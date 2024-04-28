import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Landing from './screens/Landing';
import Chat from './screens/Chat';
import Score from './screens/Score';
import Review from './screens/Review';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Landing"
        screenOptions={{ headerShown: false }} 
      >
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="Review" component={Review} />
        <Stack.Screen name="Score" component={Score} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
