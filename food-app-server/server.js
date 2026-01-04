const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.send('Сервер готов к генерации!');
});

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        
        // Для Gemini Pro 1.0 правильное название модели в SDK:
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const result = await model.generateContent(`Напиши рецепт блюда: ${dish}. Отвечай на русском языке.`);
        const response = await result.response;
        
        res.json({ recipe: response.text() });
    } catch (error) {
        console.error('Ошибка:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});