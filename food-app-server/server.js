const express = require('express');
const cors = require('cors'); // Обязательно для исправления ошибки CORS
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();

// Настройка CORS: разрешаем запросы с любого порта (3000, 3001 и т.д.)
app.use(cors());
app.use(express.json());

// Проверка наличия ключа в .env
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА: API ключ не найден в файле .env!");
}

const genAI = new GoogleGenerativeAI(apiKey);

app.post('/generate', async (req, res) => {
    const { dishName } = req.body;
    console.log("Запрос на блюдо:", dishName);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Ты профессиональный шеф-повар. Составь контент для блюда: ${dishName}. 
        Ответ дай СТРОГО в формате JSON без разметки markdown и без слов \`\`\`json.
        Структура JSON:
        {
          "title": "Название",
          "ingredients": ["ингред1", "ингред2"],
          "description": "пошаговая инструкция",
          "youtubeSEO": { "tags": "теги через запятую", "description": "SEO описание" },
          "socialPosts": { "tg": "пост для телеграм", "vk": "пост для вк" }
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Очистка текста на случай, если ИИ всё же добавил лишние символы
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const jsonResponse = JSON.parse(cleanJson);
        
        res.json(jsonResponse);

    } catch (error) {
        console.error("Ошибка ИИ:", error.message);
        res.status(500).json({ error: "Ошибка генерации", details: error.message });
    }
});

app.get('/', (req, res) => res.send("Сервер работает на порту 10000. Жду запросы на /generate"));

const PORT = 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ СЕРВЕР ЗАПУЩЕН: http://localhost:${PORT}`);
});