const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { dish, type, level, channelFormat, additional } = req.body;
    
    const prompt = `
    Ты — элитный шеф-повар и ТОП-YouTube-SEO специалист 2026.
    Создай полный контент-пакет в формате JSON для блюда "${dish}".
    ПАРАМЕТРЫ: Тип: ${type}, Сложность: ${level}, Формат: ${channelFormat}, Уточнения: ${additional}.

    ФОРМАТ ОТВЕТА: СТРОГО JSON.
    {
      "recipe": {
        "title": "Название",
        "time": "Время",
        "difficulty": "Сложность",
        "ingredients": ["Список"],
        "steps": ["Шаги"]
      },
      "youtube": {
        "titles": ["5 названий"],
        "description": "Описание 400-600 слов",
        "timestamps": ["Таймкоды"],
        "tags": "теги, через, запятую",
        "hashtags": "#хештеги"
      },
      "social": {
        "telegram": "Пост",
        "vk": "Статья"
      }
    }`;

    const systemMessage = "Ты - профессиональный AI-ассистент. Отвечай ТОЛЬКО чистым JSON без лишнего текста.";

    try {
        // --- 1. ПОПЫТКА ЧЕРЕЗ OLLAMA ---
        console.log(`📡 [${new Date().toLocaleTimeString()}] Запрос к Ollama (${dish})...`);
        
        const ollamaResponse = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.MODEL_NAME_LOCAL || "gemma2:9b",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                stream: false,
                options: { temperature: 0.6 }
            }),
            signal: AbortSignal.timeout(90000) // Ждем 90 секунд
        });

        if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            let content = data.message.content;

            // Очистка ответа от возможных кавычек ```json ... ```
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();

            const parsedJson = JSON.parse(content);
            console.log("✅ Успех: Ответ получен от Ollama!");
            return res.json(parsedJson);
        }
        throw new Error("Ollama недоступна");

    } catch (error) {
        // --- 2. РЕЗЕРВ: OPENAI ---
        console.log(`⚠️ Ollama не ответила (${error.message}). Пробую OpenAI...`);
        
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey.includes('ВАШ_РЕАЛЬНЫЙ_КЛЮЧ')) {
            console.error("❌ Ошибка: Ключ OpenAI не настроен!");
            return res.status(500).json({ error: "Ollama недоступна, а ключ OpenAI не настроен в .env" });
        }

        try {
            const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey.trim()}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            const data = await openAiResponse.json();
            if (!openAiResponse.ok) throw new Error(data.error?.message || 'Ошибка OpenAI');

            console.log("✅ Успех: Ответ получен от OpenAI!");
            return res.json(JSON.parse(data.choices[0].message.content));

        } catch (apiError) {
            console.error("❌ Критическая ошибка:", apiError.message);
            res.status(500).json({ 
                error: "Все сервисы недоступны", 
                details: apiError.message 
            });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🔗 Локальный адрес: http://localhost:${PORT}`);
    console.log(`🧠 Модель Ollama: ${process.env.MODEL_NAME_LOCAL}`);
    console.log(`-----------------------------------------------`);
});