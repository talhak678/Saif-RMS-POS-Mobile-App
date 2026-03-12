import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    // For standalone/dev builds, we MUST have a projectId
    const projectId = 
      Constants?.expoConfig?.extra?.eas?.projectId ?? 
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.error("Project ID not found in Constants. Check your app.json and eas.json.");
      alert("Notification error: Project ID missing. Check console.");
      return;
    }

    try {
      const expoPushToken = await Notifications.getExpoPushTokenAsync({ projectId });
      token = expoPushToken.data;
      console.log("Expo Push Token Successfully Generated:", token);
    } catch (e) {
      console.error("Error getting Expo Push Token:", e);
      alert(`Error getting push token: ${e}`);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
