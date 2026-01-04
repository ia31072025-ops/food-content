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

        if (!apiKey) return res.status(500).json({ error: 'API KEY не найден' });

        // МАКСИМАЛЬНО СТАБИЛЬНЫЙ URL (v1)
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Напиши подробный рецепт блюда: ${dish} на русском языке.` }]
                }]
            })
        });

        const data = await response.json();

        // Если Google вернул ошибку (например, 404 или 403)
        if (data.error) {
            console.error('Google API Error:', data.error.message);
            
            // Если 1.5-flash не сработал, пробуем СТАРУЮ модель-заглушку
            const backupUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
            const backupRes = await fetch(backupUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Напиши рецепт: ${dish}` }] }]
                })
            });
            const backupData = await backupRes.json();
            
            if (backupData.error) {
                throw new Error(`Google отказал обеим моделям: ${data.error.message}`);
            }
            return res.json({ recipe: backupData.candidates[0].content.parts[0].text });
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        res.json({ recipe: recipeText });

    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on ${PORT}`));