const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/generate-recipe', async (req, res) => {
    const { dishName, ingredients } = req.body;
    if (!dishName) return res.status(400).json({ error: "Назови блюдо" });

    console.log(`🚀 Начинаю генерацию через Qwen 3: ${dishName}`);

    const systemPrompt = `Ты — эксперт по SEO и шеф-повар. Напиши контент-пакет для "${dishName}".
    ОТВЕТЬ СТРОГО В JSON.
    
    Обязательно:
    1. В "description" (700+ слов) начни с ХУКА. Используй ключи: "рецепт ${dishName}", "как приготовить".
    2. Опиши историю и науку процесса (почему получается именно такой вкус).
    3. Telegram: пост-лонгрид с эмодзи.
    4. Заголовки: SEO, Кликбейт, Интрига.`;

    try {
        const completion = await groq.chat.completions.create({
            // Используем ID модели ровно как в твоем примере
            model: "qwen/qwen3-32b", 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Создай полный пакет для ${dishName}` }
            ],
            temperature: 0.6,
            // Для JSON формата max_tokens должен быть достаточным
            max_tokens: 5000, 
            top_p: 0.95,
            // Добавляем поддержку формата JSON
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        console.log("✅ Готово! Отправляю данные.");
        res.json(result);

    } catch (error) {
        console.error("❌ Ошибка в терминале:", error.message);
        res.status(500).json({ error: "Ошибка нейросети", details: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Сервер Обжорка.ру на Qwen 3 запущен (Порт ${PORT})`);
});
