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

        if (!apiKey) return res.status(500).json({ error: 'Сервер не настроен: отсутствует API Key' });

        // ТВОЙ УЛУЧШЕННЫЙ ПРОМПТ
        const prompt = `Ты — профессиональный YouTube-SEO специалист и фуд-блогер. 
        Создай полное SEO-оформление для видео с рецептом: "${dish}".
        Цель — максимальные просмотры, высокий CTR и попадание в поиск YouTube и Google 2026.
        Стиль: вкусно, понятно, дружелюбно, профессионально.

        Верни ответ СТРОГО в формате JSON с этой структурой:
        {
          "recipe": {
            "title": "Название блюда",
            "time": "Время приготовления",
            "difficulty": "Сложность",
            "ingredients": ["Список с граммовками"],
            "steps": ["Пошаговый процесс (не менее 7 шагов)"]
          },
          "youtube": {
            "titles": ["5 SEO-названий до 60 символов, с ключевыми словами, без кликбейта"],
            "description": "Полное SEO-описание (200–400 слов) с ключевыми словами в первых 2 строках, ингредиентами, шагами и призывами.",
            "timestamps": ["0:00 – Вступление", "0:30 – Ингредиенты", "01:20 – Приготовление", "05:40 – Результат"],
            "tags": ["20-30 SEO-тегов: высоко-, средне- и низкочастотные через запятую"],
            "hashtags": ["15 тематических хэштегов через пробел"]
          },
          "social": {
            "telegram": "Интригующий пост для ТГ с эмодзи",
            "vk": "Полезный лонгрид для ВК"
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
                    { role: "system", content: "Ты — лучший SEO-эксперт в кулинарной нише. Твоя задача — сделать контент виральным." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.8
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("OpenAI Error:", data);
            return res.status(response.status).json({ error: data.error.message });
        }

        // Парсим контент из ответа OpenAI
        const finalContent = JSON.parse(data.choices[0].message.content);
        res.json(finalContent);

    } catch (error) {
        console.error("Critical Server Error:", error);
        res.status(500).json({ error: 'Ошибка сервера при связи с ИИ' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`SEO Server is running on port ${PORT}`));