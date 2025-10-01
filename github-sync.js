/**
 * Система синхронизации данных через GitHub Gist API
 * Использует GitHub Gist как облачное хранилище для данных игры
 */

class GitHubSyncService {
    constructor() {
        this.gistId = null; // ID gist будет установлен при первом сохранении
        this.githubToken = null; // GitHub токен для доступа к API
        this.syncInterval = 30000; // Синхронизация каждые 30 секунд
        this.lastSyncTime = 0;
        this.syncInProgress = false;
        
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
        console.log('Инициализация GitHub синхронизации...');
        
        // Проверяем, есть ли сохраненные настройки
        const savedGistId = localStorage.getItem('gangsters_gist_id');
        if (savedGistId) {
            this.gistId = savedGistId;
            console.log('Найден сохраненный Gist ID:', this.gistId);
        } else {
            console.log('Gist ID не найден в localStorage');
        }
        
        // Загружаем сохраненный GitHub токен
        const savedToken = localStorage.getItem('gangsters_github_token');
        if (savedToken) {
            this.githubToken = savedToken;
            console.log('Найден сохраненный GitHub токен, длина:', savedToken.length);
        } else {
            console.log('GitHub токен не найден в localStorage');
        }
        
        // Проверяем все ключи в localStorage
        console.log('Все ключи в localStorage:', Object.keys(localStorage).filter(key => key.startsWith('gangsters')));
        
        // Запускаем периодическую синхронизацию
        this.startPeriodicSync();
        
        // Синхронизируем при загрузке страницы
        this.syncFromGist();
    }
    
    /**
     * Установка GitHub токена
     */
    setGitHubToken(token) {
        this.githubToken = token;
        localStorage.setItem('gangsters_github_token', token);
        console.log('GitHub токен установлен и сохранен, длина:', token.length);
        
        // Проверяем, что токен действительно сохранился
        const savedToken = localStorage.getItem('gangsters_github_token');
        if (savedToken === token) {
            console.log('✅ Токен успешно сохранен в localStorage');
        } else {
            console.error('❌ Ошибка сохранения токена в localStorage');
        }
        
        // Показываем уведомление
        this.updateSyncStatus('GitHub токен сохранен');
    }
    
    /**
     * Синхронизация данных из Gist
     */
    async syncFromGist() {
        if (this.syncInProgress || !this.gistId) return;
        
        try {
            this.syncInProgress = true;
            this.updateSyncStatus('Синхронизация с GitHub...');
            
            // Получаем данные из Gist
            const gistData = await this.fetchFromGist();
            
            if (gistData) {
                // Обновляем локальные данные
                this.updateLocalData(gistData);
                this.lastSyncTime = Date.now();
                this.updateSyncStatus('Синхронизировано с GitHub');
                console.log('Данные синхронизированы из GitHub Gist');
            }
        } catch (error) {
            console.error('Ошибка синхронизации с GitHub:', error);
            this.updateSyncStatus('Ошибка синхронизации');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Синхронизация данных в Gist
     */
    async syncToGist() {
        if (this.syncInProgress) return;
        
        try {
            this.syncInProgress = true;
            this.updateSyncStatus('Сохранение в GitHub...');
            
            // Собираем все данные из localStorage
            const localData = this.collectLocalData();
            
            // Отправляем в Gist
            await this.sendToGist(localData);
            
            this.lastSyncTime = Date.now();
            this.updateSyncStatus('Сохранено в GitHub');
            console.log('Данные сохранены в GitHub Gist');
        } catch (error) {
            console.error('Ошибка сохранения в GitHub:', error);
            this.updateSyncStatus('Ошибка сохранения');
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * Получение данных из Gist
     */
    async fetchFromGist() {
        if (!this.gistId) return null;
        
        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
            
            if (response.ok) {
                const gist = await response.json();
                const gameDataFile = gist.files['gangsters-game-data.json'];
                
                if (gameDataFile && gameDataFile.content) {
                    return JSON.parse(gameDataFile.content);
                }
            }
        } catch (error) {
            console.error('Ошибка получения данных из Gist:', error);
        }
        return null;
    }
    
    /**
     * Отправка данных в Gist
     */
    async sendToGist(data) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.githubToken) {
            headers['Authorization'] = `token ${this.githubToken}`;
        }
        
        const gistData = {
            files: {
                'gangsters-game-data.json': {
                    content: JSON.stringify(data, null, 2)
                }
            }
        };
        
        // Если у нас уже есть Gist ID, обновляем его
        if (this.gistId) {
            gistData.description = `Gangsters Game Data - Updated ${new Date().toISOString()}`;
            
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(gistData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } else {
            // Создаем новый Gist
            gistData.description = 'Gangsters Game Data';
            gistData.public = false;
            
            const response = await fetch('https://api.github.com/gists', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(gistData)
            });
            
            if (response.ok) {
                const newGist = await response.json();
                this.gistId = newGist.id;
                localStorage.setItem('gangsters_gist_id', this.gistId);
                console.log('Создан новый Gist:', this.gistId);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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
        data.version = '1.0';
        return data;
    }
    
    /**
     * Обновление локальных данных
     */
    updateLocalData(gistData) {
        Object.keys(this.dataTypes).forEach(typeKey => {
            const dataKey = this.dataTypes[typeKey];
            if (gistData[dataKey]) {
                localStorage.setItem(dataKey, JSON.stringify(gistData[dataKey]));
            }
        });
    }
    
    /**
     * Запуск периодической синхронизации
     */
    startPeriodicSync() {
        setInterval(() => {
            if (Date.now() - this.lastSyncTime > this.syncInterval) {
                this.syncFromGist();
            }
        }, this.syncInterval);
        
        // Дополнительная синхронизация при фокусе на вкладке
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.gistId) {
                console.log('Вкладка стала активной, синхронизируем данные...');
                this.syncFromGist();
            }
        });
        
        // Синхронизация при загрузке страницы
        window.addEventListener('beforeunload', () => {
            if (this.gistId) {
                this.syncToGist();
            }
        });
    }
    
    /**
     * Обновление статуса синхронизации в UI
     */
    updateSyncStatus(status) {
        let statusElement = document.getElementById('github-sync-status');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'github-sync-status';
            statusElement.style.cssText = `
                position: fixed;
                top: 50px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10000;
                font-family: var(--font-sans);
                border-left: 4px solid #28a745;
            `;
            document.body.appendChild(statusElement);
        }
        
        statusElement.textContent = `GitHub: ${status}`;
        
        // Автоматически скрываем статус через 3 секунды
        setTimeout(() => {
            if (statusElement && statusElement.textContent === `GitHub: ${status}`) {
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
        await this.syncToGist();
        await this.syncFromGist();
    }
    
    /**
     * Получение информации о синхронизации
     */
    getSyncInfo() {
        return {
            gistId: this.gistId,
            lastSync: this.lastSyncTime,
            syncInProgress: this.syncInProgress,
            hasToken: !!this.githubToken,
            tokenLength: this.githubToken ? this.githubToken.length : 0,
            dataTypes: Object.keys(this.dataTypes)
        };
    }
    
    /**
     * Проверка состояния токена
     */
    checkTokenStatus() {
        const savedToken = localStorage.getItem('gangsters_github_token');
        console.log('=== СТАТУС ТОКЕНА ===');
        console.log('Токен в localStorage:', savedToken ? `${savedToken.substring(0, 8)}...` : 'Нет');
        console.log('Токен в памяти:', this.githubToken ? `${this.githubToken.substring(0, 8)}...` : 'Нет');
        console.log('Gist ID:', this.gistId || 'Нет');
        console.log('Все gangsters ключи в localStorage:', Object.keys(localStorage).filter(key => key.startsWith('gangsters')));
        console.log('==================');
        return {
            hasTokenInStorage: !!savedToken,
            hasTokenInMemory: !!this.githubToken,
            hasGistId: !!this.gistId,
            tokenInStorage: savedToken,
            tokenInMemory: this.githubToken
        };
    }
    
    /**
     * Создание нового Gist
     */
    async createNewGist() {
        this.gistId = null;
        localStorage.removeItem('gangsters_gist_id');
        await this.syncToGist();
    }
    
    /**
     * Быстрая настройка синхронизации
     */
    async quickSetup(token) {
        try {
            this.setGitHubToken(token);
            await this.syncToGist();
            this.updateSyncStatus('Синхронизация настроена!');
            console.log('Быстрая настройка синхронизации завершена');
            return true;
        } catch (error) {
            console.error('Ошибка настройки синхронизации:', error);
            this.updateSyncStatus('Ошибка настройки');
            return false;
        }
    }
}

// Создаем глобальный экземпляр
window.githubSyncService = new GitHubSyncService();

// Экспортируем для использования в других модулях
window.setGitHubToken = (token) => window.githubSyncService.setGitHubToken(token);
window.forceGitHubSync = () => window.githubSyncService.forceSync();
window.getGitHubSyncInfo = () => window.githubSyncService.getSyncInfo();
window.createNewGist = () => window.githubSyncService.createNewGist();
window.quickSetupSync = (token) => window.githubSyncService.quickSetup(token);
window.checkTokenStatus = () => window.githubSyncService.checkTokenStatus();

console.log('GitHub система синхронизации инициализирована');

