// Система игрока
class Player {
    constructor() {
        this.id = this.generatePlayerId();
        this.name = 'Игрок';
        this.level = 1;
        this.money = 1000; // Стартовые деньги
        this.experience = 0;
        this.ownedVenues = new Set();
        this.clanId = null;
        this.clanRole = null;
        this.inventory = {
            cards: [],
            upgrades: [],
            protection: []
        };
        this.achievements = new Set();
        this.stats = {
            venuesCaptured: 0,
            duelsWon: 0,
            duelsLost: 0,
            totalIncome: 0,
            playTime: 0
        };
        this.settings = {
            sound: true,
            notifications: true,
            autoCapture: false
        };
        
        this.loadPlayerData();
    }

    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    loadPlayerData() {
        // Загружаем данные игрока из localStorage
        const savedData = localStorage.getItem('gangsters_player_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.assign(this, data);
                
                // Восстанавливаем Set объекты
                if (Array.isArray(this.achievements)) {
                    this.achievements = new Set(this.achievements);
                } else if (!(this.achievements instanceof Set)) {
                    this.achievements = new Set();
                }
                
                if (Array.isArray(this.ownedVenues)) {
                    this.ownedVenues = new Set(this.ownedVenues);
                } else if (!(this.ownedVenues instanceof Set)) {
                    this.ownedVenues = new Set();
                }
                
                console.log('Данные игрока загружены');
            } catch (error) {
                console.error('Ошибка загрузки данных игрока:', error);
            }
        }
    }

    savePlayerData() {
        // Сохраняем данные игрока в localStorage
        try {
            // Создаем копию данных для сериализации
            const dataToSave = {
                ...this,
                achievements: Array.from(this.achievements),
                ownedVenues: Array.from(this.ownedVenues)
            };
            
            localStorage.setItem('gangsters_player_data', JSON.stringify(dataToSave));
            console.log('Данные игрока сохранены');
        } catch (error) {
            console.error('Ошибка сохранения данных игрока:', error);
        }
    }

    canCaptureVenueType(venueType) {
        // Проверяем, может ли игрок захватывать заведения данного типа
        if (!this.clanId) {
            // Игрок без клана может захватывать только малые заведения
            return venueType === 'small';
        }
        
        const clan = game.clans.get(this.clanId);
        if (!clan) return false;
        
        if (clan.members.length < 20) {
            // Клан до 20 участников - малые и средние заведения
            return venueType === 'small' || venueType === 'medium';
        } else {
            // Клан от 20 участников - все типы заведений
            return true;
        }
    }

    addMoney(amount) {
        this.money += amount;
        this.stats.totalIncome += amount;
        this.updateUI();
        this.savePlayerData();
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateUI();
            this.savePlayerData();
            return true;
        }
        return false;
    }

    addExperience(amount) {
        this.experience += amount;
        const newLevel = Math.floor(this.experience / 1000) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showLevelUpNotification();
        }
        
        this.updateUI();
        this.savePlayerData();
    }

    showLevelUpNotification() {
        game.ui.showNotification(`Поздравляем! Вы достигли ${this.level} уровня!`, 'success');
    }

    captureVenue(venueId) {
        // Убеждаемся, что ownedVenues является Set
        if (!(this.ownedVenues instanceof Set)) {
            this.ownedVenues = new Set();
        }
        
        if (!this.ownedVenues.has(venueId)) {
            this.ownedVenues.add(venueId);
            this.stats.venuesCaptured++;
            this.addExperience(50);
            this.updateUI();
            this.savePlayerData();
            return true;
        }
        return false;
    }

    loseVenue(venueId) {
        // Убеждаемся, что ownedVenues является Set
        if (!(this.ownedVenues instanceof Set)) {
            this.ownedVenues = new Set();
        }
        
        if (this.ownedVenues.has(venueId)) {
            this.ownedVenues.delete(venueId);
            this.updateUI();
            this.savePlayerData();
            return true;
        }
        return false;
    }

    addCard(card) {
        this.inventory.cards.push(card);
        this.savePlayerData();
    }

    removeCard(cardId) {
        const index = this.inventory.cards.findIndex(card => card.id === cardId);
        if (index !== -1) {
            this.inventory.cards.splice(index, 1);
            this.savePlayerData();
            return true;
        }
        return false;
    }

    getCardsByType(type) {
        return this.inventory.cards.filter(card => card.type === type);
    }

    addUpgrade(upgrade) {
        this.inventory.upgrades.push(upgrade);
        this.savePlayerData();
    }

    addProtection(protection) {
        this.inventory.protection.push(protection);
        this.savePlayerData();
    }

    unlockAchievement(achievementId) {
        // Убеждаемся, что achievements является Set
        if (!(this.achievements instanceof Set)) {
            this.achievements = new Set();
        }
        
        if (!this.achievements.has(achievementId)) {
            this.achievements.add(achievementId);
            const achievement = game.achievements.get(achievementId);
            if (achievement) {
                this.addMoney(achievement.reward);
                if (game.ui) {
                    game.ui.showNotification(`Достижение разблокировано: ${achievement.name}`, 'success');
                }
            }
            this.savePlayerData();
            return true;
        }
        return false;
    }

    checkAchievements() {
        // Проверяем достижения
        if (!game || !game.achievements) return;
        
        const achievements = game.achievements;
        
        // Убеждаемся, что achievements является Set
        if (!(this.achievements instanceof Set)) {
            this.achievements = new Set();
        }
        
        // Достижения по количеству захваченных заведений
        if (this.stats.venuesCaptured >= 1 && !this.achievements.has('first_capture')) {
            this.unlockAchievement('first_capture');
        }
        
        if (this.stats.venuesCaptured >= 10 && !this.achievements.has('territory_owner')) {
            this.unlockAchievement('territory_owner');
        }
        
        if (this.stats.venuesCaptured >= 50 && !this.achievements.has('district_controller')) {
            this.unlockAchievement('district_controller');
        }
        
        // Достижения по дуэлям
        if (this.stats.duelsWon >= 1 && !this.achievements.has('first_duel')) {
            this.unlockAchievement('first_duel');
        }
        
        if (this.stats.duelsWon >= 10 && !this.achievements.has('duel_master')) {
            this.unlockAchievement('duel_master');
        }
        
        // Достижения по доходам
        if (this.stats.totalIncome >= 10000 && !this.achievements.has('money_maker')) {
            this.unlockAchievement('money_maker');
        }
        
        // Достижения по клану
        if (this.clanId && !this.achievements.has('clan_member')) {
            this.unlockAchievement('clan_member');
        }
    }

    joinClan(clanId, role = 'member') {
        this.clanId = clanId;
        this.clanRole = role;
        this.updateUI();
        this.savePlayerData();
        this.checkAchievements();
    }

    leaveClan() {
        this.clanId = null;
        this.clanRole = null;
        this.updateUI();
        this.savePlayerData();
    }

    updateUI() {
        // Обновляем UI элементы
        const nameElements = document.querySelectorAll('.player-name');
        const moneyElements = document.querySelectorAll('.player-money');
        const levelElements = document.querySelectorAll('.player-level');
        
        nameElements.forEach(el => el.textContent = this.name);
        moneyElements.forEach(el => el.textContent = `$${this.money.toLocaleString()}`);
        levelElements.forEach(el => el.textContent = `Уровень ${this.level}`);
        
        // Обновляем информацию о доходах
        const incomeElements = document.querySelectorAll('.income-per-hour');
        const venuesElements = document.querySelectorAll('.owned-venues');
        const totalVenuesElements = document.querySelectorAll('.total-venues');
        
        const totalIncome = this.getTotalIncome();
        const venuesCount = (this.ownedVenues instanceof Set) ? this.ownedVenues.size : 0;
        const totalVenuesCount = game.map ? game.map.venues.size : 0;
        
        incomeElements.forEach(el => el.textContent = `$${totalIncome}/час`);
        venuesElements.forEach(el => el.textContent = `Заведений: ${venuesCount}`);
        totalVenuesElements.forEach(el => el.textContent = `Всего: ${totalVenuesCount}`);
        
        // Обновляем информацию о клане
        const clanNameElements = document.querySelectorAll('.clan-name');
        const clanMembersElements = document.querySelectorAll('.clan-members');
        
        if (this.clanId) {
            const clan = game.clans.get(this.clanId);
            if (clan) {
                clanNameElements.forEach(el => el.textContent = clan.name);
                clanMembersElements.forEach(el => el.textContent = `${clan.members.length}/20`);
            }
        } else {
            clanNameElements.forEach(el => el.textContent = 'Без клана');
            clanMembersElements.forEach(el => el.textContent = '0/20');
        }
    }

    getTotalIncome() {
        let totalIncome = 0;
        
        // Убеждаемся, что ownedVenues является Set
        if (!(this.ownedVenues instanceof Set)) {
            this.ownedVenues = new Set();
        }
        
        this.ownedVenues.forEach(venueId => {
            const venue = game.map.venues.get(venueId);
            if (venue) {
                totalIncome += this.calculateVenueIncome(venue);
            }
        });
        
        return totalIncome;
    }

    calculateVenueIncome(venue) {
        let income = venue.income;
        
        // Бонус за район
        if (venue.bonuses.district) {
            income *= 1.3;
        }
        
        // Бонус за округ
        if (venue.bonuses.districtUnion) {
            income *= 1.2;
        }
        
        // Бонус за долгосрочное владение
        if (venue.bonuses.longTerm > 0) {
            income *= (1 + venue.bonuses.longTerm * 0.1);
        }
        
        return Math.floor(income);
    }

    updateVenueBonuses() {
        // Убеждаемся, что ownedVenues является Set
        if (!(this.ownedVenues instanceof Set)) {
            this.ownedVenues = new Set();
        }
        
        this.ownedVenues.forEach(venueId => {
            const venue = game.map.venues.get(venueId);
            if (venue) {
                this.updateVenueBonusesForVenue(venue);
            }
        });
    }

    updateVenueBonusesForVenue(venue) {
        // Сбрасываем бонусы
        venue.bonuses.district = false;
        venue.bonuses.districtUnion = false;
        
        // Проверяем бонус за район
        const district = this.findVenueDistrict(venue.id);
        if (district && this.ownsDistrict(district.id)) {
            venue.bonuses.district = true;
            
            // Проверяем бонус за округ
            if (this.ownsDistrictUnion(district.id)) {
                venue.bonuses.districtUnion = true;
            }
        }
        
        // Обновляем бонус за долгосрочное владение
        if (venue.captureTime) {
            const weeksOwned = Math.floor((Date.now() - venue.captureTime) / (7 * 24 * 60 * 60 * 1000));
            venue.bonuses.longTerm = Math.min(weeksOwned, 5); // Максимум 5 недель
        }
    }

    findVenueDistrict(venueId) {
        for (const district of game.map.districts.values()) {
            if (district.venues.includes(venueId)) {
                return district;
            }
        }
        return null;
    }

    ownsDistrict(districtId) {
        const district = game.map.districts.get(districtId);
        if (!district) return false;
        
        // Убеждаемся, что ownedVenues является Set
        if (!(this.ownedVenues instanceof Set)) {
            this.ownedVenues = new Set();
        }
        
        // Проверяем, владеет ли игрок всеми заведениями района
        return district.venues.every(venueId => this.ownedVenues.has(venueId));
    }

    ownsDistrictUnion(districtId) {
        const district = game.map.districts.get(districtId);
        if (!district) return false;
        
        // Убеждаемся, что ownedVenues является Set
        if (!(this.ownedVenues instanceof Set)) {
            this.ownedVenues = new Set();
        }
        
        // Проверяем, владеет ли игрок несколькими смежными районами
        const adjacentDistricts = this.findAdjacentDistricts(districtId);
        return adjacentDistricts.every(adjDistrictId => this.ownsDistrict(adjDistrictId));
    }

    findAdjacentDistricts(districtId) {
        // Простая логика поиска смежных районов
        // В реальной игре здесь должна быть более сложная логика
        const allDistricts = Array.from(game.map.districts.keys());
        return allDistricts.filter(id => id !== districtId);
    }

    startIncomeTimer() {
        // Запускаем таймер начисления дохода каждую минуту для демонстрации
        setInterval(() => {
            this.updateVenueBonuses();
            const totalIncome = this.getTotalIncome();
            if (totalIncome > 0) {
                // Начисляем доход каждую минуту (1/60 от часового дохода)
                const minuteIncome = Math.floor(totalIncome / 60);
                this.addMoney(minuteIncome);
                
                // Показываем уведомление о доходе каждые 5 минут
                if (Date.now() % (5 * 60 * 1000) < 1000) {
                    game.showNotification(`Доход от заведений: $${minuteIncome * 5} за 5 минут`, 'success');
                }
            }
        }, 60 * 1000); // Каждую минуту
    }

    // Методы для дуэлей
    winDuel() {
        this.stats.duelsWon++;
        this.addExperience(25);
        this.checkAchievements();
    }

    loseDuel() {
        this.stats.duelsLost++;
        // Штраф за проигрыш - 20% от текущих денег
        const penalty = Math.floor(this.money * 0.2);
        this.spendMoney(penalty);
    }

    // Методы для настроек
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.savePlayerData();
    }

    getSetting(key) {
        return this.settings[key];
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.savePlayerData();
    }
}

// Глобальная переменная для игрока
let gamePlayer;
