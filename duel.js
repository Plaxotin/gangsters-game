// Система дуэлей
class DuelSystem {
    constructor() {
        this.activeDuels = new Map();
        this.duelHistory = [];
        this.cardTypes = {
            weapon: {
                name: 'Оружие',
                color: '#ff6b6b',
                icon: '⚔️'
            },
            armor: {
                name: 'Броня',
                color: '#4ecdc4',
                icon: '🛡️'
            },
            special: {
                name: 'Специальное',
                color: '#ffa726',
                icon: '💥'
            }
        };
        
        this.initDuelSystem();
    }

    initDuelSystem() {
        this.loadDuelHistory();
        this.startDuelUpdates();
    }

    startDuel(player1Id, player2Id, venueId) {
        const duelId = 'duel_' + Math.random().toString(36).substr(2, 9);
        const player1 = game.players.get(player1Id);
        const player2 = game.players.get(player2Id);
        
        if (!player1 || !player2) {
            return { success: false, reason: 'Игрок не найден' };
        }
        
        const duel = {
            id: duelId,
            player1: {
                id: player1Id,
                name: player1.name,
                health: 100,
                cards: this.generateDuelCards(player1),
                usedCards: []
            },
            player2: {
                id: player2Id,
                name: player2.name,
                health: 100,
                cards: this.generateDuelCards(player2),
                usedCards: []
            },
            venueId: venueId,
            currentTurn: player1Id,
            turnNumber: 1,
            maxTurns: 10,
            startTime: Date.now(),
            status: 'active',
            winner: null
        };
        
        this.activeDuels.set(duelId, duel);
        this.saveDuelHistory();
        
        return { success: true, duelId: duelId };
    }

    generateDuelCards(player) {
        const cards = [];
        const playerCards = player.inventory.cards;
        
        // Добавляем карты игрока
        playerCards.forEach(card => {
            cards.push({
                id: card.id,
                name: card.name,
                type: card.type,
                power: card.power || 0,
                defense: card.defense || 0,
                description: card.description,
                used: false
            });
        });
        
        // Если у игрока мало карт, добавляем базовые
        while (cards.length < 5) {
            cards.push(this.generateBasicCard());
        }
        
        // Перемешиваем карты
        return this.shuffleArray(cards).slice(0, 5);
    }

    generateBasicCard() {
        const basicCards = [
            { name: 'Кулак', type: 'weapon', power: 3, defense: 0 },
            { name: 'Блок', type: 'armor', power: 0, defense: 2 },
            { name: 'Уклон', type: 'special', power: 1, defense: 1 }
        ];
        
        const randomCard = basicCards[Math.floor(Math.random() * basicCards.length)];
        return {
            id: 'basic_' + Math.random().toString(36).substr(2, 9),
            name: randomCard.name,
            type: randomCard.type,
            power: randomCard.power,
            defense: randomCard.defense,
            description: 'Базовая карта',
            used: false
        };
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    playCard(duelId, playerId, cardId) {
        const duel = this.activeDuels.get(duelId);
        if (!duel) {
            return { success: false, reason: 'Дуэль не найдена' };
        }
        
        if (duel.currentTurn !== playerId) {
            return { success: false, reason: 'Не ваш ход' };
        }
        
        if (duel.status !== 'active') {
            return { success: false, reason: 'Дуэль завершена' };
        }
        
        const player = duel.player1.id === playerId ? duel.player1 : duel.player2;
        const opponent = duel.player1.id === playerId ? duel.player2 : duel.player1;
        
        const card = player.cards.find(c => c.id === cardId && !c.used);
        if (!card) {
            return { success: false, reason: 'Карта не найдена или уже использована' };
        }
        
        // Играем карту
        const result = this.resolveCardPlay(card, player, opponent);
        
        // Отмечаем карту как использованную
        card.used = true;
        player.usedCards.push(card);
        
        // Проверяем условия победы
        if (opponent.health <= 0) {
            duel.status = 'finished';
            duel.winner = playerId;
            this.endDuel(duelId);
        } else if (duel.turnNumber >= duel.maxTurns) {
            // Ничья по количеству ходов
            duel.status = 'finished';
            duel.winner = null;
            this.endDuel(duelId);
        } else {
            // Передаем ход
            duel.currentTurn = opponent.id;
            duel.turnNumber++;
        }
        
        this.saveDuelHistory();
        
        return {
            success: true,
            result: result,
            duel: this.getDuelState(duelId)
        };
    }

    resolveCardPlay(card, player, opponent) {
        let damage = 0;
        let defense = 0;
        let specialEffect = null;
        
        switch (card.type) {
            case 'weapon':
                damage = card.power;
                // Оружие наносит урон
                opponent.health = Math.max(0, opponent.health - damage);
                break;
                
            case 'armor':
                defense = card.defense;
                // Броня защищает от следующей атаки
                player.defense = (player.defense || 0) + defense;
                break;
                
            case 'special':
                // Специальные карты имеют уникальные эффекты
                specialEffect = this.applySpecialEffect(card, player, opponent);
                break;
        }
        
        return {
            card: card,
            damage: damage,
            defense: defense,
            specialEffect: specialEffect,
            playerHealth: player.health,
            opponentHealth: opponent.health
        };
    }

    applySpecialEffect(card, player, opponent) {
        const effects = {
            'grenade_card': () => {
                // Граната наносит урон обоим игрокам
                const damage = 15;
                player.health = Math.max(0, player.health - damage);
                opponent.health = Math.max(0, opponent.health - damage);
                return { type: 'grenade', damage: damage };
            },
            'smoke_card': () => {
                // Дымовая шашка снижает точность противника
                opponent.accuracy = (opponent.accuracy || 100) - 20;
                return { type: 'smoke', effect: 'accuracy_reduced' };
            },
            'taser_card': () => {
                // Тазер оглушает противника на ход
                opponent.stunned = true;
                return { type: 'taser', effect: 'stunned' };
            }
        };
        
        const effect = effects[card.id];
        if (effect) {
            return effect();
        }
        
        // Базовый эффект для специальных карт
        const damage = card.power || 5;
        opponent.health = Math.max(0, opponent.health - damage);
        return { type: 'special_attack', damage: damage };
    }

    endDuel(duelId) {
        const duel = this.activeDuels.get(duelId);
        if (!duel) return;
        
        // Обновляем статистику игроков
        const player1 = game.players.get(duel.player1.id);
        const player2 = game.players.get(duel.player2.id);
        
        if (duel.winner) {
            const winner = game.players.get(duel.winner);
            const loser = game.players.get(duel.winner === duel.player1.id ? duel.player2.id : duel.player1.id);
            
            if (winner) {
                winner.winDuel();
                winner.addMoney(500); // Награда за победу
            }
            
            if (loser) {
                loser.loseDuel();
            }
        } else {
            // Ничья
            if (player1) {
                player1.addMoney(100);
            }
            if (player2) {
                player2.addMoney(100);
            }
        }
        
        // Обновляем владение заведением
        if (duel.winner && duel.venueId) {
            const venue = game.map.venues.get(duel.venueId);
            if (venue) {
                venue.owner = duel.winner;
                venue.captureTime = Date.now();
                game.map.updateVenueOwnership(duel.venueId, duel.winner);
            }
        }
        
        // Добавляем в историю
        this.duelHistory.push({
            id: duel.id,
            player1: duel.player1.name,
            player2: duel.player2.name,
            winner: duel.winner ? (duel.winner === duel.player1.id ? duel.player1.name : duel.player2.name) : 'Ничья',
            venueId: duel.venueId,
            duration: Date.now() - duel.startTime,
            endTime: Date.now()
        });
        
        // Удаляем из активных дуэлей
        this.activeDuels.delete(duelId);
        
        this.saveDuelHistory();
    }

    getDuelState(duelId) {
        const duel = this.activeDuels.get(duelId);
        if (!duel) return null;
        
        return {
            id: duel.id,
            player1: {
                name: duel.player1.name,
                health: duel.player1.health,
                cards: duel.player1.cards.filter(c => !c.used)
            },
            player2: {
                name: duel.player2.name,
                health: duel.player2.health,
                cards: duel.player2.cards.filter(c => !c.used)
            },
            currentTurn: duel.currentTurn,
            turnNumber: duel.turnNumber,
            maxTurns: duel.maxTurns,
            status: duel.status
        };
    }

    getDuelHistory(playerId = null) {
        if (playerId) {
            return this.duelHistory.filter(duel => 
                duel.player1 === playerId || duel.player2 === playerId
            );
        }
        return this.duelHistory;
    }

    getActiveDuels(playerId = null) {
        if (playerId) {
            const activeDuels = [];
            this.activeDuels.forEach(duel => {
                if (duel.player1.id === playerId || duel.player2.id === playerId) {
                    activeDuels.push(this.getDuelState(duel.id));
                }
            });
            return activeDuels;
        }
        
        const activeDuels = [];
        this.activeDuels.forEach(duel => {
            activeDuels.push(this.getDuelState(duel.id));
        });
        return activeDuels;
    }

    canStartDuel(player1Id, player2Id) {
        const player1 = game.players.get(player1Id);
        const player2 = game.players.get(player2Id);
        
        if (!player1 || !player2) {
            return { success: false, reason: 'Игрок не найден' };
        }
        
        // Проверяем, не участвует ли игрок уже в дуэли
        const activeDuels = this.getActiveDuels(player1Id);
        if (activeDuels.length > 0) {
            return { success: false, reason: 'Игрок уже участвует в дуэли' };
        }
        
        const activeDuels2 = this.getActiveDuels(player2Id);
        if (activeDuels2.length > 0) {
            return { success: false, reason: 'Противник уже участвует в дуэли' };
        }
        
        // Проверяем, есть ли у игроков карты
        if (player1.inventory.cards.length === 0) {
            return { success: false, reason: 'У вас нет карт для дуэли' };
        }
        
        if (player2.inventory.cards.length === 0) {
            return { success: false, reason: 'У противника нет карт для дуэли' };
        }
        
        return { success: true };
    }

    startDuelUpdates() {
        // Обновляем дуэли каждые 5 секунд
        setInterval(() => {
            this.updateDuels();
        }, 5000);
    }

    updateDuels() {
        const now = Date.now();
        const duelsToEnd = [];
        
        this.activeDuels.forEach((duel, duelId) => {
            // Проверяем таймаут дуэли (30 минут)
            if (now - duel.startTime > 30 * 60 * 1000) {
                duelsToEnd.push(duelId);
            }
        });
        
        duelsToEnd.forEach(duelId => {
            const duel = this.activeDuels.get(duelId);
            if (duel) {
                duel.status = 'timeout';
                duel.winner = null;
                this.endDuel(duelId);
            }
        });
    }

    saveDuelHistory() {
        try {
            localStorage.setItem('gangsters_duel_history', JSON.stringify(this.duelHistory));
        } catch (error) {
            console.error('Ошибка сохранения истории дуэлей:', error);
        }
    }

    loadDuelHistory() {
        try {
            const savedHistory = localStorage.getItem('gangsters_duel_history');
            if (savedHistory) {
                this.duelHistory = JSON.parse(savedHistory);
                console.log('История дуэлей загружена');
            }
        } catch (error) {
            console.error('Ошибка загрузки истории дуэлей:', error);
        }
    }

    // Методы для UI дуэлей
    createDuelUI(duelId) {
        const duel = this.activeDuels.get(duelId);
        if (!duel) return null;
        
        const duelState = this.getDuelState(duelId);
        if (!duelState) return null;
        
        return {
            id: duelState.id,
            player1: {
                name: duelState.player1.name,
                health: duelState.player1.health,
                cards: duelState.player1.cards.map(card => ({
                    id: card.id,
                    name: card.name,
                    type: card.type,
                    power: card.power,
                    defense: card.defense,
                    description: card.description
                }))
            },
            player2: {
                name: duelState.player2.name,
                health: duelState.player2.health,
                cards: duelState.player2.cards.map(card => ({
                    id: card.id,
                    name: card.name,
                    type: card.type,
                    power: card.power,
                    defense: card.defense,
                    description: card.description
                }))
            },
            currentTurn: duelState.currentTurn,
            turnNumber: duelState.turnNumber,
            maxTurns: duelState.maxTurns,
            status: duelState.status
        };
    }

    getCardTypeInfo(type) {
        return this.cardTypes[type] || {
            name: 'Неизвестно',
            color: '#666',
            icon: '?'
        };
    }

    // Методы для статистики дуэлей
    getPlayerDuelStats(playerId) {
        const history = this.getDuelHistory(playerId);
        const wins = history.filter(duel => 
            (duel.player1 === playerId && duel.winner === duel.player1) ||
            (duel.player2 === playerId && duel.winner === duel.player2)
        ).length;
        
        const losses = history.filter(duel => 
            (duel.player1 === playerId && duel.winner === duel.player2) ||
            (duel.player2 === playerId && duel.winner === duel.player1)
        ).length;
        
        const draws = history.filter(duel => duel.winner === 'Ничья').length;
        
        return {
            total: history.length,
            wins: wins,
            losses: losses,
            draws: draws,
            winRate: history.length > 0 ? (wins / history.length * 100).toFixed(1) : 0
        };
    }
}

// Глобальная переменная для системы дуэлей
let duelSystem;

