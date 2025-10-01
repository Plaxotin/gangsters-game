// Leaflet карта с OpenStreetMap для проекта Gangsters
// Максимальные возможности кастомизации

// Настройки винтажной темы для Leaflet
const vintageMapStyle = {
    // Основные цвета
    colors: {
        background: '#f4f1eb',
        water: '#9ca89a',
        buildings: '#c4b896',
        roads: {
            primary: '#8b7355',
            secondary: '#a0957a',
            minor: '#b5a68a'
        },
        text: '#5d4e37',
        parks: '#aab6c0'
    },
    
    // Настройки зданий
    buildings: {
        fillColor: '#c4b896',
        fillOpacity: 0.8,
        strokeColor: '#8b7355',
        strokeWidth: 1,
        strokeOpacity: 0.6
    },
    
    // Настройки дорог
    roads: {
        primary: {
            color: '#8b7355',
            weight: 3,
            opacity: 0.8
        },
        secondary: {
            color: '#a0957a',
            weight: 2,
            opacity: 0.7
        },
        minor: {
            color: '#b5a68a',
            weight: 1,
            opacity: 0.6
        }
    },
    
    // Настройки текста
    text: {
        fontFamily: 'Libre Baskerville, serif',
        fontSize: '12px',
        fontWeight: 'normal',
        color: '#5d4e37'
    }
};

// Инициализация Leaflet карты
function initLeafletMap() {
    // Создаем карту с центром на точных координатах района с аптеками
    const map = L.map('game-map').setView([55.802829386823106, 37.34818120097642], 16);
    
    // Сохраняем карту в глобальной переменной для доступа из других скриптов
    window.gangsterMap = map;
    
    // Добавляем базовый слой OpenStreetMap с кастомной стилизацией
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        className: 'vintage-map-tiles'
    }).addTo(map);
    
    // Применяем винтажные фильтры через CSS
    applyVintageFilters();
    
    // Добавляем кастомные стили для элементов карты
    addCustomMapStyles();
    
    // Загружаем данные зданий Москвы
    loadMoscowBuildings(map);
    
    // Добавляем заведения для игры
    addGameVenues(map);
    
    // Добавляем маркер игрока
    addPlayerMarker(map);
    
    // Добавляем обработчик изменения зума для масштабирования иконок заведений
    map.on('zoomend', function() {
        const zoom = map.getZoom();
        // Вызываем функцию обновления иконок из admin-tools.js если она доступна
        if (typeof window.updateAllEstablishmentIcons === 'function') {
            window.updateAllEstablishmentIcons(zoom);
        }
    });
    
    return map;
}

// Применение винтажных CSS фильтров
function applyVintageFilters() {
    const style = document.createElement('style');
    style.textContent = `
        .vintage-map-tiles {
            filter: sepia(0.4) saturate(0.6) contrast(1.2) brightness(0.85) hue-rotate(15deg);
        }
        
        .leaflet-tile {
            filter: sepia(0.4) saturate(0.6) contrast(1.2) brightness(0.85) hue-rotate(15deg);
        }
        
        .leaflet-popup-content {
            font-family: 'Libre Baskerville', serif;
            color: #5d4e37;
            background: linear-gradient(135deg, #f4f1eb, #e7dfd4);
            border: 2px solid #8b7355;
        }
        
        .leaflet-popup-tip {
            background: #f4f1eb;
            border: 2px solid #8b7355;
        }
        
        .leaflet-control {
            background: rgba(244, 241, 235, 0.9);
            border: 2px solid #8b7355;
        }
        
        .leaflet-control a {
            color: #5d4e37;
            font-family: 'Libre Baskerville', serif;
        }
        
        /* Винтажные метки владельцев территорий */
        .vintage-owner-label {
            pointer-events: none !important;
        }
        
        .vintage-owner-label div {
            font-family: 'Libre Baskerville', 'Times New Roman', serif !important;
            font-style: italic !important;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7) !important;
            backdrop-filter: blur(3px) !important;
        }
        
        /* Пунктирная линия для имен владельцев */
        .owner-dashed-line {
            stroke-dasharray: 5, 5 !important;
            stroke-width: 2px !important;
            opacity: 0.7 !important;
        }
    `;
    document.head.appendChild(style);
}

// Добавление кастомных стилей карты
function addCustomMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Винтажные стили для элементов карты */
        .vintage-map-container {
            background: #f4f1eb;
            position: relative;
        }
        
        .vintage-map-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 3px,
                    rgba(139, 38, 53, 0.015) 3px,
                    rgba(139, 38, 53, 0.015) 6px
                ),
                repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 3px,
                    rgba(212, 175, 55, 0.015) 3px,
                    rgba(212, 175, 55, 0.015) 6px
                );
            pointer-events: none;
            z-index: 1000;
            opacity: 0.3;
        }
        
        /* Стили для маркеров заведений */
        .vintage-marker {
            background: linear-gradient(135deg, #d4af37, #b87333);
            border: 2px solid #8b2635;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f4f1eb;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .vintage-marker.restaurant {
            background: linear-gradient(135deg, #8b2635, #5c1a23);
        }
        
        .vintage-marker.bar {
            background: linear-gradient(135deg, #d4af37, #b87333);
        }
        
        .vintage-marker.shop {
            background: linear-gradient(135deg, #3a4a5a, #2a3a4a);
        }
        
        /* Стили для всплывающих окон */
        .vintage-popup {
            font-family: 'Libre Baskerville', serif;
            background: linear-gradient(135deg, #f4f1eb, #e7dfd4);
            border: 2px solid #8b7355;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .vintage-popup h3 {
            color: #8b2635;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid #8b7355;
            padding-bottom: 4px;
        }
        
        .vintage-popup p {
            color: #5d4e37;
            margin: 4px 0;
        }
        
        .vintage-button {
            background: linear-gradient(45deg, #8b2635, #5c1a23);
            border: 2px solid #d4af37;
            color: #f4f1eb;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: bold;
            text-transform: uppercase;
            transition: all 0.3s ease;
            margin-top: 8px;
            border-radius: 4px;
        }
        
        .vintage-button:hover {
            background: linear-gradient(45deg, #d4af37, #b87333);
            color: #1a1a1a;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Загрузка данных зданий Москвы
function loadMoscowBuildings(map) {
    // Используем Overpass API для получения данных зданий
    const overpassUrl = 'https://overpass-api.de/api/interpreter';
    const query = `
        [out:json][timeout:25];
        (
          way["building"](55.5,37.3,55.9,38.0);
          relation["building"](55.5,37.3,55.9,38.0);
        );
        out geom;
    `;
    
    fetch(overpassUrl, {
        method: 'POST',
        body: query
    })
    .then(response => response.json())
    .then(data => {
        // Создаем GeoJSON из данных OSM
        const buildings = {
            type: 'FeatureCollection',
            features: data.elements.map(element => ({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [element.geometry.map(coord => [coord.lon, coord.lat])]
                },
                properties: {
                    id: element.id,
                    type: element.tags.building || 'building',
                    name: element.tags.name || ''
                }
            }))
        };
        
        // Добавляем здания на карту с винтажной стилизацией
        const buildingsLayer = L.geoJSON(buildings, {
            style: function(feature) {
                return {
                    fillColor: vintageMapStyle.buildings.fillColor,
                    fillOpacity: vintageMapStyle.buildings.fillOpacity,
                    color: vintageMapStyle.buildings.strokeColor,
                    weight: vintageMapStyle.buildings.strokeWidth,
                    opacity: vintageMapStyle.buildings.strokeOpacity
                };
            }
        }).addTo(map);
        
        console.log(`Загружено ${buildings.features.length} зданий Москвы`);
    })
    .catch(error => {
        console.error('Ошибка загрузки зданий:', error);
        // Fallback: добавляем примеры зданий
        addSampleBuildings(map);
    });
}

// Добавление примеров зданий (fallback)
function addSampleBuildings(map) {
    const sampleBuildings = [
        {
            coords: [[55.7558, 37.6176], [55.7559, 37.6176], [55.7559, 37.6177], [55.7558, 37.6177], [55.7558, 37.6176]],
            name: 'Red Square Building'
        },
        {
            coords: [[55.7522, 37.6156], [55.7523, 37.6156], [55.7523, 37.6157], [55.7522, 37.6157], [55.7522, 37.6156]],
            name: 'GUM Building'
        }
    ];
    
    sampleBuildings.forEach(building => {
        const polygon = L.polygon(building.coords, {
            fillColor: vintageMapStyle.buildings.fillColor,
            fillOpacity: vintageMapStyle.buildings.fillOpacity,
            color: vintageMapStyle.buildings.strokeColor,
            weight: vintageMapStyle.buildings.strokeWidth,
            opacity: vintageMapStyle.buildings.strokeOpacity
        }).addTo(map);
        
        if (building.name) {
            polygon.bindPopup(`<div class="vintage-popup"><h3>${building.name}</h3><p>Building available for capture</p></div>`);
        }
    });
}

// Добавление заведений для игры (базовые заведения, если система территорий не загружена)
function addGameVenues(map) {
    // Эта функция теперь используется только как fallback
    // Основные заведения управляются через систему территорий
    console.log('Using fallback venues - territory system should handle establishments');
}

// Добавление маркера игрока
function addPlayerMarker(map) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const playerCoords = [position.coords.latitude, position.coords.longitude];
            
            const playerIcon = L.divIcon({
                html: '<div class="vintage-marker" style="background: linear-gradient(135deg, #3a4a5a, #2a3a4a);">P</div>',
                iconSize: [25, 25],
                iconAnchor: [12, 12],
                className: 'vintage-player-icon'
            });
            
            const playerMarker = L.marker(playerCoords, { icon: playerIcon }).addTo(map);
            
            // Создаем popup с актуальной информацией об игроке
            const createPlayerPopup = () => {
                const user = typeof currentUser === 'function' ? currentUser() : currentUser;
                
                if (!user) {
                    return `
                        <div class="vintage-popup">
                            <h3>Your Location</h3>
                            <p><strong>Status:</strong> <span style="color: #ff9800;">Not logged in</span></p>
                            <p><em>Login to see your stats</em></p>
                        </div>
                    `;
                }
                
                const money = user.money || 0;
                const totalIncome = user.totalIncome || 0;
                const territories = user.territories ? user.territories.length : 0;
                const clan = user.clan || 'No clan';
                const status = user.name === 'admin' ? 'Administrator' : 'Player';
                
                return `
                    <div class="vintage-popup">
                        <h3>${user.name}</h3>
                        <p><strong>Status:</strong> <span style="color: ${user.name === 'admin' ? '#9c27b0' : '#4caf50'};">${status}</span></p>
                        <p><strong>Money:</strong> $${money.toLocaleString()}</p>
                        <p><strong>Income/hour:</strong> $${totalIncome}</p>
                        <p><strong>Establishments:</strong> ${territories}</p>
                        <p><strong>Clan:</strong> ${clan}</p>
                    </div>
                `;
            };
            
            playerMarker.bindPopup(createPlayerPopup());
            
            // Обновляем popup при изменениях пользователя
            playerMarker.on('popupopen', function() {
                playerMarker.setPopupContent(createPlayerPopup());
            });
            
            // Устанавливаем центр карты на район аптек, если игрок далеко
            const pharmacyCenter = [55.802829386823106, 37.34818120097642];
            const distance = Math.sqrt(
                Math.pow(playerCoords[0] - pharmacyCenter[0], 2) + 
                Math.pow(playerCoords[1] - pharmacyCenter[1], 2)
            );
            
            if (distance > 0.01) { // Если игрок далеко от района аптек
                map.setView(pharmacyCenter, 16); // Показываем район аптек
            } else {
                map.setView(playerCoords, 16); // Показываем позицию игрока
            }
        });
    }
}

// Функция захвата территории
window.attemptCapture = function(venueName) {
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
        z-index: 1000;
        font-family: var(--font-sans);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
            border: 3px solid var(--warm-gold);
            padding: 2rem;
            max-width: 500px;
            text-align: center;
            position: relative;
        ">
            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 2px solid var(--warm-gold); border-right: 2px solid var(--warm-gold); clip-path: polygon(0 0, 100% 0, 100% 100%);"></div>
            
            <h3 style="color: var(--warm-gold); font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 1rem;">Territory Capture</h3>
            <p style="color: var(--cream); margin-bottom: 1.5rem;">Attempting to capture: <strong>${venueName}</strong></p>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button onclick="confirmCapture('${venueName}')" style="
                    background: linear-gradient(45deg, var(--brick-red), var(--dark-brick));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                ">Confirm Capture</button>
                <button onclick="closeModal()" style="
                    background: linear-gradient(45deg, var(--steel-blue), var(--midnight-blue));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.closeModal = function() {
        document.body.removeChild(modal);
    };
    
    window.confirmCapture = function(venue) {
        document.body.removeChild(modal);
        
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
            <div style="color: var(--warm-gold); font-weight: bold;">🎯 Territory Captured!</div>
            <div style="font-size: 0.9rem; margin-top: 0.5rem;">${venue} is now under your control</div>
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 3000);
    };
};
