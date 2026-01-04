const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        console.log(`Запрос на блюдо: ${dish}`);

        // Самый стабильный вариант для v1
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        const result = await model.generateContent(`Напиши подробный рецепт для блюда: ${dish} на русском языке.`);
        const response = await result.response;
        
        res.json({ recipe: response.text() });
    } catch (error) {
        console.error('Ошибка ИИ:', error.message);
        res.status(500).json({ error: 'Ошибка нейросети', details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
});