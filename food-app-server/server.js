const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Настройка CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));

app.use(express.json());

// Проверка ключа
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: API ключ отсутствует в переменных окружения!");
}

// Инициализация Google AI
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/generate', async (req, res) => {
    const { dishName } = req.body;
    
    if (!dishName) {
        return res.status(400).json({ error: "Название блюда не получено" });
    }

    try {
        // Используем проверенную модель flash
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Ты — профессиональный шеф-повар. 
        Составь контент для блюда: ${dishName}. 
        Ответ верни СТРОГО в формате JSON без разметки markdown и без слов \`\`\`json.
        
        Структура JSON:
        {
          "title": "Название",
          "ingredients": ["ингред1", "ингред2"],
          "description": "Пошаговое приготовление",
          "youtubeSEO": { "tags": "теги через запятую", "description": "SEO текст" },
          "socialPosts": { "tg": "текст для телеграм", "vk": "текст для вк" }
        }`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Очистка текста от лишних символов
        const cleanJson = text.replace(/```json|```/g, "").trim();
        
        const jsonResponse = JSON.parse(cleanJson);
        res.json(jsonResponse);

    } catch (error) {
        console.error("Ошибка в процессе генерации:", error);
        
        // Если ошибка именно от Google API
        if (error.status === 404) {
            return res.status(500).json({ 
                error: "Модель не найдена", 
                details: "Библиотека Google AI не смогла найти модель. Попробуйте обновить зависимости." 
            });
        }

        res.status(500).json({ 
            error: "Ошибка генерации на стороне сервера", 
            details: error.message 
        });
    }
});

// Базовый роут для проверки
app.get('/', (req, res) => {
    res.send('Сервер работает. Жду POST запросы на /generate');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});