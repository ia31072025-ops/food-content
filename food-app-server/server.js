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

        const prompt = `
        Ты — элитный шеф-повар и ТОП-YouTube-SEO специалист 2026.
        Создай полный контент-пакет для блюда "${dish}".

        ПАРАМЕТРЫ:
        - Тип: "${type}", Сложность: "${level}", Формат: "${channelFormat}", Доп: "${additional}"

        🛑 КАЧЕСТВО:
        1. Рецепт с нуля (тесто, соусы — только база). Минимум 12 шагов с t°C и минутами.
        2. ПРАВИЛО ПЕЧЕНЬЯ: Если блюдо требует выпечки (торт) — пеки с нуля. Если классика (Тирамису) или указано "без выпечки" — используй печенье.

        ✅ SEO YouTube 2026:
        1. ЗАГОЛОВКИ: 5 вариантов.
        2. ОПИСАНИЕ: 400-600 слов. ОБЯЗАТЕЛЬНО ТАЙМКОДЫ (00:00-00:15 Вступление, 00:15-00:45 Ингредиенты и т.д.).
        3. ПОСТЫ: Для Telegram (с эмодзи) и VK (лонгрид).
        4. ТЕГИ: 30-40 шт. ХЭШТЕГИ: 15-20 шт.

        ОТВЕТЬ СТРОГО В JSON:
        {
          "recipe": { "title": "...", "time": "...", "difficulty": "...", "ingredients": ["..."], "steps": ["..."] },
          "youtube": { "titles": ["..."], "description": "...", "tags": "...", "hashtags": "..." },
          "social": { "telegram": "...", "vk": "..." }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "system", content: "Профессиональный AI-ассистент фуд-блогеров." }, { role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));