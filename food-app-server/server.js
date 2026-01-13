const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Инициализация Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/generate-recipe', async (req, res) => {
  const { dishName, ingredients } = req.body;

  if (!dishName) {
    return res.status(400).json({ error: "Назовите блюдо" });
  }

  // Самый жесткий промпт на объем и точность
  const systemMessage = `Ты — элитный кулинарный технолог и копирайтер. Создай контент-пакет для: "${dishName}".
Ингредиенты: ${ingredients || 'базовый набор'}.

ПРАВИЛА (НЕ НАРУШАТЬ):
1. YouTube Title: 3 разных варианта (SEO, Кликбейт, Интрига).
2. YouTube Description: ОГРОМНАЯ СТАТЬЯ (минимум 600-800 слов). Подробно про историю, про химию процесса (для сушек — ОБЯЗАТЕЛЬНО про обварку в кипятке для блеска и хруста), советы по выбору муки. ПИШИ СОЧНО.
3. Telegram: Полноценный пост-лонгрид (200+ слов). Не список, а сторителлинг с эмодзи.
4. VK: Пошаговый гайд. Каждый шаг — это 3-4 предложения с описанием ощущений (тесто должно стать эластичным и т.д.).

ОТВЕТЬ СТРОГО В JSON:
{
  "youtube_title": ["", "", ""],
  "description": "",
  "ingredients": [],
  "steps": [],
  "telegram_post": "",
  "vk_post": "",
  "hashtags": ["#ОбжоркаРу", "#рецепт"]
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Напиши экспертный лонгрид про ${dishName}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Чтобы и красиво, и без ошибок в технологии
      max_tokens: 6000, 
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Ошибка Groq:', error);
    res.status(500).json({ error: "Ошибка нейросети. Проверьте GROQ_API_KEY в файле .env" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер на Groq запущен! Порт: ${PORT}`);
});
