// Система событий
class EventSystem {
    constructor() {
        this.activeEvents = new Map();
        this.eventHistory = [];
        this.eventTypes = {
            police_raid: {
                name: 'Рейд полиции',
                description: 'Полиция проводит рейд на заведение',
                duration: 3 * 60 * 60 * 1000, // 3 часа
                frequency: 0.1, // 10% шанс в день
                icon: '🚔'
            },
            golden_district: {
                name: 'Золотой район',
                description: 'Район дает двойной доход',
                duration: 7 * 24 * 60 * 60 * 1000, // 1 неделя
                frequency: 0.05, // 5% шанс в день
                icon: '💰'
            },
            seasonal_bonus: {
                name: 'Сезонный бонус',
                description: 'Все заведения дают +50% дохода',
                duration: 24 * 60 * 60 * 1000, // 1 день
                frequency: 0.2, // 20% шанс в день
                icon: '🎉'
            },
            market_crash: {
                name: 'Крах рынка',
                description: 'Цены на карты снижены на 30%',
                duration: 24 * 60 * 60 * 1000, // 1 день
                frequency: 0.1, // 10% шанс в день
                icon: '📉'
            },
            market_boom: {
                name: 'Бум рынка',
                description: 'Цены на улучшения выросли на 50%',
                duration: 24 * 60 * 60 * 1000, // 1 день
                frequency: 0.1, // 10% шанс в день
                icon: '📈'
            },
            rare_items: {
                name: 'Редкие предметы',
                description: 'Редкие предметы доступны в продаже',
                duration: 24 * 60 * 60 * 1000, // 1 день
                frequency: 0.05, // 5% шанс в день
                icon: '💎'
            },
            gang_war: {
                name: 'Война банд',
                description: 'Между кланами объявлена война',
                duration: 7 * 24 * 60 * 60 * 1000, // 1 неделя
                frequency: 0.02, // 2% шанс в день
                icon: '⚔️'
            },
            police_crackdown: {
                name: 'Облава полиции',
                description: 'Полиция усиливает патрулирование',
                duration: 12 * 60 * 60 * 1000, // 12 часов
                frequency: 0.08, // 8% шанс в день
                icon: '👮'
            }
        };
        
        this.initEventSystem();
    }

    initEventSystem() {
        this.loadEventHistory();
        this.startEventGenerator();
        this.startEventUpdates();
    }

    startEventGenerator() {
        // Генерируем события каждые 30 минут
        setInterval(() => {
            this.generateRandomEvent();
        }, 30 * 60 * 1000);
        
        // Генерируем ежедневные события
        setInterval(() => {
            this.generateDailyEvents();
        }, 24 * 60 * 60 * 1000);
    }

    startEventUpdates() {
        // Обновляем события каждые 5 минут
        setInterval(() => {
            this.updateEvents();
        }, 5 * 60 * 1000);
    }

    generateRandomEvent() {
        const eventTypes = Object.keys(this.eventTypes);
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventType = this.eventTypes[randomType];
        
        if (Math.random() < eventType.frequency) {
            this.triggerEvent(randomType);
        }
    }

    generateDailyEvents() {
        // Генерируем ежедневные события
        Object.entries(this.eventTypes).forEach(([type, config]) => {
            if (Math.random() < config.frequency) {
                this.triggerEvent(type);
            }
        });
    }

    triggerEvent(eventType, targetId = null) {
        const eventConfig = this.eventTypes[eventType];
        if (!eventConfig) return null;
        
        const eventId = 'event_' + Math.random().toString(36).substr(2, 9);
        const event = {
            id: eventId,
            type: eventType,
            name: eventConfig.name,
            description: eventConfig.description,
            targetId: targetId,
            startTime: Date.now(),
            duration: eventConfig.duration,
            endTime: Date.now() + eventConfig.duration,
            active: true,
            effects: this.getEventEffects(eventType),
            icon: eventConfig.icon
        };
        
        this.activeEvents.set(eventId, event);
        this.applyEventEffects(event);
        this.saveEventHistory();
        
        // Уведомляем игроков
        this.notifyPlayers(event);
        
        return event;
    }

    getEventEffects(eventType) {
        const effects = {
            police_raid: {
                target: 'venue',
                effect: 'block_capture',
                duration: 3 * 60 * 60 * 1000
            },
            golden_district: {
                target: 'district',
                effect: 'income_multiplier',
                multiplier: 2.0
            },
            seasonal_bonus: {
                target: 'global',
                effect: 'income_multiplier',
                multiplier: 1.5
            },
            market_crash: {
                target: 'market',
                effect: 'price_multiplier',
                category: 'cards',
                multiplier: 0.7
            },
            market_boom: {
                target: 'market',
                effect: 'price_multiplier',
                category: 'upgrades',
                multiplier: 1.5
            },
            rare_items: {
                target: 'market',
                effect: 'unlock_rare_items'
            },
            gang_war: {
                target: 'clans',
                effect: 'enable_war_mode'
            },
            police_crackdown: {
                target: 'global',
                effect: 'increase_capture_difficulty',
                multiplier: 1.5
            }
        };
        
        return effects[eventType] || {};
    }

    applyEventEffects(event) {
        const effects = event.effects;
        
        switch (effects.target) {
            case 'venue':
                this.applyVenueEffect(event);
                break;
            case 'district':
                this.applyDistrictEffect(event);
                break;
            case 'global':
                this.applyGlobalEffect(event);
                break;
            case 'market':
                this.applyMarketEffect(event);
                break;
            case 'clans':
                this.applyClanEffect(event);
                break;
        }
    }

    applyVenueEffect(event) {
        if (event.targetId) {
            const venue = game.map.venues.get(event.targetId);
            if (venue) {
                venue.events = venue.events || {};
                venue.events[event.type] = {
                    startTime: event.startTime,
                    endTime: event.endTime,
                    active: true
                };
            }
        } else {
            // Применяем к случайному заведению
            const venues = Array.from(game.map.venues.values());
            const randomVenue = venues[Math.floor(Math.random() * venues.length)];
            if (randomVenue) {
                randomVenue.events = randomVenue.events || {};
                randomVenue.events[event.type] = {
                    startTime: event.startTime,
                    endTime: event.endTime,
                    active: true
                };
                event.targetId = randomVenue.id;
            }
        }
    }

    applyDistrictEffect(event) {
        if (event.targetId) {
            const district = game.map.districts.get(event.targetId);
            if (district) {
                district.events = district.events || {};
                district.events[event.type] = {
                    startTime: event.startTime,
                    endTime: event.endTime,
                    active: true,
                    multiplier: event.effects.multiplier
                };
            }
        } else {
            // Применяем к случайному району
            const districts = Array.from(game.map.districts.values());
            const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
            if (randomDistrict) {
                randomDistrict.events = randomDistrict.events || {};
                randomDistrict.events[event.type] = {
                    startTime: event.startTime,
                    endTime: event.endTime,
                    active: true,
                    multiplier: event.effects.multiplier
                };
                event.targetId = randomDistrict.id;
            }
        }
    }

    applyGlobalEffect(event) {
        // Применяем глобальный эффект
        game.globalEvents = game.globalEvents || {};
        game.globalEvents[event.type] = {
            startTime: event.startTime,
            endTime: event.endTime,
            active: true,
            effects: event.effects
        };
    }

    applyMarketEffect(event) {
        // Применяем эффект к рынку
        if (event.effects.effect === 'price_multiplier') {
            game.marketEvents = game.marketEvents || {};
            game.marketEvents[event.type] = {
                startTime: event.startTime,
                endTime: event.endTime,
                active: true,
                category: event.effects.category,
                multiplier: event.effects.multiplier
            };
        } else if (event.effects.effect === 'unlock_rare_items') {
            game.marketEvents = game.marketEvents || {};
            game.marketEvents[event.type] = {
                startTime: event.startTime,
                endTime: event.endTime,
                active: true,
                effect: 'unlock_rare_items'
            };
        }
    }

    applyClanEffect(event) {
        // Применяем эффект к кланам
        if (event.effects.effect === 'enable_war_mode') {
            game.clanEvents = game.clanEvents || {};
            game.clanEvents[event.type] = {
                startTime: event.startTime,
                endTime: event.endTime,
                active: true,
                effect: 'enable_war_mode'
            };
        }
    }

    updateEvents() {
        const now = Date.now();
        const eventsToEnd = [];
        
        this.activeEvents.forEach((event, eventId) => {
            if (now >= event.endTime) {
                eventsToEnd.push(eventId);
            }
        });
        
        eventsToEnd.forEach(eventId => {
            this.endEvent(eventId);
        });
    }

    endEvent(eventId) {
        const event = this.activeEvents.get(eventId);
        if (!event) return;
        
        // Убираем эффекты события
        this.removeEventEffects(event);
        
        // Обновляем статус
        event.active = false;
        event.endTime = Date.now();
        
        // Добавляем в историю
        this.eventHistory.push({
            id: event.id,
            type: event.type,
            name: event.name,
            startTime: event.startTime,
            endTime: event.endTime,
            duration: event.endTime - event.startTime,
            targetId: event.targetId
        });
        
        // Удаляем из активных событий
        this.activeEvents.delete(eventId);
        
        this.saveEventHistory();
        
        // Уведомляем игроков об окончании события
        this.notifyPlayers(event, 'ended');
    }

    removeEventEffects(event) {
        const effects = event.effects;
        
        switch (effects.target) {
            case 'venue':
                this.removeVenueEffect(event);
                break;
            case 'district':
                this.removeDistrictEffect(event);
                break;
            case 'global':
                this.removeGlobalEffect(event);
                break;
            case 'market':
                this.removeMarketEffect(event);
                break;
            case 'clans':
                this.removeClanEffect(event);
                break;
        }
    }

    removeVenueEffect(event) {
        if (event.targetId) {
            const venue = game.map.venues.get(event.targetId);
            if (venue && venue.events) {
                delete venue.events[event.type];
            }
        }
    }

    removeDistrictEffect(event) {
        if (event.targetId) {
            const district = game.map.districts.get(event.targetId);
            if (district && district.events) {
                delete district.events[event.type];
            }
        }
    }

    removeGlobalEffect(event) {
        if (game.globalEvents) {
            delete game.globalEvents[event.type];
        }
    }

    removeMarketEffect(event) {
        if (game.marketEvents) {
            delete game.marketEvents[event.type];
        }
    }

    removeClanEffect(event) {
        if (game.clanEvents) {
            delete game.clanEvents[event.type];
        }
    }

    notifyPlayers(event, status = 'started') {
        const message = status === 'started' 
            ? `Событие: ${event.name} - ${event.description}`
            : `Событие завершено: ${event.name}`;
        
        const notificationType = status === 'started' ? 'info' : 'success';
        
        game.showNotification(message, notificationType);
    }

    getActiveEvents() {
        const activeEvents = [];
        this.activeEvents.forEach(event => {
            activeEvents.push({
                id: event.id,
                type: event.type,
                name: event.name,
                description: event.description,
                startTime: event.startTime,
                endTime: event.endTime,
                remainingTime: event.endTime - Date.now(),
                targetId: event.targetId,
                icon: event.icon
            });
        });
        return activeEvents;
    }

    getEventHistory(limit = 50) {
        return this.eventHistory
            .sort((a, b) => b.startTime - a.startTime)
            .slice(0, limit);
    }

    isEventActive(eventType, targetId = null) {
        for (const event of this.activeEvents.values()) {
            if (event.type === eventType && event.active) {
                if (targetId === null || event.targetId === targetId) {
                    return true;
                }
            }
        }
        return false;
    }

    getEventMultiplier(eventType, targetId = null) {
        for (const event of this.activeEvents.values()) {
            if (event.type === eventType && event.active) {
                if (targetId === null || event.targetId === targetId) {
                    return event.effects.multiplier || 1.0;
                }
            }
        }
        return 1.0;
    }

    // Методы для специальных событий
    triggerPoliceRaid(venueId) {
        return this.triggerEvent('police_raid', venueId);
    }

    triggerGoldenDistrict(districtId) {
        return this.triggerEvent('golden_district', districtId);
    }

    triggerSeasonalBonus() {
        return this.triggerEvent('seasonal_bonus');
    }

    triggerMarketCrash() {
        return this.triggerEvent('market_crash');
    }

    triggerMarketBoom() {
        return this.triggerEvent('market_boom');
    }

    triggerRareItems() {
        return this.triggerEvent('rare_items');
    }

    triggerGangWar() {
        return this.triggerEvent('gang_war');
    }

    triggerPoliceCrackdown() {
        return this.triggerEvent('police_crackdown');
    }

    // Методы для проверки эффектов событий
    isVenueBlocked(venueId) {
        return this.isEventActive('police_raid', venueId);
    }

    getDistrictIncomeMultiplier(districtId) {
        return this.getEventMultiplier('golden_district', districtId);
    }

    getGlobalIncomeMultiplier() {
        return this.getEventMultiplier('seasonal_bonus');
    }

    getMarketPriceMultiplier(category) {
        if (game.marketEvents) {
            for (const event of game.marketEvents) {
                if (event.active && event.category === category) {
                    return event.multiplier || 1.0;
                }
            }
        }
        return 1.0;
    }

    areRareItemsAvailable() {
        return this.isEventActive('rare_items');
    }

    isWarModeEnabled() {
        return this.isEventActive('gang_war');
    }

    getCaptureDifficultyMultiplier() {
        return this.getEventMultiplier('police_crackdown');
    }

    saveEventHistory() {
        try {
            const eventData = {
                activeEvents: Array.from(this.activeEvents.entries()),
                eventHistory: this.eventHistory
            };
            localStorage.setItem('gangsters_events', JSON.stringify(eventData));
        } catch (error) {
            console.error('Ошибка сохранения событий:', error);
        }
    }

    loadEventHistory() {
        try {
            const savedData = localStorage.getItem('gangsters_events');
            if (savedData) {
                const eventData = JSON.parse(savedData);
                this.activeEvents = new Map(eventData.activeEvents);
                this.eventHistory = eventData.eventHistory;
                console.log('События загружены');
            }
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
        }
    }
}

// Глобальная переменная для системы событий
let eventSystem;

