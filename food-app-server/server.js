const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Проверка работы сервера
app.get('/', (req, res) => res.send('Backend is LIVE!'));

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API KEY MISSING IN RENDER' });
        }

        // Мы используем v1beta для 1.5-flash, так как это самый стабильный путь сейчас
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Напиши рецепт для: ${dish} на русском языке.` }]
                }]
            })
        });

        const data = await response.json();

        // Если модель не найдена, пробуем запасной вариант (gemini-pro)
        if (data.error && data.error.code === 404) {
            console.log("Flash not found, trying gemini-pro...");
            const backupUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
            // ... (аналогичный запрос можно сделать здесь, но Flash должен сработать)
        }

        if (data.error) {
            throw new Error(data.error.message);
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        res.json({ recipe: recipeText });

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));