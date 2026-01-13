const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Улучшенный строитель промпта: заставляем писать много и правильно
function buildPrompt(dishName, ingredients) {
  const ingrList = ingredients ? ingredients.split(',').map(i => i.trim()).filter(i => i).join(', ') : 'на твое усмотрение';
  
  return `Ты — элитный фуд-блогер, технолог и SEO-стратег. Твоя задача — создать профессиональный пакет материалов для блюда: "${dishName}".
Ингредиенты: ${ingrList}.

ИНСТРУКЦИИ ПО КОНТЕНТУ:
1. YouTube Title: Создай 3 варианта: SEO-оптимизированный, кликбейтный и интригующий. Выдай их массивом в поле "youtube_title".
2. Description: Это ЛОНГРИД (600+ слов). Напиши историю блюда, физику процессов (например, зачем нужна обварка для сушек или реакция Майяра для мяса). ПИШИ СОЧНО, используй эпитеты.
3. Steps: Каждый шаг должен быть описан максимально подробно (минимум 2-3 предложения на шаг).
4. Telegram Post: Это АВТОРСКИЙ лонгрид для канала. Начни с личной истории или "хука", используй эмодзи, опиши текстуру и хруст. Не менее 150 слов.
5. VK Post: Подробная статья-инструкция, чтобы можно было приготовить, не открывая видео.

Верни ТОЛЬКО JSON. Никакой болтовни.

{
  "youtube_title": ["", "", ""],
  "description": "ОГРОМНЫЙ ТЕКСТ ТУТ",
  "ingredients": ["", ""],
  "steps": ["", ""],
  "telegram_post": "ДЛИННЫЙ ПОСТ ТУТ",
  "vk_post": "ПОДРОБНАЯ СТАТЬЯ ТУТ",
  "hashtags": ["#ОбжоркаРу", "#рецепт", "..."]
}`;
}

app.post('/generate-recipe', async (req, res) => {
  const { dishName, ingredients } = req.body;

  if (!dishName) return res.status(400).json({ error: 'Нужно название блюда' });

  try {
    const prompt = buildPrompt(dishName, ingredients);

    const ollamaResponse = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'llama3:8b', // Если будет тормозить или тупить, лучше переключись на Groq и модель 70b
        prompt,
        stream: false,
        options: {
          temperature: 0.5,     // Золотая середина между правдой и красотой
          num_predict: 4096,    // Увеличили лимит, чтобы влез длинный текст
          top_p: 0.9
        }
      },
      { timeout: 180000 } // Увеличил таймаут до 3 минут, так как текст будет длинным
    );

    let rawText = ollamaResponse.data.response.trim();
    const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
    
    if (!jsonMatch) throw new Error('Модель не вернула JSON');

    const result = JSON.parse(jsonMatch[1]);
    res.json(result);

  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ error: 'Ошибка генерации', details: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Сервер летит на порту ${PORT}`));
