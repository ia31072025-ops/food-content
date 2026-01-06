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

        const prompt = `Ты — элитный YouTube-SEO специалист и шеф-повар.
        Создай профессиональное оформление для видео: "${dish}".
        
        ТРЕБОВАНИЯ К КОНТЕНТУ:
        1. Рецепт: Только КЛАССИЧЕСКИЙ и ПОЛНЫЙ (никаких упрощений, если это не указано). Минимум 7-10 детальных шагов.
        2. SEO-Описание: Объем 300-500 слов. Используй LSI-ключи, опиши текстуру, вкус и аромат блюда. В начале — мощное вступление для удержания.
        3. Заголовки: 5 вариантов с высоким CTR, комбинируй "Как приготовить" и эмоциональные триггеры.
        4. Таймкоды: Детальные, привязанные к конкретным процессам (например: "02:15 - Замешиваем тесто", а не просто "Приготовление").
        5. Теги и Ключи: Глубокая проработка (25-30 тегов).
        6. Формат: Строгий JSON.

        JSON СТРУКТУРА:
        {
          "recipe": {
            "title": "Полное название",
            "time": "Время",
            "difficulty": "Сложность",
            "ingredients": ["Список с мерами веса"],
            "steps": ["Детальные шаги"]
          },
          "youtube": {
            "titles": ["Список названий"],
            "description": "Огромный SEO-текст с абзацами",
            "timestamps": ["Список таймкодов"],
            "tags": ["Список тегов через запятую"],
            "hashtags": ["Список хэштегов"]
          },
          "social": {
            "telegram": "Пост с эмодзи",
            "vk": "Пост-лонгрид"
          },
          "keywords": "Ключевые слова через запятую"
        }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Эта модель отлично справляется с длинными текстами
                messages: [
                    { 
                        role: "system", 
                        content: "Ты — профессиональный фуд-блогер. Ты пишешь экспертно, подробно и вкусно. Твоя цель — вывести видео в ТОП-1 поиска." 
                    },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7 // Оптимально для баланса между точностью рецепта и креативностью текста
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));

    } catch (error) {
        res.status(500).json({ error: 'Ошибка генерации' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`SEO Server Live`));