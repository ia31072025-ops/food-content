const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Инициализируем Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/generate-recipe', async (req, res) => {
    const { dishName, ingredients } = req.body;

    console.log(`>>> Запрос на блюдо: ${dishName}`);

    const systemPrompt = `Ты — SEO-специалист и шеф-повар. Напиши контент-пакет для "${dishName}".
    ОТВЕТЬ ТОЛЬКО В ФОРМАТЕ JSON. 
    Структура:
    {
      "youtube_title": ["SEO заголовок с хуком", "Кликбейт", "Интрига"],
      "description": "ЛОНГРИД от 600 слов. В начале ХУК. Внутри ключи: как приготовить, пошаговый рецепт. Подробно про историю и химию процессов.",
      "ingredients": ["список"],
      "steps": ["детальные шаги"],
      "telegram_post": "пост-лонгрид 200 слов",
      "vk_post": "статья",
      "hashtags": ["#тег1", "#тег2"]
    }`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Создай контент для ${dishName}` }
            ],
            // Используем самую стабильную модель Groq на текущий момент
            model: "llama-3.3-70b-versatile", 
            temperature: 0.6,
            max_tokens: 5000,
            response_format: { type: "json_object" }
        });

        console.log(">>> Ответ от Groq получен");
        const result = JSON.parse(completion.choices[0].message.content);
        res.json(result);

    } catch (error) {
        console.error("!!! ОШИБКА !!!");
        console.error(error.message);
        
        // Отправляем подробности ошибки на фронтенд
        res.status(500).json({ 
            error: "Ошибка генерации", 
            details: error.message,
            hint: "Проверь GROQ_API_KEY в файле .env" 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер онлайн: http://localhost:${PORT}`);
});
