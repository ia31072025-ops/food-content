const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    try {
        const { dish, type, level, channelFormat, additional } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        const prompt = `Ты — топовый YouTube-продюсер и шеф-повар 2026.
        СОЗДАЙ КОНТЕНТ ДЛЯ: "${dish}".
        
        ТРЕБОВАНИЯ К ОПИСАНИЮ:
        1. Длина: 600+ слов.
        2. ТАЙМКОДЫ: Обязательно в формате:
           00:00-00:15 — Вступление и презентация блюда
           00:15-00:45 — Список ингредиентов и их выбор
           00:45-02:30 — (и так далее до конца процесса)
        3. Содержание: История блюда, советы по подаче, химия процессов.

        ТРЕБОВАНИЯ К РЕЦЕПТУ:
        - Никаких полуфабрикатов. Тесто, соусы — всё с нуля.
        - Минимум 12 пошаговых этапов.

        ОТВЕТЬ СТРОГО В JSON:
        {
          "recipe": { "title": "Название", "time": "Время", "difficulty": "Сложность", "ingredients": ["..."], "steps": ["..."] },
          "youtube": { "titles": ["..."], "description": "...", "tags": "...", "hashtags": "..." },
          "social": { "telegram": "...", "vk": "..." }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "Ты — профессиональный фуд-блогер." }, { role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('Backend Live'));