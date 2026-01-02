const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAJMmYNSWgj21K5LsjHS34_CfmITcxNcfE");

async function listModels() {
    try {
        console.log("🔍 Запрос списка доступных моделей...");
        // В некоторых версиях SDK метод называется listModels
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${genAI.apiKey}`);
        const data = await response.json();
        
        console.log("\n=== ДОСТУПНЫЕ МОДЕЛИ ДЛЯ ВАШЕГО КЛЮЧА ===\n");
        if (data.models) {
            data.models.forEach(m => {
                console.log(`- ${m.name.replace('models/', '')} (Поддерживает: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("Модели не найдены или ошибка ключа:", data);
        }
        console.log("\n==========================================\n");
    } catch (e) {
        console.error("Ошибка при получении списка:", e.message);
    }
}

listModels();