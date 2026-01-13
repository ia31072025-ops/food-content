const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/generate-recipe', async (req, res) => {
  const { dishName, ingredients } = req.body;

  const systemMessage = `Ты — топовый SEO-копирайтер и шеф-повар. 
Напиши контент-пакет для блюда: "${dishName}". 

[БЛОК 1: SEO DESCRIPTION ДЛЯ YOUTUBE]
- Начни с мощного ХУКА (интрига, решение проблемы).
- Напиши СТАТЬЮ (600+ слов). 
- Обязательно вшей ключевые слова: "как приготовить ${dishName}", "пошаговый рецепт", "секреты шеф-повара", "в домашних условиях".
- Опиши историю, химию процессов (почему это вкусно) и выбор продуктов.

[БЛОК 2: SEO ЗАГОЛОВКИ]
1. SEO-оптимизированный (с ключами).
2. Хайповый (для кликов).
3. Интригующий.

[БЛОК 3: ТЕЛЕГРАМ]
Пост-лонгрид (200+ слов) со сторителлингом.

[БЛОК 4: РЕЦЕПТ]
Ингредиенты списком и пошаговые шаги (каждый шаг подробно).

ОТВЕТЬ ТОЛЬКО JSON:
{
  "youtube_title": [],
  "description": "",
  "ingredients": [],
  "steps": [],
  "telegram_post": "",
  "vk_post": "",
  "hashtags": []
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemMessage }],
      model: "qwen/qwen3-32b", // Твоя новая супер-модель!
      temperature: 0.6,
      max_tokens: 6000, // Qwen отлично держит длинный контекст
      top_p: 0.95,
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка генерации через Qwen-3" });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер на Qwen-3 запущен (Порт ${PORT})`));
