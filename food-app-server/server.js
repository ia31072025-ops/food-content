const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Инициализация Google AI с твоим ключом
// Ключ будет браться из Environment Variables на Render или из файла .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'ТВОЙ_КЛЮЧ_ЕСЛИ_НЕТ_ENV');

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Запрос не может быть пустым' });
    }

    try {
        // Используем актуальное название модели
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(`Ты — шеф-повар. Составь подробный рецепт для блюда: ${prompt}`);
        const response = await result.response;
        const text = response.text();

        res.json({ recipe: text });
    } catch (error) {
        console.error('Ошибка Gemini:', error);
        res.status(500).json({ 
            error: 'Ошибка при генерации рецепта',
            details: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});