const express = require('express');
const cors = require('cors');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Проверка API ключа
if (!process.env.GEMINI_API_KEY) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: GEMINI_API_KEY не установлен в Environment Variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        console.log(`Запрос на блюдо: ${dish}`);

        // Используем модель gemini-1.5-flash (она лучше понимает структуру запроса)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Формируем запрос как объект, чтобы избежать ошибок кодировки (ByteString error)
        const result = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [{ text: `Напиши подробный рецепт для блюда: ${dish}. Ответ должен быть полностью на русском языке.` }] 
            }]
        });

        const response = await result.response;
        const text = response.text();

        console.log("Рецепт успешно сгенерирован");
        res.json({ recipe: text });

    } catch (error) {
        console.error('Ошибка ИИ:', error.message);
        res.status(500).json({ 
            error: 'Ошибка сервера при генерации', 
            details: error.message 
        });
    }
});

// Настройка порта для Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ СЕРВЕР ЗАПУЩЕН: Port ${PORT}`);
});