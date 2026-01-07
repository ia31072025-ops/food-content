const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    try {
        const { dish, additional } = req.body;
        const prompt = `Ты — эксперт YouTube. Создай контент-пакет для "${dish}". 
        Доп. условия: ${additional}.
        ОБЯЗАТЕЛЬНО: 
        1. Описание 500 слов с ТАЙМ-КОДАМИ (00:00-00:15 и т.д.). 
        2. Рецепт (ингредиенты и шаги). 
        3. Посты для Telegram и VK.
        
        ОТВЕТЬ ТОЛЬКО В JSON:
        {
          "title": "Название блюда",
          "recipe": { "ingredients": ["..."], "steps": ["..."] },
          "youtube": { "description": "ОПИСАНИЕ С ТАЙМКОДАМИ", "tags": "теги" },
          "social": { "telegram": "текст", "vk": "текст" }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: "Ошибка ИИ" });
    }
});

app.listen(10000, '0.0.0.0');