const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Настройка CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Главная страница (проверка работоспособности)
app.get('/', (req, res) => {
    res.send('Сервер готов! Используем стабильную модель 1.5 Flash.');
});

// Основной роут для генерации рецепта
app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('Ошибка: API Ключ отсутствует!');
            return res.status(500).json({ error: 'Ключ API не найден в настройках' });
        }

        //const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Напиши подробный рецепт блюда: ${dish} на русском языке. Оформи красиво с использованием Markdown.` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        const data = await response.json();

        // Обработка ошибок от Google (включая квоты)
        if (data.error) {
            console.error('Google API Error:', data.error.message);
            return res.status(data.error.code || 500).json({ 
                error: 'Ошибка Google API', 
                details: data.error.message 
            });
        }

        if (!data.candidates || !data.candidates[0]) {
            return res.status(500).json({ error: 'ИИ вернул пустой ответ' });
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        res.json({ recipe: recipeText });

    } catch (error) {
        console.error('Критическая ошибка сервера:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});