const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    try {
        const { dish, type, additional } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        const systemRole = `Ты — профессиональный помощник фуд-блогера, SEO-специалист YouTube, сценарист и SMM-редактор. 
        Твоя цель — создавать контент-пакеты по 10 пунктам: 
        1. SEO-описание (500+ слов, ключевые слова). 
        2. Тайм-коды (00:00-00:15 и т.д.). 
        3. 3 варианта названий. 
        4. 30 Тегов. 
        5. Сценарий видео (Хук, Визуал). 
        6. Сценарий Shorts. 
        7. Пост Telegram. 
        8. Пост VK. 
        9. Полный рецепт (с учетом правок: без сахара/ПП и т.д.). 
        10. КБЖУ.`;

        const userPrompt = `Объект: "${dish}". Формат: ${type}. Пожелания: ${additional}. 
        Если дана ссылка — проанализируй её (имитируй анализ по названию/контексту) и выдай полный пакет.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemRole },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка генерации контента' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log('Chef AI Engine 3.6 Active'));