const functions = require("firebase-functions");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { defineString } = require('firebase-functions/params');

// Завантажуємо змінні з файлу .env для локального тестування
require("dotenv").config();

// Визначаємо секрет для розгортання
const geminiApiKey = defineString("GEMINI_API_KEY");

exports.generatePost = functions.https.onRequest(async (request, response) => {
    // Настраиваем CORS
    response.set('Access-control-Allow-Origin', '*');
    if (request.method === 'OPTIONS') {
        response.set('Access-control-Allow-Methods', 'POST');
        response.set('Access-control-Allow-Headers', 'Content-Type');
        response.status(204).send('');
        return;
    }

    try {
        // Використовуємо ключ, визначений вище
        const genAI = new GoogleGenerativeAI(geminiApiKey.value());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const context = request.body.context;

        if (!context) {
            return response.status(400).json({ error: "Контекст не був наданий (context)." });
        }
        // Формуємо повний запит вже тут, на сервері

        // ▼▼▼ ВАША СКРЫТАЯ ИНФОРМАЦИЯ ЗДЕСЬ ▼▼▼
        const hiddenContext = `
        Стиль тексту: дружній, захоплений, трохи загадковий.
        Цільова аудиторія: досвідчені мандрівники, які шукають автентичні враження.
        Обов'язковий заклик до дії в кінці: «Хочете так само? Приєднуйтесь до нашого ексклюзивного туру! Посилання в профілі».
                Заборонено використовувати: банальні фрази на кшталт «райська насолода»..
        `;
        const fullPrompt = `Напиши короткий, яскравий, привабливий і емоційний рекламний пост для Instagram українською мовою про наступний етап подорожі на Балі. Зроби акцент на враженнях. Додай смайли. Додай 3-7 релевантних хештегів. Ось контекст: ${context}`;

        const result = await model.generateContent(fullPrompt);
        const geminiResponse = await result.response;
        const text = geminiResponse.text();

        response.status(200).json({ text: text });

    } catch (error) {
        console.error("Критична помилка при виклику Gemini API:", error);
        response.status(500).json({ error: "Не вдалося згенерувати пост через внутрішню помилку сервера." });
    }
});
