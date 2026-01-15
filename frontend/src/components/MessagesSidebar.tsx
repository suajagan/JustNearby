import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listConversations, type ConversationResponse } from "../api/conversationApi";

type LoadState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; conversations: ConversationResponse[] }
    | { status: "error"; message: string };

export default function MessagesSidebar() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const openId = params.get("open");

    const [loadState, setLoadState] = useState<LoadState>({ status: "idle" });
    const didStartRef = useRef(false);

    const mountRef = (node: HTMLDivElement | null) => {
        if (!node) return;
        if (didStartRef.current) return;
        didStartRef.current = true;

        setLoadState({ status: "loading" });

        listConversations()
            .then((data) => setLoadState({ status: "ready", conversations: data }))
            .catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : "Failed to load";
                setLoadState({ status: "error", message: msg });
            });
    };

    const conversations = useMemo(() => {
        if (loadState.status === "ready") return loadState.conversations;
        return [];
    }, [loadState]);

    const selectedId = openId ?? null;

    return (
        <div ref={mountRef} className="sidebar-messages">
            <div className="sidebar-messages-title">Messages</div>

            {loadState.status === "idle" || loadState.status === "loading" ? (
                <div className="sidebar-messages-loading">Loading…</div>
            ) : loadState.status === "error" ? (
                <div className="sidebar-messages-error">{loadState.message}</div>
            ) : conversations.length === 0 ? (
                <div className="sidebar-messages-empty">No messages yet.</div>
            ) : (
                <div className="sidebar-messages-list">
                    {conversations.map((c) => {
                        const name = c.type === "FRIEND" ? (c.otherUserName ?? "Friend") : "Marketplace";
                        const letter = (name.trim()?.[0] ?? "U").toUpperCase();
                        const selected = c.id === selectedId;

                        return (
                            <button
                                key={c.id}
                                type="button"
                                className={`sidebar-messages-item ${selected ? "is-active" : ""}`}
                                onClick={() => navigate(`/messages?open=${encodeURIComponent(c.id)}`)}
                            >
                                <div className="sidebar-messages-avatar">
                                    {c.otherUserProfileImageUrl ? (
                                        <img className="sidebar-messages-avatarImg" src={c.otherUserProfileImageUrl} alt="" />
                                    ) : (
                                        <span className="sidebar-messages-avatarLetter">{letter}</span>
                                    )}
                                </div>

                                <div className="sidebar-messages-text">
                                    <div className="sidebar-messages-name">{name}</div>
                                    <div className="sidebar-messages-time">
                                        {new Date(c.lastMessageAt).toLocaleString()}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
