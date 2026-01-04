const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    const { dishName } = req.body; // App.tsx отправляет dishName

    if (!dishName) {
        return res.status(400).json({ error: 'Название блюда обязательно' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Составь контент для блюда: ${dishName}. 
        Ответ верни СТРОГО в формате JSON без лишнего текста и без разметки markdown (без кавычек \`\`\`json).
        Структура JSON:
        {
          "title": "Название",
          "ingredients": ["ингред1", "ингред2"],
          "description": "Пошаговый рецепт",
          "youtubeSEO": { "tags": "тег1, тег2", "description": "SEO описание" },
          "socialPosts": { "tg": "пост для телеграм", "vk": "пост для вк" }
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Очистка от возможных символов разметки markdown, если ИИ их добавит
        text = text.replace(/```json|```/g, "").trim();

        const jsonResponse = JSON.parse(text);
        res.json(jsonResponse);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка генерации', details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});