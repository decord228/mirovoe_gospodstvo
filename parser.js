// parser.js - Парсинг markdown файлов

class MarkdownParser {
    // Парсинг файла хода
    parseTurn(content) {
        const turn = {
            title: '',
            startResources: {},
            endResources: {},
            actions: [],
            army: [],
            population: 0,
            om: 0,
            hero: '',
            completed: [],
            arriving: []
        };

        const lines = content.split('\n');
        let section = '';

        for (let line of lines) {
            line = line.trim();

            // Заголовок
            if (line.startsWith('# ХОД')) {
                turn.title = line.replace('# ', '');
            }

            // Секции
            if (line.startsWith('## Начало хода')) {
                section = 'start';
                continue;
            }
            if (line.startsWith('## Конец хода')) {
                section = 'end';
                continue;
            }
            if (line.startsWith('## Действия')) {
                section = 'actions';
                continue;
            }
            if (line.startsWith('## Армия')) {
                section = 'army';
                continue;
            }
            if (line.startsWith('## Завершается')) {
                section = 'completed';
                continue;
            }
            if (line.startsWith('## Прибывает')) {
                section = 'arriving';
                continue;
            }

            // Парсинг ресурсов
            if (section === 'start' || section === 'end') {
                const resourceMatch = line.match(/- [🌾🪵🪨⚙️] (\w+): (\d+)/);
                if (resourceMatch) {
                    const [, name, value] = resourceMatch;
                    const resources = section === 'start' ? turn.startResources : turn.endResources;
                    resources[name.toLowerCase()] = parseInt(value);
                }
            }

            // Парсинг действий
            if (section === 'actions' && line.startsWith('✅')) {
                turn.actions.push(line.replace('✅ ', '').replace('**', '').replace('**', ''));
            }

            // Парсинг армии
            if (section === 'army' && line.startsWith('- ')) {
                const armyMatch = line.match(/- (\d+) (\w+)/);
                if (armyMatch) {
                    turn.army.push({
                        count: parseInt(armyMatch[1]),
                        type: armyMatch[2]
                    });
                }
            }

            // Парсинг завершается/прибывает
            if ((section === 'completed' || section === 'arriving') && line.startsWith('✅')) {
                const list = section === 'completed' ? turn.completed : turn.arriving;
                list.push(line.replace('✅ ', '').replace('**', '').replace('**', ''));
            }

            // Население
            const popMatch = line.match(/## Население: (\d+)/);
            if (popMatch) {
                turn.population = parseInt(popMatch[1]);
            }

            // ОМ
            const omMatch = line.match(/## ОМ: (\d+)/);
            if (omMatch) {
                turn.om = parseInt(omMatch[1]);
            }
        }

        return turn;
    }

    // Парсинг текущего состояния
    parseCurrentState(content) {
        const state = {
            resources: {},
            buildings: [],
            army: [],
            armyPower: 0,
            population: 0,
            om: 0,
            hero: '',
            allies: [],
            enemies: [],
            treaties: []
        };

        const lines = content.split('\n');
        let section = '';

        for (let line of lines) {
            line = line.trim();

            if (line.startsWith('## 💰 РЕСУРСЫ')) {
                section = 'resources';
                continue;
            }
            if (line.startsWith('## 🏠 ЗДАНИЯ')) {
                section = 'buildings';
                continue;
            }
            if (line.startsWith('## ⚔️ АРМИЯ')) {
                section = 'army';
                continue;
            }
            if (line.startsWith('## 🗺️ ДИПЛОМАТИЯ')) {
                section = 'diplomacy';
                continue;
            }

            // Ресурсы
            if (section === 'resources') {
                const resourceMatch = line.match(/- [🌾🪵🪨⚙️] (\w+): (\d+)/);
                if (resourceMatch) {
                    state.resources[resourceMatch[1].toLowerCase()] = parseInt(resourceMatch[2]);
                }
            }

            // Сила армии
            const powerMatch = line.match(/\*\*Сила:\*\* (\d+)/);
            if (powerMatch) {
                state.armyPower = parseInt(powerMatch[1]);
            }

            // Население
            const popMatch = line.match(/\*\*Население:\*\* (\d+)/);
            if (popMatch) {
                state.population = parseInt(popMatch[1]);
            }

            // ОМ
            const omMatch = line.match(/\*\*Текущие:\*\* (\d+)/);
            if (omMatch) {
                state.om = parseInt(omMatch[1]);
            }

            // Герой
            const heroMatch = line.match(/\*\*(.+?)\*\* [😱🗡️⚡]/);
            if (heroMatch) {
                state.hero = heroMatch[1];
            }

            // Союзники
            if (section === 'diplomacy' && line.includes('🤝')) {
                const allyMatch = line.match(/- 🤝 (.+?) \(/);
                if (allyMatch) {
                    state.allies.push(allyMatch[1]);
                }
            }
        }

        return state;
    }

    // Парсинг таблицы построек
    parseBuildingsTable(content) {
        const buildings = [];
        const lines = content.split('\n');
        let inTable = false;

        for (let line of lines) {
            if (line.includes('|') && !line.includes('---')) {
                if (line.includes('Уровень')) {
                    inTable = true;
                    continue;
                }
                if (inTable) {
                    const parts = line.split('|').map(p => p.trim()).filter(p => p);
                    if (parts.length >= 4) {
                        buildings.push({
                            name: parts[0],
                            level: parts[1],
                            cost: parts[2],
                            time: parts[3]
                        });
                    }
                }
            }
        }

        return buildings;
    }
}

// Экспорт
window.MarkdownParser = MarkdownParser;
