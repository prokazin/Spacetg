// telegram-integration.js
// Telegram Mini App интеграция

let tg = null;
let telegramUser = null;

// Инициализация Telegram
function initTelegram() {
    console.log('Инициализация Telegram Web App...');
    
    tg = window.Telegram.WebApp;
    
    if (!tg) {
        console.log('Telegram Web App не найден');
        return;
    }
    
    // Расширяем на весь экран
    tg.expand();
    
    // Получаем данные пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        telegramUser = {
            id: user.id,
            username: user.username || `user_${user.id}`,
            firstName: user.first_name || 'Игрок',
            lastName: user.last_name || '',
            languageCode: user.language_code || 'ru'
        };
        
        console.log('Telegram пользователь:', telegramUser);
        
        // Показываем информацию о пользователе
        showTelegramUserInfo();
    }
    
    // Настройка темы
    applyTelegramTheme();
    
    // Настройка кнопки назад
    setupTelegramBackButton();
    
    // Настройка главной кнопки
    setupMainButton();
    
    // Обработчики событий
    setupTelegramEvents();
    
    // Запускаем игру
    if (window.initGame) {
        window.initGame();
    }
}

// Показываем информацию о пользователе Telegram
function showTelegramUserInfo() {
    if (!telegramUser) return;
    
    const userInfo = document.getElementById('tgUserInfo');
    const userName = document.getElementById('tgUserName');
    
    if (userInfo && userName) {
        userName.textContent = telegramUser.firstName;
        userInfo.style.display = 'flex';
    }
}

// Применяем тему Telegram
function applyTelegramTheme() {
    if (!tg) return;
    
    // Применяем цвета Telegram
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#000000');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#ffffff');
    
    // Обновляем фоновое видео прозрачность
    const video = document.getElementById('bgVideo');
    if (video) {
        video.style.opacity = '0.2';
    }
}

// Настройка кнопки назад Telegram
function setupTelegramBackButton() {
    if (!tg) return;
    
    const backButton = document.getElementById('tgBackBtn');
    
    if (tg.BackButton.isVisible) {
        if (backButton) {
            backButton.style.display = 'flex';
        }
        
        tg.BackButton.onClick(() => {
            window.history.back();
        });
        
        tg.BackButton.show();
    }
}

// Настройка главной кнопки Telegram
function setupMainButton() {
    if (!tg || !tg.MainButton) return;
    
    tg.MainButton.setText('💰 Портфель');
    tg.MainButton.onClick(showPortfolioInTelegram);
    
    // Обновляем текст кнопки при изменении баланса
    const originalUpdateDisplay = window.updateDisplay;
    if (originalUpdateDisplay) {
        window.updateDisplay = function() {
            originalUpdateDisplay();
            updateTelegramMainButton();
        };
    }
}

// Обновление главной кнопки Telegram
function updateTelegramMainButton() {
    if (!tg || !tg.MainButton) return;
    
    if (window.gameState) {
        const total = gameState.balance + 
            (gameState.portfolio.USD * gameState.rates.USD) +
            (gameState.portfolio.EUR * gameState.rates.EUR) +
            (gameState.portfolio.CNY * gameState.rates.CNY);
        
        tg.MainButton.setText(`💰 ${total.toFixed(0)}₽`);
        tg.MainButton.show();
    }
}

// Показать портфель через Telegram кнопку
function showPortfolioInTelegram() {
    if (window.updatePortfolio) {
        updatePortfolio();
    }
    
    const portfolioModal = document.getElementById('portfolioModal');
    if (portfolioModal) {
        portfolioModal.classList.add('show');
        
        // Скрыть кнопку при открытом модальном окне
        if (tg && tg.MainButton) {
            tg.MainButton.hide();
        }
    }
}

// Обработчики событий Telegram
function setupTelegramEvents() {
    if (!tg) return;
    
    // Изменение темы
    tg.onEvent('themeChanged', applyTelegramTheme);
    
    // Изменение размера
    tg.onEvent('viewportChanged', () => {
        console.log('Размер окна изменен');
    });
    
    // Закрытие приложения
    tg.onEvent('close', () => {
        console.log('Приложение закрывается');
        if (window.saveGame) saveGame();
    });
}

// Виброотклик для Telegram
function tgHapticFeedback(type = 'light') {
    if (!tg || !tg.HapticFeedback) return;
    
    const types = {
        'light': 'impactOccurred',
        'medium': 'impactOccurred',
        'heavy': 'impactOccurred',
        'success': 'notificationOccurred',
        'error': 'notificationOccurred',
        'warning': 'notificationOccurred'
    };
    
    if (types[type]) {
        tg.HapticFeedback[types[type]](type);
    }
}

// Модифицируем функцию торговли для Telegram
const originalTradeCurrency = window.tradeCurrency;
if (originalTradeCurrency) {
    window.tradeCurrency = function(currency, action) {
        // Вызываем оригинальную функцию
        const result = originalTradeCurrency(currency, action);
        
        // Виброотклик в Telegram
        tgHapticFeedback('light');
        
        // Обновляем кнопку Telegram
        updateTelegramMainButton();
        
        return result;
    };
}

// Отправка данных в Telegram
function sendToTelegram(data) {
    if (!tg || !tg.sendData) return false;
    
    try {
        tg.sendData(JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Ошибка отправки данных в Telegram:', e);
        return false;
    }
}

// Открыть ссылку в Telegram
function openInTelegram(url) {
    if (!tg || !tg.openLink) {
        window.open(url, '_blank');
        return false;
    }
    
    tg.openLink(url);
    return true;
}

// Закрытие модальных окон для Telegram
const originalCloseModal = window.closeModal;
if (originalCloseModal) {
    window.closeModal = function() {
        originalCloseModal();
        
        // Показываем кнопку Telegram после закрытия модального
        if (tg && tg.MainButton) {
            setTimeout(() => {
                updateTelegramMainButton();
            }, 300);
        }
    };
}

// Экспортируем функции
window.initTelegram = initTelegram;
window.tgHapticFeedback = tgHapticFeedback;
window.sendToTelegram = sendToTelegram;
window.openInTelegram = openInTelegram;
window.telegramUser = telegramUser;
