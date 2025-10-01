// Расширенные возможности кастомизации карты для проекта Gangsters
// Полный контроль над стилями, цветами, шрифтами и элементами

// Глобальные настройки темы
const gangsterMapTheme = {
    // Основная цветовая палитра 1920-х годов
    colors: {
        // Фон и земля
        background: '#f4f1eb',
        land: '#f0ebe0',
        
        // Вода
        water: '#9ca89a',
        waterOutline: '#7a8475',
        
        // Здания
        buildings: {
            residential: '#c4b896',
            commercial: '#d4c4a8',
            industrial: '#b8a896',
            historic: '#e2d3b5'
        },
        
        // Дороги
        roads: {
            highway: '#8b7355',
            primary: '#9a8570',
            secondary: '#a0957a',
            tertiary: '#b5a68a',
            residential: '#c4b896'
        },
        
        // Парки и зелень
        parks: '#aab6c0',
        forests: '#9db5a8',
        grass: '#b5c4b0',
        
        // Текст
        text: {
            primary: '#5d4e37',
            secondary: '#8b7355',
            accent: '#8b2635'
        }
    },
    
    // Настройки шрифтов
    fonts: {
        primary: 'Libre Baskerville, serif',
        secondary: 'Montserrat, sans-serif',
        sizes: {
            small: '10px',
            normal: '12px',
            large: '14px',
            title: '16px'
        }
    },
    
    // Настройки прозрачности
    opacity: {
        buildings: 0.8,
        roads: 0.7,
        water: 0.9,
        parks: 0.6,
        text: 0.9
    }
};

// Функция применения кастомной темы
function applyCustomTheme(map, theme = gangsterMapTheme) {
    // Применяем CSS стили
    applyThemeStyles(theme);
    
    // Применяем стили к элементам карты
    applyMapElementStyles(map, theme);
    
    // Обновляем существующие слои
    updateMapLayers(map, theme);
}

// Применение CSS стилей темы
function applyThemeStyles(theme) {
    const styleId = 'gangster-map-theme';
    let existingStyle = document.getElementById(styleId);
    if (existingStyle) {
        existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        /* Основные стили карты */
        .leaflet-container {
            background: ${theme.colors.background} !important;
            font-family: ${theme.fonts.primary} !important;
        }
        
        /* Стили тайлов */
        .leaflet-tile {
            filter: sepia(0.4) saturate(0.6) contrast(1.2) brightness(0.85) hue-rotate(15deg);
        }
        
        /* Стили зданий */
        .building-polygon {
            fill: ${theme.colors.buildings.residential};
            fill-opacity: ${theme.opacity.buildings};
            stroke: ${theme.colors.roads.primary};
            stroke-width: 1;
            stroke-opacity: 0.6;
        }
        
        .building-commercial {
            fill: ${theme.colors.buildings.commercial};
        }
        
        .building-industrial {
            fill: ${theme.colors.buildings.industrial};
        }
        
        .building-historic {
            fill: ${theme.colors.buildings.historic};
        }
        
        /* Стили дорог */
        .road-highway {
            stroke: ${theme.colors.roads.highway};
            stroke-width: 4;
            stroke-opacity: ${theme.opacity.roads};
        }
        
        .road-primary {
            stroke: ${theme.colors.roads.primary};
            stroke-width: 3;
            stroke-opacity: ${theme.opacity.roads};
        }
        
        .road-secondary {
            stroke: ${theme.colors.roads.secondary};
            stroke-width: 2;
            stroke-opacity: ${theme.opacity.roads};
        }
        
        .road-tertiary {
            stroke: ${theme.colors.roads.tertiary};
            stroke-width: 1.5;
            stroke-opacity: ${theme.opacity.roads};
        }
        
        /* Стили воды */
        .water-polygon {
            fill: ${theme.colors.water};
            fill-opacity: ${theme.opacity.water};
            stroke: ${theme.colors.waterOutline};
            stroke-width: 1;
        }
        
        /* Стили парков */
        .park-polygon {
            fill: ${theme.colors.parks};
            fill-opacity: ${theme.opacity.parks};
        }
        
        .forest-polygon {
            fill: ${theme.colors.forests};
            fill-opacity: ${theme.opacity.parks};
        }
        
        .grass-polygon {
            fill: ${theme.colors.grass};
            fill-opacity: ${theme.opacity.parks};
        }
        
        /* Стили текста */
        .map-label {
            font-family: ${theme.fonts.primary};
            font-size: ${theme.fonts.sizes.normal};
            color: ${theme.colors.text.primary};
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
        }
        
        .map-label-large {
            font-size: ${theme.fonts.sizes.large};
            font-weight: bold;
            color: ${theme.colors.text.accent};
        }
        
        /* Стили всплывающих окон */
        .leaflet-popup-content {
            font-family: ${theme.fonts.primary};
            background: linear-gradient(135deg, ${theme.colors.background}, ${theme.colors.land});
            border: 2px solid ${theme.colors.roads.primary};
            color: ${theme.colors.text.primary};
        }
        
        .leaflet-popup-tip {
            background: ${theme.colors.background};
            border: 2px solid ${theme.colors.roads.primary};
        }
        
        /* Стили элементов управления */
        .leaflet-control {
            background: rgba(244, 241, 235, 0.9);
            border: 2px solid ${theme.colors.roads.primary};
            border-radius: 4px;
        }
        
        .leaflet-control a {
            color: ${theme.colors.text.primary};
            font-family: ${theme.fonts.primary};
        }
        
        /* Стили маркеров */
        .vintage-marker {
            background: linear-gradient(135deg, #d4af37, #b87333);
            border: 2px solid #8b2635;
            border-radius: 50%;
            color: #f4f1eb;
            font-weight: bold;
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
        
        .vintage-marker.player {
            background: linear-gradient(135deg, #3a4a5a, #2a3a4a);
            border: 3px solid #d4af37;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    
    document.head.appendChild(style);
}

// Применение стилей к элементам карты
function applyMapElementStyles(map, theme) {
    // Обновляем стили существующих слоев
    map.eachLayer(function(layer) {
        if (layer instanceof L.GeoJSON) {
            layer.setStyle(function(feature) {
                return getFeatureStyle(feature, theme);
            });
        }
    });
}

// Получение стиля для конкретного элемента
function getFeatureStyle(feature, theme) {
    const properties = feature.properties || {};
    const type = properties.building || properties.highway || properties.natural || properties.landuse;
    
    let style = {
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.8
    };
    
    // Стили для зданий
    if (properties.building) {
        style.fillColor = theme.colors.buildings.residential;
        style.color = theme.colors.roads.primary;
        style.weight = 1;
        style.opacity = 0.6;
        style.fillOpacity = theme.opacity.buildings;
        
        // Специальные стили для разных типов зданий
        if (properties.building === 'commercial') {
            style.fillColor = theme.colors.buildings.commercial;
        } else if (properties.building === 'industrial') {
            style.fillColor = theme.colors.buildings.industrial;
        } else if (properties.building === 'historic') {
            style.fillColor = theme.colors.buildings.historic;
        }
    }
    
    // Стили для дорог
    if (properties.highway) {
        style.fillColor = theme.colors.background;
        style.color = theme.colors.roads.secondary;
        style.fillOpacity = 0;
        
        if (properties.highway === 'primary' || properties.highway === 'trunk') {
            style.color = theme.colors.roads.primary;
            style.weight = 3;
        } else if (properties.highway === 'secondary') {
            style.color = theme.colors.roads.secondary;
            style.weight = 2;
        } else if (properties.highway === 'tertiary') {
            style.color = theme.colors.roads.tertiary;
            style.weight = 1.5;
        } else if (properties.highway === 'residential') {
            style.color = theme.colors.roads.residential;
            style.weight = 1;
        }
        
        style.opacity = theme.opacity.roads;
    }
    
    // Стили для воды
    if (properties.natural === 'water' || properties.waterway) {
        style.fillColor = theme.colors.water;
        style.color = theme.colors.waterOutline;
        style.fillOpacity = theme.opacity.water;
        style.opacity = 0.8;
    }
    
    // Стили для парков и зелени
    if (properties.natural === 'park' || properties.leisure === 'park') {
        style.fillColor = theme.colors.parks;
        style.color = theme.colors.roads.tertiary;
        style.fillOpacity = theme.opacity.parks;
        style.opacity = 0.6;
    } else if (properties.natural === 'forest' || properties.landuse === 'forest') {
        style.fillColor = theme.colors.forests;
        style.color = theme.colors.roads.tertiary;
        style.fillOpacity = theme.opacity.parks;
        style.opacity = 0.6;
    }
    
    return style;
}

// Обновление слоев карты
function updateMapLayers(map, theme) {
    // Пересоздаем слои с новыми стилями
    map.eachLayer(function(layer) {
        if (layer instanceof L.GeoJSON) {
            const geoJsonData = layer.toGeoJSON();
            layer.clearLayers();
            
            L.geoJSON(geoJsonData, {
                style: function(feature) {
                    return getFeatureStyle(feature, theme);
                },
                onEachFeature: function(feature, layer) {
                    addFeatureInteraction(feature, layer, theme);
                }
            }).addTo(map);
        }
    });
}

// Добавление интерактивности к элементам
function addFeatureInteraction(feature, layer, theme) {
    const properties = feature.properties || {};
    
    if (properties.building) {
        layer.bindPopup(`
            <div class="vintage-popup">
                <h3>${properties.name || 'Building'}</h3>
                <p><strong>Type:</strong> ${properties.building}</p>
                <p><strong>Status:</strong> <span style="color: #4caf50;">Available for capture</span></p>
                <button class="vintage-button" onclick="attemptCapture('${properties.name || 'Building'}')">
                    Capture Territory
                </button>
            </div>
        `);
    }
    
    // Добавляем эффекты при наведении
    layer.on('mouseover', function(e) {
        e.target.setStyle({
            weight: 3,
            opacity: 1
        });
    });
    
    layer.on('mouseout', function(e) {
        e.target.setStyle(getFeatureStyle(feature, theme));
    });
}

// Функция смены темы для Leaflet карты
function changeMapTheme(themeName) {
    if (!window.gangsterMap) {
        console.warn('Карта не найдена для смены темы');
        return;
    }

    const mapContainer = document.getElementById('game-map');
    if (!mapContainer) {
        console.warn('Контейнер карты не найден');
        return;
    }

    // Удаляем старые CSS классы
    mapContainer.classList.remove('vintage-theme', 'dark-theme', 'sepia-theme');
    
    // Применяем новую тему
    switch(themeName) {
        case 'vintage':
            mapContainer.classList.add('vintage-theme');
            mapContainer.style.filter = 'sepia(0.3) saturate(1.2) contrast(1.1) brightness(0.9) hue-rotate(5deg)';
            break;
        case 'dark':
            mapContainer.classList.add('dark-theme');
            mapContainer.style.filter = 'brightness(0.6) contrast(1.2) saturate(0.8) hue-rotate(180deg)';
            break;
        case 'sepia':
            mapContainer.classList.add('sepia-theme');
            mapContainer.style.filter = 'sepia(0.8) saturate(1.1) contrast(1.0) brightness(1.1) hue-rotate(-10deg)';
            break;
        default:
            mapContainer.classList.add('vintage-theme');
            mapContainer.style.filter = 'sepia(0.3) saturate(1.2) contrast(1.1) brightness(0.9) hue-rotate(5deg)';
    }

    console.log(`Тема карты изменена на: ${themeName}`);
}

// Экспорт функций для использования
window.applyCustomTheme = applyCustomTheme;
window.changeMapTheme = changeMapTheme;
window.gangsterMapTheme = gangsterMapTheme;
