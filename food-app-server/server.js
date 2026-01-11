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
Создай сочное SEO-оформление для "${dish}".

ПРАВИЛА ФОРМАТИРОВАНИЯ:
1. Используй двойной перенос строки (\\n\\n) между заголовками, абзацами и разделами.
2. Текст должен быть разбит на короткие, читабельные абзацы.
3. Каждый пункт тайм-кодов и ингредиентов пиши с НОВОЙ СТРОКИ.

СТРУКТУРА В ПОЛЕ "description":
- ТРИ ВАРИАНТА НАЗВАНИЯ (каждый с новой строки)
- ХУК (отдельный абзац)
- ОСНОВНОЙ ТЕКСТ (минимум 5-7 абзацев с описанием вкуса и процесса)
- СПИСОК ИНГРЕДИЕНТОВ
- ТАЙМ-КОДЫ
- ХЕШТЕГИ

ОТВЕТЬ СТРОГО В JSON:
{
  "youtube": { "description": "Здесь весь оформленный текст с переносами строк \\n\\n" },
  "social": { "telegram": "Пост для ТГ", "vk": "Пост для ВК" },
  "recipe": { "ingredients": [], "steps": [] }
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
