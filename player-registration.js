// Система регистрации и управления игроками для проекта Gangsters

// База данных игроков (в реальном проекте это было бы на сервере)
let playersDatabase = {
    // Админ по умолчанию для разметки территорий
    'admin': {
        name: 'admin',
        password: '372324',
        color: '#d4af37',
        territories: [],
        totalIncome: 0,
        registrationDate: new Date().toISOString(),
        role: 'admin'
    },
    // Пользователь kes для тестирования
    'kes': {
        name: 'kes',
        password: '123456',
        color: '#8b2635',
        territories: [],
        totalIncome: 0,
        registrationDate: new Date().toISOString(),
        role: 'player'
    }
};

// Текущий авторизованный игрок
let currentUser = null;

// Функция для сохранения базы данных игроков в localStorage
function savePlayersDatabase() {
    try {
        localStorage.setItem('gangsters_players_database', JSON.stringify(playersDatabase));
        console.log('Players database saved to localStorage');
    } catch (error) {
        console.error('Error saving players database:', error);
    }
}

// Функция для загрузки базы данных игроков из localStorage
function loadPlayersDatabase() {
    try {
        const saved = localStorage.getItem('gangsters_players_database');
        if (saved) {
            const savedDb = JSON.parse(saved);
            // Объединяем сохраненную базу с базовой (чтобы не потерять предустановленных пользователей)
            playersDatabase = { ...playersDatabase, ...savedDb };
            console.log('Players database loaded from localStorage');
        } else {
            // Если нет сохраненной базы, сохраняем базовую
            savePlayersDatabase();
            console.log('Initial players database saved to localStorage');
        }
    } catch (error) {
        console.error('Error loading players database:', error);
        // В случае ошибки сохраняем базовую базу
        savePlayersDatabase();
    }
}

// Функция для сохранения текущего пользователя в localStorage
function saveCurrentUser() {
    try {
        if (currentUser) {
            localStorage.setItem('gangsters_current_user', JSON.stringify(currentUser));
            console.log('Current user saved to localStorage');
        }
    } catch (error) {
        console.error('Error saving current user:', error);
    }
}

// Функция для загрузки текущего пользователя из localStorage
function loadCurrentUser() {
    try {
        const saved = localStorage.getItem('gangsters_current_user');
        if (saved) {
            currentUser = JSON.parse(saved);
            console.log('Current user loaded from localStorage');
            return true;
        }
    } catch (error) {
        console.error('Error loading current user:', error);
    }
    return false;
}

// Доступные цвета для игроков
const availableColors = [
    { name: 'Красный', value: '#8b2635' },
    { name: 'Синий', value: '#3a4a5a' },
    { name: 'Золотой', value: '#d4af37' },
    { name: 'Зеленый', value: '#2d5016' },
    { name: 'Фиолетовый', value: '#4a148c' },
    { name: 'Оранжевый', value: '#e65100' },
    { name: 'Бирюзовый', value: '#006064' },
    { name: 'Розовый', value: '#880e4f' }
];

// Показ окна регистрации
function showRegistrationModal() {
    const modal = document.createElement('div');
    modal.id = 'registration-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        font-family: var(--font-sans);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
            border: 3px solid var(--warm-gold);
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
            position: relative;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        ">
            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 2px solid var(--warm-gold); border-right: 2px solid var(--warm-gold); clip-path: polygon(0 0, 100% 0, 100% 100%);"></div>
            
            <h3 style="color: var(--warm-gold); font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 1.5rem;">Регистрация игрока</h3>
            
            <div style="margin-bottom: 1rem; text-align: left;">
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-weight: bold;">Имя игрока:</label>
                <input type="text" id="player-name" placeholder="Введите имя игрока" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(46, 46, 46, 0.8);
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    border-radius: 4px;
                    font-family: var(--font-sans);
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="margin-bottom: 1rem; text-align: left;">
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-weight: bold;">Пароль:</label>
                <input type="password" id="player-password" placeholder="Введите пароль" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(46, 46, 46, 0.8);
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    border-radius: 4px;
                    font-family: var(--font-sans);
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="margin-bottom: 1.5rem; text-align: left;">
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-weight: bold;">Цвет игрока:</label>
                <div id="color-picker" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;">
                    <!-- Цвета будут добавлены динамически -->
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button onclick="registerPlayer()" style="
                    background: linear-gradient(45deg, var(--brick-red), var(--dark-brick));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                ">Зарегистрироваться</button>
                <button onclick="showLoginModal()" style="
                    background: linear-gradient(45deg, var(--steel-blue), var(--midnight-blue));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                ">Войти</button>
                <button onclick="closeRegistrationModal()" style="
                    background: linear-gradient(45deg, var(--concrete), var(--dark-concrete));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                ">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем цвета в picker
    const colorPicker = document.getElementById('color-picker');
    availableColors.forEach((color, index) => {
        const colorButton = document.createElement('button');
        colorButton.style.cssText = `
            width: 40px;
            height: 40px;
            background: ${color.value};
            border: 2px solid var(--warm-gold);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        colorButton.title = color.name;
        colorButton.onclick = () => selectColor(index);
        
        if (index === 0) {
            colorButton.style.borderColor = '#ffffff';
            colorButton.style.transform = 'scale(1.2)';
        }
        
        colorPicker.appendChild(colorButton);
    });
    
    // Устанавливаем первый цвет как выбранный по умолчанию
    window.selectedColorIndex = 0;
}

// Показ окна входа
function showLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'login-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        font-family: var(--font-sans);
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
            border: 3px solid var(--warm-gold);
            padding: 2rem;
            max-width: 400px;
            width: 90%;
            text-align: center;
            position: relative;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        ">
            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 2px solid var(--warm-gold); border-right: 2px solid var(--warm-gold); clip-path: polygon(0 0, 100% 0, 100% 100%);"></div>
            
            <h3 style="color: var(--warm-gold); font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 1.5rem;">Вход в игру</h3>
            
            <div style="margin-bottom: 1rem; text-align: left;">
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-weight: bold;">Имя игрока:</label>
                <input type="text" id="login-name" placeholder="Введите имя" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(46, 46, 46, 0.8);
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    border-radius: 4px;
                    font-family: var(--font-sans);
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="margin-bottom: 1.5rem; text-align: left;">
                <label style="display: block; color: var(--cream); margin-bottom: 0.5rem; font-weight: bold;">Пароль:</label>
                <input type="password" id="login-password" placeholder="Введите пароль" style="
                    width: 100%;
                    padding: 0.75rem;
                    background: rgba(46, 46, 46, 0.8);
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    border-radius: 4px;
                    font-family: var(--font-sans);
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button onclick="loginPlayer()" style="
                    background: linear-gradient(45deg, var(--brick-red), var(--dark-brick));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                ">Войти</button>
                <button onclick="showRegistrationModal()" style="
                    background: linear-gradient(45deg, var(--steel-blue), var(--midnight-blue));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                ">Регистрация</button>
                <button onclick="closeLoginModal()" style="
                    background: linear-gradient(45deg, var(--concrete), var(--dark-concrete));
                    border: 2px solid var(--warm-gold);
                    color: var(--cream);
                    padding: 0.75rem 1.5rem;
                    cursor: pointer;
                    font-weight: bold;
                    text-transform: uppercase;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                ">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Выбор цвета
function selectColor(index) {
    // Сбрасываем все цвета
    const colorButtons = document.querySelectorAll('#color-picker button');
    colorButtons.forEach(button => {
        button.style.borderColor = 'var(--warm-gold)';
        button.style.transform = 'scale(1)';
    });
    
    // Выделяем выбранный цвет
    colorButtons[index].style.borderColor = '#ffffff';
    colorButtons[index].style.transform = 'scale(1.2)';
    
    window.selectedColorIndex = index;
}

// Регистрация игрока
function registerPlayer() {
    const name = document.getElementById('player-name').value.trim();
    const password = document.getElementById('player-password').value.trim();
    const color = availableColors[window.selectedColorIndex];
    
    // Валидация
    if (!name) {
        showMessage('Введите имя игрока!', 'error');
        return;
    }
    
    if (!password) {
        showMessage('Введите пароль!', 'error');
        return;
    }
    
    if (name.length < 3) {
        showMessage('Имя должно содержать минимум 3 символа!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Пароль должен содержать минимум 6 символов!', 'error');
        return;
    }
    
    // Проверяем, не существует ли уже игрок с таким именем
    if (playersDatabase[name.toLowerCase()]) {
        showMessage('Игрок с таким именем уже существует!', 'error');
        return;
    }
    
    // Создаем нового игрока
    const newPlayer = {
        name: name,
        password: password,
        color: color.value,
        territories: [],
        totalIncome: 0,
        money: 10000, // Начальные деньги игрока
        clan: 'No clan', // По умолчанию игрок не в клане
        registrationDate: new Date().toISOString()
    };
    
    playersDatabase[name.toLowerCase()] = newPlayer;
    
    // Авторизуем игрока
    currentUser = newPlayer;
    
    // Сохраняем данные в localStorage
    savePlayersDatabase();
    saveCurrentUser();
    
    // Закрываем модальное окно
    closeRegistrationModal();
    
    // Показываем сообщение об успехе
    showMessage(`Добро пожаловать, ${name}!`, 'success');
    
    // Обновляем интерфейс
    updatePlayerInterface();
    
    console.log('Player registered:', newPlayer);
}

// Вход игрока
function loginPlayer() {
    const name = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    // Валидация
    if (!name || !password) {
        showMessage('Введите имя и пароль!', 'error');
        return;
    }
    
    // Проверяем данные (ищем по точному имени и по нижнему регистру)
    let player = playersDatabase[name] || playersDatabase[name.toLowerCase()];
    if (!player) {
        showMessage('Игрок не найден!', 'error');
        return;
    }
    
    if (player.password !== password) {
        showMessage('Неверный пароль!', 'error');
        return;
    }
    
    // Авторизуем игрока
    currentUser = player;
    
    // Сохраняем текущего пользователя в localStorage
    saveCurrentUser();
    
    // Закрываем модальное окно
    closeLoginModal();
    
    // Показываем сообщение об успехе
    showMessage(`Добро пожаловать обратно, ${name}!`, 'success');
    
    // Обновляем интерфейс
    updatePlayerInterface();
    
    console.log('Player logged in:', player);
}

// Закрытие модального окна регистрации
function closeRegistrationModal() {
    const modal = document.getElementById('registration-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Закрытие модального окна входа
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Переменная для отслеживания количества сообщений
window.messageStack = 0;

// Показ сообщения
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    
    // Вычисляем позицию для стека сообщений (снизу вверх)
    const bottomPosition = 20 + (window.messageStack * 60); // 60px между сообщениями (уменьшено для меньших сообщений)
    
    message.style.cssText = `
        position: fixed;
        bottom: ${bottomPosition}px;
        left: 20px;
        background: ${type === 'error' ? 'linear-gradient(135deg, #d32f2f, #b71c1c)' : 
                    type === 'success' ? 'linear-gradient(135deg, #2e7d32, #1b5e20)' : 
                    'linear-gradient(135deg, var(--charcoal-black), var(--deep-black))'};
        border: 1px solid var(--warm-gold);
        padding: 0.5rem 1rem;
        color: var(--cream);
        z-index: 2001;
        font-family: var(--font-sans);
        animation: slideInLeft 0.3s ease;
        border-radius: 2px;
        max-width: 150px;
        font-size: 0.7rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    message.innerHTML = `
        <div style="font-weight: bold;">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'} ${text}</div>
    `;
    
    document.body.appendChild(message);
    
    // Увеличиваем счетчик сообщений
    window.messageStack++;
    
    setTimeout(() => {
        if (document.body.contains(message)) {
            document.body.removeChild(message);
            // Уменьшаем счетчик сообщений
            window.messageStack--;
        }
    }, 3000);
}

// Обновление интерфейса игрока
function updatePlayerInterface() {
    // Скрываем админские инструменты по умолчанию
    const adminToolsContainer = document.getElementById('admin-tools-container');
    if (adminToolsContainer) {
        adminToolsContainer.style.display = 'none';
    }
    
    if (!currentUser) return;
    
    // Показываем админские инструменты только для админа
    if (adminToolsContainer) {
        adminToolsContainer.style.display = currentUser.role === 'admin' ? 'flex' : 'none';
    }
    
    // Обновляем панель управления территориями
    updatePlayerStats();
    
    // Показываем кнопку выхода
    showLogoutButton();
    
    // Обновляем селектор игрока в системе территорий
    if (typeof updateTerritoryPlayerSelector !== 'undefined') {
        updateTerritoryPlayerSelector(currentUser);
    }
}

// Показ кнопки выхода и отчета, скрытие кнопок авторизации
function showLogoutButton() {
    // Удаляем существующие кнопки, если есть
    const existingLogoutButton = document.getElementById('logout-button');
    const existingReportButton = document.getElementById('report-button');
    if (existingLogoutButton) {
        existingLogoutButton.remove();
    }
    if (existingReportButton) {
        existingReportButton.remove();
    }
    
    // Скрываем кнопки авторизации
    const authButtons = document.getElementById('game-auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'none';
    }
    
    // Добавляем кнопки выхода и отчета в игровую панель
    const gameControls = document.querySelector('.game-controls');
    if (gameControls && currentUser) {
        // Кнопка отчета (только для игроков, не для админов)
        if (currentUser.role !== 'admin') {
            const reportButton = document.createElement('button');
            reportButton.id = 'report-button';
            reportButton.innerHTML = '📊 Отчет';
            reportButton.style.cssText = `
                background: linear-gradient(45deg, var(--steel-blue), var(--midnight-blue));
                border: 2px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.5rem 1rem;
                margin-right: 1rem;
                font-family: var(--font-sans);
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s ease;
            `;
            reportButton.onclick = showFinancialReport;
            
            // Добавляем hover эффект
            reportButton.onmouseover = function() {
                this.style.background = 'linear-gradient(45deg, var(--warm-gold), var(--copper))';
                this.style.color = 'var(--deep-black)';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            };
            reportButton.onmouseout = function() {
                this.style.background = 'linear-gradient(45deg, var(--steel-blue), var(--midnight-blue))';
                this.style.color = 'var(--cream)';
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            };
            
            gameControls.insertBefore(reportButton, gameControls.firstChild);
        }
        
        // Кнопка выхода
        const logoutButton = document.createElement('button');
        logoutButton.id = 'logout-button';
        logoutButton.innerHTML = `Выйти (${currentUser.name})`;
        logoutButton.style.cssText = `
            background: linear-gradient(45deg, var(--concrete), var(--dark-concrete));
            border: 2px solid var(--warm-gold);
            color: var(--cream);
            padding: 0.5rem 1rem;
            margin-right: 1rem;
            font-family: var(--font-sans);
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.3s ease;
        `;
        logoutButton.onclick = logoutPlayer;
        
        // Добавляем hover эффект
        logoutButton.onmouseover = function() {
            this.style.background = 'linear-gradient(45deg, #d32f2f, #b71c1c)';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        };
        logoutButton.onmouseout = function() {
            this.style.background = 'linear-gradient(45deg, var(--concrete), var(--dark-concrete))';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        
        gameControls.insertBefore(logoutButton, gameControls.firstChild);
    }
}

// Показ финансового отчета
function showFinancialReport() {
    if (!currentUser || currentUser.role === 'admin') {
        showMessage('Отчет доступен только для игроков', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'financial-report-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        font-family: var(--font-sans);
    `;
    
    // Получаем данные о заведениях игрока
    const playerEstablishments = getPlayerEstablishments();
    const totalEstablishments = playerEstablishments.length;
    const totalIncome = currentUser.totalIncome || 0;
    const currentMoney = currentUser.money || 0;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, var(--charcoal-black), var(--deep-black));
            border: 3px solid var(--warm-gold);
            padding: 2rem;
            max-width: 700px;
            width: 90%;
            text-align: center;
            position: relative;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="position: absolute; top: -2px; right: -2px; width: 20px; height: 20px; border-top: 2px solid var(--warm-gold); border-right: 2px solid var(--warm-gold); clip-path: polygon(0 0, 100% 0, 100% 100%);"></div>
            
            <!-- Заголовок отчета -->
            <div style="margin-bottom: 2rem;">
                <h2 style="color: var(--warm-gold); font-family: var(--font-serif); font-size: 2rem; margin-bottom: 0.5rem; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">
                    📊 ФИНАНСОВЫЙ ОТЧЕТ
                </h2>
                <div style="color: var(--cream); font-size: 1.1rem; margin-bottom: 1rem;">
                    Игрок: <span style="color: var(--warm-gold); font-weight: bold;">${currentUser.name}</span>
                </div>
                <div style="color: var(--cream); font-size: 0.9rem; opacity: 0.8;">
                    Дата: ${new Date().toLocaleDateString('ru-RU', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
            
            <!-- Основные показатели -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="
                    background: linear-gradient(135deg, rgba(139, 115, 85, 0.2), rgba(139, 115, 85, 0.1));
                    border: 2px solid var(--warm-gold);
                    padding: 1.5rem;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="color: var(--warm-gold); font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">
                        $${currentMoney.toLocaleString()}
                    </div>
                    <div style="color: var(--cream); font-size: 0.9rem; text-transform: uppercase;">
                        Текущий баланс
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, rgba(139, 115, 85, 0.2), rgba(139, 115, 85, 0.1));
                    border: 2px solid var(--warm-gold);
                    padding: 1.5rem;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="color: var(--warm-gold); font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">
                        $${totalIncome}/час
                    </div>
                    <div style="color: var(--cream); font-size: 0.9rem; text-transform: uppercase;">
                        Доход в час
                    </div>
                </div>
                
                <div style="
                    background: linear-gradient(135deg, rgba(139, 115, 85, 0.2), rgba(139, 115, 85, 0.1));
                    border: 2px solid var(--warm-gold);
                    padding: 1.5rem;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="color: var(--warm-gold); font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">
                        ${totalEstablishments}
                    </div>
                    <div style="color: var(--cream); font-size: 0.9rem; text-transform: uppercase;">
                        Заведений
                    </div>
                </div>
            </div>
            
            <!-- Детализация по заведениям -->
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--warm-gold); font-family: var(--font-serif); font-size: 1.3rem; margin-bottom: 1rem; text-align: left;">
                    🏢 ВЛАДЕНИЯ И ДОХОДЫ
                </h3>
                
                ${totalEstablishments > 0 ? `
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--warm-gold); border-radius: 4px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                            <thead>
                                <tr style="background: rgba(139, 115, 85, 0.3);">
                                    <th style="padding: 0.75rem; color: var(--warm-gold); border-bottom: 1px solid var(--warm-gold); text-align: left;">Заведение</th>
                                    <th style="padding: 0.75rem; color: var(--warm-gold); border-bottom: 1px solid var(--warm-gold); text-align: left;">Тип</th>
                                    <th style="padding: 0.75rem; color: var(--warm-gold); border-bottom: 1px solid var(--warm-gold); text-align: right;">Доход/час</th>
                                    <th style="padding: 0.75rem; color: var(--warm-gold); border-bottom: 1px solid var(--warm-gold); text-align: right;">Стоимость</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${playerEstablishments.map(establishment => `
                                    <tr style="border-bottom: 1px solid rgba(139, 115, 85, 0.2);">
                                        <td style="padding: 0.75rem; color: var(--cream); border-right: 1px solid rgba(139, 115, 85, 0.2);">
                                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                <div style="width: 12px; height: 12px; background: ${currentUser.color}; border-radius: 50%; border: 1px solid var(--warm-gold);"></div>
                                                ${establishment.name}
                                            </div>
                                        </td>
                                        <td style="padding: 0.75rem; color: var(--cream); border-right: 1px solid rgba(139, 115, 85, 0.2);">
                                            ${establishment.type}
                                        </td>
                                        <td style="padding: 0.75rem; color: var(--warm-gold); font-weight: bold; border-right: 1px solid rgba(139, 115, 85, 0.2); text-align: right;">
                                            $${establishment.income}
                                        </td>
                                        <td style="padding: 0.75rem; color: var(--cream); text-align: right;">
                                            $${establishment.captureCost}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div style="
                        background: rgba(139, 115, 85, 0.1);
                        border: 2px dashed var(--warm-gold);
                        padding: 2rem;
                        border-radius: 8px;
                        color: var(--cream);
                        font-style: italic;
                    ">
                        🏪 У вас пока нет заведений.<br>
                        Захватите или купите заведения на карте для получения дохода!
                    </div>
                `}
            </div>
            
            <!-- Дополнительная информация -->
            <div style="
                background: rgba(139, 115, 85, 0.1);
                border: 1px solid var(--warm-gold);
                padding: 1.5rem;
                border-radius: 8px;
                margin-bottom: 2rem;
                text-align: left;
            ">
                <h4 style="color: var(--warm-gold); margin-bottom: 1rem; font-family: var(--font-serif);">
                    📈 СТАТИСТИКА ИГРОКА
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; color: var(--cream);">
                    <div>
                        <strong>Клан:</strong> ${currentUser.clan || 'Не в клане'}
                    </div>
                    <div>
                        <strong>Дата регистрации:</strong> ${new Date(currentUser.registrationDate).toLocaleDateString('ru-RU')}
                    </div>
                    <div>
                        <strong>Цвет игрока:</strong> 
                        <span style="display: inline-block; width: 16px; height: 16px; background: ${currentUser.color}; border: 1px solid var(--warm-gold); border-radius: 50%; margin-left: 0.5rem; vertical-align: middle;"></span>
                    </div>
                </div>
            </div>
            
            <!-- Прогноз доходов -->
            ${totalIncome > 0 ? `
                <div style="
                    background: linear-gradient(135deg, rgba(46, 125, 50, 0.2), rgba(46, 125, 50, 0.1));
                    border: 2px solid #2e7d32;
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 2rem;
                ">
                    <h4 style="color: #4caf50; margin-bottom: 1rem; font-family: var(--font-serif);">
                        💰 ПРОГНОЗ ДОХОДОВ
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; color: var(--cream);">
                        <div>
                            <strong>Час:</strong> $${totalIncome}
                        </div>
                        <div>
                            <strong>День:</strong> $${(totalIncome * 24).toLocaleString()}
                        </div>
                        <div>
                            <strong>Неделя:</strong> $${(totalIncome * 24 * 7).toLocaleString()}
                        </div>
                        <div>
                            <strong>Месяц:</strong> $${(totalIncome * 24 * 30).toLocaleString()}
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <!-- Кнопка закрытия -->
            <button onclick="closeFinancialReport()" style="
                background: linear-gradient(45deg, var(--concrete), var(--dark-concrete));
                border: 2px solid var(--warm-gold);
                color: var(--cream);
                padding: 0.75rem 2rem;
                cursor: pointer;
                font-weight: bold;
                text-transform: uppercase;
                transition: all 0.3s ease;
                border-radius: 4px;
                font-family: var(--font-sans);
            ">Закрыть отчет</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Получение заведений игрока из системы территорий
function getPlayerEstablishments() {
    const establishments = [];
    
    // Проверяем, есть ли данные о заведениях в localStorage
    if (typeof window.currentMarkupData !== 'undefined' && window.currentMarkupData && window.currentMarkupData.establishments) {
        window.currentMarkupData.establishments.forEach(establishment => {
            if (establishment.owner && establishment.owner.name === currentUser.name) {
                establishments.push(establishment);
            }
        });
    }
    
    return establishments;
}

// Закрытие финансового отчета
function closeFinancialReport() {
    const modal = document.getElementById('financial-report-modal');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Выход игрока
function logoutPlayer() {
    currentUser = null;
    
    // Очищаем текущего пользователя из localStorage
    localStorage.removeItem('gangsters_current_user');
    
    // Удаляем кнопки выхода и отчета
    const logoutButton = document.getElementById('logout-button');
    const reportButton = document.getElementById('report-button');
    if (logoutButton) {
        logoutButton.remove();
    }
    if (reportButton) {
        reportButton.remove();
    }
    
    // Показываем кнопки авторизации
    const authButtons = document.getElementById('game-auth-buttons');
    if (authButtons) {
        authButtons.style.display = 'block';
    }
    
    // Скрываем админские инструменты
    const adminToolsContainer = document.getElementById('admin-tools-container');
    if (adminToolsContainer) {
        adminToolsContainer.style.display = 'none';
    }
    
    // Обновляем интерфейс
    updatePlayerStats();
    
    // Показываем сообщение
    showMessage('Вы вышли из игры', 'info');
    
    console.log('Player logged out');
}

// Проверка авторизации перед игровыми действиями
function checkAuth() {
    if (!currentUser) {
        showMessage('Необходимо войти в игру!', 'error');
        showLoginModal();
        return false;
    }
    return true;
}

// Функция для принудительного обновления базы данных (для отладки)
function forceUpdateDatabase() {
    console.log('Принудительное обновление базы данных...');
    savePlayersDatabase();
    console.log('Текущая база данных:', playersDatabase);
    showMessage('База данных обновлена!', 'success');
}

// Экспортируем функцию для использования в консоли
window.forceUpdateDatabase = forceUpdateDatabase;

// Экспорт функций
window.showRegistrationModal = showRegistrationModal;
window.showLoginModal = showLoginModal;
window.closeRegistrationModal = closeRegistrationModal;
window.closeLoginModal = closeLoginModal;
window.registerPlayer = registerPlayer;
window.loginPlayer = loginPlayer;
window.logoutPlayer = logoutPlayer;
window.checkAuth = checkAuth;
window.currentUser = () => currentUser;
window.saveCurrentUser = saveCurrentUser;
window.showFinancialReport = showFinancialReport;
window.closeFinancialReport = closeFinancialReport;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Загружаем базу данных игроков
    loadPlayersDatabase();
    
    // Пытаемся загрузить текущего пользователя
    if (loadCurrentUser()) {
        console.log('User auto-logged in:', currentUser.name);
        // Обновляем интерфейс для авторизованного пользователя
        updatePlayerInterface();
    }
});
