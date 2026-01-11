const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/generate', async (req, res) => {
    const { dish, additional, type, level } = req.body;

    // ТВОЙ ПРОМПТ ДОСЛОВНО + ТЕХНИЧЕСКИЕ УТОЧНЕНИЯ
    const systemMessage = `Ты — профессиональный YouTube-продюсер и фуд-копирайтер с опытом создания вирусного контента. Твоя задача — создать полное SEO-оформление для кулинарного видео.

Я дам тебе название блюда и краткие детали. На основе этого ты должен сгенерировать:

1. ТРИ ВАРИАНТА НАЗВАНИЯ (SEO + Кликбейт):
   - Вариант 1: Эмоциональный/Вирусный (с упором на интригу или шок-контент).
   - Вариант 2: Поисковый (четкое название блюда + "как приготовить").
   - Вариант 3: Смешанный (Польза/Скорость + Название).
   *Используй капс, эмодзи и сильные слова (Секрет, За 5 минут, Самый вкусный).*

2. ЖИВОЕ ОПИСАНИЕ ВИДЕО:
   - ХУК (Первые 2 строки): Провокация или обещание невероятного вкуса. Сразу к делу!
   - ОСНОВНАЯ ЧАСТЬ: "Вкусный" текст. Используй сенсорные слова (хрустящий, сочный, тает во рту). Объясни, почему этот рецепт лучший.
   - СПИСОК ИНГРЕДИЕНТОВ: Внутри текста описания, с маркерами.
   - ТАЙМ-КОДЫ: Логичные этапы видео (00:00 - Вступление и т.д.).
   - SEO-БЛОК: Ключевые слова органично в тексте.

3. ХЕШТЕГИ:
   - 5-7 релевантных тегов.

ПРАВИЛА:
- Никаких приветствий.
- Текст разбит на короткие абзацы (читабельный).
- В поле "recipe" НЕ ПИШИ ингредиенты (оставь пустым), пиши их ТОЛЬКО в описании.

ОТВЕТЬ СТРОГО В JSON:
{
  "youtube": {
    "description": "Здесь ВЕСЬ текст: 3 названия, хук, описание, ингредиенты, таймкоды и хештеги"
  },
  "social": {
    "telegram": "Готовый виральный пост для Telegram с эмодзи",
    "vk": "Подробный пост для VK"
  },
  "recipe": {
    "steps": ["Подробные шаги приготовления"]
  }
}`;

    const userPrompt = `Блюдо: ${dish}. Особенности: ${additional || 'Классический рецепт'}. Сложность: ${level}. Тип: ${type}.`;

    try {
        console.log(`📡 Запрос к Llama 3.3 для: ${dish}`);

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

        const content = completion.choices[0].message.content;
        res.json(JSON.parse(content));

    } catch (error) {
        console.error("❌ Ошибка:", error.message);
        res.status(500).json({ error: "Ошибка генерации" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер на порту ${PORT}`);
});
