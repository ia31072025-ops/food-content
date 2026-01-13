const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Проверка наличия ключа
if (!process.env.GROQ_API_KEY) {
    console.error("ОШИБКА: Не найден GROQ_API_KEY в файле .env");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function buildSystemPrompt(dishName, ingredients) {
    const ingr = ingredients ? ingredients : "на твой профессиональный вкус";
    
    return `Ты — ведущий SEO-стратег кулинарных YouTube каналов и шеф-повар. 
Твоя задача: создать контент-пакет для блюда "${dishName}".
Ингредиенты: ${ingr}.

[БЛОК 1: SEO DESCRIPTION ДЛЯ YOUTUBE]
- СТРУКТУРА:
  1. ХУК (Первые 2 предложения): Мощный захват внимания зрителя.
  2. КЛЮЧЕВЫЕ СЛОВА: Обязательно вплети в текст: "как приготовить ${dishName}", "пошаговый рецепт", "секреты приготовления", "в домашних условиях".
  3. ТЕКСТ (ЛОНГРИД): Минимум 600-800 слов. Подробно про историю блюда, химию процессов (например, реакция Майяра или обварка теста), лайфхаки по выбору продуктов.
  4. ТАЙМКОДЫ: 5-7 логичных этапов.
  5. ХЕШТЕГИ: 15 тематических SEO-тегов.

[БЛОК 2: ЗАГОЛОВКИ]
Выдай 3 варианта: SEO-оптимизированный (с главным ключом), Кликбейтный (эмоциональный) и Интригующий.

[БЛОК 3: ТЕЛЕГРАМ]
Пост-лонгрид (200+ слов). Стиль: живой, экспертный, с эмодзи. Опиши текстуру и аромат так, чтобы захотелось приготовить немедленно.

[БЛОК 4: ВКОНТАКТЕ]
Полноценная статья. Пошаговый рецепт, где каждый шаг расписан детально (3-4 предложения).

ОТВЕТЬ СТРОГО В JSON:
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

    if (!dishName) {
        return res.status(400).json({ error: 'Нужно название блюда' });
    }

    try {
        console.log(`--- Старт генерации для: ${dishName} ---`);
        
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: buildSystemPrompt(dishName, ingredients) },
                { role: "user", content: `Создай экспертный контент про ${dishName} с учетом всех SEO-правил и хуков.` }
            ],
            model: "qwen-2.5-32b", // Замени на "qwen/qwen3-32b", если Groq выдал тебе именно такой ID
            temperature: 0.6,
            max_tokens: 6000,
            top_p: 0.95,
            response_format: { type: "json_object" }
        });

        const rawContent = completion.choices[0].message.content;
        
        // Надежный парсинг JSON (на случай, если модель добавит мусор)
        const jsonMatch = rawContent.match(/(\{[\s\S]*\})/);
        if (!jsonMatch) {
            throw new Error("Модель не вернула валидный JSON");
        }

        const result = JSON.parse(jsonMatch[1]);
        console.log("✅ Успешно сгенерировано!");
        res.json(result);

    } catch (error) {
        console.error("ОШИБКА СЕРВЕРА:", error.message);
        res.status(500).json({ 
            error: 'Ошибка при работе с нейросетью', 
            details: error.message 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
🚀 Сервер Обжорка.ру запущен!
📍 Порт: ${PORT}
🧠 Модель: Qwen-2.5-32b (Groq)
    `);
});
