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

// НОВАЯ ФУНКЦИЯ — загрузка реальных курсов
async function fetchRealRates() {
    try {
        const response = await fetch('https://api.exchangerate.host/latest?base=RUB&symbols=USD,EUR,CNY');
        const data = await response.json();
        
        if (data.success && data.rates) {
            gameState.rates.USD = (1 / data.rates.USD).toFixed(2);
            gameState.rates.EUR = (1 / data.rates.EUR).toFixed(2);
            gameState.rates.CNY = (1 / data.rates.CNY).toFixed(2);
            
            gameState.previousRates = { ...gameState.rates };
            updateDisplay();
            showNotification('Курсы обновлены с реального рынка', 'info');
        }
    } catch (err) {
        console.error('Ошибка загрузки реальных курсов:', err);
        showNotification('Используются симулированные курсы', 'info');
    }
}

// Инициализация игры
window.addEventListener('DOMContentLoaded', () => {
    console.log("Игра загружается...");
    initGame();
});

function initGame() {
    loadGame();
    fetchRealRates(); // Загружаем реальные курсы при старте
    updateDisplay();
    startRateFluctuation();
    startNewsCycle();
    
    console.log("Игра инициализирована");
    console.log("Начальный баланс:", gameState.balance);
    console.log("Начальные курсы:", gameState.rates);
}

// Обновляем реальные курсы каждые 5 минут
setInterval(fetchRealRates, 5 * 60 * 1000);

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
        
        // Округляем до 2 знаков
        gameState.rates.USD = parseFloat(gameState.rates.USD.toFixed(2));
        gameState.rates.EUR = parseFloat(gameState.rates.EUR.toFixed(2));
        gameState.rates.CNY = parseFloat(gameState.rates.CNY.toFixed(2));
        
        updateDisplay();
    }, 3000);
}

// ЦИКЛ НОВОСТЕЙ
function startNewsCycle() {
    setInterval(() => {
        const news = newsList[Math.floor(Math.random() * newsList.length)];
        showNotification(news.text, news.type);
        
        // Применяем влияние на курсы
        gameState.rates.USD *= (1 + news.impact.USD);
        gameState.rates.EUR *= (1 + news.impact.EUR);
        gameState.rates.CNY *= (1 + news.impact.CNY);
        
        gameState.rates.USD = parseFloat(gameState.rates.USD.toFixed(2));
        gameState.rates.EUR = parseFloat(gameState.rates.EUR.toFixed(2));
        gameState.rates.CNY = parseFloat(gameState.rates.CNY.toFixed(2));
        
        updateDisplay();
    }, Math.random() * 20000 + 10000); // каждые 10-30 сек
}

// УВЕДОМЛЕНИЯ
function showNotification(text, type = 'info') {
    const notification = document.getElementById('notificationText');
    if (notification) {
        notification.textContent = text;
        const notif = document.getElementById('notification');
        notif.className = `notification ${type} show`;
        setTimeout(() => {
            notif.className = 'notification';
        }, 3000);
    }
}

// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ
function updateDisplay() {
    // Баланс
    document.getElementById('balanceAmount').textContent = gameState.balance.toFixed(0);
    
    // Курсы и изменения
    ['USD', 'EUR', 'CNY'].forEach(curr => {
        const priceEl = document.getElementById(`${curr.toLowerCase()}Price`);
        const changeEl = document.getElementById(`${curr.toLowerCase()}Change`);
        const changeValue = changeEl.querySelector('.change-value');
        const changeIcon = changeEl.querySelector('.change-icon');
        
        if (priceEl) priceEl.textContent = gameState.rates[curr].toFixed(2);
        
        if (changeEl) {
            const diff = gameState.rates[curr] - gameState.previousRates[curr];
            const percent = ((diff / gameState.previousRates[curr]) * 100).toFixed(2);
            
            changeValue.textContent = (percent > 0 ? '+' : '') + percent + '%';
            changeEl.className = percent > 0 ? 'currency-change up' : percent < 0 ? 'currency-change down' : 'currency-change';
            changeIcon.className = percent > 0 ? 'fas fa-arrow-up change-icon' : percent < 0 ? 'fas fa-arrow-down change-icon' : 'fas fa-minus change-icon';
        }
    });
    
    updatePortfolio();
}

// СОХРАНЕНИЕ И ЗАГРУЗКА
function saveGame() {
    if (tg && telegramUser) {
        // Для Telegram — сохраняем в CloudStorage
        tg.CloudStorage.setItem(`balance_${telegramUser.id}`, gameState.balance.toString());
        tg.CloudStorage.setItem(`portfolio_${telegramUser.id}`, JSON.stringify(gameState.portfolio));
    } else {
        localStorage.setItem('currencyTraderSave', JSON.stringify(gameState));
    }
}

function loadGame() {
    if (tg && telegramUser) {
        tg.CloudStorage.getItems([
            `balance_${telegramUser.id}`,
            `portfolio_${telegramUser.id}`
        ], (error, values) => {
            if (!error && values) {
                if (values[`balance_${telegramUser.id}`]) {
                    gameState.balance = parseFloat(values[`balance_${telegramUser.id}`]);
                }
                if (values[`portfolio_${telegramUser.id}`]) {
                    gameState.portfolio = JSON.parse(values[`portfolio_${telegramUser.id}`]);
                }
            }
        });
    } else {
        const saved = localStorage.getItem('currencyTraderSave');
        if (saved) {
            const loaded = JSON.parse(saved);
            gameState.balance = loaded.balance || 1500;
            gameState.portfolio = loaded.portfolio || { USD: 0, EUR: 0, CNY: 0 };
        }
    }
}

// ПОРТФЕЛЬ
function updatePortfolio() {
    ['USD', 'EUR', 'CNY'].forEach(curr => {
        const amountEl = document.getElementById(`portfolio${curr}`);
        const valueEl = document.getElementById(`portfolio${curr}Value`);
        
        if (amountEl) amountEl.textContent = gameState.portfolio[curr].toFixed(2);
        if (valueEl) valueEl.textContent = (gameState.portfolio[curr] * gameState.rates[curr]).toFixed(0) + ' ₽';
    });
    
    const total = gameState.balance + 
        (gameState.portfolio.USD * gameState.rates.USD) +
        (gameState.portfolio.EUR * gameState.rates.EUR) +
        (gameState.portfolio.CNY * gameState.rates.CNY);
    
    document.getElementById('portfolioTotal').textContent = total.toFixed(0);
}

// РЕЙТИНГ
function updateTelegramRating() {
    if (!tg || !telegramUser) return;
    
    const total = gameState.balance + 
        (gameState.portfolio.USD * gameState.rates.USD) +
        (gameState.portfolio.EUR * gameState.rates.EUR) +
        (gameState.portfolio.CNY * gameState.rates.CNY);
    
    tg.CloudStorage.setItem(`rating_${telegramUser.id}`, total.toString());
    
    // Обновляем топ
    document.getElementById('topBalance').textContent = total.toFixed(0) + '₽';
}

// Обновление отображения рейтинга
function updateRatingDisplay() {
    const ratings = getRatingData();
    
    updateRatingStats();
    
    const ratingList = document.getElementById('ratingList');
    if (!ratingList) return;
    
    ratingList.innerHTML = '';
    
    if (ratings.length === 0) {
        ratingList.innerHTML = `
            <div class="no-rating">
                <i class="fas fa-users" style="font-size: 3rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 20px;"></i>
                <p style="color: rgba(255, 255, 255, 0.7); text-align: center;">
                    Пока никто не играл. Будьте первым!
                </p>
            </div>
        `;
        return;
    }
    
    const sortedRatings = [...ratings].sort((a, b) => b.balance - a.balance);
    
    const currentUserIndex = sortedRatings.findIndex(u => u.userId === telegramUser?.id);
    
    const showCount = 20;
    let usersToShow = sortedRatings.slice(0, showCount);
    
    if (currentUserIndex >= showCount && telegramUser) {
        usersToShow.push(sortedRatings[currentUserIndex]);
    }
    
    usersToShow.forEach((user, index) => {
        const isCurrentUser = user.userId === telegramUser?.id;
        const actualPosition = sortedRatings.findIndex(u => u.userId === user.userId) + 1;
        
        let rankIcon = 'fas fa-hashtag';
        if (actualPosition === 1) rankIcon = 'fas fa-crown';
        else if (actualPosition === 2) rankIcon = 'fas fa-medal';
        else if (actualPosition === 3) rankIcon = 'fas fa-award';
        
        const item = document.createElement('div');
        item.className = `rating-item ${isCurrentUser ? 'current' : ''}`;
        
        item.innerHTML = `
            <div class="rating-rank">
                <i class="${rankIcon}"></i>
                <span style="font-size: 0.9rem; margin-left: 3px;">${actualPosition}</span>
            </div>
            <div class="rating-user-info">
                <div class="rating-name">${user.firstName} ${user.lastName || ''}</div>
                <div class="rating-username">@${user.username}</div>
            </div>
            <div class="rating-value">${user.balance.toFixed(2)} ₽</div>
        `;
        
        ratingList.appendChild(item);
    });
    
    if (currentUserIndex >= showCount && telegramUser) {
        const positionInfo = document.createElement('div');
        positionInfo.className = 'rating-position-info';
        positionInfo.style.cssText = `
            text-align: center;
            padding: 15px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            margin-top: 10px;
        `;
        positionInfo.innerHTML = `
            <i class="fas fa-arrow-down"></i>
            Ваша позиция: <strong>${currentUserIndex + 1}</strong> из ${sortedRatings.length}
            <i class="fas fa-arrow-down"></i>
        `;
        ratingList.appendChild(positionInfo);
    }
}

// Обновляем функцию рейтинга для Telegram
window.updateRating = function() {
    if (telegramUser) {
        updateTelegramRating();
        updateRatingDisplay();
    } else {
        const totalValue = calculateTotalPortfolioValue();
        
        const ratings = [
            { name: "Вы", value: totalValue, current: true }
        ];
        
        const ratingList = document.getElementById('ratingList');
        if (ratingList) {
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
    }
};

// Модифицируем tradeCurrency для обновления рейтинга
const originalTradeCurrency = window.tradeCurrency;
window.tradeCurrency = function(currency, action) {
    const result = originalTradeCurrency(currency, action);
    
    if (telegramUser) {
        updateTelegramRating();
    }
    
    if (tg) {
        tgHapticFeedback('light');
        updateTelegramMainButton();
    }
    
    return result;
};

// Обновляем updateDisplay для Telegram
const originalUpdateDisplay = window.updateDisplay;
window.updateDisplay = function() {
    originalUpdateDisplay();
    
    if (tg) {
        updateTelegramMainButton();
    }
    
    if (telegramUser) {
        updateTelegramRating();
    }
};

// Закрытие модальных окон для Telegram
const originalCloseModal = window.closeModal;
window.closeModal = function() {
    originalCloseModal();
    
    if (tg && tg.MainButton) {
        setTimeout(() => {
            updateTelegramMainButton();
        }, 300);
    }
};

// Обработчики кнопок
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('ratingBtn').addEventListener('click', () => {
        updateRating();
        document.getElementById('ratingModal').classList.add('show');
    });
    
    document.getElementById('portfolioBtn').addEventListener('click', () => {
        updatePortfolio();
        document.getElementById('portfolioModal').classList.add('show');
    });
    
    document.querySelectorAll('.modal-close, .modal-backdrop').forEach(el => {
        el.addEventListener('click', closeModal);
    });
});

// Экспортируем функции
window.initTelegram = initTelegram;
window.tgHapticFeedback = tgHapticFeedback;
window.telegramUser = telegramUser;
window.tg = tg;
