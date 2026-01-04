const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        console.log(`Запрос на: ${dish}`);

        // Вариант, который работает в 2025-2026 годах чаще всего
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Упрощенный вызов
        const result = await model.generateContent(
            `Напиши рецепт блюда: ${dish}. Отвечай на русском языке.`
        );
        
        const response = await result.response;
        const text = response.text();

        res.json({ recipe: text });
    } catch (error) {
        console.error('Ошибка в логах сервера:', error.message);
        // Если опять 404, сервер ответит нам точной причиной
        res.status(500).json({ error: "Ошибка API Google", details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер активен на порту ${PORT}`);
});