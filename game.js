// Основной игровой движок
class Game {
    constructor() {
        this.player = null;
        this.map = null;
        this.clans = new Map();
        this.achievements = new Map();
        this.events = [];
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            console.log('Инициализация игры...');
            
            // Инициализируем игрока
            this.player = new Player();
            
            // Инициализируем достижения
            this.initAchievements();
            
            // Инициализируем кланы
            this.initClans();
            
            // Инициализируем события
            this.initEvents();
            
            // Ждем загрузки Яндекс.Карт API
            await this.waitForYandexMaps();
            
            // Инициализируем карту
            this.map = new GameMap();
            
            // Ждем инициализации карты
            await this.waitForMapInit();
            
            // Запускаем игровые системы
            this.startGameSystems();
            
            this.isInitialized = true;
            console.log('Игра инициализирована');
            
            // Показываем главное меню
            this.showMainMenu();
            
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            this.showNotification('Ошибка инициализации игры: ' + error.message, 'error');
            
            // Показываем главное меню даже при ошибке
            this.showMainMenu();
        }
    }

    async waitForYandexMaps() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Таймаут загрузки Яндекс.Карт API'));
            }, 15000); // 15 секунд таймаут

            const checkAPI = () => {
                if (typeof ymaps !== 'undefined' && ymaps.ready) {
                    ymaps.ready(() => {
                        clearTimeout(timeout);
                        resolve();
                    });
                } else if (typeof ymaps !== 'undefined' && ymaps.Map) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkAPI, 100);
                }
            };
            
            checkAPI();
        });
    }

    async waitForMapInit() {
        return new Promise((resolve) => {
            const checkMap = () => {
                if (this.map && this.map.map) {
                    resolve();
                } else {
                    setTimeout(checkMap, 100);
                }
            };
            checkMap();
        });
    }

    initAchievements() {
        const achievements = [
            {
                id: 'first_capture',
                name: 'Первый захват',
                description: 'Захватите первое заведение',
                reward: 100,
                icon: '🎯'
            },
            {
                id: 'territory_owner',
                name: 'Владелец территории',
                description: 'Захватите 10 заведений',
                reward: 500,
                icon: '🏢'
            },
            {
                id: 'district_controller',
                name: 'Контролер района',
                description: 'Захватите 50 заведений',
                reward: 2000,
                icon: '👑'
            },
            {
                id: 'first_duel',
                name: 'Первая дуэль',
                description: 'Выиграйте первую дуэль',
                reward: 200,
                icon: '⚔️'
            },
            {
                id: 'duel_master',
                name: 'Мастер дуэлей',
                description: 'Выиграйте 10 дуэлей',
                reward: 1000,
                icon: '🏆'
            },
            {
                id: 'money_maker',
                name: 'Денежный мешок',
                description: 'Заработайте $10,000',
                reward: 500,
                icon: '💰'
            },
            {
                id: 'clan_member',
                name: 'Член клана',
                description: 'Вступите в клан',
                reward: 300,
                icon: '👥'
            }
        ];

        achievements.forEach(achievement => {
            this.achievements.set(achievement.id, achievement);
        });
    }

    initClans() {
        // Создаем несколько тестовых кланов
        const testClans = [
            {
                id: 'clan_1',
                name: 'Красные Драконы',
                members: ['player_1', 'player_2', 'player_3'],
                leader: 'player_1',
                created: Date.now() - 86400000, // 1 день назад
                territory: ['venue_1', 'venue_2', 'venue_3']
            },
            {
                id: 'clan_2',
                name: 'Синие Тигры',
                members: ['player_4', 'player_5'],
                leader: 'player_4',
                created: Date.now() - 172800000, // 2 дня назад
                territory: ['venue_4', 'venue_5']
            }
        ];

        testClans.forEach(clan => {
            this.clans.set(clan.id, clan);
        });
    }

    initEvents() {
        // Инициализируем систему событий
        this.events = [];
        
        // Запускаем генератор событий
        this.startEventGenerator();
    }

    startEventGenerator() {
        // Генерируем события каждые 30 минут
        setInterval(() => {
            this.generateRandomEvent();
        }, 30 * 60 * 1000);
    }

    generateRandomEvent() {
        const eventTypes = ['police_raid', 'golden_district', 'seasonal_bonus'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        switch (randomType) {
            case 'police_raid':
                this.triggerPoliceRaid();
                break;
            case 'golden_district':
                this.triggerGoldenDistrict();
                break;
            case 'seasonal_bonus':
                this.triggerSeasonalBonus();
                break;
        }
    }

    triggerPoliceRaid() {
        // Рейд полиции - блокирует случайное заведение на 3 часа
        const venues = Array.from(this.map.venues.values());
        const randomVenue = venues[Math.floor(Math.random() * venues.length)];
        
        if (randomVenue && randomVenue.owner) {
            randomVenue.policeRaid = {
                startTime: Date.now(),
                duration: 3 * 60 * 60 * 1000, // 3 часа
                active: true
            };
            
            this.showNotification(`Рейд полиции! Заведение "${randomVenue.name}" заблокировано на 3 часа`, 'warning');
        }
    }

    triggerGoldenDistrict() {
        // Золотой район - удваивает доход случайного района на неделю
        const districts = Array.from(this.map.districts.values());
        const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
        
        if (randomDistrict) {
            randomDistrict.goldenBonus = {
                startTime: Date.now(),
                duration: 7 * 24 * 60 * 60 * 1000, // 1 неделя
                multiplier: 2,
                active: true
            };
            
            this.showNotification(`Золотой район! Район "${randomDistrict.name}" дает двойной доход на неделю`, 'success');
        }
    }

    triggerSeasonalBonus() {
        // Сезонный бонус - увеличивает доход всех заведений на 50% на день
        const bonus = {
            startTime: Date.now(),
            duration: 24 * 60 * 60 * 1000, // 1 день
            multiplier: 1.5,
            active: true
        };
        
        this.events.push(bonus);
        this.showNotification('Сезонный бонус! Все заведения дают +50% дохода на день', 'success');
    }

    startGameSystems() {
        // Запускаем системы игры
        this.player.startIncomeTimer();
        this.player.checkAchievements();
        
        // Обновляем UI
        this.player.updateUI();
    }

    // Методы для захвата заведений
    async attemptCapture() {
        if (!this.map.selectedVenue) {
            this.showNotification('Выберите заведение для захвата', 'warning');
            return;
        }

        const venue = this.map.selectedVenue;
        
        // Проверяем условия захвата
        if (!this.map.canCaptureVenue(venue)) {
            return;
        }

        if (venue.owner) {
            // Заведение занято - начинаем дуэль
            this.startDuel(venue);
        } else {
            // Заведение свободно - захватываем
            this.captureVenue(venue);
        }
    }

    captureVenue(venue) {
        // Захватываем заведение
        venue.owner = this.player.id;
        venue.captureTime = Date.now();
        venue.bonuses = {
            district: false,
            districtUnion: false,
            longTerm: 0
        };

        // Обновляем данные игрока
        this.player.captureVenue(venue.id);
        
        // Обновляем карту
        this.map.updateVenueOwnership(venue.id, this.player.id);
        
        // Проверяем район
        this.checkDistrictOwnership(venue);
        
        this.showNotification(`Заведение "${venue.name}" захвачено!`, 'success');
        this.map.closeVenuePanel();
    }

    checkDistrictOwnership(venue) {
        const district = this.findVenueDistrict(venue.id);
        if (district) {
            // Проверяем, владеет ли игрок всеми заведениями района
            const allOwned = district.venues.every(venueId => {
                const v = this.map.venues.get(venueId);
                return v && v.owner === this.player.id;
            });
            
            if (allOwned) {
                district.owner = this.player.id;
                this.map.updateDistrictOwnership(district.id, this.player.id);
                this.showNotification(`Район "${district.name}" под вашим контролем!`, 'success');
            }
        }
    }

    findVenueDistrict(venueId) {
        for (const district of this.map.districts.values()) {
            if (district.venues.includes(venueId)) {
                return district;
            }
        }
        return null;
    }

    // Методы для дуэлей
    startDuel(venue) {
        if (!venue.owner) return;
        
        // Создаем панель дуэли
        this.showDuelPanel(venue);
    }

    showDuelPanel(venue) {
        const panel = document.getElementById('duel-panel');
        const playerCardsEl = document.getElementById('player-cards');
        const enemyCardsEl = document.getElementById('enemy-cards');
        
        // Очищаем карты
        playerCardsEl.innerHTML = '';
        enemyCardsEl.innerHTML = '';
        
        // Добавляем карты игрока
        const playerCards = this.player.getCardsByType('weapon').slice(0, 5);
        playerCards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.textContent = card.name;
            cardEl.onclick = () => this.selectCard(card);
            playerCardsEl.appendChild(cardEl);
        });
        
        // Добавляем карты противника (скрытые)
        const enemyCards = this.generateEnemyCards(5);
        enemyCards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.textContent = '?';
            enemyCardsEl.appendChild(cardEl);
        });
        
        panel.classList.remove('hidden');
    }

    generateEnemyCards(count) {
        const cardTypes = ['weapon', 'armor', 'special'];
        const cards = [];
        
        for (let i = 0; i < count; i++) {
            const type = cardTypes[Math.floor(Math.random() * cardTypes.length)];
            cards.push({
                id: `enemy_card_${i}`,
                type: type,
                name: this.getRandomCardName(type),
                power: Math.floor(Math.random() * 10) + 1
            });
        }
        
        return cards;
    }

    getRandomCardName(type) {
        const names = {
            weapon: ['Пистолет', 'Нож', 'Дубинка', 'Бейсбольная бита'],
            armor: ['Бронежилет', 'Каска', 'Щит', 'Защитный жилет'],
            special: ['Граната', 'Дымовая шашка', 'Тазер', 'Перцовый баллончик']
        };
        
        const typeNames = names[type] || ['Неизвестно'];
        return typeNames[Math.floor(Math.random() * typeNames.length)];
    }

    selectCard(card) {
        // Логика выбора карты в дуэли
        console.log('Выбрана карта:', card);
    }

    // Методы для UI
    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('main-menu').classList.add('active');
    }

    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.add('active');
    }

    showClanMenu() {
        this.hideAllScreens();
        document.getElementById('clan-menu').classList.add('active');
        this.updateClanMenu();
    }

    showInventory() {
        this.hideAllScreens();
        document.getElementById('inventory-menu').classList.add('active');
        this.updateInventory();
    }

    showAchievements() {
        this.hideAllScreens();
        document.getElementById('achievements-menu').classList.add('active');
        this.updateAchievements();
    }

    showSettings() {
        this.hideAllScreens();
        document.getElementById('settings-menu').classList.add('active');
        this.updateSettings();
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
    }

    updateClanMenu() {
        const currentClanEl = document.getElementById('current-clan');
        const clansListEl = document.getElementById('clans-list');
        
        if (this.player.clanId) {
            const clan = this.clans.get(this.player.clanId);
            if (clan) {
                currentClanEl.innerHTML = `
                    <h4>${clan.name}</h4>
                    <p>Участников: ${clan.members.length}/20</p>
                    <p>Роль: ${this.player.clanRole}</p>
                    <button class="menu-btn" onclick="game.leaveClan()">Покинуть клан</button>
                `;
            }
        } else {
            currentClanEl.innerHTML = `
                <p>Вы не состоите в клане</p>
                <button class="menu-btn" onclick="game.createClan()">Создать клан</button>
            `;
        }
        
        // Обновляем список кланов
        clansListEl.innerHTML = '';
        this.clans.forEach(clan => {
            if (clan.id !== this.player.clanId) {
                const clanEl = document.createElement('div');
                clanEl.className = 'clan-item';
                clanEl.innerHTML = `
                    <div class="clan-details">
                        <h4>${clan.name}</h4>
                        <div class="clan-stats">
                            <p>Участников: ${clan.members.length}/20</p>
                            <p>Территория: ${clan.territory.length} заведений</p>
                        </div>
                    </div>
                    <button class="menu-btn" onclick="game.joinClan('${clan.id}')">Вступить</button>
                `;
                clansListEl.appendChild(clanEl);
            }
        });
    }

    updateInventory() {
        // Обновляем инвентарь
        const cardsListEl = document.getElementById('cards-list');
        const upgradesListEl = document.getElementById('upgrades-list');
        const protectionListEl = document.getElementById('protection-list');
        
        // Карты
        cardsListEl.innerHTML = '';
        this.player.inventory.cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'inventory-item';
            cardEl.innerHTML = `
                <div class="item-info">
                    <h4>${card.name}</h4>
                    <p class="item-description">${card.description}</p>
                </div>
                <div class="item-actions">
                    <button class="action-btn" onclick="game.useCard('${card.id}')">Использовать</button>
                </div>
            `;
            cardsListEl.appendChild(cardEl);
        });
        
        // Улучшения
        upgradesListEl.innerHTML = '';
        this.player.inventory.upgrades.forEach(upgrade => {
            const upgradeEl = document.createElement('div');
            upgradeEl.className = 'inventory-item';
            upgradeEl.innerHTML = `
                <div class="item-info">
                    <h4>${upgrade.name}</h4>
                    <p class="item-description">${upgrade.description}</p>
                </div>
                <div class="item-actions">
                    <button class="action-btn" onclick="game.useUpgrade('${upgrade.id}')">Применить</button>
                </div>
            `;
            upgradesListEl.appendChild(upgradeEl);
        });
        
        // Защита
        protectionListEl.innerHTML = '';
        this.player.inventory.protection.forEach(protection => {
            const protectionEl = document.createElement('div');
            protectionEl.className = 'inventory-item';
            protectionEl.innerHTML = `
                <div class="item-info">
                    <h4>${protection.name}</h4>
                    <p class="item-description">${protection.description}</p>
                </div>
                <div class="item-actions">
                    <button class="action-btn" onclick="game.useProtection('${protection.id}')">Активировать</button>
                </div>
            `;
            protectionListEl.appendChild(protectionEl);
        });
    }

    updateAchievements() {
        const achievementsListEl = document.getElementById('achievements-list');
        achievementsListEl.innerHTML = '';
        
        this.achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement ${this.player.achievements.has(achievement.id) ? 'unlocked' : ''}`;
            achievementEl.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    <p>Награда: $${achievement.reward}</p>
                </div>
            `;
            achievementsListEl.appendChild(achievementEl);
        });
    }

    updateSettings() {
        const soundToggle = document.getElementById('sound-toggle');
        const notificationsToggle = document.getElementById('notifications-toggle');
        const autoCaptureToggle = document.getElementById('auto-capture-toggle');
        
        soundToggle.checked = this.player.getSetting('sound');
        notificationsToggle.checked = this.player.getSetting('notifications');
        autoCaptureToggle.checked = this.player.getSetting('autoCapture');
        
        // Добавляем обработчики событий
        soundToggle.onchange = (e) => this.player.setSetting('sound', e.target.checked);
        notificationsToggle.onchange = (e) => this.player.setSetting('notifications', e.target.checked);
        autoCaptureToggle.onchange = (e) => this.player.setSetting('autoCapture', e.target.checked);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.getElementById('notifications').appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Методы для кланов
    createClan() {
        const name = prompt('Введите название клана:');
        if (name && name.trim()) {
            const clanId = 'clan_' + Math.random().toString(36).substr(2, 9);
            const clan = {
                id: clanId,
                name: name.trim(),
                members: [this.player.id],
                leader: this.player.id,
                created: Date.now(),
                territory: []
            };
            
            this.clans.set(clanId, clan);
            this.player.joinClan(clanId, 'leader');
            this.showNotification(`Клан "${name}" создан!`, 'success');
            this.updateClanMenu();
        }
    }

    joinClan(clanId) {
        const clan = this.clans.get(clanId);
        if (clan && clan.members.length < 20) {
            clan.members.push(this.player.id);
            this.player.joinClan(clanId, 'member');
            this.showNotification(`Вы вступили в клан "${clan.name}"`, 'success');
            this.updateClanMenu();
        } else {
            this.showNotification('Клан переполнен или не найден', 'error');
        }
    }

    leaveClan() {
        if (this.player.clanId) {
            const clan = this.clans.get(this.player.clanId);
            if (clan) {
                clan.members = clan.members.filter(id => id !== this.player.id);
                this.player.leaveClan();
                this.showNotification('Вы покинули клан', 'info');
                this.updateClanMenu();
            }
        }
    }
}

// Глобальные функции для HTML
function startGame() {
    game.showGameScreen();
}

function showClanMenu() {
    game.showClanMenu();
}

function showInventory() {
    game.showInventory();
}

function showAchievements() {
    game.showAchievements();
}

function showSettings() {
    game.showSettings();
}

function showMainMenu() {
    game.showMainMenu();
}

function showPlayerMenu() {
    game.showMainMenu();
}

function showMapLegend() {
    game.showNotification('Легенда карты:\nСиний - ваши заведения\nКрасный - чужие заведения\nОранжевый - свободные заведения', 'info');
}

function attemptCapture() {
    game.attemptCapture();
}

function startDuel() {
    if (game.map.selectedVenue) {
        game.startDuel(game.map.selectedVenue);
    }
}

function closeVenuePanel() {
    game.map.closeVenuePanel();
}

function closeDuelPanel() {
    document.getElementById('duel-panel').classList.add('hidden');
}

function playCard() {
    game.showNotification('Выберите карту для игры', 'info');
}

function endTurn() {
    game.showNotification('Ход завершен', 'info');
}

function showInventoryTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Скрываем все кнопки вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[onclick="showInventoryTab('${tabName}')"]`).classList.add('active');
}

// Инициализация игры
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});

// Функция для пропуска загрузки
function skipLoading() {
    if (game && game.ui) {
        game.ui.hideLoadingScreen();
        game.ui.showMainMenu();
        game.showNotification('Загрузка пропущена. Некоторые функции могут быть недоступны.', 'warning');
    }
}
