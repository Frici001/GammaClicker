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

app.post('/check-subscribe', async (req, res) => {
  const { userId } = req.body;
  try {
    const member = await bot.telegram.getChatMember('@GammaDLC', userId);
    const ok = ['creator','administrator','member'].includes(member.status);
    res.json({ subscribed: ok });
  } catch (e) {
    console.error('Ошибка getChatMember:', e);
    res.json({ subscribed: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
