// Система пользовательского интерфейса
class UISystem {
    constructor() {
        this.currentScreen = 'loading';
        this.notifications = [];
        this.modals = new Map();
        this.tooltips = new Map();
        
        this.initUI();
    }

    initUI() {
        this.setupEventListeners();
        this.setupTooltips();
        this.startUISystem();
    }

    setupEventListeners() {
        // Обработчики для кнопок меню
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-btn')) {
                this.handleMenuButtonClick(e.target);
            }
        });

        // Обработчики для клавиатуры
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Обработчики для мобильных устройств
        if ('ontouchstart' in window) {
            this.setupTouchEvents();
        }
    }

    setupTouchEvents() {
        // Обработчики для сенсорных устройств
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        });

        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });
    }

    handleMenuButtonClick(button) {
        const action = button.getAttribute('onclick');
        if (action) {
            // Добавляем визуальную обратную связь
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        }
    }

    handleKeyPress(e) {
        // Обработка горячих клавиш
        switch (e.key) {
            case 'Escape':
                this.closeCurrentModal();
                break;
            case 'Enter':
                this.handleEnterKey();
                break;
            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }

    handleTouchStart(e) {
        // Обработка начала касания
        const target = e.target;
        if (target.classList.contains('touchable')) {
            target.style.opacity = '0.7';
        }
    }

    handleTouchEnd(e) {
        // Обработка окончания касания
        const target = e.target;
        if (target.classList.contains('touchable')) {
            target.style.opacity = '';
        }
    }

    handleEnterKey() {
        // Обработка нажатия Enter
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'BUTTON') {
            activeElement.click();
        }
    }

    handleTabKey(e) {
        // Обработка навигации по Tab
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
        
        if (nextIndex >= 0 && nextIndex < focusableElements.length) {
            focusableElements[nextIndex].focus();
            e.preventDefault();
        }
    }

    setupTooltips() {
        // Настройка всплывающих подсказок
        document.addEventListener('mouseover', (e) => {
            const tooltip = e.target.getAttribute('data-tooltip');
            if (tooltip) {
                this.showTooltip(e.target, tooltip);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const tooltip = e.target.getAttribute('data-tooltip');
            if (tooltip) {
                this.hideTooltip();
            }
        });
    }

    showTooltip(element, text) {
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.id = 'tooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        this.tooltips.set('main', tooltip);
    }

    hideTooltip() {
        const tooltip = this.tooltips.get('main');
        if (tooltip) {
            tooltip.remove();
            this.tooltips.delete('main');
        }
    }

    startUISystem() {
        // Запускаем систему обновления UI
        setInterval(() => {
            this.updateUI();
        }, 1000);
    }

    updateUI() {
        this.updatePlayerInfo();
        this.updateNotifications();
        this.updateActiveEvents();
        this.updateMapMarkers();
    }

    updatePlayerInfo() {
        if (!game || !game.player) return;
        
        const player = game.player;
        
        // Обновляем информацию о деньгах
        const moneyElements = document.querySelectorAll('.player-money');
        moneyElements.forEach(el => {
            el.textContent = `$${player.money.toLocaleString()}`;
        });
        
        // Обновляем информацию об уровне
        const levelElements = document.querySelectorAll('.player-level');
        levelElements.forEach(el => {
            el.textContent = `Уровень ${player.level}`;
        });
        
        // Обновляем информацию о клане
        const clanNameElements = document.querySelectorAll('.clan-name');
        const clanMembersElements = document.querySelectorAll('.clan-members');
        
        if (player.clanId) {
            const clan = game.clans.get(player.clanId);
            if (clan) {
                clanNameElements.forEach(el => el.textContent = clan.name);
                clanMembersElements.forEach(el => el.textContent = `${clan.members.length}/20`);
            }
        } else {
            clanNameElements.forEach(el => el.textContent = 'Без клана');
            clanMembersElements.forEach(el => el.textContent = '0/20');
        }
    }

    updateNotifications() {
        // Обновляем уведомления
        const notificationContainer = document.getElementById('notifications');
        if (!notificationContainer) return;
        
        // Удаляем старые уведомления
        const oldNotifications = notificationContainer.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            const timestamp = parseInt(notification.dataset.timestamp);
            if (Date.now() - timestamp > 5000) {
                notification.remove();
            }
        });
    }

    updateActiveEvents() {
        // Обновляем информацию об активных событиях
        if (!game || !game.eventSystem) return;
        
        const activeEvents = game.eventSystem.getActiveEvents();
        const eventContainer = document.getElementById('active-events');
        
        if (eventContainer) {
            eventContainer.innerHTML = '';
            
            activeEvents.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = 'active-event';
                eventEl.innerHTML = `
                    <span class="event-icon">${event.icon}</span>
                    <span class="event-name">${event.name}</span>
                    <span class="event-time">${this.formatTime(event.remainingTime)}</span>
                `;
                eventContainer.appendChild(eventEl);
            });
        }
    }

    updateMapMarkers() {
        // Обновляем маркеры на карте
        if (!game || !game.map) return;
        
        game.map.venues.forEach((venue, venueId) => {
            const marker = game.map.venueMarkers.get(venueId);
            if (marker) {
                // Обновляем цвет маркера
                const color = game.map.getVenueColor(venue);
                marker.options.set('iconColor', color);
                
                // Обновляем содержимое балуна
                marker.properties.set('balloonContent', game.map.createVenueBalloon(venue));
            }
        });
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}д ${hours % 24}ч`;
        } else if (hours > 0) {
            return `${hours}ч ${minutes % 60}м`;
        } else if (minutes > 0) {
            return `${minutes}м ${seconds % 60}с`;
        } else {
            return `${seconds}с`;
        }
    }

    showScreen(screenId) {
        // Показываем экран
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
    }

    showModal(modalId, content) {
        // Показываем модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = modalId;
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${content.title || 'Уведомление'}</h3>
                    <button class="modal-close" onclick="ui.closeModal('${modalId}')">×</button>
                </div>
                <div class="modal-body">
                    ${content.body || ''}
                </div>
                <div class="modal-footer">
                    ${content.buttons || ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modals.set(modalId, modal);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                this.modals.delete(modalId);
            }, 300);
        }
    }

    closeCurrentModal() {
        // Закрываем последнее открытое модальное окно
        const modals = Array.from(this.modals.values());
        if (modals.length > 0) {
            const lastModal = modals[modals.length - 1];
            this.closeModal(lastModal.id);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.dataset.timestamp = Date.now();
        
        const container = document.getElementById('notifications');
        if (container) {
            container.appendChild(notification);
            
            // Анимация появления
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Автоматическое удаление
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
        }
    }

    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        const modalId = 'confirm_' + Math.random().toString(36).substr(2, 9);
        const content = {
            title: title,
            body: `<p>${message}</p>`,
            buttons: `
                <button class="btn btn-primary" onclick="ui.confirmDialog('${modalId}', true)">Да</button>
                <button class="btn btn-secondary" onclick="ui.confirmDialog('${modalId}', false)">Нет</button>
            `
        };
        
        this.showModal(modalId, content);
        
        // Сохраняем обработчики
        this.modals.set(modalId + '_confirm', onConfirm);
        this.modals.set(modalId + '_cancel', onCancel);
    }

    confirmDialog(modalId, confirmed) {
        const handler = confirmed 
            ? this.modals.get(modalId + '_confirm')
            : this.modals.get(modalId + '_cancel');
        
        if (handler) {
            handler();
        }
        
        this.closeModal(modalId);
        this.modals.delete(modalId + '_confirm');
        this.modals.delete(modalId + '_cancel');
    }

    showInputDialog(title, message, placeholder = '', onConfirm, onCancel = null) {
        const modalId = 'input_' + Math.random().toString(36).substr(2, 9);
        const content = {
            title: title,
            body: `
                <p>${message}</p>
                <input type="text" id="${modalId}_input" placeholder="${placeholder}" class="form-input">
            `,
            buttons: `
                <button class="btn btn-primary" onclick="ui.inputDialog('${modalId}', true)">ОК</button>
                <button class="btn btn-secondary" onclick="ui.inputDialog('${modalId}', false)">Отмена</button>
            `
        };
        
        this.showModal(modalId, content);
        
        // Фокус на поле ввода
        setTimeout(() => {
            const input = document.getElementById(modalId + '_input');
            if (input) {
                input.focus();
            }
        }, 100);
        
        // Сохраняем обработчики
        this.modals.set(modalId + '_confirm', onConfirm);
        this.modals.set(modalId + '_cancel', onCancel);
    }

    inputDialog(modalId, confirmed) {
        const handler = confirmed 
            ? this.modals.get(modalId + '_confirm')
            : this.modals.get(modalId + '_cancel');
        
        if (handler) {
            const input = document.getElementById(modalId + '_input');
            const value = input ? input.value : '';
            handler(value);
        }
        
        this.closeModal(modalId);
        this.modals.delete(modalId + '_confirm');
        this.modals.delete(modalId + '_cancel');
    }

    showLoadingScreen(message = 'Загрузка...') {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            const messageEl = loadingScreen.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            this.showScreen('loading-screen');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    }

    updateProgressBar(progress) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    // Методы для анимаций
    animateElement(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const increment = 16 / duration; // 60 FPS
        
        const timer = setInterval(() => {
            opacity += increment;
            element.style.opacity = opacity;
            
            if (opacity >= 1) {
                clearInterval(timer);
                element.style.opacity = '1';
            }
        }, 16);
    }

    fadeOut(element, duration = 300) {
        let opacity = 1;
        const decrement = 16 / duration; // 60 FPS
        
        const timer = setInterval(() => {
            opacity -= decrement;
            element.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(timer);
                element.style.display = 'none';
                element.style.opacity = '1';
            }
        }, 16);
    }

    // Методы для адаптивности
    isMobile() {
        return window.innerWidth <= 768;
    }

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    isDesktop() {
        return window.innerWidth > 1024;
    }

    updateLayout() {
        // Обновляем макет в зависимости от размера экрана
        const body = document.body;
        
        if (this.isMobile()) {
            body.classList.add('mobile');
            body.classList.remove('tablet', 'desktop');
        } else if (this.isTablet()) {
            body.classList.add('tablet');
            body.classList.remove('mobile', 'desktop');
        } else {
            body.classList.add('desktop');
            body.classList.remove('mobile', 'tablet');
        }
    }

    // Методы для работы с формами
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('error');
            });
        }
    }

    // Методы для работы с данными
    formatNumber(number) {
        return number.toLocaleString();
    }

    formatCurrency(amount) {
        return `$${amount.toLocaleString()}`;
    }

    formatPercentage(value) {
        return `${(value * 100).toFixed(1)}%`;
    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days}д ${hours % 24}ч`;
        } else if (hours > 0) {
            return `${hours}ч ${minutes % 60}м`;
        } else if (minutes > 0) {
            return `${minutes}м ${seconds % 60}с`;
        } else {
            return `${seconds}с`;
        }
    }
}

// Глобальная переменная для системы UI
let ui;

// Инициализация UI при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    ui = new UISystem();
    
    // Обновляем макет при изменении размера окна
    window.addEventListener('resize', () => {
        ui.updateLayout();
    });
    
    // Инициализируем макет
    ui.updateLayout();
});

