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
    const { dish, type, level, channelFormat, additional } = req.body;

    // --- ТВОЙ ПРОМПТ (ВСТАВЛЕН БЕЗ ИЗМЕНЕНИЙ) ---
    // Я только подставил переменные ${dish} и ${additional} в твои скобки
    const promptText = `
Ты — профессиональный YouTube-продюсер и фуд-копирайтер с опытом создания вирусного контента. Твоя задача — создать полное SEO-оформление для кулинарного видео, которое заставит зрителя кликнуть и досмотреть до конца.

Я дам тебе название блюда и краткие детали. На основе этого ты должен сгенерировать:

1. ТРИ ВАРИАНТА НАЗВАНИЯ (SEO + Кликбейт):
   - Вариант 1: Эмоциональный/Вирусный (с упором на интригу или шок-контент).
   - Вариант 2: Поисковый (четкое название блюда + "как приготовить").
   - Вариант 3: Смешанный (Польза/Скорость + Название).
   *Используй капс, эмодзи и сильные слова (Секрет, За 5 минут, Самый вкусный).*

2. ЖИВОЕ ОПИСАНИЕ ВИДЕО:
   - ХУК (Первые 2 строки): Должен быть виден до кнопки "Ещё". Это должна быть провокация, вопрос или обещание невероятного вкуса. Никаких "В этом видео я покажу...". Сразу к делу!
   - ОСНОВНАЯ ЧАСТЬ: "Вкусный" текст. Используй сенсорные слова (хрустящий, сочный, тает во рту, ароматный). Объясни, почему этот рецепт лучший (быстро, дешево, необычно).
   - SEO-БЛОК: Органично вплети ключевые слова в текст.

3. СПИСОК ИНГРЕДИЕНТОВ:
   - Оформи красивым списком с марлерами.

4. ХЕШТЕГИ:
   - 5-7 самых релевантных тегов для YouTube (#Рецепт #Еда #КакПриготовить...).

---

МОЙ ЗАПРОС:
Блюдо: ${dish}
Особенности: ${additional || 'Классический рецепт'}. Тип: ${type}. Сложность: ${level}.
`;

    // --- ТЕХНИЧЕСКАЯ ЧАСТЬ (ЧТОБЫ КОД НЕ ЛОМАЛСЯ) ---
    // Добавляем требование JSON, иначе сервер упадет
    const systemMessage = `${promptText}
    
    ВАЖНО: Твой ответ должен быть ТОЛЬКО валидным JSON объектом без лишнего текста. Структура:
    {
      "youtube": {
        "titles": { "viral": "", "seo": "", "mixed": "" },
        "description": "", 
        "hashtags": []
      },
      "recipe": {
        "ingredients": [],
        "steps": []
      }
    }`;

    try {
        console.log(`📡 Запрос: ${dish}`);

        // 1. OLLAMA
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 сек

        try {
            const ollamaResp = await fetch(`${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.MODEL_NAME_LOCAL || "gemma2:latest",
                    messages: [{ role: "user", content: systemMessage }],
                    format: "json",
                    stream: false
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (ollamaResp.ok) {
                const data = await ollamaResp.json();
                let clean = data.message.content.replace(/```json/g, '').replace(/```/g, '').trim();
                return res.json(JSON.parse(clean));
            }
        } catch (err) {
            console.log("⚠️ Ollama пропущена, идем в Groq...");
        }

        // 2. GROQ
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You output only JSON." },
                { role: "user", content: systemMessage }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        res.json(JSON.parse(content));

    } catch (error) {
        console.error("❌ Ошибка:", error.message);
        res.status(500).json({ error: "Server Error" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
