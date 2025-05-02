require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const app = express();
app.use(express.json());

if (!process.env.BOT_TOKEN) {
  console.error('Укажите BOT_TOKEN в .env');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply('Привет! Нажми на кнопку ниже, чтобы начать тапать!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Начать тапать',
            url: 'https://t.me/Gamma_Clicker_Bot/clicker'
          }
        ]
      ]
    }
  });
});

// Эндпоинт для проверки подписки
app.post('/check-subscribe', async (req, res) => {
  const { userId } = req.body;
  try {
    const member = await bot.telegram.getChatMember('@GammaDLC', userId);
    const ok = ['creator', 'administrator', 'member'].includes(member.status);
    res.json({ subscribed: ok });
  } catch (e) {
    console.error('Ошибка getChatMember:', e);
    res.json({ subscribed: false });
  }
});

// Добавление поддержки CORS (для устранения возможных проблем с доступом)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// Запуск бота
bot.launch().then(() => {
  console.log('Bot started');
});

// Обработка остановки бота
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
