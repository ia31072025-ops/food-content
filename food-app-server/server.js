const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. НАСТРОЙКА CORS (Это уберет твою ошибку из консоли)
app.use(cors({
    origin: '*', // Разрешает запросы с любого сайта
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key']
}));

app.use(express.json());

// Проверка, что сервер вообще дышит
app.get('/', (req, res) => res.send('Backend is working!'));

// 2. ИСПРАВЛЕННЫЙ МАРШРУТ ГЕНЕРАЦИИ
app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API Key missing on server' });
        }

        // Используем максимально стабильную ссылку v1beta
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Напиши рецепт блюда: ${dish} на русском языке.` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Google Error:', data.error);
            return res.status(data.error.code || 500).json({ error: data.error.message });
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        res.json({ recipe: recipeText });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});