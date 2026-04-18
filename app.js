// app.js - Основная логика приложения

class App {
    constructor() {
        this.fileSync = new FileSync();
        this.currentTurn = 1;
        this.currentView = 'dashboard';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadFiles();
        this.showView('dashboard');
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.showView(view);
            });
        });

        // Очистка кеша
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            localStorage.removeItem('gameData');
            location.reload();
        });

        // Перезагрузка из data.json
        document.getElementById('reload-data-btn').addEventListener('click', async () => {
            this.setSyncStatus('syncing', 'Загрузка из data.json...');
            try {
                const response = await fetch('data.json?t=' + Date.now());
                const data = await response.json();
                this.fileSync.data = data;
                localStorage.setItem('gameData', JSON.stringify(data));
                this.setSyncStatus('success', 'Загружено!');
                this.currentTurn = data.currentState.currentTurn;
                this.updateUI();
                alert('Данные обновлены из data.json!');
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                this.setSyncStatus('error', 'Ошибка загрузки');
                alert('Ошибка: ' + err.message);
            }
        });

        // Сохранение
        document.getElementById('save-btn').addEventListener('click', async () => {
            await this.save();
        });

        // Навигация по ходам
        document.getElementById('prev-turn').addEventListener('click', () => {
            if (this.currentTurn > 1) {
                this.currentTurn--;
                this.showTurn(this.currentTurn);
            }
        });

        document.getElementById('next-turn').addEventListener('click', () => {
            if (this.currentTurn < 18) {
                this.currentTurn++;
                this.showTurn(this.currentTurn);
            }
        });

        // Табы в справке
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showReferenceTab(tab);
            });
        });
    }

    async loadFiles() {
        this.setSyncStatus('syncing', 'Загрузка...');
        const success = await this.fileSync.loadData();

        if (success) {
            this.setSyncStatus('success', 'Синхронизировано');
            this.currentTurn = this.fileSync.data.currentState.currentTurn;
            this.updateUI();
        } else {
            this.setSyncStatus('error', 'Ошибка загрузки');
        }
    }

    async save() {
        this.setSyncStatus('syncing', 'Сохранение...');
        this.fileSync.saveData();
        setTimeout(() => {
            this.setSyncStatus('success', 'Сохранено');
        }, 500);
    }

    setSyncStatus(status, text) {
        const indicator = document.getElementById('sync-indicator');
        const textEl = document.getElementById('sync-text');

        indicator.className = status === 'syncing' ? 'syncing' : '';
        textEl.textContent = text;
    }

    showView(viewName) {
        // Скрыть все виды
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        // Показать нужный вид
        document.getElementById(`${viewName}-view`).classList.add('active');
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        this.currentView = viewName;

        // Обновить содержимое
        if (viewName === 'dashboard') {
            this.renderDashboard();
        } else if (viewName === 'turns') {
            this.renderTurnsList();
            this.showTurn(this.currentTurn);
        } else if (viewName === 'diplomacy') {
            this.renderDiplomacy();
        } else if (viewName === 'reference') {
            this.showReferenceTab('buildings');
        }
    }

    renderTurnsList() {
        const data = this.fileSync.data;
        if (!data) return;

        const turnsList = document.getElementById('turns-list');
        turnsList.innerHTML = '';

        for (let i = 1; i <= 9; i++) {
            const turn = data.turns[i];
            if (!turn) continue;

            const turnCard = document.createElement('div');
            turnCard.className = 'turn-card';

            let statusIcon = '';
            let statusColor = '';
            if (turn.status === 'completed') {
                statusIcon = '✅';
                statusColor = 'var(--success)';
            } else if (turn.status === 'in_progress') {
                statusIcon = '⏳';
                statusColor = 'var(--warning)';
            } else {
                statusIcon = '📋';
                statusColor = 'var(--text-secondary)';
            }

            turnCard.innerHTML = `
                <div style="font-size: 1.5rem;">${statusIcon}</div>
                <div style="font-weight: bold; color: ${statusColor};">Ход ${i}</div>
            `;

            turnCard.style.cssText = `
                background: var(--bg-card);
                border: 2px solid ${i === this.currentTurn ? 'var(--accent)' : 'var(--border)'};
                border-radius: 12px;
                padding: 1rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
            `;

            turnCard.addEventListener('mouseenter', () => {
                turnCard.style.borderColor = 'var(--accent)';
            });

            turnCard.addEventListener('mouseleave', () => {
                if (i !== this.currentTurn) {
                    turnCard.style.borderColor = 'var(--border)';
                }
            });

            turnCard.addEventListener('click', () => {
                this.currentTurn = i;
                this.renderTurnsList();
                this.showTurn(i);
            });

            turnsList.appendChild(turnCard);
        }
    }

    updateUI() {
        this.updateQuickStats();
        this.updateHeaderTurn();
        if (this.currentView === 'dashboard') {
            this.renderDashboard();
        }
    }

    updateHeaderTurn() {
        const data = this.fileSync.data;
        if (!data) return;
        document.getElementById('header-current-turn').textContent = data.currentState.currentTurn;
    }

    updateQuickStats() {
        const data = this.fileSync.data;
        if (!data) return;

        const state = data.currentState;
        const totalStrength = this.calculateArmyStrength(state.army);

        document.getElementById('quick-food').textContent = state.resources.food || 0;
        document.getElementById('quick-wood').textContent = state.resources.wood || 0;
        document.getElementById('quick-stone').textContent = state.resources.stone || 0;
        document.getElementById('quick-metal').textContent = state.resources.metal || 0;
        document.getElementById('quick-power').textContent = totalStrength;
        document.getElementById('quick-om').textContent = state.om || 0;
    }

    calculateArmyStrength(army) {
        return army.reduce((total, unit) => {
            const baseStrength = unit.strength;
            const racialBonus = 1; // +1 от расового бафа
            return total + (unit.count * (baseStrength + racialBonus));
        }, 0);
    }

    renderDashboard() {
        const data = this.fileSync.data;
        if (!data) {
            document.getElementById('resources-content').innerHTML = '<p>Загрузите файлы</p>';
            return;
        }

        const state = data.currentState;

        // Ресурсы (редактируемые)
        document.getElementById('resources-content').innerHTML = `
            <div class="resource-item">
                <span>🌾 Еда:</span>
                <input type="number" class="resource-input" data-resource="food" value="${state.resources.food || 0}" min="0">
            </div>
            <div class="resource-item">
                <span>🪵 Дерево:</span>
                <input type="number" class="resource-input" data-resource="wood" value="${state.resources.wood || 0}" min="0">
            </div>
            <div class="resource-item">
                <span>🪨 Камень:</span>
                <input type="number" class="resource-input" data-resource="stone" value="${state.resources.stone || 0}" min="0">
            </div>
            <div class="resource-item">
                <span>⚙️ Металл:</span>
                <input type="number" class="resource-input" data-resource="metal" value="${state.resources.metal || 0}" min="0">
            </div>
        `;

        // Обработчики изменения ресурсов
        document.querySelectorAll('.resource-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const resource = e.target.dataset.resource;
                const value = parseInt(e.target.value) || 0;
                state.resources[resource] = value;
                this.fileSync.updateResources(state.resources);
                this.updateQuickStats();
                this.setSyncStatus('syncing', 'Сохранение...');
                setTimeout(() => this.setSyncStatus('success', 'Сохранено'), 1000);
            });
        });

        // Армия
        const totalStrength = this.calculateArmyStrength(state.army);
        document.getElementById('army-content').innerHTML = `
            <p><strong>Сила:</strong> ${totalStrength}</p>
            <p><strong>Население:</strong> ${state.population.total} (занято: ${state.population.occupied}, свободно: ${state.population.free})</p>
            ${state.army.map(u => `<p>• ${u.count} ${u.type} (сила ${u.strength + 1} каждый)</p>`).join('')}
            <button class="btn-primary" id="edit-army-btn" style="margin-top: 1rem;">Редактировать армию</button>
        `;

        document.getElementById('edit-army-btn').addEventListener('click', () => {
            this.showArmyEditor();
        });

        // Герой и ОМ
        document.getElementById('hero-content').innerHTML = `
            <p><strong>Герой:</strong> ${state.hero.name}</p>
            <p><em>${state.hero.ability}</em></p>
            <div class="resource-item" style="margin-top: 1rem;">
                <span><strong>ОМ:</strong></span>
                <input type="number" class="resource-input" id="om-input" value="${state.om}" min="0">
            </div>
        `;

        document.getElementById('om-input').addEventListener('change', (e) => {
            const value = parseInt(e.target.value) || 0;
            this.fileSync.updateOM(value);
            this.updateQuickStats();
            this.setSyncStatus('syncing', 'Сохранение...');
            setTimeout(() => this.setSyncStatus('success', 'Сохранено'), 1000);
        });

        // Здания
        document.getElementById('buildings-content').innerHTML = `
            <table style="width: 100%; font-size: 0.9rem;">
                ${state.buildings.map(b => `
                    <tr>
                        <td>${b.name}</td>
                        <td>Ур. ${b.level}</td>
                        <td>${b.upgrading ? `⏳ Ход ${b.completeTurn}` : '✅'}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        // Планировщик построек
        this.renderBuildingPlanner();
    }

    renderBuildingPlanner() {
        const data = this.fileSync.data;
        if (!data) return;

        const state = data.currentState;
        const currentTurn = state.currentTurn;

        // Строится/Улучшается сейчас
        const buildingNow = state.buildings.filter(b => b.upgrading);
        document.getElementById('building-now-content').innerHTML = buildingNow.length > 0 ? `
            ${buildingNow.map(b => {
                const buildingInfo = data.reference.buildings.find(ref =>
                    ref.name === b.name && ref.level === b.level
                );
                return `
                <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="font-weight: bold;">${b.name} ${b.level - 1}→${b.level}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        ${buildingInfo ? buildingInfo.cost : ''} | ${buildingInfo ? buildingInfo.time : ''}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--warning); margin-top: 0.25rem;">Готово: Ход ${b.completeTurn}</div>
                    <div style="margin-top: 0.5rem;">
                        <div style="background: var(--bg-primary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--accent); height: 100%; width: ${Math.min(100, ((currentTurn - (b.completeTurn - 2)) / 2) * 100)}%;"></div>
                        </div>
                    </div>
                </div>
            `}).join('')}
        ` : '<p style="color: var(--text-secondary);">Ничего не строится</p>';

        // Готово (можно улучшить)
        const completed = state.buildings.filter(b => !b.upgrading);
        document.getElementById('building-completed-content').innerHTML = completed.length > 0 ? `
            ${completed.map(b => {
                const nextLevel = b.level + 1;
                const upgradeInfo = data.reference.buildings.find(ref =>
                    ref.name === b.name && ref.level === nextLevel
                );
                const canUpgrade = upgradeInfo && this.canAffordBuilding(this.parseBuildingCost(upgradeInfo.cost), state.resources);

                return `
                <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold;">${b.name} Ур. ${b.level}</div>
                            ${upgradeInfo ? `
                                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                    Улучшение до ${nextLevel}: ${upgradeInfo.cost} | ${upgradeInfo.time}
                                </div>
                            ` : '<div style="font-size: 0.85rem; color: var(--text-secondary);">Макс. уровень</div>'}
                        </div>
                        ${upgradeInfo ? `
                            <div style="font-size: 1.5rem;">${canUpgrade ? '✅' : '❌'}</div>
                        ` : ''}
                    </div>
                </div>
            `}).join('')}
        ` : '<p style="color: var(--text-secondary);">Нет построенных зданий</p>';

        // Новые постройки (здания уровня 1, которых еще нет)
        const existingBuildings = state.buildings.map(b => b.name);
        const newBuildings = data.reference.buildings.filter(b =>
            b.level === 1 && !existingBuildings.includes(b.name)
        );

        document.getElementById('building-new-content').innerHTML = newBuildings.length > 0 ? `
            ${newBuildings.map(b => {
                const cost = this.parseBuildingCost(b.cost);
                const canAfford = this.canAffordBuilding(cost, state.resources);

                return `
                <div style="padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 0.5rem; opacity: ${canAfford ? '1' : '0.5'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold;">${b.name} Ур. 1</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                ${b.cost} | ${b.time}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--success); margin-top: 0.25rem;">
                                ${b.effect}
                            </div>
                        </div>
                        <div style="font-size: 1.5rem;">${canAfford ? '✅' : '❌'}</div>
                    </div>
                </div>
            `}).join('')}
        ` : '<p style="color: var(--text-secondary);">Все здания построены</p>';
    }

    parseBuildingCost(costStr) {
        const cost = { wood: 0, stone: 0, metal: 0, food: 0 };

        // Парсинг "10 дер + 5 кам" или "30 дер/кам/мет"
        if (costStr.includes('/')) {
            const match = costStr.match(/(\d+)/);
            if (match) {
                const value = parseInt(match[1]);
                cost.wood = value;
                cost.stone = value;
                cost.metal = value;
            }
        } else {
            const woodMatch = costStr.match(/(\d+)\s*дер/);
            const stoneMatch = costStr.match(/(\d+)\s*кам/);
            const metalMatch = costStr.match(/(\d+)\s*мет/);
            const foodMatch = costStr.match(/(\d+)\s*еды/);

            if (woodMatch) cost.wood = parseInt(woodMatch[1]);
            if (stoneMatch) cost.stone = parseInt(stoneMatch[1]);
            if (metalMatch) cost.metal = parseInt(metalMatch[1]);
            if (foodMatch) cost.food = parseInt(foodMatch[1]);
        }

        return cost;
    }

    canAffordBuilding(cost, resources) {
        // Проверка с учетом замены ресурсов 1:1
        const totalCost = cost.wood + cost.stone + cost.metal;
        const totalResources = resources.wood + resources.stone + resources.metal;

        return totalResources >= totalCost && resources.food >= cost.food;
    }

    showArmyEditor() {
        const state = this.fileSync.data.currentState;
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Редактирование армии</h3>
                <div id="army-editor-list"></div>
                <button class="btn-success" id="save-army-btn">Сохранить</button>
                <button class="btn-primary" id="close-army-btn">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);

        const editorList = modal.querySelector('#army-editor-list');
        state.army.forEach((unit, index) => {
            const div = document.createElement('div');
            div.className = 'resource-item';
            div.innerHTML = `
                <span>${unit.type}:</span>
                <input type="number" class="army-count-input" data-index="${index}" value="${unit.count}" min="0">
            `;
            editorList.appendChild(div);
        });

        modal.querySelector('#save-army-btn').addEventListener('click', () => {
            modal.querySelectorAll('.army-count-input').forEach(input => {
                const index = parseInt(input.dataset.index);
                state.army[index].count = parseInt(input.value) || 0;
            });
            this.fileSync.updateArmy(state.army);
            this.renderDashboard();
            document.body.removeChild(modal);
            this.setSyncStatus('syncing', 'Сохранение...');
            setTimeout(() => this.setSyncStatus('success', 'Сохранено'), 1000);
        });

        modal.querySelector('#close-army-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    showTurn(turnNumber) {
        const data = this.fileSync.data;
        const turn = data.turns[turnNumber];

        document.getElementById('current-turn-label').textContent = `Ход ${turnNumber}`;

        // Управление кнопками
        document.getElementById('prev-turn').disabled = turnNumber === 1;
        document.getElementById('next-turn').disabled = turnNumber === 18;

        if (!turn) {
            document.getElementById('turn-content').innerHTML = '<p>Ход не найден</p>';
            return;
        }

        // Статус хода
        let statusBadge = '';
        if (turn.status === 'completed') {
            statusBadge = '<span style="background: var(--success); padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.9rem;">✅ Завершен</span>';
        } else if (turn.status === 'in_progress') {
            statusBadge = '<span style="background: var(--warning); padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.9rem;">⏳ В процессе</span>';
        } else if (turn.status === 'planned') {
            statusBadge = '<span style="background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.9rem;">📋 Запланирован</span>';
        }

        // Рендер хода
        document.getElementById('turn-content').innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3>${turn.title}</h3>
                ${statusBadge}
            </div>

            <div class="turn-section">
                <h4>Начало хода</h4>
                <div class="resource-item">🌾 Еда: ${turn.startResources.food || 0}</div>
                <div class="resource-item">🪵 Дерево: ${turn.startResources.wood || 0}</div>
                <div class="resource-item">🪨 Камень: ${turn.startResources.stone || 0}</div>
                <div class="resource-item">⚙️ Металл: ${turn.startResources.metal || 0}</div>
            </div>

            ${turn.completed.length > 0 ? `
                <div class="turn-section">
                    <h4>Завершается</h4>
                    ${turn.completed.map(c => `<p>✅ ${c}</p>`).join('')}
                </div>
            ` : ''}

            ${turn.arriving.length > 0 ? `
                <div class="turn-section">
                    <h4>Прибывает</h4>
                    ${turn.arriving.map(a => `<p>✅ ${a}</p>`).join('')}
                </div>
            ` : ''}

            <div class="turn-section">
                <h4>Действия</h4>
                ${turn.actions.length > 0 ? turn.actions.map(a => `<p>✅ ${a}</p>`).join('') : '<p>Нет действий</p>'}
            </div>

            <div class="turn-section">
                <h4>Конец хода</h4>
                <div class="resource-item">🌾 Еда: ${turn.endResources.food || 0}</div>
                <div class="resource-item">🪵 Дерево: ${turn.endResources.wood || 0}</div>
                <div class="resource-item">🪨 Камень: ${turn.endResources.stone || 0}</div>
                <div class="resource-item">⚙️ Металл: ${turn.endResources.metal || 0}</div>
            </div>

            <div class="turn-section">
                <h4>Армия</h4>
                ${turn.army.map(u => `<p>• ${u.count} ${u.type}</p>`).join('')}
            </div>

            <p><strong>Население:</strong> ${turn.population}</p>
            <p><strong>ОМ:</strong> ${turn.om}</p>
            ${turn.notes ? `<p style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;"><em>💡 ${turn.notes}</em></p>` : ''}
        `;
    }

    renderDiplomacy() {
        const data = this.fileSync.data;
        if (!data) {
            document.getElementById('diplomacy-content').innerHTML = '<p>Загрузите файлы</p>';
            return;
        }

        const state = data.currentState;

        document.getElementById('diplomacy-content').innerHTML = `
            <div class="card">
                <h3>🤝 Союзники</h3>
                ${state.diplomacy.allies.length > 0 ? state.diplomacy.allies.map(a => `<p>• ${a}</p>`).join('') : '<p>Нет союзников</p>'}
            </div>

            <div class="card">
                <h3>⚔️ Враги</h3>
                ${state.diplomacy.enemies.length > 0 ? state.diplomacy.enemies.map(e => `<p>• ${e}</p>`).join('') : '<p>Нет врагов</p>'}
            </div>

            <div class="card">
                <h3>⚖️ Договоры</h3>
                ${state.diplomacy.treaties.length > 0 ? state.diplomacy.treaties.map(t => `<p>• ${t}</p>`).join('') : '<p>Нет договоров</p>'}
            </div>
        `;
    }

    showReferenceTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        const data = this.fileSync.data;
        if (!data) return;

        if (tabName === 'buildings') {
            const buildings = data.reference.buildings;
            document.getElementById('reference-content').innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Здание</th>
                            <th>Уровень</th>
                            <th>Стоимость</th>
                            <th>Время</th>
                            <th>Эффект</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${buildings.map(b => `
                            <tr>
                                <td>${b.name}</td>
                                <td>${b.level}</td>
                                <td>${b.cost}</td>
                                <td>${b.time}</td>
                                <td>${b.effect}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else if (tabName === 'units') {
            const units = data.reference.units;
            document.getElementById('reference-content').innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Юнит</th>
                            <th>Сила</th>
                            <th>Стоимость</th>
                            <th>Время</th>
                            <th>Население</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${units.map(u => `
                            <tr>
                                <td>${u.name}</td>
                                <td>${u.strength} (+1 баф = ${u.strength + 1})</td>
                                <td>${u.cost}</td>
                                <td>${u.time}</td>
                                <td>${u.population}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="card" style="margin-top: 1rem;">
                    <h3>Осадные орудия</h3>
                    ${data.reference.siege.map(s => `
                        <p><strong>${s.name}:</strong> ${s.effect}</p>
                        <p>Стоимость: ${s.cost}, Время: ${s.time}</p>
                    `).join('')}
                </div>
            `;
        } else if (tabName === 'rules') {
            const rules = data.reference.rules;
            document.getElementById('reference-content').innerHTML = `
                <div class="card">
                    <h3>Основные правила</h3>
                    <p>• <strong>Расовый баф:</strong> ${rules.racialBuff}</p>
                    <p>• <strong>Расовый дебаф:</strong> ${rules.racialDebuff}</p>
                    <p>• <strong>Замена ресурсов:</strong> ${rules.resourceSubstitution}</p>
                    <p>• <strong>Лимит построек:</strong> ${rules.newBuildingLimit}</p>
                    <p>• <strong>Население:</strong> ${rules.unitPopulation}</p>
                    <p>• <strong>Еда:</strong> ${rules.foodCost}</p>
                    <p>• <strong>Победа:</strong> ${rules.victoryCondition}</p>
                </div>
            `;
        }
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
