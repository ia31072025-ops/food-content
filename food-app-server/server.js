const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
    const { dish, type, level, channelFormat, additional } = req.body;
    
    // Твой мощный промпт (оставляем без изменений)
    const prompt = `Ты — элитный шеф-повар и ТОП-YouTube-SEO специалист 2026.
    Создай контент-пакет для блюда "${dish}".
    ПАРАМЕТРЫ: Тип: ${type}, Сложность: ${level}, Формат: ${channelFormat}, Уточнения: ${additional}.
    ФОРМАТ ОТВЕТА: СТРОГО JSON. (Далее по твоей структуре)`;

    const systemMessage = "Ты - профессиональный AI-ассистент для фуд-блогеров. Генерируй качественный JSON контент.";

    try {
        // --- ПОПЫТКА 1: ЛОКАЛЬНАЯ OLLAMA (GEMMA 2) ---
        console.log("📡 Пробую локальную Ollama (Gemma 2)...");
        
        const ollamaResponse = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.MODEL_NAME_LOCAL || "gemma2:9b",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                format: "json", // Gemma 2 отлично умеет в JSON
                stream: false
            }),
            signal: AbortSignal.timeout(7000) // Ждем 7 секунд. Если комп не тянет или выключен - идем дальше.
        });

        if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            console.log("✅ Успех: Ответ получен от Ollama!");
            return res.json(JSON.parse(data.message.content));
        }
        throw new Error("Ollama вернула ошибку или недоступна");

    } catch (error) {
        // --- ПОПЫТКА 2: OPENAI (РЕЗЕРВ) ---
        console.log("⚠️ Ollama недоступна. Переключаюсь на OpenAI...");
        
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Локальная сеть недоступна, а ключ OpenAI отсутствует.' });
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                    response_format: { type: "json_object" },
                    temperature: 0.6
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Ошибка OpenAI');
            
            console.log("✅ Успех: Ответ получен от OpenAI!");
            return res.json(JSON.parse(data.choices[0].message.content));

        } catch (openAiError) {
            console.error("❌ Критическая ошибка:", openAiError);
            res.status(500).json({ error: `Все сервисы недоступны: ${openAiError.message}` });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 YT Chef HYBRID запущен на порту ${PORT}`));