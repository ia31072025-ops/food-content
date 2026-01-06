const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) return res.status(500).json({ error: 'Ошибка: API Key не настроен на сервере' });

        // УЛЬТИМАТИВНЫЙ ПРОМПТ ДЛЯ ЛЮБЫХ БЛЮД
        const prompt = `Ты — элитный шеф-повар и эксперт по YouTube-маркетингу. 
        Создай профессиональный контент-план для блюда: "${dish}".

        ПРАВИЛА ДЛЯ РЕЦЕПТА:
        1. ГОТОВИМ С НУЛЯ: Никаких готовых коржей, печенья или магазинных соусов. Если это торт — печем бисквит. Если паста — делаем соус.
        2. ДЕТАЛИЗАЦИЯ: Описывай шаги максимально подробно (минимум 10 шагов). Указывай температуру, время и нюансы (например, "взбивать до твердых пиков").
        3. ТОЧНОСТЬ: Указывай ингредиенты в граммах, миллилитрах и штуках.

        ПРАВИЛА ДЛЯ SEO (YouTube 2026):
        1. ОПИСАНИЕ: Огромный текст (400-500 слов). Включи: историю блюда, почему этот рецепт лучший, подробный список продуктов и призыв к подписке.
        2. ЗАГОЛОВКИ: 5 вариантов с высоким CTR (сочетай пользу и любопытство).
        3. ТАЙМКОДЫ: Профессиональная разбивка по минутам.
        4. ТЕГИ: 30 релевантных SEO-тегов.

        ВЕРНИ СТРОГИЙ JSON:
        {
          "recipe": {
            "title": "Название",
            "time": "Общее время",
            "difficulty": "Сложность",
            "ingredients": ["Список с граммовками"],
            "steps": ["10-12 детальных шагов"]
          },
          "youtube": {
            "titles": ["5 заголовков"],
            "description": "Длинный SEO-текст",
            "timestamps": ["0:00 - Вступление", "..."],
            "tags": ["теги через запятую"],
            "hashtags": ["15 хэштегов"]
          },
          "social": {
            "telegram": "Пост с эмодзи",
            "vk": "Статья-лонгрид"
          }
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Ты — профессионал высокого уровня. Твои рецепты точны, а SEO-тексты выводят видео в топ." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`SEO Server is Live on port ${PORT}`));