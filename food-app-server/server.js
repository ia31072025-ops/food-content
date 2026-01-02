const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyAJMmYNSWgj21K5LsjHS34_CfmITcxNcfE");

app.post('/generate', async (req, res) => {
    const { dishName } = req.body;
    console.log(`🤖 Запрос на блюдо: ${dishName}`);

    try {
        // Используем самую актуальную модель для 2026 года
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Действуй как шеф-повар. Создай рецепт и SEO для: "${dishName}". 
        Ответь ТОЛЬКО чистым JSON (без разметки markdown, без \`\`\`json).
        Структура:
        {
          "title": "Название",
          "ingredients": ["инг1", "инг2"],
          "description": "описание",
          "youtubeSEO": { "tags": "теги", "description": "описание" },
          "socialPosts": { "tg": "пост тг", "vk": "пост вк" }
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Убираем возможные лишние символы, если ИИ все же добавил обертку
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        
        console.log("✅ Ответ получен!");
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("❌ Ошибка:");
        // Если модель снова не найдена, выведем список того, что ВАМ доступно
        console.log(error.message);
        res.status(500).json({ error: "Ошибка нейросети" });
    }
});

app.listen(5000, () => console.log('🚀 Сервер активен на порту 5000'));