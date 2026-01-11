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
Твоя задача — создать полное SEO-оформление для видео про "${dish}".

ПРАВИЛА ВЫДАЧИ:
1. В начале поля "description" напиши ТРИ ВАРИАНТА НАЗВАНИЯ (Вирусный, Поисковый, Смешанный) с капсом и эмодзи.
2. Далее — ЖИВОЕ ОПИСАНИЕ (500+ слов). Используй ХУК в начале, сенсорные слова (сочный, хрустящий).
3. Вставь СПИСОК ИНГРЕДИЕНТОВ с иконками прямо в текст описания.
4. Добавь ТАЙМ-КОДЫ (00:00 - Вступление, 01:30 - Подготовка и т.д.).
5. В конце — 7 SEO ХЕШТЕГОВ.
6. ПОСТЫ ДЛЯ СОЦСЕТЕЙ должны быть развернутыми и готовыми к публикации.

ОТВЕТЬ СТРОГО В JSON:
{
  "youtube": {
    "description": "Здесь: 3 названия + Хук + Описание + Ингредиенты + Таймкоды + Хештеги"
  },
  "social": {
    "telegram": "Полный виральный пост для Telegram с эмодзи",
    "vk": "Подробная статья-пост для VK"
  },
  "recipe": {
    "steps": ["Детальные пошаговые инструкции приготовления"]
  }
}`;

    const userPrompt = `Блюдо: ${dish}. Особенности: ${additional || 'Классический рецепт'}. Тип: ${type}, Сложность: ${level}. Никаких приветствий, сразу к делу.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        res.json(JSON.parse(completion.choices[0].message.content));
    } catch (error) {
        console.error("❌ Ошибка:", error.message);
        res.status(500).json({ error: "Ошибка генерации" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен и готов к работе`);
});
