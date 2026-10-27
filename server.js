require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));
const origins = (process.env.CORS_ORIGIN || '').split(',').map(x => x.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || origins.includes('*') || origins.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use('/api/auth/sms', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false }));
const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID'];
function twilioClient() {
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) throw new Error('SMS service is not configured. Missing: ' + missing.join(', '));
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}
app.get('/health', (_req, res) => res.json({ ok: true, service: 'HollOram SMS API' }));
app.post('/api/auth/sms/send', async (req, res) => {
  try {
    const phone = String(req.body?.phone || '');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return res.status(400).json({ error: 'Введите номер в международном формате, например +79991234567' });
    const client = twilioClient();
    const result = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verifications.create({ to: phone, channel: 'sms' });
    if (!['pending', 'approved'].includes(result.status)) return res.status(502).json({ error: 'SMS-провайдер не принял запрос' });
    res.json({ ok: true, status: result.status });
  } catch (e) {
    console.error('SMS send failed:', e.message);
    res.status(502).json({ error: 'Не удалось отправить SMS. Проверьте номер, баланс и настройки Twilio Verify.' });
  }
});
app.post('/api/auth/sms/verify', async (req, res) => {
  try {
    const phone = String(req.body?.phone || '');
    const code = String(req.body?.code || '').trim();
    if (!/^\+[1-9]\d{7,14}$/.test(phone) || !/^\d{4,10}$/.test(code)) return res.status(400).json({ error: 'Неверный номер или формат кода' });
    const client = twilioClient();
    const result = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({ to: phone, code });
    if (result.status !== 'approved') return res.status(401).json({ error: 'Неверный или просроченный код' });
    res.json({ ok: true, verified: true });
  } catch (e) {
    console.error('SMS verify failed:', e.message);
    res.status(401).json({ error: 'Код неверный, истёк или SMS-сервис не настроен' });
  }
});
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`HollOram SMS API listening on ${port}`));
