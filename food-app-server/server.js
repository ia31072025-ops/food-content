

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/generate', async (req, res) => {
  const { dish, additional } = req.body;
  
  if (!dish || dish.trim() === '') {
    return res.status(400).json({ error: "Название блюда обязательно" });
  }
  
const systemPrompt = `Ты — продвинутый ИИ-агент уровня Virale (ChatPlace). Твоя специализация — взлом алгоритмов YouTube и Reels через психологию удержания.
Создай контент-пакет для "${dish}".

[БЛОК 1: VIRALE HOOKS]
- Напиши 3 варианта "Сверх-мощных хуков" для начала описания и самого видео. 
- Хук должен бить в страх (потерять деньги/вкус) или в любопытство (секрет профи).

[БЛОК 2: SEO-ЛОНГРИД (500+ слов)]
- Это не просто текст, это воронка продаж твоего бренда. 
- Начни с выбранного хука. 
- Используй ключевые слова: "как приготовить ${dish}", "лучший рецепт", "в домашних условиях", "секреты шефа".
- Опиши историю блюда так, чтобы его захотелось переслать другу (виральный потенциал).

[БЛОК 3: ТЕХНОЛОГИЧЕСКАЯ КАРТА]
- Ингредиенты: СТРОГО В ГРАММАХ.
- Шаги: Подробно, с указанием тайминга и температуры.

[БЛОК 4: CTA (ПРИЗЫВ К ДЕЙСТВИЮ)]
- Напиши виральную концовку для Telegram и VK, которая заставит людей ставить реакции и писать комментарии.

ОТВЕТЬ СТРОГО В JSON:
{
  "youtube": {
    "hooks": ["", "", ""],
    "titles": ["", "", ""],
    "description": ""
  },
  "recipe": {
    "ingredients": [],
    "steps": []
  },
  "social": {
    "telegram": "",
    "vk": ""
  },
  "hashtags": []
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Создай пакет для: ${dish}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 6000, 
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    let result = JSON.parse(content);
    
    if (!result.youtube || !result.social || !result.recipe) {
      throw new Error("AI вернул неполную структуру данных");
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Ошибка Groq:', error);
    const status = error.status || 500;
    res.status(status).json({ error: "Ошибка генерации" });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
