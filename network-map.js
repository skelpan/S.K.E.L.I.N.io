// Расширенная система сетевой карты
class NetworkMap {
    constructor() {
        this.nodes = new Map();
        this.connections = new Set();
        this.initializeMap();
    }
    
    initializeMap() {
        // Создаем базовые узлы для демонстрации
        this.addNode('core', 'Основное ядро', 50, 50);
        this.addNode('neural', 'Нейронная сеть', 30, 30);
        this.addNode('security', 'Безопасность', 70, 30);
        this.addNode('analytics', 'Аналитика', 30, 70);
        this.addNode('weather', 'Погодный модуль', 70, 70);
        
        // Создаем соединения
        this.addConnection('core', 'neural');
        this.addConnection('core', 'security');
        this.addConnection('core', 'analytics');
        this.addConnection('core', 'weather');
        this.addConnection('neural', 'analytics');
    }
    
    addNode(id, name, x, y) {
        this.nodes.set(id, {
            id,
            name,
            x,
            y,
            status: 'active',
            load: Math.random() * 100
        });
    }
    
    addConnection(from, to) {
        this.connections.add(`${from}-${to}`);
    }
    
    render(container) {
        if (!container) return;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 100 100');
        
        // Отрисовываем соединения
        this.connections.forEach(conn => {
            const [from, to] = conn.split('-');
            const fromNode = this.nodes.get(from);
            const toNode = this.nodes.get(to);
            
            if (fromNode && toNode) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromNode.x);
                line.setAttribute('y1', fromNode.y);
                line.setAttribute('x2', toNode.x);
                line.setAttribute('y2', toNode.y);
                line.setAttribute('stroke', 'var(--primary)');
                line.setAttribute('stroke-width', '0.5');
                line.setAttribute('stroke-opacity', '0.7');
                svg.appendChild(line);
            }
        });
        
        // Отрисовываем узлы
        this.nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', node.x);
            circle.setAttribute('cy', node.y);
            circle.setAttribute('r', '3');
            circle.setAttribute('fill', this.getNodeColor(node.status));
            circle.setAttribute('stroke', 'var(--primary)');
            circle.setAttribute('stroke-width', '0.5');
            
            // Анимация пульсации для активных узлов
            if (node.status === 'active') {
                circle.classList.add('node-pulse');
            }
            
            group.appendChild(circle);
            
            // Добавляем текст
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', node.x);
            text.setAttribute('y', node.y - 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text)');
            text.setAttribute('font-size', '2');
            text.setAttribute('font-family', 'Arial, sans-serif');
            text.textContent = node.name;
            group.appendChild(text);
            
            svg.appendChild(group);
        });
        
        container.innerHTML = '';
        container.appendChild(svg);
    }
    
    getNodeColor(status) {
        const colors = {
            'active': 'var(--primary)',
            'warning': 'var(--warning)',
            'error': 'var(--danger)',
            'inactive': 'var(--text-dim)'
        };
        return colors[status] || colors.inactive;
    }
    
    updateNodeStatus(nodeId, status) {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.status = status;
            return true;
        }
        return false;
    }
    
    simulateNetworkActivity() {
        // Случайным образом обновляем статусы узлов для демонстрации
        this.nodes.forEach(node => {
            if (Math.random() < 0.1) { // 10% шанс изменения статуса
                const statuses = ['active', 'warning', 'error', 'inactive'];
                node.status = statuses[Math.floor(Math.random() * statuses.length)];
                node.load = Math.random() * 100;
            }
        });
    }
}

// Инициализация сетевой карты
const networkMap = new NetworkMap();

// Интеграция с основной системой
document.addEventListener('DOMContentLoaded', function() {
    const mapContainer = document.querySelector('.map-overlay .active-nodes');
    if (mapContainer) {
        networkMap.render(mapContainer);
        
        // Обновляем карту каждые 5 секунд
        setInterval(() => {
            networkMap.simulateNetworkActivity();
            networkMap.render(mapContainer);
        }, 5000);
    }
});