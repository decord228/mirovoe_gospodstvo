// sync.js - Синхронизация с JSON файлом

class FileSync {
    constructor() {
        this.data = null;
        this.saveTimeout = null;
        this.dataFile = 'data.json';
    }

    // Загрузка данных из JSON
    async loadData() {
        try {
            // Сначала пробуем загрузить из data.json
            const response = await fetch(this.dataFile + '?t=' + Date.now());
            this.data = await response.json();
            localStorage.setItem('gameData', JSON.stringify(this.data));
            console.log('Данные загружены из data.json');
            return true;
        } catch (err) {
            console.error('Ошибка загрузки из data.json:', err);

            // Если не получилось, пробуем localStorage
            const cached = localStorage.getItem('gameData');
            if (cached) {
                this.data = JSON.parse(cached);
                console.log('Данные загружены из localStorage');
                return true;
            }

            // Если нет нигде, используем встроенные данные
            this.data = this.getDefaultData();
            localStorage.setItem('gameData', JSON.stringify(this.data));
            console.log('Используются встроенные данные');
            return true;
        }
    }

    // Данные по умолчанию (встроенные)
    getDefaultData() {
        return {
            "currentState": {
                "resources": { "food": 90, "wood": 38, "stone": 25, "metal": 22 },
                "buildings": [
                    { "name": "Дома", "level": 2, "upgrading": true, "completeTurn": 3 },
                    { "name": "Дома", "level": 1, "upgrading": true, "completeTurn": 3 },
                    { "name": "Ферма", "level": 2, "upgrading": true, "completeTurn": 3 },
                    { "name": "Лесопилка", "level": 2, "upgrading": true, "completeTurn": 3 },
                    { "name": "Шахта", "level": 1, "upgrading": true, "completeTurn": 3 },
                    { "name": "Казармы", "level": 2, "upgrading": false }
                ],
                "army": [{ "type": "Ополченец", "count": 2, "strength": 2 }],
                "population": { "total": 10, "occupied": 10, "free": 0 },
                "om": 13,
                "hero": { "name": "Азракс", "ability": "Устрашение: враг теряет 20% силы" },
                "diplomacy": {
                    "allies": ["Тёмные Эльфы"],
                    "enemies": [],
                    "treaties": ["Эльфы ↔ Люди (мирный договор)", "Гномы ↔ Орки (мирный договор)"]
                },
                "currentTurn": 2,
                "lastUpdated": "2026-04-18"
            },
            "turns": {
                "1": {
                    "number": 1,
                    "title": "ХОД 1 🚀 СТАРТ ИГРЫ",
                    "startResources": { "food": 120, "wood": 150, "stone": 80, "metal": 20 },
                    "endResources": { "food": 80, "wood": 53, "stone": 40, "metal": 20 },
                    "actions": ["Дома 2→3 (30 дерева, готово Ход 3)", "Ферма 2→3 (30 дерева, готово Ход 3)", "Лесопилка 2→3 (25 дерева, готово Ход 3)", "Казармы 1→2 (40 камня, готово Ход 2)", "2 Ополченца (12 дерева + 40 еды, прибудут Ход 2)"],
                    "completed": [],
                    "arriving": [],
                    "army": [],
                    "population": 10,
                    "om": 10,
                    "notes": "Выбран герой Азракс. Союз с Тёмными Эльфами.",
                    "status": "completed"
                },
                "2": {
                    "number": 2,
                    "title": "ХОД 2 ⚡ ШАХТА + НОВЫЙ ДОМ",
                    "startResources": { "food": 90, "wood": 63, "stone": 45, "metal": 22 },
                    "endResources": { "food": 90, "wood": 38, "stone": 25, "metal": 22 },
                    "actions": ["Шахта 1→2 (30 ресурсов: 15 дер + 15 кам, готово Ход 3)", "Дома 1 (НОВОЕ здание: 15 ресурсов: 10 дер + 5 кам, готово Ход 3)"],
                    "completed": ["Казармы 2"],
                    "arriving": ["2 Ополченца"],
                    "army": [{ "type": "Ополченец", "count": 2, "strength": 2 }],
                    "population": 10,
                    "om": 13,
                    "notes": "+3 ОМ бонус. Воодушевление +2 атака (1 ход).",
                    "status": "in_progress"
                },
                "3": {
                    "number": 3,
                    "title": "ХОД 3 ✅ 20 НАСЕЛЕНИЯ! НАНИМАЕМ АРМИЮ!",
                    "startResources": { "food": 105, "wood": 53, "stone": 35, "metal": 26 },
                    "endResources": { "food": 65, "wood": 33, "stone": 35, "metal": 20 },
                    "actions": ["2 Копейщика (20 дер + 6 мет + 40 еды, готовы Ход 4)"],
                    "completed": ["Дома 3 (15 населения)", "Дома 1 (5 населения)", "Ферма 3", "Лесопилка 3", "Шахта 2"],
                    "arriving": [],
                    "army": [{ "type": "Ополченец", "count": 2, "strength": 2 }],
                    "population": 20,
                    "om": 13,
                    "notes": "Население достигло 20. Можно нанимать больше войск.",
                    "status": "planned"
                },
                "4": {
                    "number": 4,
                    "title": "ХОД 4 🏠 УЛУЧШАЕМ ДОМА",
                    "startResources": { "food": 80, "wood": 48, "stone": 45, "metal": 24 },
                    "endResources": { "food": 80, "wood": 28, "stone": 25, "metal": 24 },
                    "actions": ["Дома 3→4 (40 ресурсов: 20 дер + 20 кам, готово Ход 6)"],
                    "completed": [],
                    "arriving": ["2 Копейщика"],
                    "army": [
                        { "type": "Ополченец", "count": 2, "strength": 2 },
                        { "type": "Копейщик", "count": 2, "strength": 3 }
                    ],
                    "population": 20,
                    "om": 13,
                    "notes": "Армия усилилась. Общая сила: 10.",
                    "status": "planned"
                },
                "5": {
                    "number": 5,
                    "title": "ХОД 5 🏠 ВТОРОЙ ДОМ",
                    "startResources": { "food": 95, "wood": 43, "stone": 35, "metal": 28 },
                    "endResources": { "food": 95, "wood": 33, "stone": 30, "metal": 28 },
                    "actions": ["Дома 1→2 (15 ресурсов: 10 дер + 5 кам, готово Ход 6)"],
                    "completed": [],
                    "arriving": [],
                    "army": [
                        { "type": "Ополченец", "count": 2, "strength": 2 },
                        { "type": "Копейщик", "count": 2, "strength": 3 }
                    ],
                    "population": 20,
                    "om": 13,
                    "notes": "Металл сохранен для будущих войск (28).",
                    "status": "planned"
                },
                "6": {
                    "number": 6,
                    "title": "ХОД 6 💪 МАССОВЫЙ НАЙМ АРМИИ!",
                    "startResources": { "food": 110, "wood": 48, "stone": 40, "metal": 32 },
                    "endResources": { "food": 30, "wood": 28, "stone": 20, "metal": 20 },
                    "actions": ["4 Копейщика (40 ресурсов: 20 дер + 20 кам + 12 мет + 80 еды, готовы Ход 7)"],
                    "completed": ["Дома 4 (25 населения)", "Дома 2 (10 населения)"],
                    "arriving": [],
                    "army": [
                        { "type": "Ополченец", "count": 2, "strength": 2 },
                        { "type": "Копейщик", "count": 2, "strength": 3 }
                    ],
                    "population": 35,
                    "om": 13,
                    "notes": "Население 35. Массовый найм армии.",
                    "status": "planned"
                },
                "7": {
                    "number": 7,
                    "title": "ХОД 7 💰 КОПИМ ДЛЯ ТАРАНА",
                    "startResources": { "food": 45, "wood": 43, "stone": 30, "metal": 24 },
                    "endResources": { "food": 45, "wood": 43, "stone": 30, "metal": 24 },
                    "actions": [],
                    "completed": [],
                    "arriving": ["4 Копейщика"],
                    "army": [
                        { "type": "Ополченец", "count": 2, "strength": 2 },
                        { "type": "Копейщик", "count": 6, "strength": 3 }
                    ],
                    "population": 35,
                    "om": 13,
                    "notes": "Армия готова. Общая сила: 22.",
                    "status": "planned"
                },
                "8": {
                    "number": 8,
                    "title": "ХОД 8 🔨 ТАРАН ГОТОВ!",
                    "startResources": { "food": 60, "wood": 58, "stone": 40, "metal": 28 },
                    "endResources": { "food": 60, "wood": 33, "stone": 35, "metal": 18 },
                    "actions": ["Таран (30 ресурсов: 25 дер + 5 кам + 10 мет, готов Ход 9)"],
                    "completed": [],
                    "arriving": [],
                    "army": [
                        { "type": "Ополченец", "count": 2, "strength": 2 },
                        { "type": "Копейщик", "count": 6, "strength": 3 }
                    ],
                    "population": 35,
                    "om": 13,
                    "notes": "Таран в постройке. Готовимся к атаке.",
                    "status": "planned"
                },
                "9": {
                    "number": 9,
                    "title": "ХОД 9 🎯 АТАКА!",
                    "startResources": { "food": 75, "wood": 48, "stone": 45, "metal": 22 },
                    "endResources": { "food": 75, "wood": 48, "stone": 45, "metal": 22 },
                    "actions": ["АТАКА НА ОРКОВ/ГНОМОВ"],
                    "completed": ["Таран"],
                    "arriving": [],
                    "army": [
                        { "type": "Ополченец", "count": 2, "strength": 2 },
                        { "type": "Копейщик", "count": 6, "strength": 3 }
                    ],
                    "population": 35,
                    "om": 13,
                    "notes": "Атака! Сила 22 + Азракс + Таран.",
                    "status": "planned"
                }
            },
            "reference": {
                "buildings": [
                    { "name": "Дома", "level": 1, "cost": "10 дер + 5 кам", "time": "1 ход", "effect": "+5 населения" },
                    { "name": "Дома", "level": 2, "cost": "15 дер + 10 кам", "time": "1 ход", "effect": "+10 населения" },
                    { "name": "Казармы", "level": 1, "cost": "20 дер + 15 кам", "time": "1 ход", "effect": "Ополченцы" },
                    { "name": "Казармы", "level": 2, "cost": "40 дер/кам/мет", "time": "1 ход", "effect": "Копейщики" }
                ],
                "units": [
                    { "name": "Ополченец", "strength": 2, "cost": "6 дер + 20 еды", "time": "1 ход", "population": 5 },
                    { "name": "Копейщик", "strength": 3, "cost": "10 дер + 3 мет + 20 еды", "time": "1 ход", "population": 5 }
                ],
                "siege": [{ "name": "Таран", "effect": "-1 уровень стен", "cost": "25 дер + 10 мет", "time": "1 ход" }],
                "rules": {
                    "racialBuff": "+1 сила всем войскам",
                    "racialDebuff": "ОТКЛЮЧЕН",
                    "resourceSubstitution": "Дерево/Камень/Металл взаимозаменяемы 1:1",
                    "newBuildingLimit": "1 новое здание за ход",
                    "unitPopulation": "1 отряд = 5 населения",
                    "foodCost": "Еда тратится один раз при найме",
                    "victoryCondition": "100-200 ОМ"
                }
            }
        };
    }

    // Сохранение данных в JSON (с debounce)
    saveData() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(async () => {
            try {
                const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = this.dataFile;
                a.click();
                URL.revokeObjectURL(url);

                // Сохранение в localStorage как резервная копия
                localStorage.setItem('gameData', JSON.stringify(this.data));

                return true;
            } catch (err) {
                console.error('Ошибка сохранения:', err);
                return false;
            }
        }, 1000);
    }

    // Обновление ресурсов
    updateResources(resources) {
        this.data.currentState.resources = resources;
        this.data.currentState.lastUpdated = new Date().toISOString().split('T')[0];
        this.saveData();
    }

    // Обновление армии
    updateArmy(army) {
        this.data.currentState.army = army;
        this.data.currentState.lastUpdated = new Date().toISOString().split('T')[0];
        this.saveData();
    }

    // Обновление хода
    updateTurn(turnNumber, turnData) {
        this.data.turns[turnNumber] = turnData;
        this.saveData();
    }

    // Обновление текущего хода
    setCurrentTurn(turnNumber) {
        this.data.currentState.currentTurn = turnNumber;
        this.saveData();
    }

    // Обновление ОМ
    updateOM(om) {
        this.data.currentState.om = om;
        this.saveData();
    }

    // Обновление населения
    updatePopulation(population) {
        this.data.currentState.population = population;
        this.saveData();
    }

    // Обновление дипломатии
    updateDiplomacy(diplomacy) {
        this.data.currentState.diplomacy = diplomacy;
        this.saveData();
    }

    // Получение данных
    getData() {
        return this.data;
    }
}

// Экспорт
window.FileSync = FileSync;
