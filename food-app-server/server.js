const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
// Твой порт 10000
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function buildPrompt(dishName, ingredients) {
  const ingrList = ingredients ? ingredients.split(',').map(i => i.trim()).join(', ') : 'на выбор модели';
  
  return `Ты — элитный фуд-блогер и технолог. Напиши контент-пакет для блюда: "${dishName}".
Ингредиенты: ${ingrList}.

ТРЕБОВАНИЯ К ТЕКСТУ (ПИШИ МНОГО):
1. YouTube Title: Массив из 3 вариантов (SEO, Кликбейт, Интрига).
2. Description: ЛОНГРИД от 600 слов. История, химия процессов (почему важна обварка для сушек, клейковина и т.д.), советы. ПИШИ ПОДРОБНО.
3. Steps: Каждый шаг — это абзац из 3-4 предложений. Описывай текстуру и нюансы.
4. Telegram: Полноценный пост (150-200 слов) со сторителлингом, эмодзи и интригой.
5. VK: Пошаговая статья-инструкция, максимально детальная.

Верни ТОЛЬКО JSON:
{
  "youtube_title": ["", "", ""],
  "description": "",
  "ingredients": [],
  "steps": [],
  "telegram_post": "",
  "vk_post": "",
  "hashtags": []
}`;
}

app.post('/generate-recipe', async (req, res) => {
  const { dishName, ingredients } = req.body;
  if (!dishName) return res.status(400).json({ error: 'Укажите название' });

  try {
    const prompt = buildPrompt(dishName, ingredients);

    const ollamaResponse = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: 'llama3:8b',
        prompt,
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 4096, // Лимит на длинный текст
          top_p: 0.9
        }
      },
      { timeout: 180000 }
    );

    const jsonMatch = ollamaResponse.data.response.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) throw new Error('Ошибка формата JSON');

    res.json(JSON.parse(jsonMatch[1]));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Ошибка генерации', details: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер: порт ${PORT}`);
});
