const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Проверка работоспособности сервера
app.get('/', (req, res) => {
    res.send('Сервер запущен и готов принимать запросы!');
});

// 2. Основной маршрут генерации рецепта
app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Если ключ забыли добавить в настройки Render
        if (!apiKey) {
            return res.status(500).json({ error: 'API ключ не найден в переменных окружения Render' });
        }

        console.log(`Генерирую рецепт для: ${dish}`);

        // Используем прямой URL версии v1 и модель 1.5-flash
        const url = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey // Передаем ключ в заголовке для обхода ошибки 403
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Напиши подробный рецепт для блюда: ${dish} на русском языке. Оформи красиво.` }]
                }]
            })
        });

        const data = await response.json();

        // Если Google вернул ошибку
        if (data.error) {
            console.error('Google API Error:', data.error);
            return res.status(data.error.code || 500).json({ error: data.error.message });
        }

        // Проверяем наличие ответа в структуре данных
        if (data.candidates && data.candidates[0].content) {
            const recipeText = data.candidates[0].content.parts[0].text;
            res.json({ recipe: recipeText });
        } else {
            res.status(500).json({ error: 'Не удалось получить текст рецепта от нейросети' });
        }

    } catch (error) {
        console.error('System Error:', error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера', details: error.message });
    }
});

// 3. Порт для Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер работает на порту ${PORT}`);
});