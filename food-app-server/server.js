const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY // Удалили текстовый ключ
});


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

   const systemMessage = `Ты — ведущий SEO-специалист по YouTube и фуд-блогер. 
Твоя цель: создать описание, которое выведет видео в ТОП поиска.

СТРУКТУРА ОТВЕТА:
1. Заголовок с ключевым словом (Clickbait, но честный).
2. Захватывающее вступление (первые 2 строки), содержащее главные ключевые слова для алгоритмов.
3. Блок "В этом видео вы узнаете:" (список преимуществ).
4. Список ингредиентов с иконками.
5. Блок хэштегов в конце (5-7 штук).

ПРАВИЛА:
- Никаких приветствий типа "Доброе утро".
- Используй сильные глаголы: "Узнайте", "Попробуйте", "Секрет", "Шок".
- Текст должен быть разбит на короткие абзацы для удобства чтения.
- Пиши на русском языке, сочно и профессионально.
- Ответ дай строго в формате JSON: {"description": "весь текст здесь"}`;

    try {
        // --- 1. ПОПЫТКА ЧЕРЕЗ OLLAMA (Твой локальный ПК через туннель) ---
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
            signal: AbortSignal.timeout(15000) // Сократил до 15 сек, чтобы быстрее переключаться на запасной вариант
        });

        if (ollamaResponse.ok) {
            const data = await ollamaResponse.json();
            let content = data.message.content.replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("✅ Успех: Ответ получен от Ollama!");
            return res.json(JSON.parse(content));
        }
        throw new Error("Ollama не ответила или вернула ошибку");

    } catch (error) {
        // --- 2. РЕЗЕРВ: GROQ (Вместо OpenAI) ---
        console.log(`⚠️ Ollama недоступна. Переключаюсь на Groq (Llama 3.3)...`);
        
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.6,
                response_format: { type: "json_object" } // Groq тоже умеет строго в JSON
            });

            const content = completion.choices[0].message.content;
            console.log("✅ Успех: Ответ получен от Groq!");
            return res.json(JSON.parse(content));

        } catch (groqError) {
            console.error("❌ Критическая ошибка всех сервисов:", groqError.message);
            res.status(500).json({ 
                error: "Все сервисы (Ollama и Groq) недоступны", 
                details: groqError.message 
            });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------------`);
    console.log(`🚀 YT Chef PRO 3.0 запущен на порту ${PORT}`);
    console.log(`💡 Резервный ИИ: Groq Cloud (Llama 3.3)`);
    console.log(`-----------------------------------------------`);
});