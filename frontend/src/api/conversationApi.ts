export type ConversationType = "FRIEND" | "MARKETPLACE";

export type ConversationResponse = {
    id: string;
    participantIds: string[];
    type: ConversationType;
    postId?: string | null;
    createdAt: string;
    lastMessageAt: string;
    otherUserId?: string | null;
    otherUserName?: string | null;
    otherUserProfileImageUrl?: string | null;
};

export type MessageResponse = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: string;
};

export type CreateMarketplaceConversationRequest = {
    postId: string;
};

export type CreateMessageRequest = {
    text: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
        credentials: "include",
        ...init,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
}

export function listConversations(): Promise<ConversationResponse[]> {
    return request<ConversationResponse[]>("/api/conversations");
}

export function listMessages(conversationId: string): Promise<MessageResponse[]> {
    return request<MessageResponse[]>(`/api/conversations/${conversationId}/messages`, {
        method: "GET",
    });
}

export function sendMessage(
    conversationId: string,
    text: string
): Promise<MessageResponse> {
    return request<MessageResponse>(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text } satisfies CreateMessageRequest),
    });
}

export function createMarketplaceConversation(postId: string): Promise<ConversationResponse> {
    return request<ConversationResponse>("/api/conversations/marketplace", {
        method: "POST",
        body: JSON.stringify({ postId } satisfies CreateMarketplaceConversationRequest),
    });
}

export function createFriendConversation(userId: string): Promise<ConversationResponse> {
    return request<ConversationResponse>(`/api/conversations/friend/${encodeURIComponent(userId)}`, {
        method: "POST",
    });
}
