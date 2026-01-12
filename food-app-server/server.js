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
  
  const systemMessage = `Ты — эксперт-технолог общественного питания и популярный фуд-блогер. 
Создай контент-пакет для блюда: "${dish}".
${additional ? `Особенности: ${additional}` : ''}

ВАЖНО: Рецепт должен быть ТЕХНОЛОГИЧЕСКИ ВЕРНЫМ. Если это сушки или баранки — обязательно опиши процесс обварки. Не путай виды теста!

1. YOUTUBE (Поле "description"): 
   - СТАТЬЯ-ЛОНГРИД (500+ слов): История блюда, секреты ГОСТа, почему домашние лучше покупных.
   - ТАЙМКОДЫ: Логичные (Замес, Отдых теста, Формовка, Обварка, Выпекание).
   - ХЕШТЕГИ: 15 штук.

2. ЗАГОЛОВОК (Поле "titles"): 
   - 1. SEO (Как приготовить домашние сушки...)
   - 2. Кликбейт (Тот самый вкус из детства! Секрет хруста...)
   - 3. Интрига (Почему вы больше не купите сушки в магазине...)

3. СОЦСЕТИ (Telegram и VK):
   - Telegram: Коротко, жирно, со ссылкой.
   - VK: Подробный текстовый пошаговый рецепт.

4. РЕЦЕПТ (ingredients и steps): Строго пошагово.

ОТВЕТЬ ТОЛЬКО JSON:
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
