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
  
const systemMessage = `Ты — профессиональный фуд-райтер с гонораром 100$ за пост. Твоя задача — написать ОГРОМНЫЙ и ВКУСНЫЙ пакет контента для блюда: "${dish}".

ПРАВИЛА:
1. НИКАКИХ ОБЩИХ ФРАЗ типа "сегодня мы приготовим". 
2. В каждом блоке пиши МИНИМУМ 3-4 РАЗВЕРНУТЫХ АБЗАЦА текста.
3. Используй сочные эпитеты: "янтарная корочка", "ностальгический хруст", "аромат поджаристой муки".

СТРУКТУРА JSON:

"description": (ДЛЯ YOUTUBE)
- Напиши ЦЕЛУЮ СТАТЬЮ. 
- Абзац 1: История появления блюда в деталях (откуда пошло название, как ели раньше).
- Абзац 2: Технологические тонкости. Почему именно такая температура? Почему важна обварка? Что происходит с белком в тесте? 
- Абзац 3: Личные советы по выбору муки и добавок (мак, кунжут, соль).
- В КОНЦЕ: Таймкоды не от болды а строго по рецепту  и 15 хештегов.

"telegram":
- Напиши пост в стиле "лайфстайл-блогер". 
- Начни с ХУКА (интригующего предложения). 
- Расскажи, почему магазинные сушки — это "пластик", а домашние — "любовь". 
- Подробно опиши процесс хруста. 
- Вставь список ингредиентов и ССЫЛКУ.

"vk":
- Подробнейший ГИД по приготовлению. Эмоциональное вступление + пошаговый рецепт, где каждый шаг описан 2-3 предложениями (не просто "смешайте", а "аккуратно соедините компоненты до получения эластичной, податливой структуры").

ОТВЕТЬ СТРОГО В JSON:
{
  "youtube": { "titles": ["", "", ""], "description": "" },
  "social": { "telegram": "", "vk": "" },
  "recipe": { "ingredients": [], "steps": [] }
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Напиши профессиональный рецепт и контент для: ${dish}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3, // СНИЖЕНО: Меньше фантазий, больше точности
      max_tokens: 6000,
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка генерации" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер на порту ${PORT}`));
