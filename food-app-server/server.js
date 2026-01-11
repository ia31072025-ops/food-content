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
  
  // Улучшенный системный промпт
  const systemMessage = `Ты — профессиональный YouTube-продюсер и фуд-копирайтер. 
Создай контент-пакет для блюда: "${dish}".
${additional ? `Особенности: ${additional}` : ''}

ПРАВИЛА ТЕКСТА:
- Используй двойной перенос строки (\\n\\n) для разделения абзацев.
- Текст должен быть готов к копированию.

1. YOUTUBE: В поле "description" включи: 3 названия (КАПСОМ), ХУК, SEO-описание (500 слов), список ингредиентов, таймкоды и 15 хештегов.

2. TELEGRAM (Тон: Дружеский):
   - Заголовок: Сделай его ВИЗУАЛЬНО жирным (используй **Текст**).
   - Тело: 2-3 предложения.
   - Ингредиенты: Список через •.
   - Ссылка: [ССЫЛКА].
   - Провокационный вопрос в конце.

3. VK (Тон: Уютный):
   - Эмоциональное вступление.
   - Блок "Почему нужно сохранить".
   - ПОЛНЫЙ текстовый рецепт.
   - Призыв к лайку и 5-7 хештегов.

ОТВЕТЬ СТРОГО В JSON (БЕЗ ЛИШНЕГО ТЕКСТА):
{
  "youtube": { 
    "titles": [], 
    "description": "" 
  },
  "social": { 
    "telegram": "", 
    "vk": "" 
  },
  "recipe": { 
    "ingredients": [], 
    "steps": [] 
  }
}`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Создай пакет для: ${dish}` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096, // Увеличил, так как просим 500 слов в описании
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    let result = JSON.parse(content);
    
    // Дополнительная проверка структуры (защита от пустых ответов)
    if (!result.youtube || !result.social || !result.recipe) {
      throw new Error("AI вернул неполную структуру данных");
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Ошибка Groq:', error);
    
    const status = error.status || 500;
    const message = status === 429 ? "Лимит запросов исчерпан" : "Ошибка генерации";
    
    res.status(status).json({ error: message });
  }
});

// Прочие эндпоинты без изменений...
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 OK: Port ${PORT}`));
