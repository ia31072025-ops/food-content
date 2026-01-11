const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/generate', async (req, res) => {
    const { dish, additional, type, level } = req.body;

    const systemMessage = `Ты — профессиональный YouTube-продюсер. 
Создай контент для блюда: "${dish}".

ВАЖНО ДЛЯ СТРУКТУРЫ:
1. Ингредиенты (ingredients) должны быть МАССИВОМ строк ["ингредиент 1", "ингредиент 2"].
2. В описании (description) напиши: Три варианта заголовка (ВИРУСНЫЙ, SEO, СМЕШАННЫЙ), затем ХУК, затем ОГРОМНЫЙ сочный текст (600 слов), ТАЙМКОДЫ и ХЕШТЕГИ.
3. Посты для Telegram и VK должны быть длинными и готовыми к публикации.

ОТВЕТЬ СТРОГО В ЭТОМ JSON:
{
  "youtube": {
    "description": "ЗДЕСЬ: 3 НАЗВАНИЯ + ХУК + ТЕКСТ 600 СЛОВ + ТАЙМКОДЫ + ХЕШТЕГИ"
  },
  "recipe": {
    "title": "${dish}",
    "ingredients": ["мясо 500г", "соль по вкусу"], 
    "steps": ["шаг 1", "шаг 2"]
  },
  "social": {
    "telegram": "Пост для Телеграм с эмодзи",
    "vk": "Пост для ВК"
  }
}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: `Блюдо: ${dish}, особенности: ${additional}.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        
        // Гарантируем, что ingredients — это массив, чтобы App.tsx не падал
        if (!Array.isArray(result.recipe.ingredients)) {
            result.recipe.ingredients = [result.recipe.ingredients];
        }

        res.json(result);
    } catch (error) {
        console.error("Ошибка:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LIVE`);
});
