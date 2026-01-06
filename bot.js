const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Токен из переменной окружения (безопасно для деплоя)
const token = process.env.BOT_TOKEN || 'ВАШ_ТОКЕН';

const bot = new TelegramBot(token, { polling: false });

// Правильный URL твоего Mini App на Vercel
const gameUrl = 'https://spacetg.vercel.app';

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, '🎮 Добро пожаловать в "Валютный Трейдер"!', {
        reply_markup: {
            inline_keyboard: [[
                { text: '🎮 Играть', web_app: { url: gameUrl } }
            ]]
        }
    });
});

// Команда /play
bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, 'Нажмите кнопку ниже чтобы начать игру:', {
        reply_markup: {
            inline_keyboard: [[
                { text: '🚀 Начать игру', web_app: { url: gameUrl } }
            ]]
        }
    });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpText = `
📈 *Валютный Трейдер* 📉

*Как играть:*
1. Начните с 1500₽
2. Покупайте/продавайте USD, EUR, CNY
3. Курсы меняются каждые 3 секунды
4. Следите за новостями
5. Станьте лучшим трейдером!

*Команды:*
/start - Начать
/play - Играть
/help - Помощь
/stats - Статистика

*Удачи в торговле!* 🚀
    `;
    
    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
});

// Настройка Menu Button
bot.setChatMenuButton({
    menu_button: {
        type: 'web_app',
        text: '🎮 Играть',
        web_app: {
            url: gameUrl
        }
    }
}).then(() => {
    console.log('Menu Button установлен');
}).catch(console.error);

// Webhook для обновлений от Telegram
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Опциональный эндпоинт для получения данных из игры
app.post('/webhook', (req, res) => {
    console.log('Данные из игры:', req.body);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Бот запущен на порту ${PORT}`);
    
    // Автоматическая установка webhook
    const webhookUrl = `${process.env.RENDER_EXTERNAL_URL || process.env.VERCEL_URL || 'https://your-domain.com'}/bot${token}`;
    try {
        await bot.setWebHook(webhookUrl);
        console.log(`Webhook установлен: ${webhookUrl}`);
    } catch (err) {
        console.error('Ошибка установки webhook:', err);
    }
});
