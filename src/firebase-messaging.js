import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAo2bSSFR3aoreToARrj0qAkMGzm66zUOo",
  authDomain: "first-notification-4a609.firebaseapp.com",
  projectId: "first-notification-4a609",
  storageBucket: "first-notification-4a609.firebasestorage.app",
  messagingSenderId: "548593555701",
  appId: "1:548593555701:web:b98902291176df4fc38dbc",
  measurementId: "G-P4NBYTB7B4",
  vapidKey: 'BIn57GMZJi-jJkf2yQ8ydgjt2a4Uj9lhNJTaI66PYSeSe8mVgIwhbe658Lf2AhfJvcVTC3aCHDQJyJtuZgz4R7Q'
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


export const handleForegroundNotification = () => {
  onMessage(messaging, (payload) => {
    console.log("[firebase-messaging.js] Foreground notification received:", payload);

    const { title, body } = payload.notification;

    alert(`New Notification: ${title}\n${body}`);
  });
};
// Register service worker
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
};

// Request Notification permission and get FCM Token
const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted");
      const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log("Notification permission denied");
    }
  } catch (err) {
    console.error("Permission request failed:", err);
  }
};


// Get Firebase Token
const getFirebaseToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("No registration token available.");
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};

// Foreground Message Handling
const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("Message ddddddddddd. ", payload);

    const notificationTitle = payload.notification?.title;
    const notificationOptions = {
      body: payload.notification?.body,
      icon: '/logo192.png',
    };

    if (notificationTitle) {
      new Notification(notificationTitle, notificationOptions);
    }

    if (callback) callback(payload);
  });
};


const initializeFirebaseMessaging = async () => {
  try {
    registerServiceWorker();  // Register the service worker.
    const token = await requestPermission();  // Request notification permission and get the token.
    if (token) {
      console.log("FCM Token:", token);
      // Send token to your backend for storage (if needed).
    }
    
const getFirebaseToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
    if (token) {
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("No registration token available.");
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
  }
};
    // Handle foreground notifications:
    onMessageListener((payload) => {
      console.log("Message received. ", payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
      };
      new Notification(notificationTitle, notificationOptions);
    });

  } catch (err) {
    console.error("Error initializing Firebase Messaging:", err);
  }
};

// Request Firebase Token function (for adding token to backend)
const requestFirebaseToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: firebaseConfig.vapidKey });
      return token;
    } else {
      console.warn("Permission not granted for notifications");
      return null;
    }
  } catch (err) {
    console.error("Error requesting Firebase token:", err);
    return null;
  }
};

export { initializeFirebaseMessaging, getFirebaseToken, onMessageListener, requestFirebaseToken };
