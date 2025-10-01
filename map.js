// Карта и работа с Яндекс.Картами
class GameMap {
    constructor() {
        this.map = null;
        this.venues = new Map();
        this.districts = new Map();
        this.playerLocation = null;
        this.selectedVenue = null;
        this.venueMarkers = new Map();
        this.districtPolygons = new Map();
        this.playerMarker = null;
        
        this.initMap();
    }

    async initMap() {
        try {
            // Проверяем, загружен ли API Яндекс.Карт
            if (typeof ymaps === 'undefined') {
                throw new Error('Яндекс.Карты API не загружен');
            }

            // Ждем полной инициализации API
            await new Promise((resolve, reject) => {
                if (ymaps.ready) {
                    ymaps.ready(resolve);
                } else {
                    reject(new Error('ymaps.ready недоступен'));
                }
            });

            // Инициализация карты
            this.map = new ymaps.Map('map', {
                center: [55.7558, 37.6176], // Москва по умолчанию
                zoom: 12,
                controls: ['zoomControl', 'fullscreenControl']
            });

            // Получение местоположения игрока
            await this.getPlayerLocation();

            // Загрузка заведений
            await this.loadVenues();
            
            // Обновляем балуны для всех заведений
            this.updateVenueBalloons();

            // Загрузка районов
            await this.loadDistricts();

            // Настройка обработчиков событий
            this.setupEventHandlers();

            // Запускаем автоматическое обновление местоположения
            this.startLocationUpdates();

            console.log('Карта инициализирована');
            
            // Скрываем загрузочный экран
            if (game && game.ui) {
                game.ui.hideLoadingScreen();
                game.ui.showMainMenu();
            }
        } catch (error) {
            console.error('Ошибка инициализации карты:', error);
            this.showNotification('Ошибка загрузки карты: ' + error.message, 'error');
            
            // Показываем главное меню даже при ошибке
            if (game && game.ui) {
                game.ui.hideLoadingScreen();
                game.ui.showMainMenu();
            }
        }
    }

    async getPlayerLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.playerLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        // Центрируем карту на местоположении игрока
                        this.map.setCenter([this.playerLocation.lat, this.playerLocation.lng]);
                        
                        // Добавляем маркер местоположения игрока
                        this.addPlayerLocationMarker();
                        
                        resolve(this.playerLocation);
                    },
                    (error) => {
                        console.warn('Не удалось получить местоположение:', error);
                        // Используем Москву как fallback
                        this.playerLocation = { lat: 55.7558, lng: 37.6176 };
                        this.addPlayerLocationMarker();
                        resolve(this.playerLocation);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000
                    }
                );
            } else {
                console.warn('Геолокация не поддерживается');
                this.playerLocation = { lat: 55.7558, lng: 37.6176 };
                this.addPlayerLocationMarker();
                resolve(this.playerLocation);
            }
        });
    }

    async loadVenues() {
        try {
            // Загружаем заведения в радиусе 5 км от игрока
            const searchRadius = 5000; // 5 км в метрах
            const searchRequest = {
                text: 'ресторан кафе бар магазин клуб',
                ll: [this.playerLocation.lat, this.playerLocation.lng],
                spn: this.calculateSpn(searchRadius),
                type: 'biz',
                results: 100
            };

            const venues = await this.searchVenues(searchRequest);
            
            venues.forEach(venue => {
                this.addVenue(venue);
            });

            // Добавляем заведение Ihsan как захваченное игроком
            this.addPlayerVenue();

            console.log(`Загружено ${venues.length} заведений`);
        } catch (error) {
            console.error('Ошибка загрузки заведений:', error);
        }
    }

    addPlayerVenue() {
        if (!this.playerLocation) return;
        
        // Пытаемся найти реальные координаты заведения Ihsan
        this.findIhsanCoordinates().then(ihsanCoords => {
            if (!ihsanCoords) {
                // Если не удалось найти, используем координаты рядом с игроком
                ihsanCoords = [
                    this.playerLocation.lat + 0.0005,
                    this.playerLocation.lng + 0.0005
                ];
            }
            
            this.createIhsanVenue(ihsanCoords);
        }).catch(() => {
            // В случае ошибки используем координаты рядом с игроком
            const ihsanCoords = [
                this.playerLocation.lat + 0.0005,
                this.playerLocation.lng + 0.0005
            ];
            this.createIhsanVenue(ihsanCoords);
        });
    }
    
    async findIhsanCoordinates() {
        return new Promise((resolve) => {
            // Используем геокодирование для поиска заведения Ihsan
            ymaps.geocode('Ihsan', {
                results: 1
            }).then((res) => {
                const firstGeoObject = res.geoObjects.get(0);
                if (firstGeoObject) {
                    const coords = firstGeoObject.geometry.getCoordinates();
                    console.log('Найдены координаты Ihsan:', coords);
                    resolve(coords);
                } else {
                    resolve(null);
                }
            }).catch((error) => {
                console.log('Ошибка поиска Ihsan:', error);
                resolve(null);
            });
        });
    }
    
    createIhsanVenue(ihsanCoords) {
        // Создаем заведение Ihsan с реальными координатами
        const ihsanVenue = {
            id: 'venue_ihsan_player',
            name: 'Ihsan',
            coords: ihsanCoords,
            type: 'medium', // Среднее заведение
            category: 'Средний бизнес',
            address: this.generateAddress(ihsanCoords),
            isOpen: true,
            owner: game.player.id, // Захвачено игроком
            income: 30, // $30/час для среднего заведения
            captureTime: Date.now() - 86400000, // Захвачено 1 день назад
            bonuses: {
                district: false,
                districtUnion: false,
                longTerm: 0 // Пока без бонуса за долгосрочное владение
            }
        };
        
        this.addVenue(ihsanVenue);
        
        // Добавляем в владения игрока
        game.player.captureVenue(ihsanVenue.id);
        
        // Показываем уведомление
        setTimeout(() => {
            game.showNotification('Заведение "Ihsan" уже захвачено вами! Доход: $30/час', 'success');
        }, 2000);
        
        console.log('Заведение Ihsan добавлено как захваченное игроком');
    }

    async searchVenues(request) {
        return new Promise((resolve, reject) => {
            // Создаем сетку зданий в области поиска
            const venues = this.generateVenuesInArea(request.ll, request.spn);
            resolve(venues);
        });
    }

    generateVenuesInArea(center, spn) {
        const venues = [];
        const latStep = spn[0] / 10; // Делим область на 10x10 сетку
        const lngStep = spn[1] / 10;
        
        // Создаем заведения в сетке
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                // Пропускаем некоторые ячейки для реалистичности
                if (Math.random() < 0.3) continue;
                
                const lat = center[0] + (i - 5) * latStep + (Math.random() - 0.5) * latStep * 0.5;
                const lng = center[1] + (j - 5) * lngStep + (Math.random() - 0.5) * lngStep * 0.5;
                
                const venue = this.createRandomVenue([lat, lng]);
                if (venue) {
                    venues.push(venue);
                }
            }
        }
        
        return venues;
    }

    createRandomVenue(coords) {
        const venueTypes = [
            // Малый бизнес
            { name: 'Кафе "Уютное"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Бар "Ночной"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Магазин "Продукты"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Кофейня "Арабика"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Паб "Ирландец"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Бургерная "Быстро"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Пекарня "Свежая"', type: 'small', income: 10, category: 'Малый бизнес' },
            { name: 'Аптека "Здоровье"', type: 'small', income: 10, category: 'Малый бизнес' },
            
            // Средний бизнес
            { name: 'Ресторан "Престиж"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Пиццерия "Итальяно"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Супермаркет "Мега"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Спорт-бар "Чемпион"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Караоке "Звезда"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Стейк-хаус "Премиум"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Салон красоты "Элегант"', type: 'medium', income: 30, category: 'Средний бизнес' },
            { name: 'Автосервис "Мастер"', type: 'medium', income: 30, category: 'Средний бизнес' },
            
            // Крупный бизнес
            { name: 'Клуб "Энергия"', type: 'large', income: 100, category: 'Крупный бизнес' },
            { name: 'ТЦ "Плаза"', type: 'large', income: 100, category: 'Крупный бизнес' },
            { name: 'Дискотека "Пульс"', type: 'large', income: 100, category: 'Крупный бизнес' },
            { name: 'Торговый центр "Мегаполис"', type: 'large', income: 100, category: 'Крупный бизнес' },
            { name: 'Развлекательный комплекс "Парк"', type: 'large', income: 100, category: 'Крупный бизнес' },
            { name: 'Бизнес-центр "Офис"', type: 'large', income: 100, category: 'Крупный бизнес' }
        ];
        
        const randomVenue = venueTypes[Math.floor(Math.random() * venueTypes.length)];
        
        return {
            id: this.generateVenueId(coords),
            name: randomVenue.name,
            coords: coords,
            type: randomVenue.type,
            category: randomVenue.category,
            address: this.generateAddress(coords),
            isOpen: this.checkVenueStatus(),
            owner: null,
            income: randomVenue.income,
            captureTime: null,
            bonuses: {
                district: false,
                districtUnion: false,
                longTerm: 0
            }
        };
    }

    generateAddress(coords) {
        // Генерируем случайный адрес
        const streets = ['Ленина', 'Пушкина', 'Гагарина', 'Мира', 'Советская', 'Центральная', 'Молодежная', 'Школьная'];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const number = Math.floor(Math.random() * 200) + 1;
        
        return `ул. ${street}, д. ${number}`;
    }

    isVenueType(name) {
        const venueKeywords = [
            'ресторан', 'кафе', 'бар', 'клуб', 'магазин', 'супермаркет',
            'торговый центр', 'молл', 'пиццерия', 'бургер', 'кофейня',
            'паб', 'дискотека', 'ночной клуб', 'спорт-бар', 'караоке'
        ];
        
        const lowerName = name.toLowerCase();
        return venueKeywords.some(keyword => lowerName.includes(keyword));
    }

    determineVenueType(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('торговый центр') || lowerName.includes('молл') || 
            lowerName.includes('ночной клуб') || lowerName.includes('дискотека')) {
            return 'large';
        } else if (lowerName.includes('ресторан') || lowerName.includes('супермаркет') || 
                   lowerName.includes('магазин')) {
            return 'medium';
        } else {
            return 'small';
        }
    }

    calculateBaseIncome(name) {
        const type = this.determineVenueType(name);
        const baseIncomes = {
            small: 10,
            medium: 30,
            large: 100
        };
        return baseIncomes[type];
    }

    checkVenueStatus() {
        // Простая проверка статуса заведения
        // В реальной игре здесь должна быть интеграция с API расписания
        const now = new Date();
        const hour = now.getHours();
        
        // Большинство заведений работают с 10:00 до 22:00
        // Добавляем небольшую случайность для реалистичности
        const isWorkingHours = hour >= 10 && hour <= 22;
        const randomFactor = Math.random() > 0.1; // 90% заведений открыты в рабочее время
        
        return isWorkingHours && randomFactor;
    }

    calculateSpn(radius) {
        // Преобразуем радиус в метрах в spn для Яндекс.Карт
        const lat = this.playerLocation.lat;
        const lng = this.playerLocation.lng;
        
        // Приблизительное преобразование
        const latDelta = radius / 111000; // 1 градус широты ≈ 111 км
        const lngDelta = radius / (111000 * Math.cos(lat * Math.PI / 180));
        
        return [latDelta, lngDelta];
    }

    generateVenueId(coords) {
        return `venue_${coords[0].toFixed(6)}_${coords[1].toFixed(6)}`;
    }

    addVenue(venue) {
        this.venues.set(venue.id, venue);
        this.createVenueMarker(venue);
    }

    createVenueMarker(venue) {
        const marker = new ymaps.Placemark(venue.coords, {
            balloonContent: null, // Убираем все балуны по умолчанию
            iconContent: this.getVenueIcon(venue)
        }, {
            preset: 'islands#circleIcon',
            iconColor: this.getVenueColor(venue),
            iconImageSize: [20, 20],
            iconImageOffset: [-10, -10]
        });

        marker.events.add('click', () => {
            // Показываем балун только для своих заведений при максимальном приближении (zoom >= 16)
            const currentZoom = this.map.getZoom();
            if (currentZoom >= 16 && venue.owner === game.player.id) {
                // Создаем балун динамически только при клике
                marker.properties.set('balloonContent', this.createVenueBalloon(venue));
                marker.balloon.open();
            } else {
                this.selectVenue(venue);
            }
        });

        this.map.geoObjects.add(marker);
        this.venueMarkers.set(venue.id, marker);
    }

    getVenueColor(venue) {
        if (venue.owner === game.player.id) {
            return '#4ecdc4'; // Свой
        } else if (venue.owner) {
            return '#ff6b6b'; // Чужой
        } else {
            return '#ffa726'; // Свободный
        }
    }

    getVenueIcon(venue) {
        // Специальная иконка для заведения Ihsan
        if (venue.id === 'venue_ihsan_player') {
            return 'I';
        }
        
        const icons = {
            small: 'S',
            medium: 'M',
            large: 'L'
        };
        return icons[venue.type] || '?';
    }

    createVenueBalloon(venue) {
        const status = venue.isOpen ? 'Открыто' : 'Закрыто';
        const owner = venue.owner === game.player.id ? 'Ваше заведение' : 
                     venue.owner ? `Владелец: ${venue.owner}` : 'Свободно';
        
        // Специальный балун для заведения Ihsan
        if (venue.id === 'venue_ihsan_player') {
            return `
                <div class="venue-balloon ihsan-balloon">
                    <h3>${venue.name} 🏆</h3>
                    <p><strong>Категория:</strong> ${venue.category}</p>
                    <p><strong>Адрес:</strong> ${venue.address}</p>
                    <p><strong>Статус:</strong> ${status}</p>
                    <p><strong>Доход:</strong> $${venue.income}/час</p>
                    <p><strong>${owner}</strong></p>
                    <p><strong>Захвачено:</strong> 1 день назад</p>
                    <button onclick="game.map.selectVenue('${venue.id}')">Управление</button>
                </div>
            `;
        }
        
        return `
            <div class="venue-balloon">
                <h3>${venue.name}</h3>
                <p><strong>Категория:</strong> ${venue.category}</p>
                <p><strong>Адрес:</strong> ${venue.address}</p>
                <p><strong>Статус:</strong> ${status}</p>
                <p><strong>Доход:</strong> $${venue.income}/час</p>
                <p><strong>${owner}</strong></p>
                <button onclick="game.map.selectVenue('${venue.id}')">Подробнее</button>
            </div>
        `;
    }

    getVenueTypeName(type) {
        const names = {
            small: 'Малое заведение',
            medium: 'Среднее заведение',
            large: 'Крупное заведение'
        };
        return names[type] || 'Неизвестно';
    }

    selectVenue(venue) {
        this.selectedVenue = venue;
        this.showVenuePanel(venue);
    }

    showVenuePanel(venue) {
        const panel = document.getElementById('venue-panel');
        const nameEl = document.getElementById('venue-name');
        const typeEl = document.getElementById('venue-type');
        const ownerEl = document.getElementById('venue-owner');
        const incomeEl = document.getElementById('venue-income');
        const statusEl = document.getElementById('venue-status');
        const captureBtn = document.getElementById('capture-btn');
        const duelBtn = document.getElementById('duel-btn');

        nameEl.textContent = venue.name;
        typeEl.textContent = venue.category || this.getVenueTypeName(venue.type);
        ownerEl.textContent = venue.owner === game.player.id ? 'Ваше заведение' : (venue.owner ? venue.owner : 'Свободно');
        incomeEl.textContent = `$${venue.income}/час`;
        statusEl.textContent = venue.isOpen ? 'Открыто' : 'Закрыто';

        // Добавляем адрес в панель
        const addressEl = document.getElementById('venue-address');
        if (addressEl) {
            addressEl.textContent = venue.address;
        }

        // Показываем соответствующие кнопки
        if (venue.owner === game.player.id) {
            captureBtn.style.display = 'none';
            duelBtn.style.display = 'none';
        } else if (venue.owner) {
            captureBtn.style.display = 'none';
            duelBtn.style.display = 'block';
        } else {
            captureBtn.style.display = 'block';
            duelBtn.style.display = 'none';
        }

        panel.classList.remove('hidden');
    }

    closeVenuePanel() {
        document.getElementById('venue-panel').classList.add('hidden');
        this.selectedVenue = null;
    }

    async loadDistricts() {
        // Загружаем районы города
        // В реальной игре здесь должна быть интеграция с API административных границ
        const districts = await this.generateDistricts();
        
        districts.forEach(district => {
            this.addDistrict(district);
        });
    }

    async generateDistricts() {
        // Генерируем районы на основе заведений
        const venues = Array.from(this.venues.values());
        const districts = [];
        
        // Группируем заведения по близости
        const clusters = this.clusterVenues(venues, 1000); // 1 км радиус
        
        clusters.forEach((cluster, index) => {
            if (cluster.length >= 3) { // Минимум 3 заведения для района
                const district = {
                    id: `district_${index}`,
                    name: `Район ${index + 1}`,
                    venues: cluster.map(v => v.id),
                    bounds: this.calculateBounds(cluster),
                    owner: null
                };
                districts.push(district);
            }
        });
        
        return districts;
    }

    clusterVenues(venues, radius) {
        const clusters = [];
        const visited = new Set();
        
        venues.forEach(venue => {
            if (visited.has(venue.id)) return;
            
            const cluster = [venue];
            visited.add(venue.id);
            
            venues.forEach(otherVenue => {
                if (visited.has(otherVenue.id)) return;
                
                const distance = this.calculateDistance(venue.coords, otherVenue.coords);
                if (distance <= radius) {
                    cluster.push(otherVenue);
                    visited.add(otherVenue.id);
                }
            });
            
            clusters.push(cluster);
        });
        
        return clusters;
    }

    calculateDistance(coords1, coords2) {
        const R = 6371000; // Радиус Земли в метрах
        const lat1 = coords1[0] * Math.PI / 180;
        const lat2 = coords2[0] * Math.PI / 180;
        const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180;
        const deltaLng = (coords2[1] - coords1[1]) * Math.PI / 180;
        
        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return R * c;
    }

    calculateBounds(venues) {
        const lats = venues.map(v => v.coords[0]);
        const lngs = venues.map(v => v.coords[1]);
        
        return [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
        ];
    }

    addDistrict(district) {
        this.districts.set(district.id, district);
        this.createDistrictPolygon(district);
    }

    createDistrictPolygon(district) {
        const polygon = new ymaps.Polygon([
            [
                [district.bounds[0][0], district.bounds[0][1]],
                [district.bounds[1][0], district.bounds[0][1]],
                [district.bounds[1][0], district.bounds[1][1]],
                [district.bounds[0][0], district.bounds[1][1]],
                [district.bounds[0][0], district.bounds[0][1]]
            ]
        ], {
            balloonContent: this.createDistrictBalloon(district)
        }, {
            fillColor: this.getDistrictColor(district),
            fillOpacity: 0.1,
            strokeColor: this.getDistrictStrokeColor(district),
            strokeWidth: 2,
            strokeStyle: 'dashed'
        });

        this.map.geoObjects.add(polygon);
        this.districtPolygons.set(district.id, polygon);
    }

    getDistrictColor(district) {
        if (district.owner === game.player.id) {
            return '#4ecdc4';
        } else if (district.owner) {
            return '#ff6b6b';
        } else {
            return '#ffa726';
        }
    }

    getDistrictStrokeColor(district) {
        if (district.owner === game.player.id) {
            return '#4ecdc4';
        } else if (district.owner) {
            return '#ff6b6b';
        } else {
            return '#ffa726';
        }
    }

    createDistrictBalloon(district) {
        const owner = district.owner ? `Владелец: ${district.owner}` : 'Свободно';
        const venueCount = district.venues.length;
        
        return `
            <div class="district-balloon">
                <h3>${district.name}</h3>
                <p><strong>Заведений:</strong> ${venueCount}</p>
                <p><strong>${owner}</strong></p>
            </div>
        `;
    }

    setupEventHandlers() {
        // Обработчики событий карты
        this.map.events.add('click', (e) => {
            const coords = e.get('coords');
            this.handleMapClick(coords);
        });
        
        // Обработчик изменения масштаба - убираем балуны при изменении zoom
        this.map.events.add('zoomchange', () => {
            this.closeAllBalloons();
            this.updateVenueBalloons();
        });
        
        // Убираем автоматическое обновление при изменении масштаба
        // this.map.events.add('boundschange', (e) => {
        //     const newBounds = e.get('newBounds');
        //     this.updateVenuesForBounds(newBounds);
        // });
    }

    startLocationUpdates() {
        // Обновляем местоположение каждые 30 секунд
        setInterval(() => {
            this.updatePlayerLocation();
        }, 30000);
    }

    handleMapClick(coords) {
        // Обработка клика по карте
        console.log('Клик по карте:', coords);
    }

    // Удалены функции, вызывающие зависание при изменении масштаба

    updateVenueOwnership(venueId, newOwner) {
        const venue = this.venues.get(venueId);
        if (venue) {
            venue.owner = newOwner;
            this.updateVenueMarker(venue);
        }
    }

    updateVenueMarker(venue) {
        const marker = this.venueMarkers.get(venue.id);
        if (marker) {
            marker.options.set('iconColor', this.getVenueColor(venue));
            marker.properties.set('balloonContent', this.createVenueBalloon(venue));
        }
    }

    updateDistrictOwnership(districtId, newOwner) {
        const district = this.districts.get(districtId);
        if (district) {
            district.owner = newOwner;
            this.updateDistrictPolygon(district);
        }
    }

    updateDistrictPolygon(district) {
        const polygon = this.districtPolygons.get(district.id);
        if (polygon) {
            polygon.options.set('fillColor', this.getDistrictColor(district));
            polygon.options.set('strokeColor', this.getDistrictStrokeColor(district));
            polygon.properties.set('balloonContent', this.createDistrictBalloon(district));
        }
    }

    addPlayerLocationMarker() {
        if (!this.playerLocation || !this.map) return;
        
        // Удаляем предыдущий маркер, если есть
        if (this.playerMarker) {
            this.map.geoObjects.remove(this.playerMarker);
        }
        
        // Создаем маркер местоположения игрока
        this.playerMarker = new ymaps.Placemark([this.playerLocation.lat, this.playerLocation.lng], {
            balloonContent: `
                <div class="player-location-balloon">
                    <h3>Ваше местоположение</h3>
                    <p>Широта: ${this.playerLocation.lat.toFixed(6)}</p>
                    <p>Долгота: ${this.playerLocation.lng.toFixed(6)}</p>
                    <button onclick="game.map.centerOnPlayer()">Центрировать карту</button>
                </div>
            `
        }, {
            preset: 'islands#blueCircleDotIcon',
            iconColor: '#4ecdc4',
            iconImageSize: [30, 30],
            iconImageOffset: [-15, -15]
        });
        
        // Добавляем маркер на карту
        this.map.geoObjects.add(this.playerMarker);
        
        // Добавляем анимацию пульсации
        this.animatePlayerMarker();
        
        console.log('Маркер местоположения игрока добавлен');
    }

    animatePlayerMarker() {
        if (!this.playerMarker) return;
        
        // Создаем анимацию пульсации
        let scale = 1;
        let growing = true;
        
        const animate = () => {
            if (growing) {
                scale += 0.05;
                if (scale >= 1.3) growing = false;
            } else {
                scale -= 0.05;
                if (scale <= 1) growing = true;
            }
            
            this.playerMarker.options.set('iconImageSize', [30 * scale, 30 * scale]);
            this.playerMarker.options.set('iconImageOffset', [-15 * scale, -15 * scale]);
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    centerOnPlayer() {
        if (this.playerLocation && this.map) {
            this.map.setCenter([this.playerLocation.lat, this.playerLocation.lng], 15);
            this.showNotification('Карта центрирована на вашем местоположении', 'info');
        }
    }

    zoomToMax() {
        if (this.map) {
            this.closeAllBalloons();
            this.map.setZoom(16);
            this.showNotification('Карта приближена для просмотра балунов заведений', 'info');
        }
    }

    updatePlayerLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // Проверяем, изменилось ли местоположение значительно
                    if (this.playerLocation) {
                        const distance = this.calculateDistance(
                            [this.playerLocation.lat, this.playerLocation.lng],
                            [newLocation.lat, newLocation.lng]
                        );
                        
                        if (distance > 50) { // Если переместились более чем на 50 метров
                            this.playerLocation = newLocation;
                            this.addPlayerLocationMarker();
                            this.showNotification('Местоположение обновлено', 'info');
                        }
                    } else {
                        this.playerLocation = newLocation;
                        this.addPlayerLocationMarker();
                    }
                },
                (error) => {
                    console.warn('Ошибка обновления местоположения:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 60000
                }
            );
        }
    }

    refreshVenues() {
        // Обновляем заведения в текущей области
        const center = this.map.getCenter();
        const searchRadius = 2000; // 2 км
        const spn = this.calculateSpn(searchRadius);
        
        // Очищаем старые заведения (кроме Ihsan)
        this.venues.forEach((venue, venueId) => {
            if (venueId !== 'venue_ihsan_player') {
                const marker = this.venueMarkers.get(venueId);
                if (marker) {
                    this.map.geoObjects.remove(marker);
                }
                this.venues.delete(venueId);
            }
        });
        
        // Загружаем новые заведения
        const newVenues = this.generateVenuesInArea([center[0], center[1]], spn);
        newVenues.forEach(venue => {
            this.addVenue(venue);
        });
        
        // Обновляем балуны для всех заведений
        this.updateVenueBalloons();
        
        this.showNotification(`Обновлено заведений: ${newVenues.length}`, 'info');
        console.log(`Обновлено ${newVenues.length} заведений`);
    }
    
    updateVenueBalloons() {
        // Убираем все балуны с карты
        this.venues.forEach((venue, venueId) => {
            const marker = this.venueMarkers.get(venueId);
            if (marker) {
                // Убираем все балуны
                marker.properties.set('balloonContent', null);
                // Закрываем открытые балуны
                try {
                    if (marker.balloon && marker.balloon.isOpen()) {
                        marker.balloon.close();
                    }
                } catch (error) {
                    // Игнорируем ошибки при закрытии балунов
                }
            }
        });
    }
    
    closeAllBalloons() {
        // Принудительно закрываем все балуны на карте
        this.map.geoObjects.each((geoObject) => {
            if (geoObject.balloon && geoObject.balloon.isOpen()) {
                try {
                    geoObject.balloon.close();
                } catch (error) {
                    // Игнорируем ошибки
                }
            }
        });
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

    // Методы для проверки расстояния и доступности
    isPlayerNearVenue(venue, maxDistance = 20) {
        if (!this.playerLocation) return false;
        
        const distance = this.calculateDistance(
            [this.playerLocation.lat, this.playerLocation.lng],
            venue.coords
        );
        
        return distance <= maxDistance;
    }

    canCaptureVenue(venue) {
        // Проверяем все условия для захвата
        if (!venue.isOpen) {
            this.showNotification('Заведение закрыто', 'warning');
            return false;
        }
        
        if (!this.isPlayerNearVenue(venue)) {
            this.showNotification('Вы слишком далеко от заведения', 'warning');
            return false;
        }
        
        if (!game.player.canCaptureVenueType(venue.type)) {
            this.showNotification('Недостаточно влияния для захвата этого типа заведения', 'warning');
            return false;
        }
        
        return true;
    }
}

// Глобальная переменная для карты
let gameMap;
