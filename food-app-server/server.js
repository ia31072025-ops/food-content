const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Сервер активен!'));

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'Нет ключа API' });

        // Список моделей для попытки (от новой к старой)
        const modelsToTry = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro'
        ];

        let lastError = '';

        for (const modelName of modelsToTry) {
            try {
                console.log(`Пробую модель: ${modelName}`);
                const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Напиши рецепт: ${dish} на русском.` }] }]
                    })
                });

                const data = await response.json();

                if (data.candidates && data.candidates[0].content) {
                    console.log(`✅ Успех с моделью: ${modelName}`);
                    return res.json({ recipe: data.candidates[0].content.parts[0].text });
                } else {
                    lastError = data.error?.message || 'Пустой ответ';
                    console.warn(`Модель ${modelName} не подошла: ${lastError}`);
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        res.status(500).json({ error: 'Все модели Google отказали', details: lastError });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started`));