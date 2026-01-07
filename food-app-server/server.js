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

        const prompt = `Ты — элитный шеф-повар и эксперт по YouTube-SEO 2026.
        БЛЮДО: "${dish}". ТИП: "${type}". СЛОЖНОСТЬ: "${level}". ДОП: "${additional}".

        ПРАВИЛА:
        - Никакой лени: если блюдо требует теста — печем сами. Если печенье классика (Тирамису) — используем его.
        - Описание: 400+ слов, сочное, с ключами и CTA.
        - Шаги: Минимум 10 детальных шагов с градусами и минутами.

        ОТВЕТЬ В JSON:
        {
          "recipe": { "title": "Название", "time": "Время", "difficulty": "Сложность", "ingredients": ["Список"], "steps": ["Шаги"] },
          "youtube": { "titles": ["5 заголовков"], "description": "SEO текст", "timestamps": ["0:00 - ..."], "tags": "теги", "hashtags": "хэштеги" },
          "social": { "telegram": "Пост ТГ", "vk": "Пост ВК" }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "Ты профи." }, { role: "user", content: prompt }],
                response_format: { type: "json_object" },
                temperature: 0.7
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