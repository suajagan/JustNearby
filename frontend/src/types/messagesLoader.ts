import { listConversations, type ConversationResponse } from "../api/conversationApi";

export async function messagesLoader(): Promise<ConversationResponse[]> {
    return await listConversations();
}
