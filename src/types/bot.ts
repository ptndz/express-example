export interface ISendMessagePayload {
    chat_id: number;
    text: string;
    reply_markup?: any;
}

export interface ICallbackQueryPayload {
    callback_query: {
        from: { id: number };
        data: string;
        message: {
            message_id: number;
            chat: { id: number };
        };
    };
}

export interface ISetWebhookPayload {
    url: string;
}