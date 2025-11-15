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
    },
    notes: JSON.parse(localStorage.getItem('skelin-notes')) || [],
    weather: {
        temp: null,
        description: null,
        humidity: null,
        windSpeed: null,
        pressure: null
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
            localStorage.setItem('skelin-settings', JSON.stringify(state.settings));
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
        
        // Показываем уведомление
        showNotification('Дополнительные функции разблокированы!', 'success');
        
        // Обновляем интерфейс
        document.querySelectorAll('.security-system').forEach(el => {
            el.classList.add('unlocked-feature');
        });
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

// Модуль погоды
const WeatherManager = {
    apiKey: 'bd5e378503939ddaee76f12ad7a97608',
    currentCity: 'Москва',
    
    init() {
        this.getCurrentLocation();
    },
    
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    state.location.latitude = position.coords.latitude;
                    state.location.longitude = position.coords.longitude;
                    this.getWeatherByCoords(position.coords.latitude, position.coords.longitude);
                    updateLocation();
                },
                error => {
                    console.log('Геолокация недоступна:', error);
                    this.getWeatherByCity('Москва');
                }
            );
        } else {
            this.getWeatherByCity('Москва');
        }
    },
    
    async getWeatherByCoords(lat, lon) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=ru`);
            if (!response.ok) throw new Error('Ошибка сети');
            const data = await response.json();
            this.updateWeatherDisplay(data);
        } catch (error) {
            console.log('Ошибка загрузки погоды:', error);
            this.showWeatherError();
        }
    },
    
    async getWeatherByCity(city) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.apiKey}&units=metric&lang=ru`);
            if (!response.ok) throw new Error('Город не найден');
            const data = await response.json();
            this.currentCity = city;
            this.updateWeatherDisplay(data);
        } catch (error) {
            console.log('Ошибка загрузки погоды:', error);
            this.showWeatherError();
            showNotification('Город не найден', 'error');
        }
    },
    
    updateWeatherDisplay(data) {
        // Обновляем виджет погоды
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) {
            const weatherIcon = this.getWeatherIcon(data.weather[0].icon);
            weatherWidget.innerHTML = `
                <div class="weather-icon">${weatherIcon}</div>
                <div class="weather-temp">${Math.round(data.main.temp)}°C</div>
                <div class="weather-desc">${data.weather[0].description}</div>
                <div class="weather-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${data.name}, ${data.sys.country}</span>
                </div>
            `;
        }
        
        // Обновляем информацию о погоде
        document.getElementById('info-temp').textContent = `${Math.round(data.main.temp)}°C`;
        document.getElementById('info-humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('info-wind').textContent = `${data.wind.speed} м/с`;
        document.getElementById('info-pressure').textContent = `${data.main.pressure} hPa`;
        
        // Сохраняем данные
        state.weather = {
            temp: data.main.temp,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure
        };
        
        // Обновляем текущую погоду
        this.updateCurrentWeather(data);
    },
    
    updateCurrentWeather(data) {
        const currentWeather = document.getElementById('current-weather');
        if (currentWeather) {
            const weatherIcon = this.getWeatherIcon(data.weather[0].icon);
            currentWeather.innerHTML = `
                <div class="weather-main">
                    <div class="weather-icon-large">${weatherIcon}</div>
                    <div class="weather-info-main">
                        <div class="weather-temp-large">${Math.round(data.main.temp)}°C</div>
                        <div class="weather-desc-large">${data.weather[0].description}</div>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <i class="fas fa-temperature-low"></i>
                        Ощущается как: ${Math.round(data.main.feels_like)}°C
                    </div>
                    <div class="weather-detail">
                        <i class="fas fa-wind"></i>
                        Ветер: ${data.wind.speed} м/с
                    </div>
                    <div class="weather-detail">
                        <i class="fas fa-tint"></i>
                        Влажность: ${data.main.humidity}%
                    </div>
                    <div class="weather-detail">
                        <i class="fas fa-eye"></i>
                        Видимость: ${(data.visibility / 1000).toFixed(1)} км
                    </div>
                </div>
            `;
        }
    },
    
    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        
        const iconClass = iconMap[iconCode] || 'fas fa-cloud';
        return `<i class="${iconClass}"></i>`;
    },
    
    showWeatherError() {
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) {
            weatherWidget.innerHTML = `
                <div class="weather-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Ошибка загрузки</span>
                </div>
            `;
        }
        
        const currentWeather = document.getElementById('current-weather');
        if (currentWeather) {
            currentWeather.innerHTML = `
                <div class="weather-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Не удалось загрузить данные о погоде</span>
                </div>
            `;
        }
    },
    
    searchWeather(city) {
        if (!city.trim()) {
            showNotification('Введите название города', 'warning');
            return;
        }
        this.getWeatherByCity(city);
        VoiceManager.speak(`Поиск погоды для города ${city}`);
    }
};

// Модуль заметок
const NotesManager = {
    init() {
        this.loadNotes();
        this.updateNotesStats();
    },
    
    loadNotes() {
        const container = document.getElementById('notes-container');
        if (!container) return;
        
        if (state.notes.length === 0) {
            container.innerHTML = `
                <div class="notes-empty">
                    <i class="fas fa-sticky-note"></i>
                    <p>У вас пока нет заметок</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        state.notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-header">
                    <div class="note-title">${note.title}</div>
                    <div class="note-date">${new Date(note.date).toLocaleDateString()}</div>
                </div>
                <div class="note-content">${note.content}</div>
                <div class="note-actions">
                    <button class="btn small danger" onclick="NotesManager.deleteNote(${index})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            `;
            container.appendChild(noteElement);
        });
    },
    
    addNote(title, content) {
        if (!title.trim() || !content.trim()) {
            showNotification('Заполните заголовок и содержание заметки', 'warning');
            return;
        }
        
        const newNote = {
            title: title.trim(),
            content: content.trim(),
            date: new Date().toISOString()
        };
        
        state.notes.unshift(newNote);
        localStorage.setItem('skelin-notes', JSON.stringify(state.notes));
        this.loadNotes();
        this.updateNotesStats();
        
        showNotification('Заметка добавлена', 'success');
        VoiceManager.speak('Заметка успешно добавлена');
        
        // Очищаем поля ввода
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
    },
    
    deleteNote(index) {
        if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
            state.notes.splice(index, 1);
            localStorage.setItem('skelin-notes', JSON.stringify(state.notes));
            this.loadNotes();
            this.updateNotesStats();
            showNotification('Заметка удалена', 'success');
        }
    },
    
    clearAllNotes() {
        if (state.notes.length === 0) {
            showNotification('Нет заметок для удаления', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все заметки?')) {
            state.notes = [];
            localStorage.setItem('skelin-notes', JSON.stringify(state.notes));
            this.loadNotes();
            this.updateNotesStats();
            showNotification('Все заметки удалены', 'success');
            VoiceManager.speak('Все заметки удалены');
        }
    },
    
    updateNotesStats() {
        document.getElementById('total-notes').textContent = state.notes.length;
        document.getElementById('last-update').textContent = new Date().toLocaleDateString();
    },
    
    exportNotes() {
        if (state.notes.length === 0) {
            showNotification('Нет заметок для экспорта', 'info');
            return;
        }
        
        const dataStr = JSON.stringify(state.notes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `skelin-notes-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Заметки экспортированы', 'success');
    },
    
    importNotes(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotes = JSON.parse(e.target.result);
                if (Array.isArray(importedNotes)) {
                    state.notes = importedNotes;
                    localStorage.setItem('skelin-notes', JSON.stringify(state.notes));
                    this.loadNotes();
                    this.updateNotesStats();
                    showNotification('Заметки импортированы', 'success');
                    VoiceManager.speak('Заметки успешно импортированы');
                } else {
                    throw new Error('Неверный формат файла');
                }
            } catch (error) {
                showNotification('Ошибка импорта: неверный формат файла', 'error');
            }
        };
        reader.readAsText(file);
        
        // Сбрасываем значение input для возможности повторного импорта того же файла
        event.target.value = '';
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
        const ctx = document.getElementById('metricsChart');
        if (!ctx) return;
        
        const chartCtx = ctx.getContext('2d');
        this.chart = new Chart(chartCtx, {
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
        eventsContainer.scrollTop = eventsContainer.scrollHeight;
        
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
    document.getElementById('latitude').textContent = state.location.latitude.toFixed(4);
    document.getElementById('longitude').textContent = state.location.longitude.toFixed(4);
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

function showNotification(message, type = 'info') {
    const notifications = document.getElementById('system-notifications');
    if (!notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `system-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notifications.appendChild(notification);
    
    // Автоматическое удаление уведомления через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
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
    WeatherManager.init();
    NotesManager.init();
    
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

    // Обновление погоды
    document.getElementById('refresh-weather').addEventListener('click', () => {
        WeatherManager.getCurrentLocation();
        VoiceManager.speak('Данные о погоде обновлены.');
    });

    // Поиск погоды
    document.getElementById('search-weather').addEventListener('click', () => {
        const city = document.getElementById('city-search').value.trim();
        if (city) {
            WeatherManager.searchWeather(city);
        }
    });

    document.getElementById('city-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = document.getElementById('city-search').value.trim();
            if (city) {
                WeatherManager.searchWeather(city);
            }
        }
    });

    // Добавление заметки
    document.getElementById('add-note').addEventListener('click', () => {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        NotesManager.addNote(title, content);
    });

    // Управление заметками
    document.getElementById('export-notes').addEventListener('click', () => {
        NotesManager.exportNotes();
    });

    document.getElementById('import-notes').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (e) => {
        NotesManager.importNotes(e);
    });

    document.getElementById('clear-notes').addEventListener('click', () => {
        NotesManager.clearAllNotes();
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
    
    // Обработка команды погоды с указанием города
    if (lowerCommand.startsWith('погода в ')) {
        const city = command.substring(9).trim();
        if (city) {
            WeatherManager.searchWeather(city);
            return;
        }
    }
    
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
        case 'оптимизировать сети':
            SystemManager.activateSystem('neural-optimization');
            break;
        case 'перезагрузить ядро':
            restartSystem();
            break;
        case 'показать карту':
            switchSection('analytics');
            break;
        case 'погода':
            switchSection('weather');
            break;
        case 'заметки':
            switchSection('notes');
            break;
        case 'новая заметка':
            switchSection('notes');
            setTimeout(() => document.getElementById('note-title').focus(), 100);
            break;
        case 'удалить заметки':
            NotesManager.clearAllNotes();
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
        case 'распознавание образов':
            SystemManager.activateSystem('pattern-recognition');
            break;
        case 'глубокое обучение':
            SystemManager.activateSystem('deep-learning');
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
        case 'повысить безопасность':
            activateSecurity();
            break;
        case 'проверить угрозы':
            startScan();
            break;
        case 'главная':
            switchSection('main');
            break;
        case 'аналитика':
            switchSection('analytics');
            break;
        case 'системы':
            switchSection('systems');
            break;
        case 'безопасность':
            switchSection('security');
            break;
        case 'настройки':
            switchSection('settings');
            break;
        case 'команды':
            showCommands();
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

function restartSystem() {
    addMessage('Перезагрузка системного ядра...', 'skelin');
    VoiceManager.speak('Перезагружаю системное ядро.');
    
    setTimeout(() => {
        state.metrics.efficiency = 95;
        state.metrics.stability = 2.1;
        state.activeSystems.clear();
        updateMetrics();
        
        addMessage('Системное ядро перезагружено. Все системы работают стабильно.', 'skelin');
        VoiceManager.speak('Перезагрузка завершена. Система работает стабильно.');
    }, 3000);
}

function showCommands() {
    const commands = `
        ДОСТУПНЫЕ КОМАНДЫ:
        • статус системы - общее состояние
        • активировать защиту - безопасность
        • показать системы - список модулей
        • нейронный анализ - анализ данных
        • оптимизировать сети - улучшить производительность
        • перезагрузить ядро - перезапуск системы
        • показать карту - карта активности
        • погода - текущая погода
        • погода в [город] - погода в указанном городе
        • заметки - просмотр заметок
        • новая заметка - создать заметку
        • удалить заметки - очистить все заметки
        • обучение - глубокое обучение
        • оптимизация - оптимизация сетей
        • анализ данных - обработка информации
        • распознавание образов - анализ паттернов
        • глубокое обучение - активация ИИ
        • ключ доступа - аутентификация
        • мониторинг - статус защиты
        • сканирование - проверка системы
        • повысить безопасность - усилить защиту
        • проверить угрозы - анализ рисков
        • главная - перейти на главную
        • аналитика - показать аналитику
        • системы - управление системами
        • безопасность - настройки безопасности
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
window.NotesManager = NotesManager;