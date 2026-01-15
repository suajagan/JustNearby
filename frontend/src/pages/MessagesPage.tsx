import { useMemo, useState } from "react";
import { useLoaderData, useSearchParams } from "react-router-dom";
import type { ConversationResponse } from "../api/conversationApi";
import ChatModal from "../components/ChatModal";

export default function MessagesPage() {
    const conversations = useLoaderData() as ConversationResponse[];
    const [params, setParams] = useSearchParams();
    const [activeId, setActiveId] = useState<string | null>(null);

    const openId = params.get("open");

    const conversationIds = useMemo(() => new Set(conversations.map((c) => c.id)), [conversations]);

    const effectiveId = useMemo(() => {
        if (activeId && conversationIds.has(activeId)) return activeId;
        if (openId && conversationIds.has(openId)) return openId;
        return conversations[0]?.id ?? null;
    }, [activeId, openId, conversationIds, conversations]);

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === effectiveId) ?? null,
        [conversations, effectiveId]
    );

    const handlePick = (id: string) => {
        setActiveId(id);
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("open");
            return next;
        });
    };

    const handleClose = () => {
        setActiveId(null);
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("open");
            return next;
        });
    };

    return (
        <div className="messages-page">
            <div className="messages-header">
                <h2 className="messages-title">Messages</h2>
            </div>

            {conversations.length === 0 ? (
                <div className="messages-empty">No conversations yet.</div>
            ) : (
                <div className="messages-layout">
                    <div className="messages-sidebar">
                        {conversations.map((c) => {
                            const selected = c.id === effectiveId;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`messages-item ${selected ? "is-active" : ""}`}
                                    onClick={() => handlePick(c.id)}
                                >
                                    <div className="messages-item-title">
                                        {c.type === "FRIEND" ? "Friend chat" : "Marketplace chat"}
                                    </div>
                                    <div className="messages-item-sub">
                                        {new Date(c.lastMessageAt).toLocaleString()}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="messages-main">
                        {activeConversation ? (
                            <ChatModal conversationId={activeConversation.id} onClose={handleClose} />
                        ) : (
                            <div className="messages-empty">Select a conversation.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
