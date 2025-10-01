/**
 * Система синхронизации данных между браузерами
 * Использует localStorage и события для синхронизации между вкладками
 */

class DataSyncService {
    constructor() {
        this.syncInterval = 5000; // Синхронизация каждые 5 секунд
        this.lastSyncTime = 0;
        this.syncInProgress = false;
        this.localStorageKey = 'gangsters_sync_data';
        
        // Типы данных для синхронизации
        this.dataTypes = {
            MARKUP_DATA: 'gangsters_markup_data',
            PLAYERS_DATABASE: 'gangsters_players_database', 
            CURRENT_USER: 'gangsters_current_user',
            EVENTS: 'gangsters_events',
            DUEL_HISTORY: 'gangsters_duel_history',
            ECONOMY: 'gangsters_economy',
            CLANS: 'gangsters_clans',
            CLAN_REQUESTS: 'gangsters_clan_requests',
            CLAN_WARS: 'gangsters_clan_wars'
        };
        
        this.init();
    }
    
    init() {
        console.log('Инициализация системы синхронизации данных...');
        
        // Запускаем периодическую синхронизацию
        this.startPeriodicSync();
        
        // Синхронизируем при загрузке страницы
        this.syncFromStorage();
        
        // Слушаем изменения localStorage
        this.listenToLocalStorageChanges();
        
        // Слушаем события синхронизации от других вкладок
        this.listenToStorageEvents();
    }
    
    /**
     * Синхронизация данных из хранилища
     */
    async syncFromStorage() {
        if (this.syncInProgress) return;
        
        try {
            this.syncInProgress = true;
            this.updateSyncStatus('Синхронизация данных...');
            
            // Получаем данные из localStorage
            const storageData = this.getStorageData();
            
            if (storageData && Object.keys(storageData).length > 0) {
                // Обновляем локальные данные
                this.updateLocalData(storageData);
                this.lastSyncTime = Date.now();
                this.updateSyncStatus('Синхронизировано');
                console.log('Данные синхронизированы из хранилища');
            }
        } catch (error) {
            console.error('Ошибка синхронизации из хранилища:', error);
            this.updateSyncStatus('Ошибка синхронизации');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Синхронизация данных в хранилище
     */
    async syncToStorage() {
        if (this.syncInProgress) return;
        
        try {
            this.syncInProgress = true;
            this.updateSyncStatus('Сохранение данных...');
            
            // Собираем все данные из localStorage
            const localData = this.collectLocalData();
            
            // Сохраняем в localStorage
            this.saveStorageData(localData);
            
            this.lastSyncTime = Date.now();
            this.updateSyncStatus('Сохранено');
            console.log('Данные сохранены в хранилище');
        } catch (error) {
            console.error('Ошибка сохранения в хранилище:', error);
            this.updateSyncStatus('Ошибка сохранения');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Получение данных из хранилища
     */
    getStorageData() {
        try {
            const data = localStorage.getItem(this.localStorageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка получения данных из хранилища:', error);
            return null;
        }
    }
    
    /**
     * Сохранение данных в хранилище
     */
    saveStorageData(data) {
        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Ошибка сохранения данных в хранилище:', error);
            throw error;
        }
    }
    
    /**
     * Сбор всех локальных данных
     */
    collectLocalData() {
        const data = {};
        
        Object.values(this.dataTypes).forEach(key => {
            const localData = localStorage.getItem(key);
            if (localData) {
                try {
                    data[key] = JSON.parse(localData);
                } catch (error) {
                    console.error(`Ошибка парсинга данных ${key}:`, error);
                }
            }
        });
        
        data.lastSync = Date.now();
        return data;
    }
    
    /**
     * Обновление локальных данных
     */
    updateLocalData(serverData) {
        Object.keys(this.dataTypes).forEach(typeKey => {
            const dataKey = this.dataTypes[typeKey];
            if (serverData[dataKey]) {
                localStorage.setItem(dataKey, JSON.stringify(serverData[dataKey]));
            }
        });
    }
    
    /**
     * Запуск периодической синхронизации
     */
    startPeriodicSync() {
        setInterval(() => {
            if (Date.now() - this.lastSyncTime > this.syncInterval) {
                this.syncFromStorage();
            }
        }, this.syncInterval);
    }
    
    /**
     * Прослушивание изменений localStorage
     */
    listenToLocalStorageChanges() {
        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        
        // Перехватываем изменения localStorage
        localStorage.setItem = (key, value) => {
            originalSetItem.call(localStorage, key, value);
            
            // Если это наши данные, синхронизируем
            if (Object.values(this.dataTypes).includes(key)) {
                setTimeout(() => this.syncToStorage(), 1000); // Задержка для группировки изменений
            }
        };
        
        localStorage.removeItem = (key) => {
            originalRemoveItem.call(localStorage, key);
            
            if (Object.values(this.dataTypes).includes(key)) {
                setTimeout(() => this.syncToStorage(), 1000);
            }
        };
    }
    
    /**
     * Прослушивание событий синхронизации от других вкладок
     */
    listenToStorageEvents() {
        window.addEventListener('storage', (event) => {
            if (event.key === this.localStorageKey && event.newValue) {
                try {
                    const newData = JSON.parse(event.newValue);
                    this.updateLocalData(newData);
                    this.updateSyncStatus('Обновлено из другой вкладки');
                    console.log('Данные обновлены из другой вкладки');
                } catch (error) {
                    console.error('Ошибка обработки данных из другой вкладки:', error);
                }
            }
        });
    }
    
    /**
     * Обновление статуса синхронизации в UI
     */
    updateSyncStatus(status) {
        let statusElement = document.getElementById('sync-status');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'sync-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10000;
                font-family: var(--font-sans);
            `;
            document.body.appendChild(statusElement);
        }
        
        statusElement.textContent = status;
        
        // Автоматически скрываем статус через 3 секунды
        setTimeout(() => {
            if (statusElement && statusElement.textContent === status) {
                statusElement.style.opacity = '0';
                setTimeout(() => {
                    if (statusElement.parentNode) {
                        statusElement.parentNode.removeChild(statusElement);
                    }
                }, 500);
            }
        }, 3000);
    }
    
    /**
     * Принудительная синхронизация
     */
    async forceSync() {
        await this.syncToStorage();
        await this.syncFromStorage();
    }
    
    /**
     * Получение информации о синхронизации
     */
    getSyncInfo() {
        return {
            lastSync: this.lastSyncTime,
            syncInProgress: this.syncInProgress,
            dataTypes: Object.keys(this.dataTypes),
            localDataSize: Object.values(this.dataTypes).reduce((size, key) => {
                const data = localStorage.getItem(key);
                return size + (data ? data.length : 0);
            }, 0)
        };
    }
}

// Создаем глобальный экземпляр
window.dataSyncService = new DataSyncService();

// Экспортируем для использования в других модулях
window.forceSync = () => window.dataSyncService.forceSync();
window.getSyncInfo = () => window.dataSyncService.getSyncInfo();

console.log('Система синхронизации данных инициализирована');
