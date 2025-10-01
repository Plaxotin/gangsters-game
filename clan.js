// Система кланов
class ClanSystem {
    constructor() {
        this.clans = new Map();
        this.clanRequests = new Map();
        this.clanWars = new Map();
        
        this.initClanSystem();
    }

    initClanSystem() {
        // Инициализируем систему кланов
        this.loadClans();
        this.startClanUpdates();
    }

    loadClans() {
        // Загружаем кланы из localStorage
        const savedClans = localStorage.getItem('gangsters_clans');
        if (savedClans) {
            try {
                const clansData = JSON.parse(savedClans);
                clansData.forEach(clan => {
                    this.clans.set(clan.id, clan);
                });
                console.log('Кланы загружены');
            } catch (error) {
                console.error('Ошибка загрузки кланов:', error);
            }
        }
    }

    saveClans() {
        // Сохраняем кланы в localStorage
        try {
            const clansArray = Array.from(this.clans.values());
            localStorage.setItem('gangsters_clans', JSON.stringify(clansArray));
            console.log('Кланы сохранены');
        } catch (error) {
            console.error('Ошибка сохранения кланов:', error);
        }
    }

    createClan(name, leaderId) {
        // Создаем новый клан
        const clanId = 'clan_' + Math.random().toString(36).substr(2, 9);
        const clan = {
            id: clanId,
            name: name,
            members: [leaderId],
            leader: leaderId,
            created: Date.now(),
            territory: [],
            level: 1,
            experience: 0,
            bank: 0,
            settings: {
                autoAccept: false,
                minLevel: 1,
                maxMembers: 20
            },
            permissions: {
                invite: ['leader', 'officer'],
                kick: ['leader', 'officer'],
                manageTerritory: ['leader'],
                manageBank: ['leader', 'officer']
            }
        };
        
        this.clans.set(clanId, clan);
        this.saveClans();
        
        return clan;
    }

    joinClan(clanId, playerId) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        if (clan.members.length >= clan.settings.maxMembers) {
            return { success: false, reason: 'Клан переполнен' };
        }
        
        if (clan.settings.autoAccept) {
            clan.members.push(playerId);
            this.saveClans();
            return { success: true };
        } else {
            // Добавляем заявку
            if (!this.clanRequests.has(clanId)) {
                this.clanRequests.set(clanId, []);
            }
            
            const requests = this.clanRequests.get(clanId);
            if (!requests.includes(playerId)) {
                requests.push(playerId);
                this.saveClanRequests();
                return { success: true, pending: true };
            }
            
            return { success: false, reason: 'Заявка уже подана' };
        }
    }

    leaveClan(clanId, playerId) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        clan.members = clan.members.filter(id => id !== playerId);
        
        // Если лидер покидает клан, назначаем нового
        if (clan.leader === playerId && clan.members.length > 0) {
            clan.leader = clan.members[0];
        }
        
        // Если клан пуст, удаляем его
        if (clan.members.length === 0) {
            this.clans.delete(clanId);
        }
        
        this.saveClans();
        return true;
    }

    kickMember(clanId, playerId, kickerId) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        const kickerRole = this.getPlayerRole(clan, kickerId);
        if (!clan.permissions.kick.includes(kickerRole)) {
            return { success: false, reason: 'Недостаточно прав' };
        }
        
        if (clan.leader === playerId) {
            return { success: false, reason: 'Нельзя исключить лидера' };
        }
        
        clan.members = clan.members.filter(id => id !== playerId);
        this.saveClans();
        
        return { success: true };
    }

    invitePlayer(clanId, playerId, inviterId) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        const inviterRole = this.getPlayerRole(clan, inviterId);
        if (!clan.permissions.invite.includes(inviterRole)) {
            return { success: false, reason: 'Недостаточно прав' };
        }
        
        if (clan.members.includes(playerId)) {
            return { success: false, reason: 'Игрок уже в клане' };
        }
        
        if (clan.members.length >= clan.settings.maxMembers) {
            return { success: false, reason: 'Клан переполнен' };
        }
        
        // Отправляем приглашение
        this.sendClanInvite(clanId, playerId);
        
        return { success: true };
    }

    sendClanInvite(clanId, playerId) {
        // В реальной игре здесь должна быть система уведомлений
        console.log(`Приглашение в клан ${clanId} отправлено игроку ${playerId}`);
    }

    getPlayerRole(clan, playerId) {
        if (clan.leader === playerId) {
            return 'leader';
        } else if (clan.members.includes(playerId)) {
            return 'member';
        }
        return null;
    }

    promotePlayer(clanId, playerId, promoterId) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        if (clan.leader !== promoterId) {
            return { success: false, reason: 'Только лидер может повышать' };
        }
        
        if (clan.leader === playerId) {
            return { success: false, reason: 'Лидер уже имеет максимальный ранг' };
        }
        
        // В данной реализации у нас только лидер и участники
        // В более сложной системе здесь была бы логика повышения до офицера
        
        return { success: true };
    }

    updateClanTerritory(clanId) {
        const clan = this.clans.get(clanId);
        if (!clan) return;
        
        // Обновляем территорию клана на основе заведений участников
        const territory = [];
        clan.members.forEach(memberId => {
            const player = game.players.get(memberId);
            if (player) {
                player.ownedVenues.forEach(venueId => {
                    if (!territory.includes(venueId)) {
                        territory.push(venueId);
                    }
                });
            }
        });
        
        clan.territory = territory;
        this.saveClans();
    }

    calculateClanIncome(clanId) {
        const clan = this.clans.get(clanId);
        if (!clan) return 0;
        
        let totalIncome = 0;
        clan.members.forEach(memberId => {
            const player = game.players.get(memberId);
            if (player) {
                totalIncome += player.getTotalIncome();
            }
        });
        
        return totalIncome;
    }

    distributeClanIncome(clanId) {
        const clan = this.clans.get(clanId);
        if (!clan) return;
        
        const totalIncome = this.calculateClanIncome(clanId);
        const clanTax = 0.1; // 10% в клановую казну
        const clanShare = Math.floor(totalIncome * clanTax);
        const memberShare = Math.floor((totalIncome - clanShare) / clan.members.length);
        
        // Добавляем долю в клановую казну
        clan.bank += clanShare;
        
        // Распределяем между участниками
        clan.members.forEach(memberId => {
            const player = game.players.get(memberId);
            if (player) {
                player.addMoney(memberShare);
            }
        });
        
        this.saveClans();
    }

    startClanWar(clanId1, clanId2) {
        const clan1 = this.clans.get(clanId1);
        const clan2 = this.clans.get(clanId2);
        
        if (!clan1 || !clan2) return false;
        
        const warId = 'war_' + Math.random().toString(36).substr(2, 9);
        const war = {
            id: warId,
            clan1: clanId1,
            clan2: clanId2,
            startTime: Date.now(),
            duration: 7 * 24 * 60 * 60 * 1000, // 1 неделя
            score1: 0,
            score2: 0,
            active: true
        };
        
        this.clanWars.set(warId, war);
        this.saveClanWars();
        
        return war;
    }

    endClanWar(warId) {
        const war = this.clanWars.get(warId);
        if (!war) return;
        
        war.active = false;
        war.endTime = Date.now();
        
        // Определяем победителя
        let winner = null;
        if (war.score1 > war.score2) {
            winner = war.clan1;
        } else if (war.score2 > war.score1) {
            winner = war.clan2;
        }
        
        // Выдаем награды
        if (winner) {
            const winnerClan = this.clans.get(winner);
            if (winnerClan) {
                winnerClan.bank += 10000; // 10k в клановую казну
                winnerClan.experience += 1000;
            }
        }
        
        this.saveClanWars();
        this.saveClans();
        
        return { winner, war };
    }

    updateClanScore(warId, clanId, points) {
        const war = this.clanWars.get(warId);
        if (!war || !war.active) return;
        
        if (war.clan1 === clanId) {
            war.score1 += points;
        } else if (war.clan2 === clanId) {
            war.score2 += points;
        }
        
        this.saveClanWars();
    }

    getClanRanking() {
        const clans = Array.from(this.clans.values());
        return clans.sort((a, b) => {
            // Сортируем по опыту, затем по количеству участников
            if (b.experience !== a.experience) {
                return b.experience - a.experience;
            }
            return b.members.length - a.members.length;
        });
    }

    getClanStats(clanId) {
        const clan = this.clans.get(clanId);
        if (!clan) return null;
        
        return {
            id: clan.id,
            name: clan.name,
            level: clan.level,
            experience: clan.experience,
            members: clan.members.length,
            maxMembers: clan.settings.maxMembers,
            territory: clan.territory.length,
            bank: clan.bank,
            income: this.calculateClanIncome(clanId),
            created: clan.created,
            leader: clan.leader
        };
    }

    startClanUpdates() {
        // Обновляем кланы каждые 5 минут
        setInterval(() => {
            this.updateAllClans();
        }, 5 * 60 * 1000);
    }

    updateAllClans() {
        this.clans.forEach((clan, clanId) => {
            this.updateClanTerritory(clanId);
            this.distributeClanIncome(clanId);
            this.updateClanLevel(clanId);
        });
    }

    updateClanLevel(clanId) {
        const clan = this.clans.get(clanId);
        if (!clan) return;
        
        const newLevel = Math.floor(clan.experience / 10000) + 1;
        if (newLevel > clan.level) {
            clan.level = newLevel;
            clan.settings.maxMembers = Math.min(20 + (clan.level - 1) * 5, 50);
            this.saveClans();
        }
    }

    saveClanRequests() {
        try {
            const requestsArray = Array.from(this.clanRequests.entries());
            localStorage.setItem('gangsters_clan_requests', JSON.stringify(requestsArray));
        } catch (error) {
            console.error('Ошибка сохранения заявок в кланы:', error);
        }
    }

    loadClanRequests() {
        try {
            const savedRequests = localStorage.getItem('gangsters_clan_requests');
            if (savedRequests) {
                const requestsArray = JSON.parse(savedRequests);
                this.clanRequests = new Map(requestsArray);
            }
        } catch (error) {
            console.error('Ошибка загрузки заявок в кланы:', error);
        }
    }

    saveClanWars() {
        try {
            const warsArray = Array.from(this.clanWars.values());
            localStorage.setItem('gangsters_clan_wars', JSON.stringify(warsArray));
        } catch (error) {
            console.error('Ошибка сохранения войн кланов:', error);
        }
    }

    loadClanWars() {
        try {
            const savedWars = localStorage.getItem('gangsters_clan_wars');
            if (savedWars) {
                const warsArray = JSON.parse(savedWars);
                warsArray.forEach(war => {
                    this.clanWars.set(war.id, war);
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки войн кланов:', error);
        }
    }

    // Методы для управления клановой казной
    depositToClanBank(clanId, playerId, amount) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        const player = game.players.get(playerId);
        if (!player) return false;
        
        if (player.money < amount) {
            return { success: false, reason: 'Недостаточно денег' };
        }
        
        player.spendMoney(amount);
        clan.bank += amount;
        this.saveClans();
        
        return { success: true };
    }

    withdrawFromClanBank(clanId, playerId, amount) {
        const clan = this.clans.get(clanId);
        if (!clan) return false;
        
        const playerRole = this.getPlayerRole(clan, playerId);
        if (!clan.permissions.manageBank.includes(playerRole)) {
            return { success: false, reason: 'Недостаточно прав' };
        }
        
        if (clan.bank < amount) {
            return { success: false, reason: 'Недостаточно средств в казне' };
        }
        
        clan.bank -= amount;
        player.addMoney(amount);
        this.saveClans();
        
        return { success: true };
    }

    // Методы для клановых событий
    triggerClanEvent(clanId, eventType, data) {
        const clan = this.clans.get(clanId);
        if (!clan) return;
        
        switch (eventType) {
            case 'territory_captured':
                clan.experience += 100;
                break;
            case 'territory_lost':
                clan.experience = Math.max(0, clan.experience - 50);
                break;
            case 'member_joined':
                clan.experience += 50;
                break;
            case 'member_left':
                clan.experience = Math.max(0, clan.experience - 25);
                break;
            case 'war_won':
                clan.experience += 500;
                break;
            case 'war_lost':
                clan.experience = Math.max(0, clan.experience - 200);
                break;
        }
        
        this.saveClans();
    }
}

// Глобальная переменная для системы кланов
let clanSystem;

