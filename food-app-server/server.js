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

        if (!apiKey) return res.status(500).json({ error: 'API Key не настроен' });

        const prompt = `Ты — эксперт по YouTube-кулинарии и профессиональный шеф-повар. 
        Создай максимально подробный контент-план для видеоролика: "${dish}".
        
        Ответ должен быть СТРОГО в формате JSON:
        {
          "recipe": {
            "title": "Название",
            "time": "Время приготовления",
            "difficulty": "Сложность",
            "ingredients": ["Список всех ингредиентов с граммовками"],
            "steps": ["Детальный пошаговый процесс (минимум 7 шагов)"]
          },
          "youtube": {
            "titles": ["Кликбейтный заголовок", "SEO-оптимизированный", "Профессиональный"],
            "description": "Длинное описание (300+ слов) с вступлением, пользой, полным списком ингредиентов и призывом к действию.",
            "timestamps": ["0:00 - Вступление", "1:00 - Ингредиенты", "2:30 - Процесс готовки", "8:00 - Сервировка", "9:30 - Итог"],
            "tags": ["тег1", "тег2", "тег3", "еще 15 тегов через запятую"]
          },
          "social": {
            "telegram": "Пост в стиле блога с эмодзи и интригой",
            "vk": "Полезный лонгрид для сообщества"
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
                    { role: "system", content: "Ты пишешь экспертный, вдохновляющий и очень подробный кулинарный контент. Твои тексты помогают каналам расти." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.8
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: 'Ошибка генерации' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server live on ${PORT}`));