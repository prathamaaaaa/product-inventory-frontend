
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");
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
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  

  const messaging = firebase.messaging();
  console.log("Firebase Messaging initialized",messaging);
  messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const { title, body } = payload.notification;
    const notificationOptions = {
      body,
      icon: '/logo192.png'
    };
  
    self.registration.showNotification(title, notificationOptions);
  });