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

    const systemMessage = `Ты — профессиональный YouTube-продюсер и фуд-копирайтер. 
Твоя задача — создать вирусный контент для блюда: "${dish}".

ВЫПОЛНИ СЛЕДУЮЩИЕ ПУНКТЫ СТРОГО:
1. ТРИ ВАРИАНТА НАЗВАНИЯ (Эмоциональный, Поисковый, Смешанный) — используй КАПС и эмодзи.
2. ЖИВОЕ ОПИСАНИЕ (600 слов): ХУК в начале, сенсорные слова, SEO-блок.
3. ТАЙМКОДЫ: минимум 5 этапов.
4. ИНГРЕДИЕНТЫ: список с иконками.
5. ПОСТЫ: готовые тексты для Telegram и VK.

ОТВЕТЬ СТРОГО В ЭТОМ JSON ФОРМАТЕ:
{
  "youtube": {
    "titles": {
      "viral": "Вариант 1: Эмоциональный",
      "seo": "Вариант 2: Поисковый",
      "mixed": "Вариант 3: Смешанный"
    },
    "description": "Здесь ХУК + ДЛИННЫЙ ТЕКСТ (600 слов) + ТАЙМКОДЫ + ХЕШТЕГИ",
    "ingredients": "Список ингредиентов с иконками"
  },
  "social": {
    "telegram": "Готовый виральный пост для Telegram",
    "vk": "Подробный пост для VK"
  },
  "recipe": {
    "steps": ["Детальные шаги приготовления"]
  }
}`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: `Блюдо: ${dish}. Особенности: ${additional || 'Классический рецепт'}. Тип: ${type}, Сложность: ${level}.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4096,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server LIVE`);
});
