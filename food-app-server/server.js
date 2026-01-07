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

        const prompt = `Ты — эксперт шеф-повар и YouTube-SEO 2026.
        БЛЮДО: "${dish}". ТИП: "${type}". СЛОЖНОСТЬ: "${level}". ФОРМАТ: "${channelFormat}". ДОП: "${additional}".
        
        ТРЕБОВАНИЯ:
        1. Рецепт с нуля (кроме классики типа Тирамису). Минимум 10 шагов с градусами и минутами.
        2. SEO описание (500 слов), 5 заголовков, таймкоды.
        3. 30 тегов через запятую, 15 хэштегов.
        4. Посты для Telegram и VK.

        ОТВЕТЬ ТОЛЬКО JSON:
        {
          "recipe": { "title": "Название", "time": "Время", "difficulty": "Сложность", "ingredients": ["..."], "steps": ["..."] },
          "youtube": { "titles": ["..."], "description": "...", "timestamps": ["..."], "tags": "...", "hashtags": "..." },
          "social": { "telegram": "...", "vk": "..." }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "Ты профессиональный фуд-блогер." }, { role: "user", content: prompt }],
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
app.listen(PORT, '0.0.0.0', () => console.log(`Backend Live on ${PORT}`));