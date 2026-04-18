const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(express.static(__dirname));

// API для автокоммита
app.post('/api/commit', async (req, res) => {
    try {
        const { message, data } = req.body;

        // Сохраняем data.json
        fs.writeFileSync(path.join(__dirname, 'data.json'), data);

        // Git команды
        exec('git add data.json', (err) => {
            if (err) {
                console.error('Git add error:', err);
                return res.status(500).json({ error: 'Git add failed' });
            }

            exec(`git commit -m "${message}"`, (err) => {
                if (err) {
                    console.error('Git commit error:', err);
                    return res.status(500).json({ error: 'Git commit failed' });
                }

                exec('git push', (err) => {
                    if (err) {
                        console.error('Git push error:', err);
                        return res.status(500).json({ error: 'Git push failed' });
                    }

                    console.log('✅ Автокоммит и пуш выполнены:', message);
                    res.json({ success: true, message: 'Committed and pushed' });
                });
            });
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log('📝 Автокоммиты включены');
});
