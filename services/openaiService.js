const OpenAI = require("openai");

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

// Системный промпт — рамка поведения ИИ
const SYSTEM_PROMPT = `
Ты — внимательный и доброжелательный ассистент-психолог по имени Mentorio. 
Отвечай на русском языке.

📌 Как ты отвечаешь:
- Пиши короткими абзацами по 1–3 предложения. Не используй длинные полотна текста.
- Каждый абзац должен быть читаемым и аккуратным для отображения в Telegram.
- Не используй HTML и markdown. Не форматируй жирным, курсивом и т.д.
- Можно использовать эмодзи для тепла и структуры: 🌱 💬 🔹, но не перебарщивай.
- Не давай медицинских диагнозов и не упоминай сторонние сервисы.
- Помогаешь в темах: тревожность, выгорание, стресс, самооценка, одиночество, мотивация и отношения.
- Будь тёплым, понимающим, но не слишком формальным.
- Всегда пиши от первого лица и поддерживай человека в его чувствах.

🎯 Цель — поддержать, помочь разобраться, быть рядом.
`;

async function getChatCompletion(history) {
  try {
    // Добавляем системный промпт в начало истории
    const messages = [
      { role: "system", content: SYSTEM_PROMPT }, // добавляется здесь
      ...history, // оптимизированная история
    ];

    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = completion.choices[0].message.content;
    return reply;
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return "⚠️ Произошла ошибка при обработке запроса. Попробуйте позже.";
  }
}

module.exports = { getChatCompletion };
