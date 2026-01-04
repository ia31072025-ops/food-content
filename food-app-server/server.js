const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// Настройки
app.use(cors());
app.use(express.json());

// Проверка ключа в логах (для отладки)
if (!process.env.GEMINI_API_KEY) {
    console.error("ОШИБКА: API ключ не найден в переменных окружения!");
}

// Инициализация Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        console.log(`Принят запрос на блюдо: ${dish}`);

        // Используем стабильную версию v1, чтобы избежать ошибки 404
        // Используем ПОЛНОЕ имя модели с префиксом
        const model = genAI.getGenerativeModel(
            { model: "models/gemini-1.5-flash" }, // Добавили models/
            { apiVersion: 'v1' }
        );
        

        const prompt = `Напиши подробный пошаговый рецепт для блюда: ${dish}. Ответ должен быть на русском языке.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Рецепт успешно создан");
        res.json({ recipe: text });

    } catch (error) {
        console.error('Ошибка сервера:', error.message);
        res.status(500).json({ 
            error: 'Ошибка при обращении к нейросети',
            details: error.message 
        });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
});