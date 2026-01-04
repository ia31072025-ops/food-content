const express = require('express');
require('dotenv').config();

const app = express();

app.get('/', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        // Специальный URL для получения списка всех доступных тебе моделей
        const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        console.log('--- ДОСТУПНЫЕ МОДЕЛИ ---');
        if (data.models) {
            data.models.forEach(m => {
                console.log(`Модель: ${m.name} | Методы: ${m.supportedGenerationMethods.join(', ')}`);
            });
            res.json({ message: "Список моделей выведен в логи Render", models: data.models });
        } else {
            res.status(500).json({ error: "Не удалось получить список", details: data });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Диагностика на порту ${PORT}`));