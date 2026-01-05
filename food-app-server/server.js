const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.OPENAI_API_KEY; // Ключ теперь берется из системы

        if (!apiKey) return res.status(500).json({ error: 'Ключ сервера не настроен' });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: "Ты — эксперт по YouTube-маркетингу и шеф-повар. Твоя цель: создать контент, который принесет миллион просмотров." 
                    },
                    { 
                        role: "user", 
                        content: `Создай полный контент-план для видео: "${dish}". 
                        Верни JSON: 
                        {
                          "recipe": {"title", "ingredients": [], "steps": [], "time", "difficulty"},
                          "youtube": {"titles": ["Кликбейтный заголовок", "Интригующий", "Поисковый"], "description": "С тайм-кодами и тегами", "tags": []},
                          "social": {"telegram": "Пост с эмодзи", "vk": "Пост для охватов"}
                        }` 
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при генерации контента' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Test Server running on ${PORT}`));