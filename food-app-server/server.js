const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Сервер готов!'));

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'API ключ не найден в Render' });

        // Список всех возможных имен модели от новых к старым
        const modelVariants = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro'
        ];

        let successData = null;
        let lastError = '';

        // Цикл, который пробует каждую модель, пока не получит ответ
        for (const modelName of modelVariants) {
            try {
                console.log(`Пробую вызвать модель: ${modelName}...`);
                const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Напиши рецепт блюда: ${dish} на русском.` }] }]
                    })
                });

                const data = await response.json();

                if (data.candidates && data.candidates[0].content) {
                    successData = data.candidates[0].content.parts[0].text;
                    console.log(`✅ Успешно сработало с моделью: ${modelName}`);
                    break; // Выходим из цикла, если получили ответ
                } else {
                    lastError = data.error?.message || 'Неизвестная ошибка';
                    console.log(`❌ Модель ${modelName} выдала ошибку: ${lastError}`);
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        if (successData) {
            res.json({ recipe: successData });
        } else {
            res.status(500).json({ error: 'Google отклонил все варианты моделей', details: lastError });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));