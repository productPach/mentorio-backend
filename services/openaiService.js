const OpenAI = require("openai");

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

async function getChatCompletion(message) {
  try {
    const completion = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return "⚠️ Произошла ошибка при обработке запроса";
  }
}

module.exports = { getChatCompletion };
