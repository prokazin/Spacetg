// Состояние игры
let gameState = {
    balance: 1500,
    portfolio: {
        USD: 0,
        EUR: 0,
        CNY: 0
    },
    rates: {
        USD: 80.50,
        EUR: 90.25,
        CNY: 11.80
    },
    previousRates: {
        USD: 80.50,
        EUR: 90.25,
        CNY: 11.80
    },
    selectedAmounts: {
        USD: 0,
        EUR: 0,
        CNY: 0
    },
    news: []
};

// Новости
const newsList = [
    { text: "ЦБ повысил ключевую ставку", type: "positive", impact: { USD: 0.03, EUR: 0.02, CNY: 0.01 } },
    { text: "Падение цен на нефть", type: "negative", impact: { USD: -0.04, EUR: -0.02, CNY: -0.01 } },
    { text: "Новые санкции", type: "negative", impact: { USD: 0.05, EUR: 0.03, CNY: 0.02 } },
    { text: "Китай увеличил экспорт", type: "positive", impact: { USD: 0.01, EUR: 0.01, CNY: -0.03 } },
    { text: "ЕЦБ сохранил ставки", type: "neutral", impact: { USD: -0.02, EUR: 0.02, CNY: 0.01 } },
    { text: "Рост ВВП США", type: "positive", impact: { USD: -0.03, EUR: 0.01, CNY: 0.01 } },
    { text: "Инфляция снизилась", type: "positive", impact: { USD: 0.01, EUR: -0.02, CNY: 0.01 } },
    { text: "Торговые переговоры провалились", type: "negative", impact: { USD: 0.04, EUR: 0.03, CNY: 0.05 } },
    { text: "Криптовалюты выросли", type: "neutral", impact: { USD: 0.02, EUR: 0.01, CNY: 0.01 } },
    { text: "Доллар укрепился", type: "positive", impact: { USD: -0.04, EUR: 0.02, CNY: 0.02 } },
    { text: "Евро ослаб", type: "negative", impact: { USD: 0.01, EUR: 0.04, CNY: 0.01 } },
    { text: "Юань стабилизировался", type: "positive", impact: { USD: 0.01, EUR: 0.01, CNY: -0.02 } },
    { text: "Золото подорожал", type: "positive", impact: { USD: 0.02, EUR: 0.02, CNY: 0.02 } },
    { text: "ФРС готовится к смягчению", type: "negative", impact: { USD: 0.03, EUR: 0.01, CNY: 0.01 } },
    { text: "Банки повысили прогнозы по рублю", type: "positive", impact: { USD: -0.03, EUR: -0.02, CNY: -0.02 } },
    { text: "Нефть превысила $90", type: "positive", impact: { USD: -0.02, EUR: -0.01, CNY: -0.01 } },
    { text: "Акции упали", type: "negative", impact: { USD: 0.03, EUR: 0.02, CNY: 0.02 } },
    { text: "Китай снизил ставки", type: "positive", impact: { USD: 0.01, EUR: 0.01, CNY: -0.04 } },
    { text: "Турецкая лира обновила минимум", type: "neutral", impact: { USD: 0.02, EUR: 0.02, CNY: 0.01 } },
    { text: "Япония вмешалась в курс йены", type: "neutral", impact: { USD: 0.01, EUR: 0.01, CNY: 0.01 } }
];

// Инициализация игры
window.addEventListener('DOMContentLoaded', () => {
    console.log("Игра загружается...");
    initGame();
});

function initGame() {
    loadGame();
    updateDisplay();
    startRateFluctuation();
    startNewsCycle();
    
    console.log("Игра инициализирована");
    console.log("Начальный баланс:", gameState.balance);
    console.log("Начальные курсы:", gameState.rates);
}

// ДОБАВЛЕНИЕ СУММЫ К ВЫБРАННОЙ ВАЛЮТЕ
function addAmount(amount, currency) {
    gameState.selectedAmounts[currency] += amount;
    updateSelectedAmountDisplay(currency);
    
    const totalCost = gameState.selectedAmounts[currency] * gameState.rates[currency];
    showNotification(`${currency}: +${amount}. Итого: ${gameState.selectedAmounts[currency]} (${totalCost.toFixed(2)} ₽)`, 'info');
}

// СБРОС СУММЫ ДЛЯ ВАЛЮТЫ
function resetAmount(currency) {
    gameState.selectedAmounts[currency] = 0;
    updateSelectedAmountDisplay(currency);
    showNotification(`${currency}: сумма сброшена`, 'info');
}

// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ВЫБРАННОЙ СУММЫ
function updateSelectedAmountDisplay(currency) {
    const element = document.getElementById(`${currency.toLowerCase()}SelectedAmount`);
    if (element) {
        element.textContent = gameState.selectedAmounts[currency];
    }
}

// ТОРГОВЛЯ - ОСНОВНАЯ ФУНКЦИЯ
function tradeCurrency(currency, action) {
    const amount = gameState.selectedAmounts[currency];
    const rate = gameState.rates[currency];
    
    console.log(`Торговля: ${action} ${currency} на сумму ${amount} по курсу ${rate}`);
    
    if (amount <= 0) {
        showNotification('Сначала выберите сумму для сделки!', 'error');
        return;
    }
    
    if (action === 'buy') {
        const cost = amount * rate;
        console.log(`Стоимость покупки: ${cost} ₽ (${amount} * ${rate})`);
        
        if (cost > gameState.balance) {
            showNotification(`Недостаточно средств! Нужно ${cost.toFixed(2)} ₽, есть ${gameState.balance.toFixed(2)} ₽`, 'error');
            return;
        }
        
        gameState.balance -= cost;
        gameState.portfolio[currency] += amount;
        showNotification(`Куплено ${amount} ${currency} за ${cost.toFixed(2)} ₽`, 'success');
        
        // Сбрасываем сумму после сделки
        gameState.selectedAmounts[currency] = 0;
        updateSelectedAmountDisplay(currency);
        
        console.log(`Новый баланс: ${gameState.balance} ₽`);
        console.log(`Куплено ${currency}: ${amount}, теперь всего: ${gameState.portfolio[currency]}`);
        
    } else if (action === 'sell') {
        console.log(`Продажа ${currency}: доступно ${gameState.portfolio[currency]}, продаем ${amount}`);
        
        if (amount > gameState.portfolio[currency]) {
            showNotification(`Недостаточно ${currency}! Доступно: ${gameState.portfolio[currency].toFixed(2)}`, 'error');
            return;
        }
        
        const income = amount * rate;
        console.log(`Доход от продажи: ${income} ₽ (${amount} * ${rate})`);
        
        gameState.balance += income;
        gameState.portfolio[currency] -= amount;
        showNotification(`Продано ${amount} ${currency} за ${income.toFixed(2)} ₽`, 'success');
        
        // Сбрасываем сумму после сделки
        gameState.selectedAmounts[currency] = 0;
        updateSelectedAmountDisplay(currency);
        
        console.log(`Новый баланс: ${gameState.balance} ₽`);
        console.log(`Продано ${currency}: ${amount}, осталось: ${gameState.portfolio[currency]}`);
    }
    
    updateDisplay();
    saveGame();
}

// ФЛУКТУАЦИЯ КУРСОВ
function startRateFluctuation() {
    setInterval(() => {
        // Сохраняем текущие курсы как предыдущие
        gameState.previousRates = {
            USD: gameState.rates.USD,
            EUR: gameState.rates.EUR,
            CNY: gameState.rates.CNY
        };
        
        // Случайные изменения (сильные колебания!)
        const usdChange = (Math.random() * 0.15 - 0.075); // -7.5% до +7.5%
        const eurChange = (Math.random() * 0.15 - 0.075);
        const cnyChange = (Math.random() * 0.12 - 0.06);  // -6% до +6%
        
        // Применяем изменения
        gameState.rates.USD *= (1 + usdChange);
        gameState.rates.EUR *= (1 + eurChange);
        gameState.rates.CNY *= (1 + cnyChange);
        
        // Ограничения
        gameState.rates.USD = Math.max(10, Math.min(200, gameState.rates.USD));
        gameState.rates.EUR = Math.max(20, Math.min(300, gameState.rates.EUR));
        gameState.rates.CNY = Math.max(5, Math.min(50, gameState.rates.CNY));
        
        // Обновляем отображение
        updateDisplay();
        
    }, 3000); // Каждые 3 секунды
}

// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ
function updateDisplay() {
    // Баланс
    document.getElementById('balanceAmount').textContent = `${gameState.balance.toFixed(2)} ₽`;
    
    // Курсы валют
    updateCurrencyDisplay('USD');
    updateCurrencyDisplay('EUR');
    updateCurrencyDisplay('CNY');
    
    // Портфель
    updatePortfolio();
}

// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ВАЛЮТЫ
function updateCurrencyDisplay(currency) {
    const rate = gameState.rates[currency];
    const previous = gameState.previousRates[currency];
    const change = ((rate - previous) / previous) * 100;
    
    // Обновляем цену
    const priceElement = document.getElementById(`${currency.toLowerCase()}Price`);
    const oldPrice = parseFloat(priceElement.textContent) || 0;
    priceElement.textContent = rate.toFixed(2);
    
    // Анимация изменения
    if (rate > oldPrice) {
        priceElement.classList.remove('price-down');
        priceElement.classList.add('price-up');
    } else if (rate < oldPrice) {
        priceElement.classList.remove('price-up');
        priceElement.classList.add('price-down');
    }
    
    // Убираем анимацию
    setTimeout(() => {
        priceElement.classList.remove('price-up', 'price-down');
    }, 500);
    
    // Обновляем процент изменения
    const changeElement = document.getElementById(`${currency.toLowerCase()}Change`);
    const changeValue = changeElement.querySelector('.change-value');
    const changeIcon = changeElement.querySelector('.change-icon');
    
    changeValue.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    
    if (change > 0) {
        changeElement.className = 'currency-change up';
        changeIcon.className = 'fas fa-arrow-up change-icon';
    } else {
        changeElement.className = 'currency-change down';
        changeIcon.className = 'fas fa-arrow-down change-icon';
    }
}

// ЦИКЛ НОВОСТЕЙ
function startNewsCycle() {
    setInterval(() => {
        const newsIndex = Math.floor(Math.random() * newsList.length);
        const newsItem = newsList[newsIndex];
        
        showNotification(newsItem.text, newsItem.type);
        
        // Применяем влияние новости
        Object.keys(newsItem.impact).forEach(currency => {
            if (gameState.rates[currency]) {
                gameState.previousRates[currency] = gameState.rates[currency];
                gameState.rates[currency] *= (1 + newsItem.impact[currency]);
            }
        });
        
        updateDisplay();
    }, 15000); // Каждые 15 секунд
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showNotification(text, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = text;
    
    // Цвета для разных типов
    const colors = {
        success: '#34C759',
        error: '#FF3B30',
        info: '#007AFF',
        warning: '#FF9500',
        positive: '#34C759',
        negative: '#FF3B30',
        neutral: '#007AFF'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    notification.classList.add('show');
    
    // Скрыть через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ОБНОВЛЕНИЕ РЕЙТИНГА
function updateRating() {
    const totalValue = gameState.balance + 
        (gameState.portfolio.USD * gameState.rates.USD) +
        (gameState.portfolio.EUR * gameState.rates.EUR) +
        (gameState.portfolio.CNY * gameState.rates.CNY);
    
    // Создаем рейтинг
    const ratings = [
        { name: "Вы", value: totalValue, current: true }
    ];
    
    // Добавляем демо-игроков
    for (let i = 1; i <= 9; i++) {
        ratings.push({
            name: `Игрок ${i}`,
            value: 1500 + Math.random() * 10000,
            current: false
        });
    }
    
    // Сортируем по убыванию
    ratings.sort((a, b) => b.value - a.value);
    
    // Отображаем
    const ratingList = document.getElementById('ratingList');
    ratingList.innerHTML = '';
    
    ratings.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `rating-item ${player.current ? 'current' : ''}`;
        item.innerHTML = `
            <div class="rating-rank">${index + 1}</div>
            <div class="rating-name">${player.name}</div>
            <div class="rating-value">${player.value.toFixed(2)} ₽</div>
        `;
        ratingList.appendChild(item);
    });
}

// ОБНОВЛЕНИЕ ПОРТФЕЛЯ
function updatePortfolio() {
    // Обновляем значения в модальном окне
    document.getElementById('portfolioUSD').textContent = gameState.portfolio.USD.toFixed(2);
    document.getElementById('portfolioEUR').textContent = gameState.portfolio.EUR.toFixed(2);
    document.getElementById('portfolioCNY').textContent = gameState.portfolio.CNY.toFixed(2);
    
    // Обновляем стоимости
    document.getElementById('portfolioUSDValue').textContent = 
        `${(gameState.portfolio.USD * gameState.rates.USD).toFixed(2)} ₽`;
    document.getElementById('portfolioEURValue').textContent = 
        `${(gameState.portfolio.EUR * gameState.rates.EUR).toFixed(2)} ₽`;
    document.getElementById('portfolioCNYValue').textContent = 
        `${(gameState.portfolio.CNY * gameState.rates.CNY).toFixed(2)} ₽`;
    
    // Общая стоимость
    const total = gameState.balance + 
        (gameState.portfolio.USD * gameState.rates.USD) +
        (gameState.portfolio.EUR * gameState.rates.EUR) +
        (gameState.portfolio.CNY * gameState.rates.CNY);
    
    document.getElementById('portfolioTotal').textContent = total.toFixed(2);
}

// СОХРАНЕНИЕ ИГРЫ
function saveGame() {
    localStorage.setItem('currencyTraderSave', JSON.stringify(gameState));
}

// ЗАГРУЗКА ИГРЫ
function loadGame() {
    const saved = localStorage.getItem('currencyTraderSave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(gameState, data);
            
            // Обновляем отображение выбранных сумм
            updateSelectedAmountDisplay('USD');
            updateSelectedAmountDisplay('EUR');
            updateSelectedAmountDisplay('CNY');
            
        } catch (e) {
            console.log('Ошибка загрузки сохранения:', e);
        }
    }
}

// ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// ОБРАБОТЧИКИ КНОПОК (для рейтинга и портфеля)
document.addEventListener('DOMContentLoaded', () => {
    // Кнопка рейтинга
    document.getElementById('ratingBtn').addEventListener('click', () => {
        updateRating();
        document.getElementById('ratingModal').classList.add('show');
    });
    
    // Кнопка портфеля
    document.getElementById('portfolioBtn').addEventListener('click', () => {
        updatePortfolio();
        document.getElementById('portfolioModal').classList.add('show');
    });
    
    // Закрытие модальных окон
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', closeModal);
    });
});

// ... весь предыдущий код остается без изменений ...

// ============================================
// TELEGRAM INTEGRATION
// ============================================

let tg = null;
let telegramUser = null;

// Инициализация Telegram
function initTelegram() {
    console.log('Инициализация Telegram Web App...');
    
    tg = window.Telegram.WebApp;
    
    if (!tg) {
        console.log('Telegram Web App не найден');
        initGame();
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
    initGame();
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
    updateTelegramMainButton();
}

// Обновление главной кнопки Telegram
function updateTelegramMainButton() {
    if (!tg || !tg.MainButton || !gameState) return;
    
    const total = gameState.balance + 
        (gameState.portfolio.USD * gameState.rates.USD) +
        (gameState.portfolio.EUR * gameState.rates.EUR) +
        (gameState.portfolio.CNY * gameState.rates.CNY);
    
    tg.MainButton.setText(`💰 ${total.toFixed(0)}₽`);
    tg.MainButton.show();
}

// Показать портфель через Telegram кнопку
function showPortfolioInTelegram() {
    updatePortfolio();
    
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
        saveGame();
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
window.tradeCurrency = function(currency, action) {
    // Вызываем оригинальную функцию
    const result = originalTradeCurrency(currency, action);
    
    // Виброотклик в Telegram
    if (tg) {
        tgHapticFeedback('light');
        
        // Обновляем кнопку Telegram
        updateTelegramMainButton();
    }
    
    return result;
};

// Обновляем updateDisplay для Telegram
const originalUpdateDisplay = window.updateDisplay;
window.updateDisplay = function() {
    originalUpdateDisplay();
    
    // Обновляем кнопку Telegram
    if (tg) {
        updateTelegramMainButton();
    }
};

// Закрытие модальных окон для Telegram
const originalCloseModal = window.closeModal;
window.closeModal = function() {
    originalCloseModal();
    
    // Показываем кнопку Telegram после закрытия модального
    if (tg && tg.MainButton) {
        setTimeout(() => {
            updateTelegramMainButton();
        }, 300);
    }
};

// Экспортируем функции для глобального доступа
window.initTelegram = initTelegram;
window.tgHapticFeedback = tgHapticFeedback;
window.telegramUser = telegramUser;
window.tg = tg;
