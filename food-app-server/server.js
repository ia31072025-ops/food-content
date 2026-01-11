const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.post('/generate', async (req, res) => {
    const { dish, type, level, channelFormat, additional } = req.body;

    const promptText = `
Ты — профессиональный YouTube-продюсер и фуд-копирайтер. 
Твоя задача — создать полное SEO-оформление для видео про "${dish}".
Особенности: ${additional || 'Классический рецепт'}. 
Тип: ${type}, Сложность: ${level}, Формат: ${channelFormat}.
`;

    const systemMessage = `${promptText}
    
ВАЖНО: Пиши ОЧЕНЬ подробно. Описание YouTube должно быть не менее 500-600 слов.
Ответ дай СТРОГО в формате JSON. 

СТРУКТУРА:
{
  "youtube": {
    "titles": { 
        "viral": "Эмоциональный заголовок с капсом и эмодзи", 
        "seo": "Поисковый заголовок", 
        "mixed": "Смешанный заголовок" 
    },
    "description": "Здесь пиши огромный текст на 600 слов с хуком, историей и советами", 
    "hashtags": ["#тег1", "#тег2"]
  },
  "recipe": {
    "title": "Название",
    "ingredients": ["Список с граммовками"],
    "steps": ["Детальные шаги"]
  },
  "social": {
    "telegram": "Готовый виральный пост для Telegram",
    "vk": "Подробный пост-статья для VK"
  }
}`;

    try {
        console.log(`📡 Запрос к ИИ для: ${dish}`);

        // 1. OLLAMA
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const ollamaResp = await fetch(`${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.MODEL_NAME_LOCAL || "gemma2:latest",
                    messages: [{ role: "user", content: systemMessage }],
                    format: "json",
                    stream: false
                }),
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (ollamaResp.ok) {
                const data = await ollamaResp.json();
                console.log("✅ Ответ от Ollama");
                return res.json(JSON.parse(data.message.content));
            }
        } catch (e) { console.log("⚠️ Ollama offline..."); }

        // 2. GROQ (Llama 3.3 70B)
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a professional copywriter. You MUST provide extremely detailed responses in JSON format." },
                { role: "user", content: systemMessage }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4096, // БЕЗ ЭТОГО ТЕКСТ БУДЕТ КОРОТКИМ
            response_format: { type: "json_object" }
        });

        console.log("✅ Ответ от Groq (Llama 3.3)");
        res.json(JSON.parse(completion.choices[0].message.content));

    } catch (error) {
        console.error("❌ Ошибка:", error.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер на порту ${PORT}`);
});
