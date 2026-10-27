// 1) Впишите реальные значения Firebase Console → Project settings → Your apps.
// 2) Укажите HTTPS URL развёрнутого SMS API.
// Не помещайте сюда Twilio Auth Token или постоянные TURN-пароли.
window.HO_API_BASE = 'https://YOUR-SMS-SERVER.example.com';
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  appId: 'YOUR_FIREBASE_APP_ID'
};
window.HO_FIREBASE_CONFIG =
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
    ? firebaseConfig : null;
// Для стабильных звонков добавьте TURN от своего coturn или провайдера.
// TURN credentials лучше получать временными с backend, не хранить постоянный пароль в GitHub.
// window.HO_TURN_SERVERS = [{ urls: 'turn:YOUR_TURN_HOST:3478', username: 'TEMP_USERNAME', credential: 'TEMP_PASSWORD' }];
