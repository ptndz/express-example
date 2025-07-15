import axios from "axios";
import { AppDataSource } from "../data-source";
import { Bot } from "../entity/Bot";
import { CallbackQuery } from "../entity/CallbackQuery";
import { Message } from "../entity/Message";

import {
  ICallbackQueryPayload,
  ISendMessagePayload,
  ISetWebhookPayload,
} from "../types";

const BotRepository = AppDataSource.getRepository(Bot);
const MessageRepository = AppDataSource.getRepository(Message);
const CallbackQueryRepository = AppDataSource.getRepository(CallbackQuery);

// Hàm gọi webhook (đã được trừu tượng hóa)
const callBotWebhook = async (bot: Bot, payload: any): Promise<void> => {
  if (!bot.webhook_url) return;
  try {
    await axios.post(bot.webhook_url, payload, { timeout: 3000 });
  } catch (err) {
    console.warn("Webhook failed:", err);
  }
};

// Service để gửi tin nhắn
export const sendMessageService = async (
  token: string,
  payload: ISendMessagePayload
) => {
  const bot = await BotRepository.findOne({ where: { token } });
  if (!bot) return null;

  const message = MessageRepository.create({
    fromUserId: 0,
    toUserId: payload.chat_id,
    text: payload.text,
    direction: "bot->user",
    bot,
  });
  await MessageRepository.save(message);

  return {
    message_id: message.update_id,
    chat: { id: payload.chat_id },
    text: payload.text,
    ...(payload.reply_markup && { reply_markup: payload.reply_markup }),
  };
};

// Service để xử lý callback query
export const callbackQueryService = async (
  token: string,
  payload: ICallbackQueryPayload
) => {
  const bot = await BotRepository.findOne({ where: { token } });
  if (!bot) return null;

  const { callback_query } = payload;
  const cb = CallbackQueryRepository.create({
    bot,
    fromUserId: callback_query.from.id,
    data: callback_query.data,
    message_id: callback_query.message.message_id,
    chat_id: callback_query.message.chat.id,
  });
  await CallbackQueryRepository.save(cb);

  await callBotWebhook(bot, {
    update_id: cb.update_id,
    callback_query: {
      id: `cb_${cb.update_id}`,
      from: { id: cb.fromUserId },
      data: cb.data,
      message: {
        message_id: cb.message_id,
        chat: { id: cb.chat_id },
      },
    },
  });

  const replyMessage = MessageRepository.create({
    fromUserId: 0,
    toUserId: cb.fromUserId,
    text: `Bạn vừa chọn: ${cb.data}`,
    direction: "bot->user",
    bot,
  });
  await MessageRepository.save(replyMessage);

  return {
    response: {
      type: "answerCallbackQuery",
      text: `Bạn đã chọn: ${cb.data}`,
      show_alert: false,
    },
    message_sent: {
      message_id: replyMessage.update_id,
      chat: { id: cb.fromUserId },
      text: replyMessage.text,
    },
  };
};

// Service để lấy updates
export const getUpdatesService = async (
  token: string,
  offset: number,
  limit: number
) => {
  const bot = await BotRepository.findOne({ where: { token } });
  if (!bot) return null;

  const messages = await MessageRepository.createQueryBuilder("m")
    .where("m.botId = :botId", { botId: bot.id })
    .andWhere("m.direction = 'user->bot'")
    .andWhere("m.update_id > :offset", { offset })
    .orderBy("m.update_id", "ASC")
    .take(limit)
    .getMany();

  const callbacks = await CallbackQueryRepository.createQueryBuilder("c")
    .where("c.botId = :botId", { botId: bot.id })
    .andWhere("c.update_id > :offset", { offset })
    .orderBy("c.update_id", "ASC")
    .take(limit)
    .getMany();

  const updates = [
    ...messages.map((m) => ({
      update_id: m.update_id,
      message: {
        message_id: m.update_id,
        from: { id: m.fromUserId },
        chat: { id: m.toUserId },
        text: m.text,
        date: m.createdAt,
      },
    })),
    ...callbacks.map((c) => ({
      update_id: c.update_id,
      callback_query: {
        id: `cb_${c.update_id}`,
        from: { id: c.fromUserId },
        data: c.data,
        message: {
          message_id: c.message_id,
          chat: { id: c.chat_id },
        },
      },
    })),
  ]
    .sort((a, b) => a.update_id - b.update_id)
    .slice(0, limit);

  return updates;
};

// Service để đặt webhook
export const setWebhookService = async (
  token: string,
  payload: ISetWebhookPayload
) => {
  const bot = await BotRepository.findOne({ where: { token } });
  if (!bot) return false;

  bot.webhook_url = payload.url;
  await BotRepository.save(bot);
  return true;
};
