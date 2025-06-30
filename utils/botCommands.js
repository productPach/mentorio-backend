const { Markup } = require("telegraf");
const User = require("../models/User");
const { getChatCompletion } = require("../services/openaiService");

const MAX_FREE_MESSAGES = 3;

async function setupBot(bot) {
  bot.telegram.setMyCommands([
    { command: "buy", description: "Купить подписку" },
    { command: "restart", description: "Перезапуск" },
    { command: "reset", description: "Забыть переписку" },
    { command: "profile", description: "Профиль" },
  ]);

  bot.start(async (ctx) => {
    const telegramId = ctx.from.id.toString();
    let user = await User.findOne({ telegramId });
    if (!user) await User.create({ telegramId });
    ctx.reply(
      "👋 Привет! Я Mentorio — бот психологической поддержки.\n\nЗдесь можно поговорить о чувствах, задать вопрос или просто выговориться. Всё анонимно, бережно и безопасно.\n\nПиши, если хочешь поделиться — я рядом."
    );
  });

  bot.command("restart", (ctx) => {
    ctx.reply(
      "🔄 Перезапуск чата выполнен. Пиши, если хочешь поделиться — я рядом."
    );
  });

  bot.command("reset", (ctx) => {
    ctx.reply(
      "⚠️ Ты действительно хотите забыть переписку? Это удалит память Менторио об этой беседе.",
      Markup.inlineKeyboard([
        [Markup.button.callback("🧹 Забыть переписку", "confirm_reset")],
        [Markup.button.callback("❌ Отмена", "cancel_reset")],
      ])
    );
  });

  bot.command("profile", async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const user = await User.findOne({ telegramId });
    const isPro = user?.isPremium;
    const remaining = Math.max(
      0,
      MAX_FREE_MESSAGES - (user?.messagesCount || 0)
    );
    const sub = isPro ? "Про" : "Бесплатная";
    const limitText = isPro
      ? "∞ Без ограничений"
      : `${remaining} сообщений из ${MAX_FREE_MESSAGES} до следующей недели`;

    ctx.reply(
      `🧾 Ваш профиль:\nID: ${telegramId}\nПодписка: ${sub}\nЛимиты: ${limitText}`
    );
  });

  bot.command("buy", (ctx) => {
    ctx.reply(
      '💖 Подписка "Про" — это безлимитная психологическая поддержка от Менторио за 1000 ₽ в месяц. Никаких ограничений, только забота.\n\nПерейдите по ссылке, чтобы оформить подписку:\n\n👉 https://mentorio.pro.ru/pay'
    );
  });

  bot.action("confirm_reset", async (ctx) => {
    const telegramId = ctx.from.id.toString();
    await User.findOneAndUpdate(
      { telegramId },
      { messagesCount: 0, firstMessageAt: null }
    );
    await ctx.editMessageText("🧠 Память очищена. Можем начать сначала.");
  });

  bot.action("cancel_reset", async (ctx) => {
    await ctx.editMessageText("🚫 Отмена. Мы продолжаем общение как прежде.");
  });

  bot.on("text", async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const text = ctx.message.text;

    let user = await User.findOne({ telegramId });
    if (!user) user = await User.create({ telegramId });

    if (!user.isPremium) {
      const now = new Date();

      if (!user.firstMessageAt) {
        user.firstMessageAt = now;
      } else {
        const diff = now - user.firstMessageAt;
        if (diff >= 7 * 24 * 60 * 60 * 1000) {
          user.messagesCount = 0;
          user.firstMessageAt = now;
        }
      }

      if (user.messagesCount >= MAX_FREE_MESSAGES) {
        await user.save();
        return ctx.reply(
          "🚫 Лимит бесплатных сообщений исчерпан. Оплатите доступ: https://mentorio.pro/pay/" +
            telegramId
        );
      }
    }

    user.messagesCount++;
    await user.save();

    try {
      const reply = await getChatCompletion(text);
      ctx.reply(reply);
    } catch (err) {
      console.error("GPT error:", err);
      ctx.reply("❌ Ошибка при получении ответа. Попробуйте позже.");
    }
  });
}

module.exports = { setupBot };
