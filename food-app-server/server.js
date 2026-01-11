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
    
    // ТВОЙ ПРОМПТ ВСТАВЛЕН ДОСЛОВНО:
    const systemMessage = `Ты — профессиональный YouTube-продюсер и фуд-копирайтер с опытом создания вирусного контента. Твоя задача — создать полное SEO-оформление для кулинарного видео, которое заставит зрителя кликнуть и досмотреть до конца.

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

ОТВЕТ ДАЙ СТРОГО В ФОРМАТЕ JSON:
{
  "recipe": { "title": "", "time": "", "difficulty": "", "ingredients": [], "steps": [] },
  "youtube": { "titles": [], "description": "", "hashtags": "" },
  "social": { "telegram": "", "vk": "" }
}`;

    const prompt = `Блюдо: ${dish}. Особенности: ${additional}. Параметры: Тип ${type}, Сложность ${level}.`;

    try {
        // ПОПЫТКА 1: OLLAMA
        console.log(`📡 Запрос к Ollama (${dish})...`);
        const ollamaResponse = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.MODEL_NAME_LOCAL || "gemma2:latest",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                stream: false
            }),
            signal: AbortSignal.timeout(15000)
        });

        if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            let content = data.message.content.replace(/```json/g, '').replace(/```/g, '').trim();
            return res.json(JSON.parse(content));
        }
        throw new Error("Ollama offline");

    } catch (error) {
        // ПОПЫТКА 2: GROQ
        console.log(`⚠️ Переключаюсь на Groq (Llama 3.3 70B)...`);
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 4096,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            return res.json(JSON.parse(content));

        } catch (groqError) {
            console.error("❌ Ошибка:", groqError.message);
            res.status(500).json({ error: "Ошибка генерации", details: groqError.message });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 YT Chef PRO запущен на порту ${PORT}`);
});
