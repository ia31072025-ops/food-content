const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Сервер готов! Теперь работаем на OpenAI GPT-4o-mini.');
});

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.OPENAI_API_KEY; // Поменяли имя переменной

        if (!apiKey) {
            return res.status(500).json({ error: 'Ключ OpenAI не найден' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Ты — шеф-повар. Пиши подробные рецепты на русском языке с использованием Markdown." },
                    { role: "user", content: `Напиши рецепт блюда: ${dish}` }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Ошибка OpenAI:", data.error.message);
            return res.status(500).json({ error: data.error.message });
        }

        const recipeText = data.choices[0].message.content;
        res.json({ recipe: recipeText });

    } catch (error) {
        console.error("Ошибка сервера:", error.message);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер OpenAI запущен на порту ${PORT}`);
});