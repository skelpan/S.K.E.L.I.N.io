// Глобальные переменные
let state = {
    isListening: false,
    recognition: null,
    synth: window.speechSynthesis,
    settings: JSON.parse(localStorage.getItem('skelin-settings')) || {
        voiceControl: true,
        speechSynthesis: true,
        theme: 'system-red',
        accessLevel: 1
    },
    metrics: {
        processingCores: 225,
        efficiency: 95,
        stability: 2.1,
        activeNeurons: 15642,
        connections: 482000
    },
    activeSystems: new Set(),
    security: {
        threats: 2,
        monitoring: true,
        encryption: true
    },
    location: {
        latitude: 55.7558,
        longitude: 37.6173,
        city: 'Москва'
    }
};

// Модуль управления голосом
const VoiceManager = {
    voices: [],
    currentVoice: null,
    
    init() {
        this.loadVoices();
        this.loadSettings();
    },
    
    loadVoices() {
        const loadVoices = () => {
            this.voices = state.synth.getVoices();
            if (this.voices.length > 0) {
                this.setMaleVoice();
            }
        };
        
        loadVoices();
        
        if (state.synth.onvoiceschanged !== undefined) {
            state.synth.onvoiceschanged = loadVoices;
        }
    },
    
    setMaleVoice() {
        // Предпочтение мужским голосам
        const maleVoices = this.voices.filter(voice => 
            voice.lang.includes('ru') && 
            !voice.name.toLowerCase().includes('female') &&
            !voice.name.toLowerCase().includes('женск')
        );
        
        this.currentVoice = maleVoices.find(voice => 
            voice.name.includes('Google') || voice.name.includes('Yandex')
        ) || maleVoices[0] || this.voices[0];
    },
    
    loadSettings() {
        const savedRate = localStorage.getItem('skelin-voice-rate') || '1.0';
        const savedPitch = localStorage.getItem('skelin-voice-pitch') || '1.0';
        const savedVolume = localStorage.getItem('skelin-voice-volume') || '0.8';
        
        document.getElementById('voice-rate').value = savedRate;
        document.getElementById('voice-pitch').value = savedPitch;
        document.getElementById('voice-volume').value = savedVolume;
        
        this.updateDisplayValues();
    },
    
    getVoiceSettings() {
        return {
            rate: parseFloat(localStorage.getItem('skelin-voice-rate') || '1.0'),
            pitch: parseFloat(localStorage.getItem('skelin-voice-pitch') || '1.0'),
            volume: parseFloat(localStorage.getItem('skelin-voice-volume') || '0.8')
        };
    },
    
    speak(text) {
        if (!state.settings.speechSynthesis) return;
        
        if (state.synth.speaking) {
            state.synth.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        const settings = this.getVoiceSettings();
        
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        utterance.lang = 'ru-RU';
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;
        
        state.synth.speak(utterance);
    },
    
    setRate(rate) {
        localStorage.setItem('skelin-voice-rate', rate.toString());
    },
    
    setPitch(pitch) {
        localStorage.setItem('skelin-voice-pitch', pitch.toString());
    },
    
    setVolume(volume) {
        localStorage.setItem('skelin-voice-volume', volume.toString());
    },
    
    updateDisplayValues() {
        const settings = this.getVoiceSettings();
        document.getElementById('rate-value').textContent = settings.rate;
        document.getElementById('pitch-value').textContent = settings.pitch;
        document.getElementById('volume-value').textContent = settings.volume;
    }
};

// Пресеты голосов
const voicePresets = {
    standard: { rate: 1.0, pitch: 1.0, volume: 0.8 },
    professional: { rate: 0.9, pitch: 0.9, volume: 0.9 },
    assistant: { rate: 1.1, pitch: 1.1, volume: 0.7 }
};

// Описания систем
const systemDescriptions = {
    'deep-learning': {
        name: 'Глубокое обучение',
        description: 'Многослойные нейронные сети для сложных задач',
        action: 'Запуск алгоритмов глубокого обучения...',
        effect: () => {
            state.metrics.activeNeurons += 500;
            state.metrics.efficiency += 2;
            updateMetrics();
        }
    },
    'pattern-recognition': {
        name: 'Распознавание образов',
        description: 'Анализ и классификация паттернов в данных',
        action: 'Сканирование данных для распознавания образов...',
        effect: () => {
            state.metrics.connections += 25000;
            updateMetrics();
        }
    },
    'neural-optimization': {
        name: 'Оптимизация сетей',
        description: 'Улучшение производительности нейронных сетей',
        action: 'Оптимизация архитектуры нейронных сетей...',
        effect: () => {
            state.metrics.efficiency += 3;
            state.metrics.stability -= 0.1;
            updateMetrics();
        }
    },
    'computation': {
        name: 'Вычислительные процессы',
        description: 'Параллельные вычисления на процессорных ядрах',
        action: 'Инициализация вычислительных процессов...',
        effect: () => {
            state.metrics.processingCores += 10;
            updateMetrics();
        }
    },
    'synchronization': {
        name: 'Синхронизация систем',
        description: 'Синхронизация работы всех модулей',
        action: 'Установка синхронизации между системами...',
        effect: () => {
            state.metrics.efficiency += 1;
            state.metrics.stability += 0.2;
            updateMetrics();
        }
    },
    'parallel-processing': {
        name: 'Параллельная обработка',
        description: 'Обработка данных в параллельном режиме',
        action: 'Активация параллельной обработки данных...',
        effect: () => {
            state.metrics.processingCores += 5;
            state.metrics.efficiency += 2;
            updateMetrics();
        }
    },
    'network': {
        name: 'Сетевая инфраструктура',
        description: 'Управление сетевыми соединениями',
        action: 'Настройка сетевых протоколов...',
        effect: () => {
            state.metrics.connections += 15000;
            updateMetrics();
        }
    },
    'data-streams': {
        name: 'Потоки данных',
        description: 'Обработка потоков данных в реальном времени',
        action: 'Оптимизация потоков данных...',
        effect: () => {
            state.metrics.efficiency += 1;
            updateMetrics();
        }
    },
    'api-gateways': {
        name: 'API шлюзы',
        description: 'Управление интерфейсами взаимодействия',
        action: 'Настройка API шлюзов...',
        effect: () => {
            state.metrics.connections += 10000;
            updateMetrics();
        }
    }
};

// Модуль управления системами
const SystemManager = {
    activateSystem(systemId) {
        const system = systemDescriptions[systemId];
        if (!system) return;
        
        state.activeSystems.add(systemId);
        
        // Визуальная обратная связь
        const button = document.querySelector(`[data-system="${systemId}"]`);
        if (button) {
            button.classList.add('system-activating');
            setTimeout(() => button.classList.remove('system-activating'), 600);
        }
        
        // Системное сообщение
        this.addSystemMessage(system.action);
        
        // Эффект системы
        if (system.effect) {
            system.effect();
        }
        
        // Голосовое подтверждение
        VoiceManager.speak(`Система ${system.name} активирована`);
        
        // Обновление статуса
        this.updateSystemStatus(`✅ ${system.name} - АКТИВИРОВАНА`);
    },
    
    addSystemMessage(message) {
        const chat = document.getElementById('chat-container');
        if (chat) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message skelin-message';
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <div class="system-pulse"></div>
                    <i class="fas fa-brain"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${message}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            chat.appendChild(messageDiv);
            chat.scrollTop = chat.scrollHeight;
        }
    },
    
    updateSystemStatus(message) {
        const panel = document.getElementById('system-status-panel');
        if (panel) {
            const timestamp = new Date().toLocaleTimeString();
            panel.innerHTML = `
                <div class="status-message system-active">
                    <i class="fas fa-check-circle"></i>
                    ${message} [${timestamp}]
                </div>
            `;
        }
    }
};

// Модуль безопасности
const SecurityManager = {
    correctKey1: 'S.K.E.L.I.N',
    correctKey2: 'skelpan',
    
    authenticate() {
        const key1 = document.getElementById('access-key-1').value;
        const key2 = document.getElementById('access-key-2').value;
        const result = document.getElementById('security-result');
        const accessLevel = document.getElementById('current-access-level');
        
        if (key1 === this.correctKey1 && key2 === this.correctKey2) {
            state.settings.accessLevel = 3;
            accessLevel.textContent = '3';
            result.className = 'security-result success';
            result.innerHTML = `
                <i class="fas fa-shield-check"></i> 
                Аутентификация успешна! Уровень доступа повышен до максимального.
            `;
            this.addSecurityEvent('Повышение уровня защиты до 3', 'success');
            VoiceManager.speak('Аутентификация успешна. Уровень доступа повышен.');
            
            // Разблокировка дополнительных функций
            this.unlockAdvancedFeatures();
        } else {
            result.className = 'security-result error';
            result.innerHTML = `
                <i class="fas fa-shield-exclamation"></i> 
                Ошибка аутентификации! Проверьте ключи доступа.
            `;
            this.addSecurityEvent('Неудачная попытка аутентификации', 'danger');
            VoiceManager.speak('Ошибка аутентификации. Проверьте ключи доступа.');
        }
    },
    
    unlockAdvancedFeatures() {
        // Добавляем дополнительные системы при успешной аутентификации
        const advancedSystems = [
            'Расширенный анализ угроз',
            'Глубокое сканирование сети',
            'Криптографическая защита',
            'Резервное копирование'
        ];
        
        advancedSystems.forEach(system => {
            this.addSecurityEvent(`Разблокирована: ${system}`, 'success');
        });
        
        // Обновляем статус безопасности
        state.security.threats = 0;
        updateSecurityStatus();
    },
    
    addSecurityEvent(message, type) {
        const events = document.getElementById('system-events');
        if (events) {
            const eventDiv = document.createElement('div');
            eventDiv.className = `system-event ${type}`;
            eventDiv.innerHTML = `
                <div class="event-icon">
                    <i class="fas fa-${type === 'success' ? 'shield-check' : 'exclamation-triangle'}"></i>
                </div>
                <div class="event-content">
                    <div class="event-title">${message}</div>
                    <div class="event-time">${new Date().toLocaleTimeString()}</div>
                </div>
            `;
            events.appendChild(eventDiv);
            events.scrollTop = events.scrollHeight;
        }
    }
};

// Модуль аналитики и графиков
const AnalyticsManager = {
    chart: null,
    
    init() {
        this.createPerformanceChart();
        this.startRealTimeUpdates();
    },
    
    createPerformanceChart() {
        const ctx = document.getElementById('metricsChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 20}, (_, i) => i + 1),
                datasets: [{
                    label: 'Производительность системы',
                    data: Array.from({length: 20}, () => Math.random() * 20 + 80),
                    borderColor: '#ff003c',
                    backgroundColor: 'rgba(255, 0, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
    },
    
    startRealTimeUpdates() {
        setInterval(() => {
            if (this.chart) {
                const newData = Math.random() * 5 + 90;
                this.chart.data.labels.push(this.chart.data.labels.length + 1);
                this.chart.data.datasets[0].data.push(newData);
                
                if (this.chart.data.labels.length > 20) {
                    this.chart.data.labels.shift();
                    this.chart.data.datasets[0].data.shift();
                }
                
                this.chart.update('none');
            }
        }, 2000);
    }
};

// Модуль системных событий
const EventManager = {
    sources: [
        'Вычислительные системы',
        'Нейронные сети',
        'Сетевая безопасность',
        'Системный мониторинг',
        'API интерфейсы'
    ],
    
    events: [
        'Обнаружена аномалия в работе системы',
        'Нейронная сеть завершила обучение',
        'Установлено новое сетевое соединение',
        'Оптимизированы вычислительные процессы',
        'Обновлены протоколы безопасности',
        'Завершено сканирование системы',
        'Активирован модуль глубокого обучения',
        'Синхронизированы системные процессы'
    ],
    
    init() {
        this.generateInitialEvents();
        setInterval(() => this.addRandomEvent(), 15000);
    },
    
    generateInitialEvents() {
        const eventsContainer = document.getElementById('system-events');
        if (!eventsContainer) return;
        
        eventsContainer.innerHTML = '';
        
        // Генерация 3-5 случайных событий
        const eventCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < eventCount; i++) {
            setTimeout(() => {
                this.addRandomEvent();
            }, i * 1000);
        }
    },
    
    addRandomEvent() {
        const eventsContainer = document.getElementById('system-events');
        if (!eventsContainer) return;
        
        const source = this.sources[Math.floor(Math.random() * this.sources.length)];
        const event = this.events[Math.floor(Math.random() * this.events.length)];
        
        const eventDiv = document.createElement('div');
        eventDiv.className = 'system-event';
        eventDiv.innerHTML = `
            <div class="event-icon">
                <i class="fas fa-bolt"></i>
            </div>
            <div class="event-content">
                <div class="event-title">${event}</div>
                <div class="event-source">Источник: ${source}</div>
                <div class="event-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        eventsContainer.appendChild(eventDiv);
        eventsContainer.scrollTop = events.scrollHeight;
        
        // Ограничение количества событий
        if (eventsContainer.children.length > 8) {
            eventsContainer.removeChild(eventsContainer.firstChild);
        }
    }
};

// Функции обновления интерфейса
function updateMetrics() {
    document.getElementById('processing-cores').textContent = state.metrics.processingCores;
    document.getElementById('efficiency-level').textContent = state.metrics.efficiency + '%';
    document.getElementById('stability-time').textContent = state.metrics.stability.toFixed(1) + 's';
    
    document.getElementById('neurons-value').textContent = state.metrics.activeNeurons.toLocaleString();
    document.getElementById('connections-value').textContent = state.metrics.connections.toLocaleString();
    
    const neuronsFill = document.getElementById('neurons-fill');
    const connectionsFill = document.getElementById('connections-fill');
    
    if (neuronsFill) neuronsFill.style.width = Math.min(100, state.metrics.activeNeurons / 200) + '%';
    if (connectionsFill) connectionsFill.style.width = Math.min(100, state.metrics.connections / 500000) + '%';
}

function updateSecurityStatus() {
    const threatsElement = document.querySelector('.security-item.critical strong');
    if (threatsElement) {
        threatsElement.textContent = state.security.threats;
    }
}

function updateLocation() {
    document.getElementById('latitude').textContent = state.location.latitude;
    document.getElementById('longitude').textContent = state.location.longitude;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Инициализация модулей
    VoiceManager.init();
    AnalyticsManager.init();
    EventManager.init();
    
    // Загрузка сохраненных настроек
    loadSettings();
    
    // Инициализация интерфейса
    updateMetrics();
    updateLocation();
    updateClock();
    
    // Запуск обновлений
    setInterval(updateClock, 1000);
    setInterval(updatePerformanceMetrics, 5000);
    
    // Настройка обработчиков событий
    setupEventListeners();
    
    // Приветственное сообщение
    setTimeout(() => {
        addMessage('Система S.K.E.L.I.N полностью активирована. Все модули готовы к работе.', 'skelin');
        VoiceManager.speak('Система активирована и готова к работе.');
    }, 1000);
}

function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // Управление системами
    document.querySelectorAll('.system-btn').forEach(btn => {
        btn.addEventListener('click', () => SystemManager.activateSystem(btn.dataset.system));
    });

    // Безопасность
    document.getElementById('authenticate-btn').addEventListener('click', () => {
        SecurityManager.authenticate();
    });

    // Голосовые настройки
    document.getElementById('voice-rate').addEventListener('input', (e) => {
        VoiceManager.setRate(e.target.value);
        VoiceManager.updateDisplayValues();
    });

    document.getElementById('voice-pitch').addEventListener('input', (e) => {
        VoiceManager.setPitch(e.target.value);
        VoiceManager.updateDisplayValues();
    });

    document.getElementById('voice-volume').addEventListener('input', (e) => {
        VoiceManager.setVolume(e.target.value);
        VoiceManager.updateDisplayValues();
    });

    // Пресеты голоса
    document.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = voicePresets[btn.dataset.preset];
            document.getElementById('voice-rate').value = preset.rate;
            document.getElementById('voice-pitch').value = preset.pitch;
            document.getElementById('voice-volume').value = preset.volume;
            
            VoiceManager.setRate(preset.rate);
            VoiceManager.setPitch(preset.pitch);
            VoiceManager.setVolume(preset.volume);
            VoiceManager.updateDisplayValues();
            
            VoiceManager.speak('Голосовой модуль настроен на выбранный пресет.');
        });
    });

    // Тест голоса
    document.getElementById('test-voice').addEventListener('click', () => {
        VoiceManager.speak('Тестирование голосового модуля. Система работает стабильно.');
    });

    // Темы оформления
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            document.documentElement.setAttribute('data-theme', option.dataset.theme);
            localStorage.setItem('skelin-theme', option.dataset.theme);
            VoiceManager.speak('Тема интерфейса изменена.');
        });
    });

    // Обновление производительности
    document.getElementById('refresh-performance').addEventListener('click', () => {
        updatePerformanceMetrics();
        VoiceManager.speak('Показатели производительности обновлены.');
    });

    // Обновление событий
    document.getElementById('refresh-events').addEventListener('click', () => {
        EventManager.generateInitialEvents();
        VoiceManager.speak('Лог событий обновлен.');
    });

    // Основные элементы управления
    document.getElementById('send-btn').addEventListener('click', handleSendMessage);
    document.getElementById('text-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    // Голосовой ввод
    document.getElementById('voice-btn').addEventListener('click', startVoiceRecognition);

    // Кнопки быстрых команд
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.dataset.command;
            handleCommand(command);
        });
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');
}

function handleSendMessage() {
    const text = document.getElementById('text-input').value.trim();
    if (text) {
        addMessage(text, 'user');
        document.getElementById('text-input').value = '';
        handleCommand(text);
    }
}

function handleCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    switch(lowerCommand) {
        case 'статус системы':
            showSystemStatus();
            break;
        case 'активировать защиту':
            activateSecurity();
            break;
        case 'показать системы':
            showSystems();
            break;
        case 'нейронный анализ':
            neuralAnalysis();
            break;
        case 'показать карту':
            switchSection('analytics');
            break;
        case 'обучение':
            SystemManager.activateSystem('deep-learning');
            break;
        case 'оптимизация':
            SystemManager.activateSystem('neural-optimization');
            break;
        case 'анализ данных':
            SystemManager.activateSystem('pattern-recognition');
            break;
        case 'ключ доступа':
            switchSection('security');
            break;
        case 'мониторинг':
            showMonitoring();
            break;
        case 'сканирование':
            startScan();
            break;
        case 'команды':
            showCommands();
            break;
        case 'настройки':
            switchSection('settings');
            break;
        default:
            handleUnknownCommand(command);
    }
}

function showSystemStatus() {
    const status = `
        СТАТУС СИСТЕМЫ:
        • Процессорные ядра: ${state.metrics.processingCores}
        • Эффективность: ${state.metrics.efficiency}%
        • Стабильность: ${state.metrics.stability}s
        • Активные нейроны: ${state.metrics.activeNeurons.toLocaleString()}
        • Сетевые связи: ${state.metrics.connections.toLocaleString()}
        • Уровень доступа: ${state.settings.accessLevel}
        • Активные системы: ${state.activeSystems.size}
    `;
    addMessage(status, 'skelin');
    VoiceManager.speak('Система работает стабильно. Все показатели в норме.');
}

function activateSecurity() {
    addMessage('Активация систем защиты... Повышение уровня безопасности.', 'skelin');
    VoiceManager.speak('Системы защиты активированы. Уровень безопасности повышен.');
}

function showSystems() {
    const systems = Object.values(systemDescriptions).map(sys => 
        `• ${sys.name}: ${sys.description}`
    ).join('\n');
    
    addMessage(`ДОСТУПНЫЕ СИСТЕМЫ:\n${systems}`, 'skelin');
}

function neuralAnalysis() {
    addMessage('Запуск нейронного анализа... Анализ структур данных и паттернов.', 'skelin');
    VoiceManager.speak('Провожу нейронный анализ данных.');
}

function showMonitoring() {
    addMessage('Мониторинг системы активен 24/7. Обнаружено угроз: ' + state.security.threats, 'skelin');
}

function startScan() {
    addMessage('Запуск полного сканирования системы...', 'skelin');
    setTimeout(() => {
        state.security.threats = Math.max(0, state.security.threats - 1);
        addMessage('Сканирование завершено. Угроз нейтрализовано. Система стабильна.', 'skelin');
        updateSecurityStatus();
    }, 2000);
}

function showCommands() {
    const commands = `
        ДОСТУПНЫЕ КОМАНДЫ:
        • статус системы - общее состояние
        • активировать защиту - безопасность
        • показать системы - список модулей
        • нейронный анализ - анализ данных
        • показать карту - карта активности
        • обучение - глубокое обучение
        • оптимизация - оптимизация сетей
        • ключ доступа - аутентификация
        • мониторинг - статус защиты
        • сканирование - проверка системы
        • настройки - параметры системы
    `;
    addMessage(commands, 'skelin');
}

function handleUnknownCommand(command) {
    const response = `Команда "${command}" не распознана. Используйте "команды" для списка доступных команд.`;
    addMessage(response, 'skelin');
    VoiceManager.speak('Команда не распознана. Используйте список команд для справки.');
}

function addMessage(text, sender) {
    const chat = document.getElementById('chat-container');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const time = new Date().toLocaleTimeString();
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <div class="system-pulse"></div>
            <i class="fas fa-${sender === 'skelin' ? 'brain' : 'user'}"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

function updateClock() {
    const now = new Date();
    document.getElementById('system-clock').textContent = now.toLocaleTimeString();
    document.getElementById('system-date').textContent = now.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function updatePerformanceMetrics() {
    // Обновление виджета производительности
    const performance = document.getElementById('performance-metrics');
    if (performance) {
        performance.innerHTML = `
            <div class="performance-metric">
                <div class="metric-value">${Math.floor(Math.random() * 1000) + 15000}</div>
                <div class="metric-label">Операций в секунду</div>
            </div>
            <div class="performance-metric">
                <div class="metric-value">${(Math.random() * 0.5 + 99.5).toFixed(1)}%</div>
                <div class="metric-label">Доступность</div>
            </div>
            <div class="performance-metric">
                <div class="metric-value">${Math.floor(Math.random() * 50) + 50}ms</div>
                <div class="metric-label">Задержка</div>
            </div>
        `;
    }
}

function loadSettings() {
    const savedTheme = localStorage.getItem('skelin-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.querySelector(`[data-theme="${savedTheme}"]`)?.classList.add('active');
    }
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        addMessage('Голосовой ввод не поддерживается вашим браузером.', 'skelin');
        return;
    }
    
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!state.recognition) {
        state.recognition = new webkitSpeechRecognition();
        state.recognition.continuous = false;
        state.recognition.interimResults = false;
        state.recognition.lang = 'ru-RU';
        
        state.recognition.onstart = function() {
            state.isListening = true;
            voiceBtn.classList.add('listening');
            addMessage('Слушаю...', 'skelin');
        };
        
        state.recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('text-input').value = transcript;
            handleSendMessage();
        };
        
        state.recognition.onerror = function(event) {
            addMessage('Ошибка распознавания речи.', 'skelin');
        };
        
        state.recognition.onend = function() {
            state.isListening = false;
            voiceBtn.classList.remove('listening');
        };
    }
    
    state.recognition.start();
}

// Глобальные функции
window.startVoiceRecognition = startVoiceRecognition;