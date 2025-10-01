// Система территорий и заведений для проекта Gangsters
// Создание зон влияния для каждого заведения

// Заведения теперь создаются только через админ-панель
const establishmentsData = [];

// Система игроков и их территорий (теперь управляется через систему регистрации)
let playerTerritories = {};

// Текущий игрок (управляется через систему регистрации)
let currentPlayer = null;

// Инициализация системы территорий
function initTerritorySystem(map) {
    console.log('Initializing territory system...');
    
    // Создаем слой для территорий
    const territoryLayer = L.layerGroup().addTo(map);
    
    // Создаем слой для заведений
    const establishmentLayer = L.layerGroup().addTo(map);
    
    // Добавляем территории на карту
    addTerritoriesToMap(map, territoryLayer);
    
    // Добавляем заведения на карту
    addEstablishmentsToMap(map, establishmentLayer);
    
    // Панель управления территориями удалена
    
    return {
        territoryLayer,
        establishmentLayer
    };
}

// Добавление территорий на карту
function addTerritoriesToMap(map, layer) {
    establishmentsData.forEach(establishment => {
        // Определяем цвет территории в зависимости от владельца
        let territoryColor = establishment.territory.color;
        let territoryOpacity = establishment.territory.opacity;
        
        // Проверяем, есть ли владелец территории
        const owner = findTerritoryOwner(establishment.id);
        if (owner) {
            territoryColor = playerTerritories[owner].color;
            territoryOpacity = 0.6; // Более яркий цвет для захваченных территорий
        }
        
        // Создаем полигон территории
        const territoryPolygon = L.polygon(establishment.territory.polygon, {
            fillColor: territoryColor,
            fillOpacity: territoryOpacity,
            color: territoryColor,
            weight: 2,
            opacity: 0.8,
            className: 'territory-polygon'
        }).addTo(layer);
        
        // Добавляем информацию о территории (только просмотр, без захвата)
        territoryPolygon.bindPopup(`
            <div class="territory-popup">
                <h3>Территория ${establishment.name}</h3>
                <p><strong>Заведение:</strong> ${establishment.name}</p>
                <p><strong>Тип:</strong> ${establishment.type}</p>
                <p><strong>Доход:</strong> $${establishment.income}/час</p>
                ${owner ? `<p><strong>Владелец:</strong> ${playerTerritories[owner].name}</p>` : '<p><strong>Статус:</strong> Свободна</p>'}
                <p style="color: var(--warm-gold); font-size: 0.8rem; margin-top: 0.5rem;"><em>Территория захватывается автоматически при захвате заведения</em></p>
            </div>
        `);
        
        // Добавляем эффекты при наведении
        territoryPolygon.on('mouseover', function(e) {
            this.setStyle({
                fillOpacity: territoryOpacity + 0.2,
                weight: 3
            });
        });
        
        territoryPolygon.on('mouseout', function(e) {
            this.setStyle({
                fillOpacity: territoryOpacity,
                weight: 2
            });
        });
        
        // Сохраняем ссылку на полигон в данных заведения
        establishment.territoryPolygon = territoryPolygon;
    });
}

// Добавление заведений на карту
function addEstablishmentsToMap(map, layer) {
    establishmentsData.forEach(establishment => {
        // Создаем кастомную иконку для заведения
        const establishmentIcon = L.divIcon({
            html: `
                <div class="establishment-marker ${establishment.type} ${findTerritoryOwner(establishment.id) ? 'captured' : ''}">
                    <div class="marker-icon">🏥</div>
                    <div class="marker-label">${establishment.name}</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            className: 'establishment-marker-icon'
        });
        
        // Создаем маркер заведения
        const establishmentMarker = L.marker(establishment.coords, { 
            icon: establishmentIcon 
        }).addTo(layer);
        
        // Добавляем информацию о заведении с проверкой расстояния
        const owner = findTerritoryOwner(establishment.id);
        
        // Создаем асинхронную функцию для получения расстояния
        const createPopupContent = async () => {
            let distanceInfo = '';
            if (!owner) {
                try {
                    const distanceCheck = await checkCaptureDistance(establishment);
                    if (distanceCheck.distance !== null) {
                        const status = distanceCheck.canCapture ? 
                            `<span style="color: #4caf50;">✅ ${distanceCheck.distance}м (доступно)</span>` : 
                            `<span style="color: #f44336;">❌ ${distanceCheck.distance}м (слишком далеко)</span>`;
                        distanceInfo = `<p><strong>Расстояние:</strong> ${status}</p>`;
                    } else {
                        distanceInfo = `<p><strong>Расстояние:</strong> <span style="color: #ff9800;">⚠️ Не определено</span></p>`;
                    }
                } catch (error) {
                    distanceInfo = `<p><strong>Расстояние:</strong> <span style="color: #ff9800;">⚠️ Ошибка определения</span></p>`;
                }
            }
            
            return `
                <div class="establishment-popup">
                    <h3>${establishment.name}</h3>
                    <p><strong>Тип:</strong> ${establishment.type}</p>
                    <p><strong>Доход:</strong> $${establishment.income}/час</p>
                    <p><strong>Стоимость захвата:</strong> $${establishment.captureCost}</p>
                    <p><strong>Защита:</strong> ${establishment.defense}</p>
                    ${distanceInfo}
                    ${owner ? `<p><strong>Владелец:</strong> ${playerTerritories[owner].name}</p>` : '<p><strong>Статус:</strong> Свободно</p>'}
                    ${!owner ? `
                        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem;">
                            <button class="capture-button" onclick="attemptEstablishmentCapture('${establishment.id}')" style="
                                background: linear-gradient(45deg, #2d5016, #1e3a0a);
                                border: 1px solid var(--warm-gold);
                                color: var(--cream);
                                padding: 0.5rem 1rem;
                                cursor: pointer;
                                font-size: 0.8rem;
                                border-radius: 3px;
                                flex: 1;
                            ">⚔️ Захватить</button>
                            <button class="purchase-button" onclick="attemptEstablishmentPurchase('${establishment.id}')" style="
                                background: linear-gradient(45deg, var(--brick-red), var(--dark-brick));
                                border: 1px solid var(--warm-gold);
                                color: var(--cream);
                                padding: 0.5rem 1rem;
                                cursor: pointer;
                                font-size: 0.8rem;
                                border-radius: 3px;
                                flex: 1;
                            ">💰 Купить ($${establishment.captureCost})</button>
                        </div>
                    ` : ''}
                    <p style="color: var(--warm-gold); font-size: 0.7rem; margin-top: 0.5rem;"><em>Максимальное расстояние для захвата: 20м</em></p>
                </div>
            `;
        };
        
        establishmentMarker.bindPopup(createPopupContent());
        
        // Добавляем обработчик для обновления информации при открытии попапа
        establishmentMarker.on('popupopen', async function() {
            if (!owner) {
                try {
                    const distanceCheck = await checkCaptureDistance(establishment);
                    const popup = this.getPopup();
                    if (popup) {
                        const newContent = await createPopupContent();
                        popup.setContent(newContent);
                    }
                } catch (error) {
                    console.log('Ошибка обновления расстояния:', error);
                }
            }
        });
        
        // Добавляем зону захвата (круг радиусом 20 метров)
        const captureZone = L.circle(establishment.coords, {
            radius: 20, // 20 метров
            color: '#ff6b6b',
            fillColor: '#ff6b6b',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 5',
            className: 'capture-zone'
        }).addTo(layer);
        
        // Добавляем подпись зоны захвата
        const zoneLabel = L.marker(establishment.coords, {
            icon: L.divIcon({
                html: `<div style="
                    background: rgba(255, 107, 107, 0.9);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-weight: bold;
                    border: 1px solid #ff4757;
                ">Зона: 20м</div>`,
                iconSize: [60, 20],
                iconAnchor: [30, 10],
                className: 'capture-zone-label'
            })
        }).addTo(layer);
        
        // Сохраняем ссылки на маркер и зону в данных заведения
        establishment.marker = establishmentMarker;
        establishment.captureZone = captureZone;
        establishment.zoneLabel = zoneLabel;
    });
}

// Поиск владельца территории
function findTerritoryOwner(establishmentId) {
    for (const playerId in playerTerritories) {
        if (playerTerritories[playerId].territories.includes(establishmentId)) {
            return playerId;
        }
    }
    return null;
}

// Получение данных игрока
function getPlayerData(playerId) {
    return playerTerritories[playerId];
}

// Обновление данных игрока в системе территорий
function updatePlayerInTerritorySystem(player) {
    if (!player) return;
    
    const playerId = player.name.toLowerCase();
    playerTerritories[playerId] = {
        name: player.name,
        color: player.color,
        territories: player.territories || [],
        totalIncome: player.totalIncome || 0
    };
    
    console.log('Player updated in territory system:', playerTerritories[playerId]);
}

// Функция расчета расстояния между двумя точками (в метрах)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Радиус Земли в метрах
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Расстояние в метрах
}

// Проверка возможности захвата по расстоянию
function checkCaptureDistance(establishment) {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ canCapture: false, distance: null, error: 'Геолокация не поддерживается' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(position) {
                const playerLat = position.coords.latitude;
                const playerLon = position.coords.longitude;
                const establishmentLat = establishment.coords[0];
                const establishmentLon = establishment.coords[1];
                
                const distance = calculateDistance(playerLat, playerLon, establishmentLat, establishmentLon);
                const canCapture = distance <= 20; // 20 метров
                
                resolve({ canCapture, distance: Math.round(distance), error: null });
            },
            function(error) {
                resolve({ canCapture: false, distance: null, error: 'Не удалось получить местоположение' });
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
        );
    });
}

// Попытка захвата заведения
// Захват заведения (бесплатно)
window.attemptEstablishmentCapture = async function(establishmentId) {
    // Проверяем авторизацию
    if (typeof checkAuth === 'function' && !checkAuth()) {
        return;
    }
    
    const establishment = establishmentsData.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Проверяем, не захвачено ли уже
    if (findTerritoryOwner(establishmentId)) {
        showMessage('Это заведение уже захвачено!', 'error');
        return;
    }
    
    // Проверяем расстояние до заведения
    const distanceCheck = await checkCaptureDistance(establishment);
    
    if (!distanceCheck.canCapture) {
        if (distanceCheck.distance) {
            showMessage(`Слишком далеко! Расстояние: ${distanceCheck.distance}м. Максимум: 20м`, 'error');
        } else {
            showMessage(`Не удалось проверить расстояние: ${distanceCheck.error}`, 'error');
        }
        return;
    }

    // Подтверждение захвата (бесплатного)
    const confirmCapture = confirm(`
        Захватить заведение "${establishment.name}"?
        
        Захват: БЕСПЛАТНО
        Доход: $${establishment.income}/час
        Защита: ${establishment.defense}
        
        После захвата территория будет окрашена в ваш цвет.
    `);

    if (!confirmCapture) return;

    // Выполняем захват (бесплатно)
    performEstablishmentCapture(establishment, false);
};

// Покупка заведения (платно)
window.attemptEstablishmentPurchase = async function(establishmentId) {
    // Проверяем авторизацию
    if (typeof checkAuth === 'function' && !checkAuth()) {
        return;
    }
    
    const establishment = establishmentsData.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Проверяем, не захвачено ли уже
    if (findTerritoryOwner(establishmentId)) {
        showMessage('Это заведение уже захвачено!', 'error');
        return;
    }

    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    if (!user) {
        showMessage('Необходимо войти в систему!', 'error');
        return;
    }

    // Проверяем, достаточно ли денег у игрока
    if (user.money < establishment.captureCost) {
        showMessage(`Недостаточно денег! Нужно: $${establishment.captureCost}, у вас: $${user.money}`, 'error');
        return;
    }

    // Подтверждение покупки (платной)
    const confirmPurchase = confirm(`
        Купить заведение "${establishment.name}"?
        
        Стоимость: $${establishment.captureCost}
        Доход: $${establishment.income}/час
        Защита: ${establishment.defense}
        
        После покупки территория будет окрашена в ваш цвет.
    `);

    if (!confirmPurchase) return;

    // Выполняем покупку (платно)
    performEstablishmentCapture(establishment, true);
};

// Выполнение захвата/покупки заведения
function performEstablishmentCapture(establishment, isPurchase = false) {
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    if (!user) {
        showMessage('Необходимо войти в систему!', 'error');
        return;
    }

    // Если это покупка, списываем деньги
    if (isPurchase && user.money < establishment.captureCost) {
        showMessage(`Недостаточно денег! Нужно: $${establishment.captureCost}, у вас: $${user.money}`, 'error');
        return;
    }

    if (isPurchase) {
        user.money -= establishment.captureCost;
        showMessage(`Заведение "${establishment.name}" куплено за $${establishment.captureCost}!`, 'success');
    } else {
        showMessage(`Заведение "${establishment.name}" захвачено бесплатно!`, 'success');
    }

    // Захватываем заведение
    captureEstablishment(establishment.id);
    
    // Обновляем интерфейс игрока
    if (typeof updatePlayerInterface === 'function') {
        updatePlayerInterface();
    }
}

// Подтверждение захвата заведения (с автоматическим захватом территории)
function captureEstablishment(establishmentId) {
    const establishment = establishmentsData.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Получаем текущего пользователя
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    if (!user) {
        showMessage('Ошибка: пользователь не найден!', 'error');
        return;
    }
    
    const playerId = user.name.toLowerCase();
    
    // Обновляем данные игрока в системе территорий
    updatePlayerInTerritorySystem(user);
    
    // Захватываем заведение и прилегающую территорию
    playerTerritories[playerId].territories.push(establishmentId);
    playerTerritories[playerId].totalIncome += establishment.income;
    
    // Обновляем данные в базе игроков
    if (typeof playersDatabase !== 'undefined' && playersDatabase[playerId]) {
        playersDatabase[playerId].territories.push(establishmentId);
        playersDatabase[playerId].totalIncome += establishment.income;
    }
    
    // Обновляем визуальное отображение заведения и территории
    updateEstablishmentDisplay(establishmentId, playerId);
    
    // Проверяем, захвачен ли весь район
    checkDistrictControl();
    
    // Показываем сообщение об успехе (заведение + территория)
    showCaptureSuccess(`${establishment.name} и прилегающая территория`, playerTerritories[playerId].name);
    
    // Обновляем статистику
    updatePlayerStats();
}

// Обновление отображения заведения и территории
function updateEstablishmentDisplay(establishmentId, playerId) {
    const establishment = establishmentsData.find(e => e.id === establishmentId);
    if (!establishment || !establishment.territoryPolygon) return;
    
    // Обновляем цвет территории
    establishment.territoryPolygon.setStyle({
        fillColor: playerTerritories[playerId].color,
        color: playerTerritories[playerId].color,
        fillOpacity: 0.6,
        opacity: 0.8
    });
    
    // Обновляем маркер заведения
    if (establishment.marker) {
        const newIcon = L.divIcon({
            html: `
                <div class="establishment-marker ${establishment.type} captured" style="border-color: ${playerTerritories[playerId].color};">
                    <div class="marker-icon">🏥</div>
                    <div class="marker-label">${establishment.name}</div>
                    <div class="owner-badge" style="background: ${playerTerritories[playerId].color};">${playerTerritories[playerId].name.charAt(0)}</div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
            className: 'establishment-marker-icon'
        });
        establishment.marker.setIcon(newIcon);
    }
}

// Проверка контроля над районом
function checkDistrictControl() {
    const allEstablishments = establishmentsData.map(e => e.id);
    const capturedByPlayer = {};
    
    // Подсчитываем захваченные территории по игрокам
    for (const playerId in playerTerritories) {
        capturedByPlayer[playerId] = playerTerritories[playerId].territories.filter(t => allEstablishments.includes(t));
    }
    
    // Проверяем, есть ли игрок, который захватил все территории района
    for (const playerId in capturedByPlayer) {
        if (capturedByPlayer[playerId].length === allEstablishments.length) {
            showDistrictControlBonus(playerId);
            return;
        }
    }
}

// Показ бонуса за контроль района
function showDistrictControlBonus(playerId) {
    const bonus = 100; // Бонус за контроль всего района
    playerTerritories[playerId].totalIncome += bonus;
    
    const bonusMsg = document.createElement('div');
    bonusMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
        border: 3px solid var(--warm-gold);
        padding: 2rem;
        color: var(--cream);
        z-index: 1002;
        font-family: var(--font-sans);
        text-align: center;
        animation: slideIn 0.3s ease;
    `;
    
    bonusMsg.innerHTML = `
        <h3 style="color: var(--warm-gold); font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 1rem;">🎯 Контроль района!</h3>
        <p style="margin-bottom: 1rem;">${playerTerritories[playerId].name} захватил весь район!</p>
        <p style="color: var(--warm-gold); font-weight: bold; font-size: 1.2rem;">Бонус: +$${bonus}/час</p>
        <button onclick="closeBonusModal()" style="
            background: linear-gradient(45deg, var(--warm-gold), var(--copper));
            border: 2px solid var(--deep-black);
            color: var(--deep-black);
            padding: 0.5rem 1rem;
            cursor: pointer;
            font-weight: bold;
            margin-top: 1rem;
        ">Отлично!</button>
    `;
    
    document.body.appendChild(bonusMsg);
    
    window.closeBonusModal = function() {
        document.body.removeChild(bonusMsg);
    };
    
    // Автоматически закрываем через 5 секунд
    setTimeout(() => {
        if (document.body.contains(bonusMsg)) {
            document.body.removeChild(bonusMsg);
        }
    }, 5000);
}

// Показ сообщения об успешном захвате
function showCaptureSuccess(establishmentName, playerName) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
        border: 2px solid var(--warm-gold);
        padding: 1rem 2rem;
        color: var(--cream);
        z-index: 1001;
        font-family: var(--font-sans);
        animation: slideIn 0.3s ease;
    `;
    
    successMsg.innerHTML = `
        <div style="color: var(--warm-gold); font-weight: bold;">🎯 Территория захвачена!</div>
        <div style="font-size: 0.9rem; margin-top: 0.5rem;">${establishmentName} теперь принадлежит ${playerName}</div>
    `;
    
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
        }
    }, 3000);
}

// Панель управления территориями удалена

// Обновление статистики игроков
function updatePlayerStats() {
    // Панель статистики удалена - функция оставлена для совместимости
    return;
}

// Смена текущего игрока
window.changeCurrentPlayer = function(playerId) {
    currentPlayer = playerId;
    updatePlayerStats();
    console.log(`Current player changed to: ${playerTerritories[playerId].name}`);
};

// Функция для обновления селектора игрока в системе территорий
window.updateTerritoryPlayerSelector = function(player) {
    if (player) {
        updatePlayerInTerritorySystem(player);
        updatePlayerStats();
    }
};

// Экспорт функций для использования
window.initTerritorySystem = initTerritorySystem;
window.captureEstablishment = captureEstablishment;
window.updatePlayerInTerritorySystem = updatePlayerInTerritorySystem;
window.updatePlayerStats = updatePlayerStats;
