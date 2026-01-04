const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Разрешаем CORS для всех (чтобы не было NetworkError)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Главная страница для проверки
app.get('/', (req, res) => res.send('Сервер готов! Используем стабильную модель 1.5 Flash.'));

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Ключ API не найден в настройках Render' });
        }

        // Используем СТАБИЛЬНУЮ модель 1.5 Flash через прямой URL
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Напиши подробный рецепт блюда: ${dish} на русском языке. Оформи красиво.` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800
                }
            })
        });

        const data = await response.json();

        // Если Google всё-таки ругается на квоту, мы выведем это в лог
        if (data.error) {
            console.error('Google API Error:', data.error.message);
            return res.status(data.error.code || 500).json({ 
                error: 'Google ограничил доступ', 
                details: data.error.message 
            });
        }

        if (!data.candidates || !data.candidates[0]) {
            return res.status(500).json({ error: 'Пустой ответ от ИИ' });
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        res.json({ recipe: recipeText });

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});