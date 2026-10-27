# HollOram — GitHub / SMS / Android starter

## Что уже сделано в интерфейсе
- SMS-код запрашивается у API (`/api/auth/sms/send`) и проверяется сервером (`/api/auth/sms/verify`); код больше не генерируется и не показывается самим интерфейсом.
- Ограничение ширины/горизонтального переполнения и safe-area для мобильных экранов.
- Анимационная карточка выдачи/снятия галочек с названием каждого значка.
- В админ-панели значки можно назначать аккаунтам, группам и каналам по нику, номеру, названию или ID.
- В коде уже есть WebRTC-аудио/видеозвонки с сигнализацией через Firestore; TURN-сервер рекомендуется для стабильной связи за NAT/мобильными сетями.

**Важно:** этот репозиторий — стартовый шаблон. Для реальной работы нужны ваши Firebase и Twilio настройки. SMS не заработают до настройки секретов; вызовы не соединятся между устройствами без правильно настроенного Firestore и часто TURN. Firebase anonymous auth в этом шаблоне не является полноценной защитой аккаунта, а `firestore.rules` намеренно помечен DEMO ONLY — не выкладывайте с этими правилами личные данные и не используйте их в production.

## 1. Настроить реальную SMS-отправку через Twilio Verify
1. Создайте аккаунт Twilio и Verify Service (SMS). Для некоторых стран нужны дополнительные проверки/разрешения и баланс.
2. Скопируйте SID аккаунта (`AC...`), Auth Token и SID Verify Service (`VA...`).
3. На хостинге Node.js (например Render Web Service) задайте переменные окружения из `.env.example`. **Не коммитьте `.env` или токены в GitHub.**
4. Команда сборки: `npm install`; команда запуска: `npm start`; health check: `/health`.
5. В `firebase-config.js` замените `HO_API_BASE` на HTTPS URL сервера. `CORS_ORIGIN` на сервере установите в URL вашего сайта/домена (для быстрого теста можно `*`, но предпочтительнее точный origin).
6. Twilio Verify отправляет/проверяет код и не раскрывает его браузеру.

## 2. Подключить Firestore для чатов и звонков
1. В Firebase Console создайте проект и Web App.
2. Authentication → Sign-in method → включите **Anonymous**.
3. Создайте Firestore Database.
4. Скопируйте `apiKey`, `authDomain`, `projectId`, `appId` в `firebase-config.js`.
5. Настройте Firestore Security Rules до production. Файл `firestore.rules` открыт для демо и НЕ безопасен для публикации; он лишь помогает проверить интеграцию в тестовом проекте.
6. Разместите корень репозитория (где лежит `index.html`) как статический сайт (Firebase Hosting или другой HTTPS-хостинг). GitHub Pages не запускает `server.js`, поэтому SMS API нужно развернуть отдельно.

## 3. Звонки
- В приложении уже реализованы WebRTC audio/video calls, входящий вызов, принять/отклонить и завершение.
- Firebase Firestore должен принимать чтение/запись `calls/{id}` и `calls/{id}/c/{candidateId}` для обоих участников.
- Для теста используйте HTTPS сайт или APK: браузерный микрофон/камера требуют secure context и разрешений.
- STUN в коде помогает обнаружить адреса, но не ретранслирует медиапоток. Для надёжной работы подключите TURN (например coturn или TURN-провайдера) и заполните `window.HO_TURN_SERVERS` в `firebase-config.js`. TURN credentials лучше выдавать временными с backend, не хранить постоянный пароль в публичном репозитории.

## 4. Загрузить на GitHub
```bash
git init
git add .
git commit -m "Initial HollOram app"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```
Создайте пустой репозиторий на GitHub и замените URL на свой. Проверьте, что `.env` отсутствует в коммите.

## 5. Получить APK из GitHub Actions
1. Откройте репозиторий → **Actions** → workflow **Build Android APK** → **Run workflow** (или сделайте push в `main`).
2. Дождитесь зелёного статуса.
3. Откройте завершённый запуск и скачайте Artifact **HollOram-debug-apk**. Внутри будет `app-debug.apk`.
4. Установите APK на тестовый Android, разрешив установку из этого источника. Это debug APK для тестирования, не подписанный релиз.
5. Для публикации соберите подписанный release APK/AAB с keystore и GitHub Secrets; не храните keystore в репозитории.

## Локальный запуск SMS API
```bash
cp .env.example .env
# заполните .env реальными Twilio данными
npm install
npm start
```
Затем временно укажите `window.HO_API_BASE = 'http://localhost:3000'` для локального теста (на реальном телефоне localhost означает сам телефон, а не компьютер; используйте доступный HTTPS сервер).
