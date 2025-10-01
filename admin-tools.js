// Админские инструменты для разметки территорий
// Авторизация: admin / 372324

// Состояние админ-панели
let isAdminMode = false;
let isMarkupMode = false;
let isCreateEstablishmentMode = false;
let isDeleteEstablishmentMode = false;
let isMoveEstablishmentMode = false;
let isEstablishmentSelectionMode = false;
let isPolygonDrawingMode = false;
let selectedEstablishment = null;
let selectedForDeleteEstablishment = null;
let selectedForMoveEstablishment = null;
let currentPolygon = null;
let polygonPoints = [];
let currentMarkupData = {
    establishments: [],
    territories: [],
    districts: []
};

// Делаем currentMarkupData глобальной для доступа из других файлов
window.currentMarkupData = currentMarkupData;

// Переменная для отслеживания текущего зума карты
let currentZoom = 16;

// Функция для вычисления размера иконки в зависимости от зума
function getIconSizeForZoom(zoom) {
    // Базовый размер иконки (при зуме 16)
    const baseSize = 45;
    // Минимальный размер (25% от базового)
    const minSize = Math.round(baseSize * 0.25);
    // Максимальный размер (при зуме 18+)
    const maxSize = baseSize;
    
    // Вычисляем коэффициент масштабирования
    // При зуме 10 (максимальное отдаление) - минимальный размер
    // При зуме 18 (максимальное приближение) - максимальный размер
    let scaleFactor;
    if (zoom <= 10) {
        scaleFactor = 0.25; // Минимальный размер
    } else if (zoom >= 18) {
        scaleFactor = 1.0; // Максимальный размер
    } else {
        // Линейная интерполяция между 10 и 18 зумом
        scaleFactor = 0.25 + (zoom - 10) * (1.0 - 0.25) / (18 - 10);
    }
    
    const size = Math.round(baseSize * scaleFactor);
    return {
        size: size,
        anchor: Math.round(size / 2)
    };
}

// Функция для обновления размера иконок всех заведений при изменении зума
function updateAllEstablishmentIcons(zoom) {
    currentZoom = zoom;
    
    currentMarkupData.establishments.forEach(establishment => {
        if (establishment.marker) {
            updateEstablishmentIcon(establishment);
        }
    });
}

// Функция для обновления иконки конкретного заведения
function updateEstablishmentIcon(establishment) {
    if (!establishment.marker) return;
    
    const iconSize = getIconSizeForZoom(currentZoom);
    const territoryColor = establishment.territory ? establishment.territory.color : getEstablishmentColor(establishment.type);
    
    const newIcon = L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, ${territoryColor}, #ffffff);
                border: 4px solid var(--warm-gold);
                border-radius: 50%;
                width: ${iconSize.size}px;
                height: ${iconSize.size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--deep-black);
                font-weight: bold;
                font-size: ${Math.round(iconSize.size * 0.47)}px;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
            ">
                ${getEstablishmentIcon(establishment.type)}
            </div>
        `,
        iconSize: [iconSize.size, iconSize.size],
        iconAnchor: [iconSize.anchor, iconSize.anchor],
        className: 'markup-establishment-marker'
    });
    
    establishment.marker.setIcon(newIcon);
}

// Показ popup с кнопками захвата и покупки для игроков
function showCapturePopup(establishment) {
    // Проверяем авторизацию пользователя
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    
    // Если пользователь не авторизован, показываем только информацию
    if (!user) {
        const popupContent = `
            <div style="font-family: var(--font-sans); padding: 0.5rem; text-align: center; min-width: 200px;">
                <h4 style="color: var(--warm-gold); font-size: 1rem; margin: 0 0 0.5rem 0;">${establishment.name}</h4>
                <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Тип:</strong> ${establishment.type}</p>
                <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Доход:</strong> $${establishment.income}/час</p>
                <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Стоимость:</strong> $${establishment.captureCost}</p>
                <p style="color: #d32f2f; font-size: 0.8rem; margin: 0.5rem 0; font-weight: bold;">
                    🔒 Войдите в систему для захвата и покупки
                </p>
            </div>
        `;
        
        L.popup()
            .setLatLng(establishment.coords)
            .setContent(popupContent)
            .openOn(window.gangsterMap);
        return;
    }
    
    // Если пользователь - администратор, показываем только информацию
    if (user.name === 'admin') {
        const popupContent = `
            <div style="font-family: var(--font-sans); padding: 0.5rem; text-align: center; min-width: 200px;">
                <h4 style="color: var(--warm-gold); font-size: 1rem; margin: 0 0 0.5rem 0;">${establishment.name}</h4>
                <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Тип:</strong> ${establishment.type}</p>
                <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Доход:</strong> $${establishment.income}/час</p>
                <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Стоимость:</strong> $${establishment.captureCost}</p>
                <p style="color: #d32f2f; font-size: 0.8rem; margin: 0.5rem 0; font-weight: bold;">
                    ⚙️ Администратор не может захватывать заведения
                </p>
            </div>
        `;
        
        L.popup()
            .setLatLng(establishment.coords)
            .setContent(popupContent)
            .openOn(window.gangsterMap);
        return;
    }
    
    // Проверяем геолокацию игрока
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const playerLat = position.coords.latitude;
            const playerLng = position.coords.longitude;
            const establishmentLat = establishment.coords[0]; // lat
            const establishmentLng = establishment.coords[1]; // lng
            
            // Вычисляем расстояние в метрах
            const distance = calculateDistance(playerLat, playerLng, establishmentLat, establishmentLng);
            
            // Получаем данные игрока
            const user = typeof currentUser === 'function' ? currentUser() : currentUser;
            const playerMoney = user && user.money ? user.money : 10000; // По умолчанию 10000
            
            // Проверяем, принадлежит ли заведение текущему игроку
            const isOwner = establishment.owner && establishment.owner.name === user.name;
            
            // Определяем доступность действий
            const canCapture = !isOwner && distance <= 20; // 20 метров для захвата, но только если не владелец
            const canBuy = !isOwner && playerMoney >= establishment.captureCost; // Покупка только если не владелец
            
            // Создаем popup с информацией и двумя кнопками
            const popupContent = `
                <div style="font-family: var(--font-sans); padding: 0.5rem; text-align: center; min-width: 220px;">
                    <h4 style="color: var(--warm-gold); font-size: 1rem; margin: 0 0 0.5rem 0;">${establishment.name}</h4>
                    <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Тип:</strong> ${establishment.type}</p>
                    <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Доход:</strong> $${establishment.income}/час</p>
                    <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Стоимость:</strong> $${establishment.captureCost}</p>
                    ${isOwner ? 
                        `<p style="font-size: 0.8rem; margin: 0.25rem 0; color: var(--warm-gold); font-weight: bold;">
                            <strong>Статус:</strong> Ваше заведение
                        </p>` :
                        `<p style="font-size: 0.7rem; margin: 0.25rem 0; color: ${canCapture ? 'var(--warm-gold)' : '#d32f2f'};">
                            <strong>Расстояние:</strong> ${distance.toFixed(1)}м ${canCapture ? '(достаточно близко)' : '(слишком далеко)'}
                        </p>
                        <p style="font-size: 0.7rem; margin: 0.25rem 0; color: ${canBuy ? 'var(--warm-gold)' : '#d32f2f'};">
                            <strong>Ваши деньги:</strong> $${playerMoney.toLocaleString()}
                        </p>`
                    }
                    
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        ${isOwner ? 
                            `<button onclick="attemptSellEstablishment('${establishment.id}')" 
                                    style="
                                        background: linear-gradient(45deg, #d32f2f, #b71c1c);
                                        border: 2px solid var(--warm-gold);
                                        color: var(--cream);
                                        padding: 0.4rem 0.8rem;
                                        cursor: pointer;
                                        font-weight: bold;
                                        font-size: 0.8rem;
                                        border-radius: 4px;
                                        flex: 1;
                                        opacity: 1;
                                        transition: all 0.3s ease;
                                    " 
                                    onmouseover="this.style.background='linear-gradient(45deg, #f44336, #d32f2f)'"
                                    onmouseout="this.style.background='linear-gradient(45deg, #d32f2f, #b71c1c)'">
                                💰 Продать
                            </button>` :
                            `<button onclick="attemptCapture('${establishment.id}')" 
                                    style="
                                        background: ${canCapture ? 'linear-gradient(45deg, #2e7d32, #1b5e20)' : 'linear-gradient(45deg, #666, #444)'};
                                        border: 2px solid var(--warm-gold);
                                        color: var(--cream);
                                        padding: 0.4rem 0.8rem;
                                        cursor: ${canCapture ? 'pointer' : 'not-allowed'};
                                        font-weight: bold;
                                        font-size: 0.8rem;
                                        border-radius: 4px;
                                        flex: 1;
                                        opacity: ${canCapture ? '1' : '0.6'};
                                    " 
                                    ${canCapture ? '' : 'disabled'}>
                                    ${canCapture ? '🎯 Захватить' : `❌ -${(distance - 20).toFixed(0)}м`}
                            </button>`
                        }
                        
                        ${isOwner ? 
                            `<button onclick="showEstablishmentInfo('${establishment.id}')" 
                                    style="
                                        background: linear-gradient(45deg, #8b7355, #5d4e37);
                                        border: 2px solid var(--warm-gold);
                                        color: var(--cream);
                                        padding: 0.4rem 0.8rem;
                                        cursor: pointer;
                                        font-weight: bold;
                                        font-size: 0.8rem;
                                        border-radius: 4px;
                                        flex: 1;
                                        opacity: 1;
                                    ">
                                📊 Инфо
                            </button>` :
                            `<button onclick="attemptBuy('${establishment.id}')" 
                                    style="
                                        background: ${canBuy ? 'linear-gradient(45deg, #1976d2, #1565c0)' : 'linear-gradient(45deg, #666, #444)'};
                                        border: 2px solid var(--warm-gold);
                                        color: var(--cream);
                                        padding: 0.4rem 0.8rem;
                                        cursor: ${canBuy ? 'pointer' : 'not-allowed'};
                                        font-weight: bold;
                                        font-size: 0.8rem;
                                        border-radius: 4px;
                                        flex: 1;
                                        opacity: ${canBuy ? '1' : '0.6'};
                                    " 
                                    ${canBuy ? '' : 'disabled'}>
                                    ${canBuy ? '💰 Купить' : '❌ Недостаточно'}
                            </button>`
                        }
                    </div>
                </div>
            `;
            
            // Создаем popup на карте
            L.popup()
                .setLatLng(establishment.coords)
                .setContent(popupContent)
                .openOn(window.gangsterMap);
                
        }, function(error) {
            // Ошибка получения геолокации
            showMessage('Не удалось получить ваше местоположение', 'error');
        });
    } else {
        showMessage('Геолокация не поддерживается вашим браузером', 'error');
    }
}

// Вычисление расстояния между двумя точками в метрах
function calculateDistance(lat1, lng1, lat2, lng2) {
    // Проверяем валидность координат
    if (!lat1 || !lng1 || !lat2 || !lng2 || 
        isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
        console.error('Invalid coordinates:', { lat1, lng1, lat2, lng2 });
        return 0;
    }
    
    const R = 6371000; // Радиус Земли в метрах
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Проверяем результат
    if (isNaN(distance)) {
        console.error('Distance calculation failed:', { lat1, lng1, lat2, lng2 });
        return 0;
    }
    
    return distance;
}

// Обновление визуализации заведения (территория и маркер)
function updateEstablishmentVisualization(establishment) {
    console.log('updateEstablishmentVisualization - заведение:', establishment.name, 'владелец:', establishment.owner);
    
    // Обновляем цвет территории
    if (establishment.polygon) {
        const territoryColor = establishment.owner ? establishment.owner.color : getEstablishmentColor(establishment.type);
        console.log('updateEstablishmentVisualization - цвет территории:', territoryColor);
        establishment.polygon.setStyle({
            fillColor: territoryColor,
            color: territoryColor,
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.3
        });
        
        // Добавляем имя владельца на территории
        if (establishment.owner) {
            console.log('updateEstablishmentVisualization - добавляем имя владельца:', establishment.owner.name);
            addOwnerLabelToTerritory(establishment);
        }
    }
    
    // Обновляем цвет маркера
    if (establishment.marker) {
        updateEstablishmentIcon(establishment);
    }
    
    // Сохраняем изменения
    if (typeof window.saveMarkupDataToLocalStorage === 'function') {
        window.saveMarkupDataToLocalStorage();
    }
}

// Добавление имени владельца на территории
function addOwnerLabelToTerritory(establishment) {
    if (!establishment.polygon || !establishment.owner) return;
    
    // Удаляем предыдущие элементы владельца если есть
    if (establishment.ownerLabel) {
        if (Array.isArray(establishment.ownerLabel)) {
            establishment.ownerLabel.forEach(element => {
                window.gangsterMap.removeLayer(element);
            });
        } else {
            window.gangsterMap.removeLayer(establishment.ownerLabel);
        }
    }
    
    // Получаем координаты полигона территории
    const latLngs = establishment.polygon.getLatLngs()[0];
    if (!latLngs || latLngs.length < 3) return;
    
    // Находим самую правую точку полигона для размещения имени
    let rightmostPoint = latLngs[0];
    let rightmostIndex = 0;
    
    for (let i = 1; i < latLngs.length; i++) {
        if (latLngs[i].lng > rightmostPoint.lng) {
            rightmostPoint = latLngs[i];
            rightmostIndex = i;
        }
    }
    
    // Создаем пунктирную линию вдоль правой границы
    const ownerLabelElements = [];
    
    // Определяем направление для пунктирной линии (вверх или вниз от найденной точки)
    const prevIndex = rightmostIndex > 0 ? rightmostIndex - 1 : latLngs.length - 1;
    const nextIndex = rightmostIndex < latLngs.length - 1 ? rightmostIndex + 1 : 0;
    
    const prevPoint = latLngs[prevIndex];
    const nextPoint = latLngs[nextIndex];
    
    // Выбираем направление с большим изменением по широте
    const latDiffPrev = Math.abs(rightmostPoint.lat - prevPoint.lat);
    const latDiffNext = Math.abs(rightmostPoint.lat - nextPoint.lat);
    
    let direction;
    if (latDiffPrev > latDiffNext) {
        direction = rightmostPoint.lat > prevPoint.lat ? 'up' : 'down';
    } else {
        direction = rightmostPoint.lat > nextPoint.lat ? 'up' : 'down';
    }
    
    // Создаем пунктирную линию
    const lineLength = 0.0003; // Длина линии в градусах
    const stepSize = 0.00005; // Размер шага для пунктира
    
    const startLat = rightmostPoint.lat;
    const startLng = rightmostPoint.lng + 0.0001; // Смещаем немного вправо от границы
    
    const endLat = direction === 'up' ? startLat + lineLength : startLat - lineLength;
    
    // Создаем пунктирную линию
    const dashPoints = [];
    for (let i = 0; i <= lineLength / stepSize; i++) {
        const currentLat = startLat + (direction === 'up' ? i * stepSize : -i * stepSize);
        if (i % 2 === 0) { // Только четные точки для создания пунктира
            dashPoints.push([currentLat, startLng]);
        }
    }
    
    // Создаем пунктирную линию
    const dashedLine = L.polyline(dashPoints, {
        color: establishment.owner.color,
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 5',
        className: 'owner-dashed-line'
    }).addTo(window.gangsterMap);
    
    ownerLabelElements.push(dashedLine);
    
    // Создаем текстовую метку в конце линии
    const textPosition = [endLat, startLng];
    const ownerIcon = L.divIcon({
        html: `
            <div style="
                color: ${establishment.owner.color};
                font-family: 'Libre Baskerville', 'Times New Roman', serif;
                font-size: 0.5rem;
                font-style: italic;
                font-weight: normal;
                text-align: center;
                white-space: nowrap;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
                background: rgba(244, 241, 235, 0.9);
                padding: 0.1rem 0.4rem;
                border-radius: 3px;
                border: 1px solid ${establishment.owner.color};
                backdrop-filter: blur(3px);
                transform: rotate(${direction === 'up' ? '-5deg' : '5deg'});
                pointer-events: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            ">
                ${establishment.owner.name}
            </div>
        `,
        iconSize: [60, 12],
        iconAnchor: [30, 6],
        className: 'vintage-owner-label'
    });
    
    const textMarker = L.marker(textPosition, { icon: ownerIcon }).addTo(window.gangsterMap);
    ownerLabelElements.push(textMarker);
    
    // Сохраняем все элементы как массив
    establishment.ownerLabel = ownerLabelElements;
}

// Попытка захвата заведения
function attemptCapture(establishmentId) {
    // Проверяем авторизацию
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    if (!user) {
        showMessage('Необходимо войти в систему!', 'error');
        return;
    }
    
    // Администратор не может захватывать заведения
    if (user.name === 'admin') {
        showMessage('Администратор не может захватывать заведения!', 'error');
        return;
    }
    
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Проверяем, не принадлежит ли уже заведение этому игроку
    if (establishment.owner && establishment.owner.name === user.name) {
        showMessage('Вы уже владеете этим заведением!', 'info');
        return;
    }
    
    // Проверяем расстояние до заведения
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const playerLat = position.coords.latitude;
            const playerLng = position.coords.longitude;
            const establishmentLat = establishment.coords[0]; // lat
            const establishmentLng = establishment.coords[1]; // lng
            
            const distance = calculateDistance(playerLat, playerLng, establishmentLat, establishmentLng);
            
            if (distance > 20) {
                showMessage(`Слишком далеко для захвата. Расстояние: ${distance.toFixed(1)}м`, 'error');
                return;
            }
            
            // Устанавливаем владельца заведения
            establishment.owner = {
                name: user.name,
                color: user.color
            };
            
            console.log('Устанавливаем владельца заведения:', establishment.name, 'Владелец:', establishment.owner);
            
            // Обновляем визуализацию заведения на карте
            updateEstablishmentVisualization(establishment);
            
            // Обновляем статистику игрока
            if (user.territories) {
                user.territories.push(establishmentId);
            } else {
                user.territories = [establishmentId];
            }
            
            // Обновляем общий доход игрока
            if (user.totalIncome === undefined) {
                user.totalIncome = 0;
            }
            user.totalIncome += establishment.income;
            
            // Сохраняем данные игрока
            if (typeof window.saveCurrentUser === 'function') {
                window.saveCurrentUser();
            }
            
            // Сохраняем изменения в заведениях
            saveMarkupDataToLocalStorage();
            
            // Синхронизация с облаком
            if (window.githubSyncService && window.githubSyncService.githubToken) {
                window.githubSyncService.syncToGist().catch(error => {
                    console.error('Ошибка синхронизации с облаком:', error);
                });
            }
            
            showMessage(`Заведение "${establishment.name}" захвачено! Доход: $${establishment.income}/час`, 'success');
            
            // Закрываем popup
            window.gangsterMap.closePopup();
            
        }, function(error) {
            showMessage('Не удалось получить ваше местоположение', 'error');
        });
    } else {
        showMessage('Геолокация не поддерживается вашим браузером', 'error');
    }
}

// Попытка покупки заведения
function attemptBuy(establishmentId) {
    // Проверяем авторизацию
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    if (!user) {
        showMessage('Необходимо войти в систему!', 'error');
        return;
    }
    
    // Администратор не может покупать заведения
    if (user.name === 'admin') {
        showMessage('Администратор не может покупать заведения!', 'error');
        return;
    }
    
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Проверяем, не принадлежит ли уже заведение этому игроку
    if (establishment.owner && establishment.owner.name === user.name) {
        showMessage('Вы уже владеете этим заведением!', 'info');
        return;
    }
    
    // Получаем данные игрока
    const playerMoney = user && user.money ? user.money : 10000;
    
    if (playerMoney < establishment.captureCost) {
        showMessage(`Недостаточно денег! Нужно: $${establishment.captureCost}, у вас: $${playerMoney}`, 'error');
        return;
    }
    
    // Списываем деньги с игрока
    if (user) {
        user.money -= establishment.captureCost;
        
        // Устанавливаем владельца заведения
        establishment.owner = {
            name: user.name,
            color: user.color
        };
        
        // Обновляем статистику игрока
        if (user.territories) {
            user.territories.push(establishmentId);
        } else {
            user.territories = [establishmentId];
        }
        
        // Обновляем общий доход игрока
        if (user.totalIncome === undefined) {
            user.totalIncome = 0;
        }
        user.totalIncome += establishment.income;
        
        // Сохраняем изменения в localStorage
        if (typeof window.saveCurrentUser === 'function') {
            window.saveCurrentUser();
        }
        
        // Обновляем визуализацию заведения на карте
        updateEstablishmentVisualization(establishment);
        
        // Сохраняем изменения в заведениях
        saveMarkupDataToLocalStorage();
        
        // Синхронизация с облаком
        if (window.githubSyncService && window.githubSyncService.githubToken) {
            window.githubSyncService.syncToGist().catch(error => {
                console.error('Ошибка синхронизации с облаком:', error);
            });
        }
    }
    
    showMessage(`Заведение "${establishment.name}" куплено за $${establishment.captureCost}! Доход: $${establishment.income}/час`, 'success');
    
    // Закрываем popup
    window.gangsterMap.closePopup();
}

// Продажа заведения
function attemptSellEstablishment(establishmentId) {
    // Проверяем авторизацию
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    if (!user) {
        showMessage('Необходимо войти в систему!', 'error');
        return;
    }
    
    // Администратор не может продавать заведения
    if (user.name === 'admin') {
        showMessage('Администратор не может продавать заведения!', 'error');
        return;
    }
    
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Проверяем, принадлежит ли заведение этому игроку
    if (!establishment.owner || establishment.owner.name !== user.name) {
        showMessage('Вы не владеете этим заведением!', 'error');
        return;
    }
    
    // Вычисляем цену продажи (80% от стоимости покупки)
    const sellPrice = Math.floor(establishment.captureCost * 0.8);
    
    // Подтверждение продажи
    if (confirm(`Вы уверены, что хотите продать заведение "${establishment.name}" за $${sellPrice}?\n\nЭто действие нельзя отменить!`)) {
        // Возвращаем деньги игроку
        if (user) {
            user.money += sellPrice;
            
            // Удаляем заведение из списка территорий игрока
            if (user.territories) {
                const territoryIndex = user.territories.indexOf(establishmentId);
                if (territoryIndex > -1) {
                    user.territories.splice(territoryIndex, 1);
                }
            }
            
            // Уменьшаем общий доход игрока
            if (user.totalIncome !== undefined && user.totalIncome >= establishment.income) {
                user.totalIncome -= establishment.income;
            }
            
            // Удаляем владельца из заведения
            establishment.owner = null;
            
            // Обновляем визуализацию заведения на карте
            updateEstablishmentVisualization(establishment);
            
            // Сохраняем изменения в localStorage
            if (typeof window.saveCurrentUser === 'function') {
                window.saveCurrentUser();
            }
            
            // Сохраняем изменения в заведениях
            saveMarkupDataToLocalStorage();
            
            // Синхронизация с облаком
            if (window.githubSyncService && window.githubSyncService.githubToken) {
                window.githubSyncService.syncToGist().catch(error => {
                    console.error('Ошибка синхронизации с облаком:', error);
                });
            }
            
            showMessage(`Заведение "${establishment.name}" продано за $${sellPrice}!`, 'success');
            
            // Закрываем popup
            window.gangsterMap.closePopup();
        }
    }
}

// Показ информации о заведении для владельца
function showEstablishmentInfo(establishmentId) {
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    const totalIncome = establishment.income || 0;
    
    // Создаем информационный popup
    const infoContent = `
        <div style="font-family: var(--font-sans); padding: 0.5rem; text-align: center; min-width: 200px;">
            <h4 style="color: var(--warm-gold); font-size: 1rem; margin: 0 0 0.5rem 0;">📊 ${establishment.name}</h4>
            <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Тип:</strong> ${establishment.type}</p>
            <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Доход:</strong> $${totalIncome}/час</p>
            <p style="font-size: 0.8rem; margin: 0.25rem 0;"><strong>Владелец:</strong> ${establishment.owner ? establishment.owner.name : 'Никто'}</p>
            <p style="font-size: 0.7rem; margin: 0.25rem 0; color: var(--warm-gold);">
                <strong>Статус:</strong> Ваше заведение
            </p>
            <div style="margin-top: 0.5rem; padding: 0.3rem; background: rgba(139, 115, 85, 0.1); border-radius: 4px;">
                <p style="font-size: 0.7rem; margin: 0; color: var(--deep-black);">
                    💡 Нажмите "Продать" чтобы отказаться от заведения
                </p>
            </div>
        </div>
    `;
    
    // Создаем popup на карте
    L.popup()
        .setLatLng(establishment.coords)
        .setContent(infoContent)
        .openOn(window.gangsterMap);
}

// Автозагрузка данных при инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, начинаем инициализацию...');
    
    // Функция для проверки готовности карты и загрузки данных
    function waitForMapAndLoadData() {
        console.log('Проверяем готовность карты...');
        
        if (window.gangsterMap && window.gangsterMap.getContainer()) {
            console.log('Карта готова, загружаем данные...');
            
            // Сначала пытаемся загрузить из облака, затем из localStorage
            if (window.githubSyncService && window.githubSyncService.githubToken) {
                console.log('Пытаемся загрузить данные из облака...');
                window.githubSyncService.syncFromGist().then(() => {
                    console.log('Данные загружены из облака');
                    // Проверяем, загрузились ли данные
                    setTimeout(() => {
                        if (currentMarkupData.establishments.length === 0) {
                            console.log('Из облака не загрузилось, загружаем из localStorage...');
                            loadMarkupDataFromLocalStorage();
                        }
                    }, 500);
                }).catch(error => {
                    console.log('Не удалось загрузить из облака, загружаем из localStorage:', error);
                    loadMarkupDataFromLocalStorage();
                });
            } else {
                console.log('Нет токена GitHub, загружаем из localStorage...');
                loadMarkupDataFromLocalStorage();
            }
            
            // Проверяем наличие данных через 3 секунды
            setTimeout(() => {
                const markupData = localStorage.getItem('gangsters_markup_data');
                if (!markupData || JSON.parse(markupData).establishments.length === 0) {
                    console.log('Нет данных о заведениях. Используйте синхронизацию для загрузки данных.');
                } else {
                    console.log('Данные заведений загружены успешно');
                }
            }, 3000);
        } else {
            console.log('Карта еще не готова, ждем...');
            setTimeout(waitForMapAndLoadData, 500);
        }
    }
    
    // Начинаем проверку через 2 секунды (больше времени для инициализации)
    setTimeout(waitForMapAndLoadData, 2000);
    
    // Дополнительная проверка через 5 секунд (на случай если первая не сработала)
    setTimeout(() => {
        if (currentMarkupData.establishments.length === 0) {
            console.log('Дополнительная проверка: загружаем данные...');
            loadMarkupDataFromLocalStorage();
        }
    }, 5000);
    
    // Также слушаем событие загрузки карты
    window.addEventListener('mapReady', function() {
        console.log('Событие mapReady получено, загружаем данные...');
        setTimeout(() => {
            if (currentMarkupData.establishments.length === 0) {
                loadMarkupDataFromLocalStorage();
            }
        }, 1000);
    });
});

// Проверка админ-авторизации
function checkAdminAuth() {
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    return user && user.name === 'admin';
}

// Админ-панель больше не нужна - все функции перенесены на верхний бар

// Переключение режима разметки
function toggleMarkupMode() {
    if (!checkAdminAuth()) {
        showMessage('Доступ запрещен! Требуются права администратора.', 'error');
        return;
    }

    isMarkupMode = !isMarkupMode;
    const button = document.getElementById('markup-toggle-btn');
    
    if (isMarkupMode) {
        button.textContent = '⏹️ Остановить';
        button.style.background = 'linear-gradient(45deg, #2d5016, #1e3a0a)';
        showTerritoryMarkupNotification('Режим разметки включен! Кликните на заведение для начала разметки территории.');
        
        // Инициализируем режим выбора заведения
        initEstablishmentSelectionMode();
    } else {
        button.textContent = '🎯 Разметка';
        button.style.background = 'linear-gradient(45deg, var(--brick-red), var(--dark-brick))';
        hideTerritoryMarkupNotification();
        showMessage('Режим разметки отключен.', 'info');
        
        // Отключаем все режимы
        disableAllMarkupModes();
    }
}

// Переключение режима создания заведений
function toggleCreateEstablishmentMode() {
    if (!checkAdminAuth()) {
        showMessage('Доступ запрещен! Требуются права администратора.', 'error');
        return;
    }

    isCreateEstablishmentMode = !isCreateEstablishmentMode;
    const button = document.getElementById('create-establishment-btn');
    
    if (isCreateEstablishmentMode) {
        button.textContent = '⏹️ Остановить создание';
        button.style.background = 'linear-gradient(45deg, #2d5016, #1e3a0a)';
        showMessage('Режим создания заведений включен! Заполните форму и кликайте по карте для размещения.', 'success');
        
        // Показываем форму создания заведения
        showCreateEstablishmentForm();
    } else {
        button.textContent = '🏢 Создать';
        button.style.background = 'linear-gradient(45deg, var(--steel-blue), var(--midnight-blue))';
        showMessage('Режим создания заведений отключен.', 'info');
        
        // Скрываем форму и отключаем режим
        hideCreateEstablishmentForm();
        disableCreateEstablishmentMode();
    }
}

// Инициализация режима выбора заведения
function initEstablishmentSelectionMode() {
    isEstablishmentSelectionMode = true;
    isPolygonDrawingMode = false;
    selectedEstablishment = null;
    
    showMessage('Выберите заведение на карте для разметки территории', 'info');
    
    // Подсвечиваем все заведения для выбора
    highlightEstablishmentsForSelection();
}

// Подсветка заведений для выбора
function highlightEstablishmentsForSelection() {
    if (!window.gangsterMap) return;
    
    // Подсвечиваем все заведения
    currentMarkupData.establishments.forEach(establishment => {
        if (establishment.marker) {
            // Добавляем эффект подсветки
            establishment.marker.getElement().style.filter = 'brightness(1.3) drop-shadow(0 0 10px #d4af37)';
            establishment.marker.getElement().style.cursor = 'pointer';
            establishment.marker.getElement().style.transition = 'all 0.3s ease';
        }
    });
    
    // Добавляем обработчик кликов для выбора заведений (как резервный вариант)
    window.gangsterMap.on('click', onEstablishmentSelection);
}

// Удаление подсветки с заведений
function removeEstablishmentHighlighting() {
    if (!window.gangsterMap) return;
    
    // Убираем подсветку с всех заведений
    currentMarkupData.establishments.forEach(establishment => {
        if (establishment.marker) {
            // Убираем эффект подсветки
            establishment.marker.getElement().style.filter = '';
            establishment.marker.getElement().style.cursor = '';
            establishment.marker.getElement().style.transition = '';
        }
    });
}

// Обработчик выбора заведения
function onEstablishmentSelection(e) {
    if (!isEstablishmentSelectionMode) return;
    
    // Ищем ближайшее заведение в радиусе 50 метров
    const clickedLat = e.latlng.lat;
    const clickedLng = e.latlng.lng;
    
    let nearestEstablishment = null;
    let minDistance = Infinity;
    
    // Проверяем существующие заведения
    currentMarkupData.establishments.forEach(establishment => {
        const distance = calculateDistance(
            clickedLat, clickedLng,
            establishment.coords[0], establishment.coords[1]
        );
        
        if (distance < 50 && distance < minDistance) {
            minDistance = distance;
            nearestEstablishment = establishment;
        }
    });
    
    if (nearestEstablishment) {
        selectedEstablishment = nearestEstablishment;
        isEstablishmentSelectionMode = false;
        isPolygonDrawingMode = true;
        
        showTerritoryMarkupNotification(`Рисование территории для: ${nearestEstablishment.name}. Кликайте по карте для создания многоугольника.`);
        
        // Убираем обработчик выбора заведений
        window.gangsterMap.off('click', onEstablishmentSelection);
        
        // Запускаем режим рисования многоугольника
        startPolygonDrawing();
    } else {
        showMessage('Выберите заведение! Кликните рядом с существующим заведением.', 'warning');
    }
}

// Начало рисования многоугольника
function startPolygonDrawing() {
    if (!window.gangsterMap) return;
    
    polygonPoints = [];
    currentPolygon = null;
    
    // Добавляем обработчик кликов для рисования
    window.gangsterMap.on('click', onPolygonPointAdd);
    
    // Добавляем кнопки управления в верхний бар
    addPolygonControlsToTopBar();
}

// Добавление точки многоугольника
function onPolygonPointAdd(e) {
    if (!isPolygonDrawingMode) return;
    
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Добавляем точку
    polygonPoints.push([lat, lng]);
    
    // Удаляем предыдущий многоугольник
    if (currentPolygon && window.gangsterMap) {
        window.gangsterMap.removeLayer(currentPolygon);
    }
    
    // Определяем цвет территории (используем цвет заведения если территория еще не создана)
    const territoryColor = selectedEstablishment.territory ? selectedEstablishment.territory.color : getEstablishmentColor(selectedEstablishment.type);
    
    // Создаем новый многоугольник с добавленной точкой
    if (polygonPoints.length >= 3) {
        currentPolygon = L.polygon(polygonPoints, {
            fillColor: territoryColor,
            fillOpacity: 0.2,
            color: territoryColor,
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 5',
            className: 'temp-polygon'
        }).addTo(window.gangsterMap);
    }
    
    // Добавляем маркер точки
    const pointMarker = L.marker([lat, lng], {
        icon: L.divIcon({
            html: `<div style="
                background: ${territoryColor};
                border: 2px solid var(--warm-gold);
                border-radius: 50%;
                width: 12px;
                height: 12px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            "></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            className: 'polygon-point-marker'
        })
    }).addTo(window.gangsterMap);
    
    // Сохраняем маркер для последующего удаления
    if (!selectedEstablishment.tempPointMarkers) {
        selectedEstablishment.tempPointMarkers = [];
    }
    selectedEstablishment.tempPointMarkers.push(pointMarker);
    
    showMessage(`Добавлена точка ${polygonPoints.length}. Кликните ещё или нажмите "OK" для завершения.`, 'info');
    
    // Обновляем счетчик точек
    updatePolygonPointsCount();
}

// Добавление элементов управления многоугольником в верхний бар
function addPolygonControlsToTopBar() {
    // Удаляем старые элементы управления
    removePolygonControls();
    
    // Создаем контейнер для кнопок управления многоугольником
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'polygon-controls-topbar';
    controlsContainer.style.cssText = `
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-left: 1rem;
    `;
    
    controlsContainer.innerHTML = `
        <div style="
            display: flex;
            gap: 0.25rem;
            padding: 0.25rem;
            background: rgba(139, 38, 53, 0.2);
            border-radius: 4px;
            border: 1px solid var(--brick-red);
            align-items: center;
        ">
            <span style="color: var(--cream); font-size: 0.8rem; margin-right: 0.5rem;">
                Территория: ${selectedEstablishment ? selectedEstablishment.name : 'Не выбрано'}
            </span>
            <span id="polygon-points-count" style="color: var(--warm-gold); font-size: 0.8rem; margin-right: 0.5rem;">0 точек</span>
            <button onclick="finishPolygon()" style="
                background: linear-gradient(45deg, #2d5016, #1e3a0a);
                border: 1px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.25rem 0.5rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.8rem;
                border-radius: 3px;
                min-width: 50px;
            ">✅ OK</button>
            <button onclick="cancelPolygon()" style="
                background: linear-gradient(45deg, var(--concrete), var(--dark-concrete));
                border: 1px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.25rem 0.5rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.8rem;
                border-radius: 3px;
                min-width: 50px;
            ">❌ Отмена</button>
        </div>
    `;
    
    // Добавляем в верхний бар
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.appendChild(controlsContainer);
    }
    
    // Обновляем счетчик точек
    updatePolygonPointsCount();
}

// Обновление счетчика точек
function updatePolygonPointsCount() {
    const countElement = document.getElementById('polygon-points-count');
    if (countElement) {
        countElement.textContent = polygonPoints.length;
    }
}

// Завершение рисования многоугольника
function finishPolygon() {
    if (polygonPoints.length < 3) {
        showMessage('Необходимо минимум 3 точки для создания территории!', 'error');
        return;
    }
    
    if (!selectedEstablishment) {
        showMessage('Не выбрано заведение!', 'error');
        return;
    }
    
    // Создаем или обновляем территорию заведения
    if (!selectedEstablishment.territory) {
        selectedEstablishment.territory = {
            polygon: polygonPoints,
            color: getEstablishmentColor(selectedEstablishment.type),
            opacity: 0.3
        };
    } else {
        selectedEstablishment.territory.polygon = polygonPoints;
    }
    
    // Удаляем временный многоугольник
    if (currentPolygon && window.gangsterMap) {
        window.gangsterMap.removeLayer(currentPolygon);
    }
    
    // Создаем финальный многоугольник
    const finalPolygon = L.polygon(polygonPoints, {
        fillColor: selectedEstablishment.territory.color,
        fillOpacity: selectedEstablishment.territory.opacity,
        color: selectedEstablishment.territory.color,
        weight: 2,
        opacity: 0.8,
        className: 'final-territory-polygon'
    }).addTo(window.gangsterMap);
    
    // Сохраняем ссылку на многоугольник
    selectedEstablishment.polygon = finalPolygon;
    
    // Popup теперь показывается через showCapturePopup() при клике
    
    // Убираем все временные маркеры точек
    removePolygonPointMarkers();
    
    // Убираем элементы управления
    removePolygonControls();
    
    // Отключаем режим рисования
    disableAllMarkupModes();
    
    // Обновляем статистику
    updateMarkupStats();
    
    // Автосохранение
    saveMarkupDataToLocalStorage();
    
    showMessage(`Территория для "${selectedEstablishment.name}" создана! Точки: ${polygonPoints.length}`, 'success');
    
    // Автоматически отключаем режим разметки
    const markupBtn = document.getElementById('markup-toggle-btn');
    if (markupBtn) {
        markupBtn.textContent = '🎯 Разметка';
        markupBtn.style.background = 'linear-gradient(45deg, var(--brick-red), var(--dark-brick))';
    }
    
    // Сбрасываем состояние
    resetMarkupState();
}

// Отмена рисования многоугольника
function cancelPolygon() {
    // Удаляем временный многоугольник
    if (currentPolygon && window.gangsterMap) {
        window.gangsterMap.removeLayer(currentPolygon);
    }
    
    // Убираем маркеры точек
    removePolygonPointMarkers();
    
    // Убираем элементы управления
    removePolygonControls();
    
    // Отключаем режим рисования
    disableAllMarkupModes();
    
    // Сбрасываем состояние
    resetMarkupState();
    
    showMessage('Рисование территории отменено.', 'info');
}

// Удаление элементов управления многоугольником
function removePolygonControls() {
    // Удаляем центральное меню (если есть)
    const controlsDiv = document.getElementById('polygon-controls');
    if (controlsDiv) {
        document.body.removeChild(controlsDiv);
    }
    
    // Удаляем элементы из верхнего бара
    const topBarControls = document.getElementById('polygon-controls-topbar');
    if (topBarControls) {
        topBarControls.remove();
    }
}

// Удаление маркеров точек многоугольника
function removePolygonPointMarkers() {
    if (!window.gangsterMap) return;
    
    // Удаляем маркеры через eachLayer
    window.gangsterMap.eachLayer(function(layer) {
        if (layer instanceof L.Marker && 
            layer.options.icon && 
            layer.options.icon.options.className === 'polygon-point-marker') {
            window.gangsterMap.removeLayer(layer);
        }
    });
    
    // Также удаляем маркеры из массива временных маркеров заведения
    if (selectedEstablishment && selectedEstablishment.tempPointMarkers) {
        selectedEstablishment.tempPointMarkers.forEach(marker => {
            if (window.gangsterMap.hasLayer(marker)) {
                window.gangsterMap.removeLayer(marker);
            }
        });
        selectedEstablishment.tempPointMarkers = [];
    }
}

// Отключение всех режимов разметки
function disableAllMarkupModes() {
    isEstablishmentSelectionMode = false;
    isPolygonDrawingMode = false;
    
    // Убираем подсветку с заведений
    removeEstablishmentHighlighting();
    
    // Убираем все обработчики
    if (window.gangsterMap) {
        window.gangsterMap.off('click', onEstablishmentSelection);
        window.gangsterMap.off('click', onPolygonPointAdd);
    }
}

// Сброс состояния разметки
function resetMarkupState() {
    selectedEstablishment = null;
    currentPolygon = null;
    polygonPoints = [];
    
    // Убираем подсветку с заведений
    removeEstablishmentHighlighting();
}

// Показ формы создания заведения
function showCreateEstablishmentForm() {
    // Скрываем форму, если она уже существует
    hideCreateEstablishmentForm();
    
    const formDiv = document.createElement('div');
    formDiv.id = 'create-establishment-form';
    formDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
        border: 3px solid var(--warm-gold);
        padding: 1rem;
        border-radius: 8px;
        z-index: 1500;
        font-family: var(--font-sans);
        max-width: 195px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
    `;
    
    formDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.7rem;">
            <h3 style="color: var(--warm-gold); margin: 0; font-family: var(--font-serif); font-size: 1rem;">Создание заведения</h3>
            <button onclick="cancelCreateEstablishment()" style="
                background: none;
                border: none;
                color: var(--warm-gold);
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(212, 175, 55, 0.2)'" onmouseout="this.style.background='none'">×</button>
        </div>
        
        <div style="margin-bottom: 0.5rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.2rem; font-weight: bold; font-size: 0.8rem;">Тип:</label>
            <select id="new-establishment-type" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 1px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.5rem;
                font-size: 0.8rem;
            ">
                <option value="pharmacy">🏥 Аптека</option>
                <option value="restaurant">🍽️ Ресторан</option>
                <option value="shop">🛍️ Магазин</option>
                <option value="bar">🍸 Бар</option>
                <option value="bank">🏦 Банк</option>
                <option value="gas_station">⛽ АЗС</option>
                <option value="hotel">🏨 Отель</option>
                <option value="office">🏢 Офис</option>
                <option value="warehouse">📦 Склад</option>
            </select>
        </div>
        
        <div style="margin-bottom: 0.5rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.2rem; font-weight: bold; font-size: 0.8rem;">Название (необязательно):</label>
            <input type="text" id="new-establishment-name" placeholder="Автогенерация по типу" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 1px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.5rem;
                font-size: 0.8rem;
            ">
        </div>
        
        <div style="margin-bottom: 0.5rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.2rem; font-weight: bold; font-size: 0.8rem;">Доход в час:</label>
            <input type="number" id="new-establishment-income" placeholder="100" value="100" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 1px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.5rem;
                font-size: 0.8rem;
            ">
        </div>
        
        <div style="margin-bottom: 0.5rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.2rem; font-weight: bold; font-size: 0.8rem;">Стоимость покупки:</label>
            <input type="number" id="new-establishment-cost" placeholder="1000" value="1000" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 1px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.5rem;
                font-size: 0.8rem;
            ">
        </div>
        
        
        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--warm-gold); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.6rem;">
            <p style="color: var(--cream); font-size: 0.7rem; margin: 0; text-align: center;">
                <strong>Инструкция:</strong><br>
                1. Выберите тип заведения<br>
                2. Кликните по карте для создания<br>
                3. Кликайте по карте для перемещения<br>
                4. Нажмите "Завершить" когда готово<br>
                <em>Название генерируется автоматически</em>
            </p>
        </div>
        
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button onclick="finishEstablishmentCreation()" id="finish-creation-btn" style="
                background: linear-gradient(45deg, #388e3c, #2e7d32);
                border: 2px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.4rem 0.8rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.7rem;
                border-radius: 4px;
                width: 100%;
                display: none;
            ">Создать</button>
        </div>
    `;
    
    document.body.appendChild(formDiv);
    
    // Добавляем обработчик кликов на карту для создания заведений
    if (window.gangsterMap) {
        window.gangsterMap.on('click', onCreateEstablishmentClick);
    }
    
    // Добавляем обработчик изменения типа заведения для обновления иконки
    const typeSelect = document.getElementById('new-establishment-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', updateCreatingEstablishmentIcon);
    }
}

// Скрытие формы создания заведения
function hideCreateEstablishmentForm() {
    const formDiv = document.getElementById('create-establishment-form');
    if (formDiv) {
        document.body.removeChild(formDiv);
    }
    
    // Убираем обработчик кликов
    if (window.gangsterMap) {
        window.gangsterMap.off('click', onCreateEstablishmentClick);
    }
    
    // НЕ сбрасываем currentCreatingEstablishment здесь, чтобы заведение оставалось перемещаемым
}

// Завершение создания заведения (вызывается при завершении работы с заведением)
function finishEstablishmentCreation() {
    // Сбрасываем создаваемое заведение
    currentCreatingEstablishment = null;
    
    // Полностью останавливаем режим создания (как кнопка "Остановить создание")
    hideCreateEstablishmentForm();
    disableCreateEstablishmentMode();
    
    // Сбрасываем кнопку в верхнем баре
    const button = document.getElementById('create-establishment-btn');
    if (button) {
        button.textContent = '🏢 Создать';
        button.style.background = 'linear-gradient(45deg, var(--steel-blue), var(--midnight-blue))';
    }
    
    showMessage('Создание заведения завершено. Режим создания отключен.', 'success');
    console.log('Создание заведения завершено');
}

// Генерация автоматического названия заведения
function generateEstablishmentName(type) {
    establishmentCounters[type]++;
    const typeName = establishmentTypeNames[type] || type;
    return `${typeName} ${establishmentCounters[type]}`;
}

// Показ формы редактирования заведения
function showEditEstablishmentForm(establishment) {
    // Проверяем авторизацию администратора
    if (!checkAdminAuth()) {
        return;
    }
    
    // Скрываем существующую форму редактирования если есть
    hideEditEstablishmentForm();
    
    const formDiv = document.createElement('div');
    formDiv.id = 'edit-establishment-form';
    formDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
        border: 2.535px solid var(--warm-gold);
        padding: 0.845rem;
        border-radius: 6.76px;
        z-index: 1500;
        font-family: var(--font-sans);
        max-width: 164.775px;
        box-shadow: 0 6.76px 20.28px rgba(0, 0, 0, 0.5);
    `;
    
    formDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5915rem;">
            <h3 style="color: var(--warm-gold); margin: 0; font-family: var(--font-serif); font-size: 0.845rem;">Редактирование заведения</h3>
            <button onclick="hideEditEstablishmentForm()" style="
                background: none;
                border: none;
                color: var(--warm-gold);
                font-size: 1.014rem;
                cursor: pointer;
                padding: 0;
                width: 21.125px;
                height: 21.125px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(212, 175, 55, 0.2)'" onmouseout="this.style.background='none'">×</button>
        </div>
        
        <div style="margin-bottom: 0.4225rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.169rem; font-weight: bold; font-size: 0.676rem;">Тип:</label>
            <select id="edit-establishment-type" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 0.845px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.4225rem;
                font-size: 0.676rem;
            ">
                <option value="pharmacy">🏥 Аптека</option>
                <option value="restaurant">🍽️ Ресторан</option>
                <option value="shop">🛍️ Магазин</option>
                <option value="bar">🍸 Бар</option>
                <option value="bank">🏦 Банк</option>
                <option value="gas_station">⛽ АЗС</option>
                <option value="hotel">🏨 Отель</option>
                <option value="office">🏢 Офис</option>
                <option value="warehouse">📦 Склад</option>
            </select>
        </div>
        
        <div style="margin-bottom: 0.4225rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.169rem; font-weight: bold; font-size: 0.676rem;">Название:</label>
            <input type="text" id="edit-establishment-name" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 0.845px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.4225rem;
                font-size: 0.676rem;
            ">
        </div>
        
        <div style="margin-bottom: 0.4225rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.169rem; font-weight: bold; font-size: 0.676rem;">Доход в час:</label>
            <input type="number" id="edit-establishment-income" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 0.845px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.4225rem;
                font-size: 0.676rem;
            ">
        </div>
        
        <div style="margin-bottom: 0.4225rem;">
            <label style="display: block; color: var(--cream); margin-bottom: 0.169rem; font-weight: bold; font-size: 0.676rem;">Стоимость покупки:</label>
            <input type="number" id="edit-establishment-cost" style="
                width: 100%;
                background: rgba(46, 46, 46, 0.8);
                border: 0.845px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.4225rem;
                font-size: 0.676rem;
            ">
        </div>
        
        <div style="display: flex; gap: 0.4225rem;">
            <button onclick="saveEstablishmentChanges('${establishment.id}')" style="
                background: linear-gradient(45deg, #388e3c, #2e7d32);
                border: 1.69px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.338rem 0.676rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.5915rem;
                border-radius: 3.38px;
                flex: 1;
            ">Сохранить</button>
            <button onclick="handleDeleteEstablishmentClick('${establishment.id}')" style="
                background: linear-gradient(45deg, #d32f2f, #b71c1c);
                border: 1.69px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.338rem 0.676rem;
                cursor: pointer;
                font-weight: bold;
                font-size: 0.5915rem;
                border-radius: 3.38px;
                flex: 1;
            ">Удалить</button>
        </div>
    `;
    
    document.body.appendChild(formDiv);
    
    // Заполняем форму данными заведения
    document.getElementById('edit-establishment-type').value = establishment.type;
    document.getElementById('edit-establishment-name').value = establishment.name;
    document.getElementById('edit-establishment-income').value = establishment.income;
    document.getElementById('edit-establishment-cost').value = establishment.captureCost;
    
    // Добавляем обработчик изменения типа для обновления иконки
    const typeSelect = document.getElementById('edit-establishment-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', function() {
            updateEstablishmentIcon(establishment);
        });
    }
}

// Скрытие формы редактирования заведения
function hideEditEstablishmentForm() {
    const formDiv = document.getElementById('edit-establishment-form');
    if (formDiv) {
        document.body.removeChild(formDiv);
    }
    
    // Сбрасываем состояние подтверждения удаления
    deleteConfirmationState.establishmentId = null;
    deleteConfirmationState.confirmed = false;
}

// Сохранение изменений заведения
function saveEstablishmentChanges(establishmentId) {
    // Проверяем авторизацию администратора
    if (!checkAdminAuth()) {
        return;
    }
    
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Получаем данные из формы
    const newType = document.getElementById('edit-establishment-type').value;
    const newName = document.getElementById('edit-establishment-name').value.trim();
    const newIncome = parseInt(document.getElementById('edit-establishment-income').value) || 100;
    const newCost = parseInt(document.getElementById('edit-establishment-cost').value) || 1000;
    
    if (!newName) {
        showMessage('Введите название заведения!', 'error');
        return;
    }
    
    // Обновляем данные заведения
    establishment.type = newType;
    establishment.name = newName;
    establishment.income = newIncome;
    establishment.captureCost = newCost;
    
    // Обновляем иконку на карте
    updateEstablishmentIcon(establishment);
    
    // Обновляем статистику
    updateMarkupStats();
    
    // Скрываем форму
    hideEditEstablishmentForm();
    
    // Автосохранение
    saveMarkupDataToLocalStorage();
    
    // Обновляем селектор заведений
    if (typeof updateEstablishmentSelector === 'function') {
        updateEstablishmentSelector();
    }
    
    showMessage(`Заведение "${newName}" обновлено!`, 'success');
}

// Обновление иконки заведения
function updateEstablishmentIcon(establishment) {
    if (!establishment.marker) return;
    
    const newColor = getEstablishmentColor(establishment.type);
    const newIcon = getEstablishmentIcon(establishment.type);
    
    // Получаем размер иконки для текущего зума
    const iconSize = getIconSizeForZoom(currentZoom);
    
    // Определяем цвет территории - приоритет у владельца, затем у территории, затем у типа заведения
    const territoryColor = establishment.owner ? establishment.owner.color : 
                          (establishment.territory ? establishment.territory.color : newColor);
    const icon = L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, ${territoryColor}, #ffffff);
                border: 4px solid ${establishment.owner ? establishment.owner.color : 'var(--warm-gold)'};
                border-radius: 50%;
                width: ${iconSize.size}px;
                height: ${iconSize.size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--deep-black);
                font-weight: bold;
                font-size: ${Math.round(iconSize.size * 0.47)}px;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
            ">
                ${newIcon}
            </div>
        `,
        iconSize: [iconSize.size, iconSize.size],
        iconAnchor: [iconSize.anchor, iconSize.anchor],
        className: 'markup-establishment-marker'
    });
    
    // Обновляем иконку маркера
    establishment.marker.setIcon(icon);
}

// Обработка двойного нажатия кнопки удаления
function handleDeleteEstablishmentClick(establishmentId) {
    // Если это первое нажатие или другое заведение
    if (deleteConfirmationState.establishmentId !== establishmentId) {
        deleteConfirmationState.establishmentId = establishmentId;
        deleteConfirmationState.confirmed = false;
        
        // Изменяем текст кнопки
        const deleteBtn = document.querySelector(`button[onclick*="${establishmentId}"]`);
        if (deleteBtn) {
            deleteBtn.textContent = 'Нажмите повторно';
            deleteBtn.style.background = 'linear-gradient(45deg, #ff6b35, #ff8c42)';
        }
        
        showMessage('Нажмите повторно для удаления', 'warning');
        
        // Сбрасываем состояние через 3 секунды
        setTimeout(() => {
            if (deleteConfirmationState.establishmentId === establishmentId && !deleteConfirmationState.confirmed) {
                deleteConfirmationState.establishmentId = null;
                deleteConfirmationState.confirmed = false;
                
                // Восстанавливаем оригинальный вид кнопки
                const deleteBtn = document.querySelector(`button[onclick*="${establishmentId}"]`);
                if (deleteBtn) {
                    deleteBtn.textContent = 'Удалить';
                    deleteBtn.style.background = 'linear-gradient(45deg, #d32f2f, #b71c1c)';
                }
            }
        }, 3000);
        
    } else {
        // Второе нажатие - подтверждение удаления
        deleteConfirmationState.confirmed = true;
        actuallyDeleteEstablishment(establishmentId);
    }
}

// Фактическое удаление заведения
function actuallyDeleteEstablishment(establishmentId) {
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Удаляем маркер с карты
    if (establishment.marker) {
        window.gangsterMap.removeLayer(establishment.marker);
    }
    
    // Удаляем полигон территории если есть
    if (establishment.polygon) {
        window.gangsterMap.removeLayer(establishment.polygon);
    }
    
    // Удаляем из данных
    const index = currentMarkupData.establishments.findIndex(e => e.id === establishmentId);
    if (index > -1) {
        currentMarkupData.establishments.splice(index, 1);
    }
    
    // Обновляем статистику
    updateMarkupStats();
    
    // Скрываем форму редактирования
    hideEditEstablishmentForm();
    
    // Сбрасываем состояние подтверждения
    deleteConfirmationState.establishmentId = null;
    deleteConfirmationState.confirmed = false;
    
    // Автосохранение
    saveMarkupDataToLocalStorage();
    
    // Обновляем селектор заведений
    if (typeof updateEstablishmentSelector === 'function') {
        updateEstablishmentSelector();
    }
    
    showMessage(`Заведение "${establishment.name}" удалено!`, 'success');
}

// Обновление иконки создаваемого заведения при изменении типа
function updateCreatingEstablishmentIcon() {
    if (!currentCreatingEstablishment || !currentCreatingEstablishment.marker) return;
    
    const typeSelect = document.getElementById('new-establishment-type');
    if (!typeSelect) return;
    
    const newType = typeSelect.value;
    const newIcon = getEstablishmentIcon(newType);
    const newColor = getEstablishmentColor(newType);
    
    // Обновляем данные заведения
    currentCreatingEstablishment.type = newType;
    
    // Автоматически генерируем название если поле пустое
    const nameInput = document.getElementById('new-establishment-name');
    if (nameInput && !nameInput.value.trim()) {
        const autoName = generateEstablishmentName(newType);
        currentCreatingEstablishment.name = autoName;
        nameInput.value = autoName;
    }
    
    // Создаем новую иконку
    const territoryColor = currentCreatingEstablishment.territory ? currentCreatingEstablishment.territory.color : newColor;
    const icon = L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, ${territoryColor}, #ffffff);
                border: 4px solid var(--warm-gold);
                border-radius: 50%;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--deep-black);
                font-weight: bold;
                font-size: 21px;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
            ">
                ${newIcon}
            </div>
        `,
        iconSize: [45, 45],
        iconAnchor: [22.5, 22.5],
        className: 'markup-establishment-marker'
    });
    
    // Обновляем иконку маркера
    currentCreatingEstablishment.marker.setIcon(icon);
    
    console.log(`Иконка заведения обновлена на тип: ${newType}`);
}

// Обработчик клика по карте в режиме создания заведения
function onCreateEstablishmentClick(e) {
    if (!isCreateEstablishmentMode) return;
    
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Получаем данные из формы
    const type = document.getElementById('new-establishment-type').value;
    let name = document.getElementById('new-establishment-name').value.trim();
    const income = parseInt(document.getElementById('new-establishment-income').value) || 100;
    const cost = parseInt(document.getElementById('new-establishment-cost').value) || 1000;
    
    // Если название не введено, генерируем автоматически
    if (!name) {
        name = generateEstablishmentName(type);
        document.getElementById('new-establishment-name').value = name;
    }
    
    console.log('onCreateEstablishmentClick:', {
        currentCreatingEstablishment: currentCreatingEstablishment,
        coords: [lat, lng],
        name: name
    });
    
    if (currentCreatingEstablishment) {
        // Если заведение уже создано, перемещаем его
        console.log('Перемещаем существующее заведение');
        currentCreatingEstablishment.coords = [lat, lng];
        
        // Обновляем маркер на карте
        if (currentCreatingEstablishment.marker) {
            currentCreatingEstablishment.marker.setLatLng([lat, lng]);
            console.log('Маркер обновлен на новые координаты');
        } else {
            console.log('Маркер не найден!');
        }
        
        showMessage(`Заведение "${name}" перемещено`, 'info');
    } else {
        // Создаем новое заведение
        console.log('Создаем новое заведение');
    const establishment = {
        id: `admin_${type}_${Date.now()}`,
        name: name,
        type: type,
        coords: [lat, lng],
        income: income,
        captureCost: cost,
            territory: null, // Территория будет создана позже через разметку
            marker: null // Будет установлен после добавления на карту
    };
    
        // Добавляем на карту и получаем маркер
        const marker = addMarkupEstablishment(establishment);
        establishment.marker = marker;
    
    // Добавляем в данные
    currentMarkupData.establishments.push(establishment);
        
        // Сохраняем ссылку на создаваемое заведение
        currentCreatingEstablishment = establishment;
    
    // Обновляем статистику
    updateMarkupStats();
    
        console.log('Заведение создано:', establishment);
        showMessage(`Создано заведение: ${name}. Кликните в другое место для перемещения.`, 'success');
        
        // Показываем кнопку "Завершить"
        const finishBtn = document.getElementById('finish-creation-btn');
        if (finishBtn) {
            finishBtn.style.display = 'block';
        }
    }
}

// Глобальные переменные для интерактивного создания
let isCreatingEstablishment = false;
let tempEstablishmentMarker = null;
let tempEstablishmentArrows = [];
let tempEstablishmentData = null;

// Переменная для отслеживания создаваемого заведения
let currentCreatingEstablishment = null;

// Переменная для отслеживания подтверждения удаления
let deleteConfirmationState = {
    establishmentId: null,
    confirmed: false
};

// Счетчики для автогенерации названий заведений
const establishmentCounters = {
    'pharmacy': 0,
    'restaurant': 0,
    'shop': 0,
    'bar': 0,
    'bank': 0,
    'gas_station': 0,
    'hotel': 0,
    'office': 0,
    'warehouse': 0
};

// Названия типов заведений на русском языке
const establishmentTypeNames = {
    'pharmacy': 'Аптека',
    'restaurant': 'Ресторан',
    'shop': 'Магазин',
    'bar': 'Бар',
    'bank': 'Банк',
    'gas_station': 'АЗС',
    'hotel': 'Отель',
    'office': 'Офис',
    'warehouse': 'Склад'
};

// Создание заведения в интерактивном режиме (для кнопки "Создать здесь")
function createEstablishmentAtPosition() {
    console.log('createEstablishmentAtPosition called');
    console.log('window.gangsterMap:', window.gangsterMap);
    
    if (!window.gangsterMap) {
        console.error('Карта не найдена в window.gangsterMap');
        showMessage('Карта не найдена! Попробуйте обновить страницу.', 'error');
        return;
    }
    
    // Получаем данные из формы
    const type = document.getElementById('new-establishment-type').value;
    const name = document.getElementById('new-establishment-name').value.trim();
    const income = parseInt(document.getElementById('new-establishment-income').value) || 100;
    const cost = parseInt(document.getElementById('new-establishment-cost').value) || 1000;
    
    if (!name) {
        showMessage('Введите название заведения!', 'error');
        return;
    }
    
    if (isCreatingEstablishment) {
        // Если уже в режиме создания, фиксируем заведение в текущей позиции
        finalizeEstablishmentCreation();
        return;
    }
    
    const center = window.gangsterMap.getCenter();
    
    // Начинаем режим создания
    isCreatingEstablishment = true;
    showMessage('Кликните на карте, чтобы разместить заведение, затем нажмите "Создать здесь"', 'info');
    
    // Создаем временный маркер заведения
    const iconSize = getIconSizeForZoom(currentZoom);
    const establishmentColor = getEstablishmentColor(type);
    const establishmentIcon = getEstablishmentIcon(type);
    
    const tempIcon = L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, ${establishmentColor}, #ffffff);
                border: 4px solid var(--warm-gold);
                border-radius: 50%;
                width: ${iconSize.size}px;
                height: ${iconSize.size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--deep-black);
                font-weight: bold;
                font-size: ${Math.round(iconSize.size * 0.47)}px;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
                opacity: 0.8;
            ">
                ${establishmentIcon}
            </div>
        `,
        iconSize: [iconSize.size, iconSize.size],
        iconAnchor: [iconSize.anchor, iconSize.anchor],
        className: 'temp-establishment-marker'
    });
    
    tempEstablishmentMarker = L.marker([center.lat, center.lng], {
        icon: tempIcon,
        draggable: true,
        opacity: 0.8
    }).addTo(window.gangsterMap);
    
    // Добавляем стрелки вокруг маркера
    addMovementArrows(tempEstablishmentMarker);
    
    // Сохраняем данные заведения для создания
    tempEstablishmentData = {
        type: type,
        name: name,
        income: income,
        captureCost: cost
    };
    
    // Добавляем обработчики событий только для перемещения
    window.gangsterMap.on('mousemove', updateTempMarkerPosition);
    window.gangsterMap.on('click', updateTempMarkerPosition);
    window.gangsterMap.on('contextmenu', cancelEstablishmentCreation);
    
    // Изменяем курсор карты
    window.gangsterMap.getContainer().style.cursor = 'crosshair';
    
    // Изменяем текст кнопки на "Создать здесь"
    const createBtn = document.querySelector('button[onclick="createEstablishmentAtPosition()"]');
    if (createBtn) {
        createBtn.innerHTML = 'Создать здесь';
    }
}

// Обновление позиции временного маркера при движении мыши
function updateTempMarkerPosition(e) {
    if (tempEstablishmentMarker && isCreatingEstablishment) {
        tempEstablishmentMarker.setLatLng(e.latlng);
        updateMovementArrows(tempEstablishmentMarker);
    }
}

// Финализация создания заведения
function finalizeEstablishmentCreation(e = null) {
    if (!isCreatingEstablishment || !tempEstablishmentMarker) return;
    
    const coords = e ? e.latlng : tempEstablishmentMarker.getLatLng();
    
    // Создаем финальное заведение
    const establishment = {
        id: `admin_${tempEstablishmentData.type}_${Date.now()}`,
        name: tempEstablishmentData.name,
        type: tempEstablishmentData.type,
        coords: [coords.lat, coords.lng],
        income: tempEstablishmentData.income,
        captureCost: tempEstablishmentData.captureCost,
        territory: null
    };
    
    // Удаляем временный маркер
    window.gangsterMap.removeLayer(tempEstablishmentMarker);
    removeMovementArrows();
    
    // Добавляем финальное заведение на карту
    console.log('Создаем заведение:', establishment);
    addMarkupEstablishment(establishment);
    
    // Добавляем в данные
    currentMarkupData.establishments.push(establishment);
    console.log('Заведение добавлено в currentMarkupData. Всего заведений:', currentMarkupData.establishments.length);
    
    // Обновляем статистику
    updateMarkupStats();
    
    // Очищаем режим создания
    cleanupEstablishmentCreation();
    
    // Очищаем форму
    document.getElementById('new-establishment-name').value = '';
    
    // Автосохранение
    saveMarkupDataToLocalStorage();
    
    // Синхронизация с облаком
    if (window.githubSyncService && window.githubSyncService.githubToken) {
        console.log('Синхронизируем заведения с облаком...');
        window.githubSyncService.syncToGist().then(() => {
            console.log('Заведения синхронизированы с облаком');
        }).catch(error => {
            console.error('Ошибка синхронизации с облаком:', error);
        });
    }
    
    // Обновляем селектор заведений
    if (typeof updateEstablishmentSelector === 'function') {
        updateEstablishmentSelector();
    }
    
    // Дополнительная проверка сохранения
    setTimeout(() => {
        const savedData = localStorage.getItem('gangsters_markup_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log(`Проверка сохранения: в localStorage ${data.establishments.length} заведений`);
        }
    }, 100);
    
    showMessage(`Заведение "${establishment.name}" создано!`, 'success');
}

// Отмена создания заведения
function cancelEstablishmentCreation(e) {
    if (!isCreatingEstablishment) return;
    
    e.preventDefault();
    
    // Удаляем временный маркер
    if (tempEstablishmentMarker) {
        window.gangsterMap.removeLayer(tempEstablishmentMarker);
    }
    removeMovementArrows();
    
    // Очищаем режим создания
    cleanupEstablishmentCreation();
    
    showMessage('Создание заведения отменено', 'info');
}

// Очистка режима создания
function cleanupEstablishmentCreation() {
    isCreatingEstablishment = false;
    tempEstablishmentMarker = null;
    tempEstablishmentData = null;
    
    // Удаляем обработчики событий
    window.gangsterMap.off('mousemove', updateTempMarkerPosition);
    window.gangsterMap.off('click', updateTempMarkerPosition);
    window.gangsterMap.off('contextmenu', cancelEstablishmentCreation);
    
    // Возвращаем обычный курсор
    window.gangsterMap.getContainer().style.cursor = '';
    
    // Возвращаем текст кнопки обратно
    const createBtn = document.querySelector('button[onclick="createEstablishmentAtPosition()"]');
    if (createBtn) {
        createBtn.innerHTML = 'Создать здесь';
    }
}

// Добавление стрелок движения вокруг маркера
function addMovementArrows(marker) {
    const latlng = marker.getLatLng();
    
    // Создаем 4 стрелки (вверх, вниз, влево, вправо)
    const arrowPositions = [
        [latlng.lat + 0.0005, latlng.lng, '↑'], // вверх
        [latlng.lat - 0.0005, latlng.lng, '↓'], // вниз
        [latlng.lat, latlng.lng - 0.0005, '←'], // влево
        [latlng.lat, latlng.lng + 0.0005, '→']  // вправо
    ];
    
    arrowPositions.forEach(([lat, lng, symbol]) => {
        const arrow = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'movement-arrow',
                html: `<div style="
                    background: rgba(212, 175, 55, 0.8);
                    border: 2px solid var(--warm-gold);
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--deep-black);
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">${symbol}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(window.gangsterMap);
        
        tempEstablishmentArrows.push(arrow);
    });
}

// Обновление позиции стрелок
function updateMovementArrows(marker) {
    if (tempEstablishmentArrows.length === 0) return;
    
    const latlng = marker.getLatLng();
    const arrowPositions = [
        [latlng.lat + 0.0005, latlng.lng],
        [latlng.lat - 0.0005, latlng.lng],
        [latlng.lat, latlng.lng - 0.0005],
        [latlng.lat, latlng.lng + 0.0005]
    ];
    
    tempEstablishmentArrows.forEach((arrow, index) => {
        arrow.setLatLng(arrowPositions[index]);
    });
}

// Удаление стрелок движения
function removeMovementArrows() {
    tempEstablishmentArrows.forEach(arrow => {
        window.gangsterMap.removeLayer(arrow);
    });
    tempEstablishmentArrows = [];
}

// Отмена создания заведения
function cancelCreateEstablishment() {
    // Сбрасываем создаваемое заведение
    currentCreatingEstablishment = null;
    
    hideCreateEstablishmentForm();
    disableCreateEstablishmentMode();
    
    // Сбрасываем кнопку
    const button = document.getElementById('create-establishment-btn');
    if (button) {
        button.textContent = '🏢 Создать';
        button.style.background = 'linear-gradient(45deg, var(--steel-blue), var(--midnight-blue))';
    }
    
    showMessage('Создание заведения отменено.', 'info');
}

// Отключение режима создания заведений
function disableCreateEstablishmentMode() {
    isCreateEstablishmentMode = false;
    
    // Убираем обработчики кликов
    if (window.gangsterMap) {
        window.gangsterMap.off('click', onCreateEstablishmentClick);
    }
}

// Переключение режима удаления заведений
function toggleDeleteEstablishmentMode() {
    if (!checkAdminAuth()) {
        showMessage('Доступ запрещен! Требуются права администратора.', 'error');
        return;
    }

    isDeleteEstablishmentMode = !isDeleteEstablishmentMode;
    const button = document.getElementById('delete-establishment-btn');
    
    if (isDeleteEstablishmentMode) {
        button.textContent = '⏹️ Отменить удаление';
        button.style.background = 'linear-gradient(45deg, #2d5016, #1e3a0a)';
        showMessage('Режим удаления включен! Кликните на заведение для удаления.', 'warning');
        
        // Добавляем обработчик кликов для выбора заведений
        if (window.gangsterMap) {
            window.gangsterMap.on('click', onDeleteEstablishmentSelection);
        }
    } else {
        button.textContent = '🗑️ Удалить';
        button.style.background = 'linear-gradient(45deg, var(--concrete), var(--dark-concrete))';
        showMessage('Режим удаления отключен.', 'info');
        
        // Убираем обработчики
        if (window.gangsterMap) {
            window.gangsterMap.off('click', onDeleteEstablishmentSelection);
        }
    }
}

// Обработчик выбора заведения для удаления
function onDeleteEstablishmentSelection(e) {
    if (!isDeleteEstablishmentMode) return;
    
    const clickedLat = e.latlng.lat;
    const clickedLng = e.latlng.lng;
    
    // Ищем ближайшее заведение в радиусе 50 метров
    let nearestEstablishment = null;
    let minDistance = Infinity;
    
    currentMarkupData.establishments.forEach(establishment => {
        const distance = calculateDistance(
            clickedLat, clickedLng,
            establishment.coords[0], establishment.coords[1]
        );
        
        if (distance < 50 && distance < minDistance) {
            minDistance = distance;
            nearestEstablishment = establishment;
        }
    });
    
    if (nearestEstablishment) {
        selectedForDeleteEstablishment = nearestEstablishment;
        showDeleteConfirmation(nearestEstablishment);
    } else {
        showMessage('Выберите заведение для удаления! Кликните рядом с заведением.', 'warning');
    }
}

// Показ подтверждения удаления
function showDeleteConfirmation(establishment) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2500;
        font-family: var(--font-sans);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
            border: 3px solid #ff4757;
            padding: 2rem;
            max-width: 400px;
            text-align: center;
            position: relative;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        ">
            <h3 style="color: #ff4757; font-family: var(--font-serif); margin-bottom: 1rem;">⚠️ Удаление заведения</h3>
            <p style="color: var(--cream); margin-bottom: 0.5rem;"><strong>Название:</strong> ${establishment.name}</p>
            <p style="color: var(--cream); margin-bottom: 0.5rem;"><strong>Тип:</strong> ${establishment.type}</p>
            <p style="color: var(--cream); margin-bottom: 1rem;"><strong>Доход:</strong> $${establishment.income}/час</p>
            
            <div style="background: rgba(255, 71, 87, 0.1); border: 1px solid #ff4757; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
                <p style="color: var(--cream); font-size: 0.9rem; margin: 0;">
                    <strong>Внимание!</strong><br>
                    Это действие нельзя отменить.<br>
                    Заведение и его территория будут удалены навсегда.
                </p>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="confirmDeleteEstablishment('${establishment.id}')" style="
                    background: linear-gradient(45deg, #ff4757, #c44569);
                    border: 2px solid #ff4757;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    border-radius: 4px;
                ">🗑️ Удалить</button>
                <button onclick="cancelDeleteEstablishment()" style="
                    background: linear-gradient(45deg, var(--concrete), var(--dark-concrete));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    border-radius: 4px;
                ">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Подтверждение удаления заведения
function confirmDeleteEstablishment(establishmentId) {
    const establishment = currentMarkupData.establishments.find(e => e.id === establishmentId);
    if (!establishment) return;
    
    // Удаляем с карты
    if (establishment.marker && window.gangsterMap) {
        window.gangsterMap.removeLayer(establishment.marker);
    }
    if (establishment.polygon && window.gangsterMap) {
        window.gangsterMap.removeLayer(establishment.polygon);
    }
    
    // Удаляем из данных
    const index = currentMarkupData.establishments.findIndex(e => e.id === establishmentId);
    if (index > -1) {
        currentMarkupData.establishments.splice(index, 1);
    }
    
    // Обновляем статистику
    updateMarkupStats();
    
    // Закрываем модальное окно
    const modal = document.querySelector('[style*="z-index: 2500"]');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    showMessage(`Заведение "${establishment.name}" удалено!`, 'success');
    
    // Отключаем режим удаления
    toggleDeleteEstablishmentMode();
}

// Отмена удаления заведения
function cancelDeleteEstablishment() {
    const modal = document.querySelector('[style*="z-index: 2500"]');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    selectedForDeleteEstablishment = null;
}

// Переключение режима перемещения заведений
function toggleMoveEstablishmentMode() {
    if (!checkAdminAuth()) {
        showMessage('Доступ запрещен! Требуются права администратора.', 'error');
        return;
    }

    isMoveEstablishmentMode = !isMoveEstablishmentMode;
    const button = document.getElementById('move-establishment-btn');
    
    if (isMoveEstablishmentMode) {
        button.textContent = '⏹️ Отменить перемещение';
        button.style.background = 'linear-gradient(45deg, #2d5016, #1e3a0a)';
        showMessage('Режим перемещения включен! Кликните на заведение для перемещения.', 'info');
        
        // Добавляем обработчик кликов для выбора заведений
        if (window.gangsterMap) {
            window.gangsterMap.on('click', onMoveEstablishmentSelection);
        }
    } else {
        button.textContent = '📌 Переместить';
        button.style.background = 'linear-gradient(45deg, var(--warm-gold), var(--copper))';
        showMessage('Режим перемещения отключен.', 'info');
        
        // Убираем обработчики
        if (window.gangsterMap) {
            window.gangsterMap.off('click', onMoveEstablishmentSelection);
            window.gangsterMap.off('click', onMoveEstablishmentPlacement);
        }
    }
}

// Обработчик выбора заведения для перемещения
function onMoveEstablishmentSelection(e) {
    if (!isMoveEstablishmentMode) return;
    
    const clickedLat = e.latlng.lat;
    const clickedLng = e.latlng.lng;
    
    // Ищем ближайшее заведение в радиусе 50 метров
    let nearestEstablishment = null;
    let minDistance = Infinity;
    
    currentMarkupData.establishments.forEach(establishment => {
        const distance = calculateDistance(
            clickedLat, clickedLng,
            establishment.coords[0], establishment.coords[1]
        );
        
        if (distance < 50 && distance < minDistance) {
            minDistance = distance;
            nearestEstablishment = establishment;
        }
    });
    
    if (nearestEstablishment) {
        selectedForMoveEstablishment = nearestEstablishment;
        
        // Подсвечиваем выбранное заведение
        highlightEstablishmentForMove(nearestEstablishment);
        
        showMessage(`Выбрано заведение: ${nearestEstablishment.name}. Теперь кликните на новое место для перемещения.`, 'success');
        
        // Убираем обработчик выбора и добавляем обработчик размещения
        window.gangsterMap.off('click', onMoveEstablishmentSelection);
        window.gangsterMap.on('click', onMoveEstablishmentPlacement);
    } else {
        showMessage('Выберите заведение для перемещения! Кликните рядом с заведением.', 'warning');
    }
}

// Обработчик размещения заведения на новом месте
function onMoveEstablishmentPlacement(e) {
    if (!selectedForMoveEstablishment) return;
    
    const newLat = e.latlng.lat;
    const newLng = e.latlng.lng;
    
    // Обновляем координаты заведения
    selectedForMoveEstablishment.coords = [newLat, newLng];
    
    // Удаляем старое заведение с карты
    if (selectedForMoveEstablishment.marker && window.gangsterMap) {
        window.gangsterMap.removeLayer(selectedForMoveEstablishment.marker);
    }
    if (selectedForMoveEstablishment.polygon && window.gangsterMap) {
        window.gangsterMap.removeLayer(selectedForMoveEstablishment.polygon);
    }
    
    // Обновляем территорию
    selectedForMoveEstablishment.territory.polygon = generateTerritoryPolygon(
        newLat, newLng, selectedForMoveEstablishment.type
    );
    
    // Добавляем заведение на новом месте
    addMarkupEstablishment(selectedForMoveEstablishment);
    
    showMessage(`Заведение "${selectedForMoveEstablishment.name}" перемещено!`, 'success');
    
    // Отключаем режим перемещения
    toggleMoveEstablishmentMode();
    
    // Сбрасываем выбор
    selectedForMoveEstablishment = null;
}

// Подсветка заведения для перемещения
function highlightEstablishmentForMove(establishment) {
    if (!establishment.marker || !window.gangsterMap) return;
    
    // Создаем временный маркер подсветки
    const highlightMarker = L.circleMarker(establishment.coords, {
        radius: 25,
        fillColor: '#ffff00',
        fillOpacity: 0.3,
        color: '#ffff00',
        weight: 3,
        opacity: 0.8,
        className: 'move-highlight'
    }).addTo(window.gangsterMap);
    
    // Убираем подсветку через 3 секунды
    setTimeout(() => {
        if (window.gangsterMap) {
            window.gangsterMap.removeLayer(highlightMarker);
        }
    }, 3000);
}

// Дублирующая функция удалена - используется основная calculateDistance выше

// Генерация полигона территории
function generateTerritoryPolygon(lat, lng, type) {
    // Размер территории зависит от типа заведения
    const sizeMap = {
        'pharmacy': 0.0005,      // ~50 метров
        'restaurant': 0.0008,    // ~80 метров
        'shop': 0.0006,          // ~60 метров
        'bar': 0.0007,           // ~70 метров
        'bank': 0.001,           // ~100 метров
        'gas_station': 0.0012    // ~120 метров
    };
    
    const size = sizeMap[type] || 0.0005;
    
    return [
        [lat + size, lng - size], // Верхний левый
        [lat + size, lng + size], // Верхний правый
        [lat - size, lng + size], // Нижний правый
        [lat - size, lng - size], // Нижний левый
        [lat + size, lng - size]  // Замыкание
    ];
}

// Получение цвета заведения
function getEstablishmentColor(type) {
    const colorMap = {
        'pharmacy': '#d4af37',
        'restaurant': '#8b2635',
        'shop': '#3a4a5a',
        'bar': '#b87333',
        'bank': '#2d5016',
        'gas_station': '#4a148c',
        'hotel': '#6a1b9a',
        'office': '#1976d2',
        'warehouse': '#388e3c'
    };
    
    return colorMap[type] || '#d4af37';
}

// Добавление заведения на карту
function addMarkupEstablishment(establishment) {
    if (!window.gangsterMap) return null;
    
    // Получаем размер иконки для текущего зума
    const iconSize = getIconSizeForZoom(currentZoom);
    
    // Создаем маркер
    // Определяем цвет территории - приоритет у владельца, затем у территории, затем у типа заведения
    console.log('addMarkupEstablishment - заведение:', establishment.name, 'владелец:', establishment.owner);
    const territoryColor = establishment.owner ? establishment.owner.color : 
                          (establishment.territory ? establishment.territory.color : getEstablishmentColor(establishment.type));
    console.log('addMarkupEstablishment - цвет территории:', territoryColor);
    const icon = L.divIcon({
        html: `
            <div style="
                background: linear-gradient(135deg, ${territoryColor}, #ffffff);
                border: 4px solid ${establishment.owner ? establishment.owner.color : 'var(--warm-gold)'};
                border-radius: 50%;
                width: ${iconSize.size}px;
                height: ${iconSize.size}px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--deep-black);
                font-weight: bold;
                font-size: ${Math.round(iconSize.size * 0.47)}px;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3);
            ">
                ${getEstablishmentIcon(establishment.type)}
            </div>
        `,
        iconSize: [iconSize.size, iconSize.size],
        iconAnchor: [iconSize.anchor, iconSize.anchor],
        className: 'markup-establishment-marker'
    });
    
    const marker = L.marker(establishment.coords, { icon }).addTo(window.gangsterMap);
    
    // Добавляем обработчик кликов на маркер для режима разметки и редактирования
    marker.on('click', function(e) {
        if (isEstablishmentSelectionMode) {
            // Если включен режим выбора заведений, выбираем это заведение
            selectedEstablishment = establishment;
            isEstablishmentSelectionMode = false;
            isPolygonDrawingMode = true;
            
            showTerritoryMarkupNotification(`Рисование территории для: ${establishment.name}. Кликайте по карте для создания многоугольника.`);
            
            // Убираем обработчик выбора заведений
            window.gangsterMap.off('click', onEstablishmentSelection);
            
            // Запускаем режим рисования многоугольника
            startPolygonDrawing();
            
            // Останавливаем всплытие события
            e.originalEvent.stopPropagation();
        } else {
            // Если не в режиме разметки, проверяем авторизацию администратора
            if (checkAdminAuth()) {
                // Показываем форму редактирования только для администратора
                showEditEstablishmentForm(establishment);
            } else {
                // Для обычных пользователей показываем popup с кнопками захвата и покупки
                showCapturePopup(establishment);
            }
            
            // Останавливаем всплытие события
            e.originalEvent.stopPropagation();
        }
    });
    
    // Создаем полигон территории только если он есть
    let polygon = null;
    if (establishment.territory && establishment.territory.polygon) {
        polygon = L.polygon(establishment.territory.polygon, {
            fillColor: establishment.territory.color,
            fillOpacity: establishment.territory.opacity,
            color: establishment.territory.color,
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 5',
            className: 'markup-territory-polygon'
        }).addTo(window.gangsterMap);
        
        // Добавляем обработчик клика для территории в режиме игрока
        polygon.on('click', function(e) {
            // Проверяем, что мы не в режиме администратора
            const user = typeof currentUser === 'function' ? currentUser() : currentUser;
            if (user && user.name === 'admin') {
                return; // Админ не может захватывать территории
            }
            
            // Показываем popup с кнопкой захвата (без изменения масштаба карты)
            showCapturePopup(establishment);
            
            // Останавливаем всплытие события
            e.originalEvent.stopPropagation();
        });
    }
    
    // Popup теперь показывается через showCapturePopup() при клике
    
    // Восстанавливаем имя владельца на территории если есть
    if (establishment.owner && establishment.polygon) {
        addOwnerLabelToTerritory(establishment);
    }
    
    // Сохраняем ссылки
    establishment.marker = marker;
    establishment.polygon = polygon;
    
    return marker;
}

// Получение иконки заведения
function getEstablishmentIcon(type) {
    const iconMap = {
        'pharmacy': '🏥',
        'restaurant': '🍽️',
        'shop': '🛍️',
        'bar': '🍸',
        'bank': '🏦',
        'gas_station': '⛽',
        'hotel': '🏨',
        'office': '🏢',
        'warehouse': '📦'
    };
    
    return iconMap[type] || '📍';
}

// Обновление статистики
function updateMarkupStats() {
    const statsContainer = document.getElementById('markup-stats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <p>Заведений: ${currentMarkupData.establishments.length}</p>
        <p>Территорий: ${currentMarkupData.territories.length}</p>
        <p>Районов: ${currentMarkupData.districts.length}</p>
    `;
}

// Сохранение данных разметки в localStorage
function saveMarkupDataToLocalStorage() {
    try {
        console.log('Сохраняем данные разметки...', currentMarkupData);
        
        const dataToSave = {
            establishments: currentMarkupData.establishments.map(establishment => {
                console.log('Сохраняем заведение:', establishment.name, 'Территория:', establishment.territory);
                return {
                    id: establishment.id,
                    name: establishment.name,
                    type: establishment.type,
                    coords: establishment.coords,
                    income: establishment.income,
                    captureCost: establishment.captureCost,
                    owner: establishment.owner,
                    territory: establishment.territory,
                    // Не сохраняем DOM элементы
                    marker: null,
                    polygon: null,
                    tempPointMarkers: null
                };
            }),
            territories: currentMarkupData.territories || []
        };
        
        console.log('Данные для сохранения:', dataToSave);
        console.log('Заведения с владельцами:', dataToSave.establishments.filter(e => e.owner));
        
        // Сохраняем в localStorage
        localStorage.setItem('gangsters_markup_data', JSON.stringify(dataToSave));
        
        // Также сохраняем в глобальную переменную для синхронизации
        window.currentMarkupData = currentMarkupData;
        
        console.log(`Данные разметки сохранены в localStorage. Заведений: ${dataToSave.establishments.length}, с владельцами: ${dataToSave.establishments.filter(e => e.owner).length}`);
        
        // Показываем уведомление
        if (typeof showMessage === 'function') {
            showMessage(`Сохранено ${dataToSave.establishments.length} заведений`, 'success');
        }
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
        if (typeof showMessage === 'function') {
            showMessage('Ошибка сохранения данных', 'error');
        }
    }
}

// Загрузка данных разметки из localStorage
function loadMarkupDataFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('gangsters_markup_data');
        console.log('Загружаем данные из localStorage:', savedData);
        
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log('Распарсенные данные:', data);
            
            // Восстанавливаем заведения
            if (data.establishments && Array.isArray(data.establishments)) {
                console.log(`Найдено ${data.establishments.length} заведений для загрузки`);
                
                // Очищаем существующие заведения
                if (currentMarkupData.establishments) {
                    currentMarkupData.establishments.forEach(establishment => {
                        if (establishment.marker && window.gangsterMap) {
                            window.gangsterMap.removeLayer(establishment.marker);
                        }
                        if (establishment.polygon && window.gangsterMap) {
                            window.gangsterMap.removeLayer(establishment.polygon);
                        }
                    });
                }
                currentMarkupData.establishments = [];
                
                data.establishments.forEach(establishmentData => {
                    // Создаем маркер на карте
                    if (window.gangsterMap && establishmentData.coords) {
                        console.log('Восстанавливаем заведение:', establishmentData.name, 'Владелец:', establishmentData.owner);
                        
                        // Проверяем, есть ли владелец
                        if (establishmentData.owner) {
                            console.log('Заведение имеет владельца:', establishmentData.owner.name, 'Цвет:', establishmentData.owner.color);
                        }
                        
                        // Добавляем заведение в текущие данные
                        currentMarkupData.establishments.push(establishmentData);
                        
                        // Создаем маркер на карте
                        addMarkupEstablishment(establishmentData);
                        
                        // Восстанавливаем полигон территории если есть
                        console.log('Проверяем территорию для заведения:', establishmentData.name, 'Территория:', establishmentData.territory);
                        if (establishmentData.territory && establishmentData.territory.polygon) {
                            console.log('Восстанавливаем полигон территории для:', establishmentData.name);
                            const lastEstablishment = currentMarkupData.establishments[currentMarkupData.establishments.length - 1];
                            if (lastEstablishment) {
                                // Создаем полигон территории
                                const territoryPolygon = L.polygon(establishmentData.territory.polygon, {
                                    fillColor: establishmentData.territory.color,
                                    fillOpacity: establishmentData.territory.opacity || 0.3,
                                    color: establishmentData.territory.color,
                                    weight: 2,
                                    opacity: 0.8,
                                    className: 'final-territory-polygon'
                                }).addTo(window.gangsterMap);
                                
                                // Сохраняем ссылку на полигон
                                lastEstablishment.polygon = territoryPolygon;
                                
                                // Восстанавливаем имя владельца на территории если есть
                                if (establishmentData.owner) {
                                    addOwnerLabelToTerritory(lastEstablishment);
                                }
                                
                                console.log('Полигон территории восстановлен для:', establishmentData.name);
                            }
                        } else {
                            console.log('Нет территории для заведения:', establishmentData.name);
                        }
                    }
                });
                
                updateMarkupStats();
                
                // Обновляем селектор заведений
                if (typeof updateEstablishmentSelector === 'function') {
                    updateEstablishmentSelector();
                }
                
                if (data.establishments.length > 0) {
                    showMessage(`Загружено ${data.establishments.length} заведений`, 'success');
                }
                console.log('Данные разметки загружены из localStorage');
                
                // Обновляем глобальную переменную для синхронизации
                window.currentMarkupData = currentMarkupData;
            }
        } else {
            console.log('Нет сохраненных данных разметки');
        }
    } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error);
        if (typeof showMessage === 'function') {
            showMessage('Ошибка загрузки данных', 'error');
        }
    }
}

// Сохранение данных разметки
function saveMarkupData() {
    const dataStr = JSON.stringify(currentMarkupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'moscow_territories_markup.json';
    link.click();
    
    showMessage('Данные разметки сохранены!', 'success');
}

// Загрузка данных разметки
function loadMarkupData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                currentMarkupData = data;
                
                // Очищаем карту от предыдущих данных
                clearMarkupFromMap();
                
                // Добавляем новые данные на карту
                data.establishments.forEach(establishment => {
                    addMarkupEstablishment(establishment);
                });
                
                updateMarkupStats();
                showMessage('Данные разметки загружены!', 'success');
            } catch (error) {
                showMessage('Ошибка загрузки файла!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Экспорт данных
function exportMarkupData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        admin: 'admin',
        version: '1.0',
        data: currentMarkupData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `moscow_territories_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showMessage('Данные экспортированы!', 'success');
}

// Очистка всех данных разметки
function clearAllMarkup() {
    if (confirm('Вы уверены, что хотите очистить все данные разметки?')) {
        clearMarkupFromMap();
        currentMarkupData = {
            establishments: [],
            territories: [],
            districts: []
        };
        updateMarkupStats();
        
        // Автосохранение
        saveMarkupDataToLocalStorage();
        
        showMessage('Все данные разметки очищены!', 'success');
    }
}

// Очистка данных с карты
function clearMarkupFromMap() {
    if (!window.gangsterMap) return;
    
    // Удаляем все маркеры и полигоны разметки
    window.gangsterMap.eachLayer(function(layer) {
        if (layer instanceof L.Marker && layer.options.icon && 
            layer.options.icon.options.className === 'markup-establishment-marker') {
            window.gangsterMap.removeLayer(layer);
        }
        if (layer instanceof L.Polygon && 
            layer.options.className === 'markup-territory-polygon') {
            window.gangsterMap.removeLayer(layer);
        }
    });
}

// Админ-панель удалена - все функции перенесены на верхний бар

// Показать уведомление о разметке территории
function showTerritoryMarkupNotification(message) {
    // Удаляем старое уведомление
    hideTerritoryMarkupNotification();
    
    const notification = document.createElement('div');
    notification.id = 'territory-markup-notification';
    
    // Вычисляем позицию с учетом стека сообщений (снизу вверх)
    const bottomPosition = 20 + (window.messageStack || 0) * 60; // 60px между сообщениями
    
    notification.style.cssText = `
        position: fixed;
        bottom: ${bottomPosition}px;
        left: 20px;
        background: linear-gradient(135deg, var(--brick-red), var(--dark-brick));
        border: 1px solid var(--warm-gold);
        padding: 0.375rem 0.75rem;
        border-radius: 4px;
        color: var(--cream);
        font-family: var(--font-sans);
        font-weight: bold;
        font-size: 0.45rem;
        z-index: 1500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 250px;
        animation: slideInLeft 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🎯</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
}

// Скрыть уведомление о разметке территории
function hideTerritoryMarkupNotification() {
    const notification = document.getElementById('territory-markup-notification');
    if (notification) {
        notification.remove();
    }
}

// Экспорт функций
window.toggleMarkupMode = toggleMarkupMode;
window.toggleCreateEstablishmentMode = toggleCreateEstablishmentMode;
window.toggleDeleteEstablishmentMode = toggleDeleteEstablishmentMode;
window.toggleMoveEstablishmentMode = toggleMoveEstablishmentMode;
window.createEstablishmentAtPosition = createEstablishmentAtPosition;
window.onCreateEstablishmentClick = onCreateEstablishmentClick;
window.cancelCreateEstablishment = cancelCreateEstablishment;
window.finishEstablishmentCreation = finishEstablishmentCreation;
window.updateCreatingEstablishmentIcon = updateCreatingEstablishmentIcon;
window.showEditEstablishmentForm = showEditEstablishmentForm;
window.hideEditEstablishmentForm = hideEditEstablishmentForm;
window.saveEstablishmentChanges = saveEstablishmentChanges;
window.updateEstablishmentIcon = updateEstablishmentIcon;
window.handleDeleteEstablishmentClick = handleDeleteEstablishmentClick;
window.actuallyDeleteEstablishment = actuallyDeleteEstablishment;
window.confirmDeleteEstablishment = confirmDeleteEstablishment;
window.cancelDeleteEstablishment = cancelDeleteEstablishment;
window.saveMarkupData = saveMarkupData;
window.loadMarkupData = loadMarkupData;
window.saveMarkupDataToLocalStorage = saveMarkupDataToLocalStorage;
window.loadMarkupDataFromLocalStorage = loadMarkupDataFromLocalStorage;
window.exportMarkupData = exportMarkupData;
window.clearAllMarkup = clearAllMarkup;
window.finishPolygon = finishPolygon;
window.cancelPolygon = cancelPolygon;
window.showTerritoryMarkupNotification = showTerritoryMarkupNotification;
window.hideTerritoryMarkupNotification = hideTerritoryMarkupNotification;
window.showCapturePopup = showCapturePopup;

// Функция создания тестовых заведений
function createTestEstablishments() {
    const testEstablishments = [
        {
            id: 'test_1',
            name: 'Ресторан "Москва"',
            type: 'restaurant',
            coords: [55.7558, 37.6176],
            income: 5000,
            captureCost: 10000,
            owner: null
        },
        {
            id: 'test_2',
            name: 'Бар "Красная площадь"',
            type: 'bar',
            coords: [55.7539, 37.6208],
            income: 3000,
            captureCost: 8000,
            owner: null
        },
        {
            id: 'test_3',
            name: 'Казино "Арбат"',
            type: 'casino',
            coords: [55.7522, 37.5914],
            income: 8000,
            captureCost: 15000,
            owner: null
        },
        {
            id: 'test_4',
            name: 'Ночной клуб "Тверская"',
            type: 'nightclub',
            coords: [55.7616, 37.6094],
            income: 6000,
            captureCost: 12000,
            owner: null
        }
    ];
    
    // Добавляем заведения в текущие данные
    testEstablishments.forEach(establishment => {
        currentMarkupData.establishments.push(establishment);
        addMarkupEstablishment(establishment);
    });
    
    // Сохраняем данные
    saveMarkupDataToLocalStorage();
    
    // Обновляем селектор заведений
    if (typeof updateEstablishmentSelector === 'function') {
        updateEstablishmentSelector();
    }
    
    console.log('Создано тестовых заведений:', testEstablishments.length);
    showMessage(`Создано ${testEstablishments.length} тестовых заведений`, 'success');
}

window.createTestEstablishments = createTestEstablishments;

// Функция для принудительной загрузки данных (для отладки)
function forceLoadMarkupData() {
    console.log('Принудительная загрузка данных разметки...');
    if (window.gangsterMap) {
        loadMarkupDataFromLocalStorage();
        console.log('Данные загружены');
    } else {
        console.log('Карта не найдена');
    }
}

// Функция для проверки состояния данных
function checkMarkupDataStatus() {
    const markupData = localStorage.getItem('gangsters_markup_data');
    console.log('Данные в localStorage:', markupData ? JSON.parse(markupData) : 'Нет данных');
    console.log('Текущие данные в памяти:', currentMarkupData);
    console.log('Количество заведений в памяти:', currentMarkupData.establishments.length);
}

// Функция для принудительной синхронизации с облаком
async function forceCloudSync() {
    console.log('Принудительная синхронизация с облаком...');
    if (window.githubSyncService && window.githubSyncService.githubToken) {
        try {
            // Сначала сохраняем локальные данные
            saveMarkupDataToLocalStorage();
            
            // Затем синхронизируем с облаком
            await window.githubSyncService.syncToGist();
            console.log('Данные синхронизированы с облаком');
            
            // Показываем уведомление
            if (typeof showMessage === 'function') {
                showMessage('Данные синхронизированы с облаком', 'success');
            }
        } catch (error) {
            console.error('Ошибка синхронизации с облаком:', error);
            if (typeof showMessage === 'function') {
                showMessage('Ошибка синхронизации с облаком', 'error');
            }
        }
    } else {
        console.log('Нет токена GitHub для синхронизации');
        if (typeof showMessage === 'function') {
            showMessage('Нет токена GitHub для синхронизации', 'error');
        }
    }
}

// Функция для принудительной загрузки данных при взаимодействии
function ensureDataLoaded() {
    if (currentMarkupData.establishments.length === 0) {
        console.log('Данные не загружены, принудительно загружаем...');
        loadMarkupDataFromLocalStorage();
    }
}

// Добавляем обработчики событий для принудительной загрузки
document.addEventListener('click', function() {
    setTimeout(ensureDataLoaded, 100);
});

document.addEventListener('keydown', function() {
    setTimeout(ensureDataLoaded, 100);
});

window.forceLoadMarkupData = forceLoadMarkupData;
window.checkMarkupDataStatus = checkMarkupDataStatus;
window.forceCloudSync = forceCloudSync;
window.ensureDataLoaded = ensureDataLoaded;
window.calculateDistance = calculateDistance;
window.attemptCapture = attemptCapture;
window.attemptBuy = attemptBuy;
window.updateAllEstablishmentIcons = updateAllEstablishmentIcons;
window.getIconSizeForZoom = getIconSizeForZoom;
window.updateEstablishmentVisualization = updateEstablishmentVisualization;
window.addOwnerLabelToTerritory = addOwnerLabelToTerritory;
window.attemptSellEstablishment = attemptSellEstablishment;
window.showEstablishmentInfo = showEstablishmentInfo;

// Функция для тестирования сохранения владения
function testOwnershipSaving() {
    console.log('=== ТЕСТ СОХРАНЕНИЯ ВЛАДЕНИЯ ===');
    console.log('Текущие заведения:', currentMarkupData.establishments);
    console.log('Заведения с владельцами:', currentMarkupData.establishments.filter(e => e.owner));
    
    // Проверяем localStorage
    const savedData = localStorage.getItem('gangsters_markup_data');
    if (savedData) {
        const data = JSON.parse(savedData);
        console.log('Данные в localStorage:', data);
        console.log('Заведения с владельцами в localStorage:', data.establishments.filter(e => e.owner));
    } else {
        console.log('Нет данных в localStorage');
    }
    
    // Проверяем текущего пользователя
    const user = typeof currentUser === 'function' ? currentUser() : currentUser;
    console.log('Текущий пользователь:', user);
}

window.testOwnershipSaving = testOwnershipSaving;
