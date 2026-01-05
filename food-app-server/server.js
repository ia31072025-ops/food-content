const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Настройки CORS (чтобы фронтенд мог достучаться)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 2. Проверка работы сервера (Главная страница)
app.get('/', (req, res) => {
    res.send('Сервер готов! Используем стабильную модель Gemini 1.5 Flash.');
});

// 3. Основной роут для генерации рецепта
app.post('/generate', async (req, res) => {
    try {
        const { dish } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        // Проверка наличия ключа
        if (!apiKey) {
            console.error("ОШИБКА: Переменная GEMINI_API_KEY не найдена в окружении!");
            return res.status(500).json({ error: 'Ключ API не настроен на сервере' });
        }

        if (!dish) {
            return res.status(400).json({ error: 'Название блюда не указано' });
        }

        console.log(`Запрос на рецепт: ${dish}`);

        // Используем стабильную версию v1
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Напиши подробный рецепт блюда: ${dish} на русском языке. Используй заголовки и списки для красоты.` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        const data = await response.json();

        // Проверка ошибок от Google
        if (data.error) {
            console.error("Ошибка от Google API:", data.error.message);
            return res.status(500).json({ error: 'Google API Error', details: data.error.message });
        }

        // Проверка структуры ответа
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            console.error("Некорректный ответ от ИИ:", data);
            return res.status(500).json({ error: 'ИИ вернул пустой ответ' });
        }

        const recipeText = data.candidates[0].content.parts[0].text;
        
        console.log("Рецепт успешно сгенерирован");
        res.json({ recipe: recipeText });

    } catch (error) {
        // Здесь мы выводим ошибку в консоль Render, чтобы ты её видел
        console.error("Критическая ошибка на сервере:", error.message);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера', 
            message: error.message 
        });
    }
});

// 4. Запуск сервера
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});