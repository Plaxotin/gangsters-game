// Экономическая система игры
class EconomySystem {
    constructor() {
        this.marketPrices = new Map();
        this.inflationRate = 0.01; // 1% в день
        this.lastInflationUpdate = Date.now();
        this.dailyEvents = new Map();
        
        this.initEconomy();
    }

    initEconomy() {
        this.initMarketPrices();
        this.startEconomyUpdates();
        this.loadEconomyData();
    }

    initMarketPrices() {
        // Инициализируем цены на товары
        const prices = {
            // Карты для дуэлей
            'pistol_card': { base: 100, current: 100, category: 'weapon' },
            'knife_card': { base: 50, current: 50, category: 'weapon' },
            'bat_card': { base: 75, current: 75, category: 'weapon' },
            'armor_card': { base: 150, current: 150, category: 'armor' },
            'helmet_card': { base: 100, current: 100, category: 'armor' },
            'shield_card': { base: 200, current: 200, category: 'armor' },
            'grenade_card': { base: 300, current: 300, category: 'special' },
            'smoke_card': { base: 150, current: 150, category: 'special' },
            'taser_card': { base: 250, current: 250, category: 'special' },
            
            // Улучшения заведений
            'income_boost_20': { base: 500, current: 500, category: 'upgrade' },
            'income_boost_50': { base: 1000, current: 1000, category: 'upgrade' },
            'income_boost_100': { base: 2000, current: 2000, category: 'upgrade' },
            'security_upgrade': { base: 800, current: 800, category: 'upgrade' },
            'reputation_upgrade': { base: 1200, current: 1200, category: 'upgrade' },
            
            // Защита
            'protection_1h': { base: 200, current: 200, category: 'protection' },
            'protection_6h': { base: 1000, current: 1000, category: 'protection' },
            'protection_24h': { base: 3000, current: 3000, category: 'protection' },
            'police_bribe': { base: 500, current: 500, category: 'protection' },
            
            // Специальные предметы
            'territory_scanner': { base: 1500, current: 1500, category: 'special' },
            'income_multiplier': { base: 5000, current: 5000, category: 'special' },
            'clan_boost': { base: 3000, current: 3000, category: 'special' }
        };
        
        Object.entries(prices).forEach(([id, price]) => {
            this.marketPrices.set(id, price);
        });
    }

    startEconomyUpdates() {
        // Обновляем экономику каждые 5 минут
        setInterval(() => {
            this.updateEconomy();
        }, 5 * 60 * 1000);
        
        // Обновляем инфляцию каждый день
        setInterval(() => {
            this.updateInflation();
        }, 24 * 60 * 60 * 1000);
    }

    updateEconomy() {
        this.updateMarketPrices();
        this.updateDailyEvents();
        this.saveEconomyData();
    }

    updateInflation() {
        const now = Date.now();
        const daysPassed = Math.floor((now - this.lastInflationUpdate) / (24 * 60 * 60 * 1000));
        
        if (daysPassed > 0) {
            this.marketPrices.forEach((price, id) => {
                const inflationMultiplier = Math.pow(1 + this.inflationRate, daysPassed);
                price.current = Math.floor(price.base * inflationMultiplier);
            });
            
            this.lastInflationUpdate = now;
            this.saveEconomyData();
        }
    }

    updateMarketPrices() {
        // Обновляем цены на основе спроса и предложения
        this.marketPrices.forEach((price, id) => {
            const demand = this.calculateDemand(id);
            const supply = this.calculateSupply(id);
            
            if (demand > supply) {
                // Спрос превышает предложение - цена растет
                price.current = Math.floor(price.current * 1.02);
            } else if (supply > demand) {
                // Предложение превышает спрос - цена падает
                price.current = Math.floor(price.current * 0.98);
            }
            
            // Ограничиваем колебания цен
            const minPrice = Math.floor(price.base * 0.5);
            const maxPrice = Math.floor(price.base * 2.0);
            price.current = Math.max(minPrice, Math.min(maxPrice, price.current));
        });
    }

    calculateDemand(itemId) {
        // Простая логика расчета спроса
        // В реальной игре здесь должна быть более сложная система
        const baseDemand = 100;
        const randomFactor = Math.random() * 50;
        return baseDemand + randomFactor;
    }

    calculateSupply(itemId) {
        // Простая логика расчета предложения
        const baseSupply = 100;
        const randomFactor = Math.random() * 50;
        return baseSupply + randomFactor;
    }

    updateDailyEvents() {
        const now = Date.now();
        const today = new Date(now).toDateString();
        
        if (!this.dailyEvents.has(today)) {
            this.generateDailyEvents(today);
        }
    }

    generateDailyEvents(date) {
        const events = [];
        
        // Случайные события дня
        if (Math.random() < 0.3) {
            events.push({
                type: 'market_crash',
                description: 'Крах рынка! Цены на карты снижены на 30%',
                effect: 'card_prices_down',
                multiplier: 0.7,
                duration: 24 * 60 * 60 * 1000
            });
        }
        
        if (Math.random() < 0.2) {
            events.push({
                type: 'market_boom',
                description: 'Бум рынка! Цены на улучшения выросли на 50%',
                effect: 'upgrade_prices_up',
                multiplier: 1.5,
                duration: 24 * 60 * 60 * 1000
            });
        }
        
        if (Math.random() < 0.1) {
            events.push({
                type: 'rare_items',
                description: 'Редкие предметы в продаже!',
                effect: 'rare_items_available',
                duration: 24 * 60 * 60 * 1000
            });
        }
        
        this.dailyEvents.set(date, events);
    }

    getItemPrice(itemId) {
        const price = this.marketPrices.get(itemId);
        if (!price) return 0;
        
        // Применяем дневные события
        const today = new Date().toDateString();
        const todayEvents = this.dailyEvents.get(today) || [];
        
        let finalPrice = price.current;
        
        todayEvents.forEach(event => {
            if (event.effect === 'card_prices_down' && price.category === 'weapon') {
                finalPrice *= event.multiplier;
            } else if (event.effect === 'upgrade_prices_up' && price.category === 'upgrade') {
                finalPrice *= event.multiplier;
            }
        });
        
        return Math.floor(finalPrice);
    }

    buyItem(playerId, itemId, quantity = 1) {
        const player = game.players.get(playerId);
        if (!player) return { success: false, reason: 'Игрок не найден' };
        
        const price = this.getItemPrice(itemId);
        const totalCost = price * quantity;
        
        if (player.money < totalCost) {
            return { success: false, reason: 'Недостаточно денег' };
        }
        
        // Проверяем доступность предмета
        if (!this.isItemAvailable(itemId)) {
            return { success: false, reason: 'Предмет недоступен' };
        }
        
        // Покупаем предмет
        player.spendMoney(totalCost);
        this.giveItemToPlayer(playerId, itemId, quantity);
        
        // Обновляем спрос
        this.updateItemDemand(itemId, quantity);
        
        return { success: true, cost: totalCost };
    }

    sellItem(playerId, itemId, quantity = 1) {
        const player = game.players.get(playerId);
        if (!player) return { success: false, reason: 'Игрок не найден' };
        
        // Проверяем, есть ли у игрока предмет
        if (!this.playerHasItem(playerId, itemId, quantity)) {
            return { success: false, reason: 'Недостаточно предметов' };
        }
        
        const price = this.getItemPrice(itemId);
        const sellPrice = Math.floor(price * 0.7); // 70% от цены покупки
        const totalEarned = sellPrice * quantity;
        
        // Продаем предмет
        player.addMoney(totalEarned);
        this.removeItemFromPlayer(playerId, itemId, quantity);
        
        // Обновляем предложение
        this.updateItemSupply(itemId, quantity);
        
        return { success: true, earned: totalEarned };
    }

    isItemAvailable(itemId) {
        const price = this.marketPrices.get(itemId);
        if (!price) return false;
        
        // Проверяем дневные события
        const today = new Date().toDateString();
        const todayEvents = this.dailyEvents.get(today) || [];
        
        // Редкие предметы доступны только в определенные дни
        if (price.category === 'special') {
            const hasRareEvent = todayEvents.some(event => event.effect === 'rare_items_available');
            if (!hasRareEvent) return false;
        }
        
        return true;
    }

    giveItemToPlayer(playerId, itemId, quantity) {
        const player = game.players.get(playerId);
        if (!player) return;
        
        const item = this.createItem(itemId);
        if (!item) return;
        
        for (let i = 0; i < quantity; i++) {
            if (item.category === 'weapon' || item.category === 'armor' || item.category === 'special') {
                player.addCard(item);
            } else if (item.category === 'upgrade') {
                player.addUpgrade(item);
            } else if (item.category === 'protection') {
                player.addProtection(item);
            }
        }
    }

    removeItemFromPlayer(playerId, itemId, quantity) {
        const player = game.players.get(playerId);
        if (!player) return;
        
        const item = this.createItem(itemId);
        if (!item) return;
        
        for (let i = 0; i < quantity; i++) {
            if (item.category === 'weapon' || item.category === 'armor' || item.category === 'special') {
                player.removeCard(item.id);
            }
        }
    }

    playerHasItem(playerId, itemId, quantity) {
        const player = game.players.get(playerId);
        if (!player) return false;
        
        const item = this.createItem(itemId);
        if (!item) return false;
        
        if (item.category === 'weapon' || item.category === 'armor' || item.category === 'special') {
            const playerCards = player.inventory.cards.filter(card => card.id === itemId);
            return playerCards.length >= quantity;
        }
        
        return false;
    }

    createItem(itemId) {
        const itemTemplates = {
            // Карты оружия
            'pistol_card': {
                id: 'pistol_card',
                name: 'Пистолет',
                description: 'Надежное огнестрельное оружие',
                type: 'weapon',
                category: 'weapon',
                power: 8,
                rarity: 'common'
            },
            'knife_card': {
                id: 'knife_card',
                name: 'Нож',
                description: 'Острое холодное оружие',
                type: 'weapon',
                category: 'weapon',
                power: 5,
                rarity: 'common'
            },
            'bat_card': {
                id: 'bat_card',
                name: 'Бейсбольная бита',
                description: 'Тяжелое ударное оружие',
                type: 'weapon',
                category: 'weapon',
                power: 6,
                rarity: 'common'
            },
            
            // Карты брони
            'armor_card': {
                id: 'armor_card',
                name: 'Бронежилет',
                description: 'Защищает от огнестрельного оружия',
                type: 'armor',
                category: 'armor',
                defense: 7,
                rarity: 'uncommon'
            },
            'helmet_card': {
                id: 'helmet_card',
                name: 'Каска',
                description: 'Защищает голову от ударов',
                type: 'armor',
                category: 'armor',
                defense: 5,
                rarity: 'common'
            },
            'shield_card': {
                id: 'shield_card',
                name: 'Щит',
                description: 'Отличная защита от всех видов атак',
                type: 'armor',
                category: 'armor',
                defense: 9,
                rarity: 'rare'
            },
            
            // Специальные карты
            'grenade_card': {
                id: 'grenade_card',
                name: 'Граната',
                description: 'Мощное взрывное устройство',
                type: 'special',
                category: 'special',
                power: 12,
                rarity: 'rare'
            },
            'smoke_card': {
                id: 'smoke_card',
                name: 'Дымовая шашка',
                description: 'Создает дымовую завесу',
                type: 'special',
                category: 'special',
                power: 3,
                rarity: 'uncommon'
            },
            'taser_card': {
                id: 'taser_card',
                name: 'Тазер',
                description: 'Электрошоковое оружие',
                type: 'special',
                category: 'special',
                power: 7,
                rarity: 'uncommon'
            },
            
            // Улучшения
            'income_boost_20': {
                id: 'income_boost_20',
                name: 'Улучшение дохода +20%',
                description: 'Увеличивает доход заведения на 20%',
                category: 'upgrade',
                effect: 'income_boost',
                value: 0.2,
                duration: 7 * 24 * 60 * 60 * 1000 // 1 неделя
            },
            'income_boost_50': {
                id: 'income_boost_50',
                name: 'Улучшение дохода +50%',
                description: 'Увеличивает доход заведения на 50%',
                category: 'upgrade',
                effect: 'income_boost',
                value: 0.5,
                duration: 7 * 24 * 60 * 60 * 1000
            },
            'income_boost_100': {
                id: 'income_boost_100',
                name: 'Улучшение дохода +100%',
                description: 'Увеличивает доход заведения на 100%',
                category: 'upgrade',
                effect: 'income_boost',
                value: 1.0,
                duration: 7 * 24 * 60 * 60 * 1000
            },
            
            // Защита
            'protection_1h': {
                id: 'protection_1h',
                name: 'Защита на 1 час',
                description: 'Защищает заведение от захвата на 1 час',
                category: 'protection',
                effect: 'protection',
                duration: 60 * 60 * 1000 // 1 час
            },
            'protection_6h': {
                id: 'protection_6h',
                name: 'Защита на 6 часов',
                description: 'Защищает заведение от захвата на 6 часов',
                category: 'protection',
                effect: 'protection',
                duration: 6 * 60 * 60 * 1000
            },
            'protection_24h': {
                id: 'protection_24h',
                name: 'Защита на 24 часа',
                description: 'Защищает заведение от захвата на 24 часа',
                category: 'protection',
                effect: 'protection',
                duration: 24 * 60 * 60 * 1000
            }
        };
        
        return itemTemplates[itemId] || null;
    }

    updateItemDemand(itemId, quantity) {
        // Обновляем спрос на предмет
        const price = this.marketPrices.get(itemId);
        if (price) {
            // Увеличиваем спрос при покупке
            price.current = Math.floor(price.current * 1.01);
        }
    }

    updateItemSupply(itemId, quantity) {
        // Обновляем предложение предмета
        const price = this.marketPrices.get(itemId);
        if (price) {
            // Уменьшаем цену при продаже
            price.current = Math.floor(price.current * 0.99);
        }
    }

    getMarketData() {
        const marketData = {
            prices: {},
            events: [],
            inflation: this.inflationRate
        };
        
        this.marketPrices.forEach((price, id) => {
            marketData.prices[id] = {
                current: price.current,
                base: price.base,
                category: price.category,
                available: this.isItemAvailable(id)
            };
        });
        
        const today = new Date().toDateString();
        const todayEvents = this.dailyEvents.get(today) || [];
        marketData.events = todayEvents;
        
        return marketData;
    }

    saveEconomyData() {
        try {
            const economyData = {
                marketPrices: Array.from(this.marketPrices.entries()),
                inflationRate: this.inflationRate,
                lastInflationUpdate: this.lastInflationUpdate,
                dailyEvents: Array.from(this.dailyEvents.entries())
            };
            
            localStorage.setItem('gangsters_economy', JSON.stringify(economyData));
        } catch (error) {
            console.error('Ошибка сохранения экономических данных:', error);
        }
    }

    loadEconomyData() {
        try {
            const savedData = localStorage.getItem('gangsters_economy');
            if (savedData) {
                const economyData = JSON.parse(savedData);
                
                this.marketPrices = new Map(economyData.marketPrices);
                this.inflationRate = economyData.inflationRate;
                this.lastInflationUpdate = economyData.lastInflationUpdate;
                this.dailyEvents = new Map(economyData.dailyEvents);
                
                console.log('Экономические данные загружены');
            }
        } catch (error) {
            console.error('Ошибка загрузки экономических данных:', error);
        }
    }
}

// Глобальная переменная для экономической системы
let economySystem;

