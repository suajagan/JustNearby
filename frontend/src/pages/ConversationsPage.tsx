import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listConversations, type ConversationResponse } from "../api/conversationApi";
import ChatModal from "../components/ChatModal";

type LoadState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; conversations: ConversationResponse[] }
    | { status: "error"; message: string };

const SEEN_KEY = "conversationLastSeenAt";

function readSeen(): Record<string, string> {
    try {
        const raw = localStorage.getItem(SEEN_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, string>;
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function writeSeen(next: Record<string, string>) {
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
}

export default function ConversationsPage() {
    const [params, setParams] = useSearchParams();
    const openId = params.get("open");

    const [loadState, setLoadState] = useState<LoadState>({ status: "idle" });
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
    const [newIds, setNewIds] = useState<Set<string>>(new Set());

    const didStartRef = useRef(false);
    const intervalRef = useRef<number | null>(null);

    const computeNewIds = (convs: ConversationResponse[]) => {
        const seen = readSeen();
        const ids = new Set<string>();

        for (const c of convs) {
            const lastSeenAt = seen[c.id];
            const lastMsgAt = c.lastMessageAt;

            if (!lastSeenAt) {
                ids.add(c.id);
                continue;
            }

            if (new Date(lastMsgAt).getTime() > new Date(lastSeenAt).getTime()) {
                ids.add(c.id);
            }
        }

        return ids;
    };

    const refreshConversations = () => {
        listConversations()
            .then((data) => {
                setLoadState({ status: "ready", conversations: data });
                setNewIds(computeNewIds(data));
            })
            .catch((e: unknown) => {
                const msg = e instanceof Error ? e.message : "Failed to load conversations";
                setLoadState({ status: "error", message: msg });
            });
    };

    const mountRef = (node: HTMLDivElement | null) => {
        if (!node) {
            if (intervalRef.current != null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        if (didStartRef.current) return;
        didStartRef.current = true;

        setLoadState({ status: "loading" });
        refreshConversations();

        intervalRef.current = window.setInterval(() => {
            refreshConversations();
        }, 5000);
    };

    const conversations = useMemo(() => {
        if (loadState.status === "ready") return loadState.conversations;
        return [];
    }, [loadState]);

    const conversationIds = useMemo(() => new Set(conversations.map((c) => c.id)), [conversations]);

    const effectiveId = useMemo(() => {
        if (activeId && conversationIds.has(activeId)) return activeId;
        if (openId && conversationIds.has(openId)) return openId;
        return null;
    }, [activeId, openId, conversationIds]);

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === effectiveId) ?? null,
        [conversations, effectiveId]
    );

    const markSeen = (conversationId: string) => {
        const conv = conversations.find((c) => c.id === conversationId);
        if (!conv) return;

        const seen = readSeen();
        seen[conversationId] = conv.lastMessageAt;
        writeSeen(seen);

        setNewIds((prev) => {
            const next = new Set(prev);
            next.delete(conversationId);
            return next;
        });
    };

    const handlePick = (id: string) => {
        setActiveId(id);
        setIsChatOpen(true);

        setParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set("open", id);
            return next;
        });

        markSeen(id);
    };

    const handleClose = () => {
        setIsChatOpen(false);
        setActiveId(null);
        setParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete("open");
            return next;
        });
    };

    const newCount = newIds.size;

    return (
        <div ref={mountRef} className="messages-centerPage">
            <div className="messages-header">
                <h2 className="messages-title">Messages</h2>
            </div>

            {newCount > 0 ? (
                <div className="messages-notice">New messages: {newCount}</div>
            ) : null}

            {loadState.status === "idle" || loadState.status === "loading" ? (
                <div className="messages-loading">Loading…</div>
            ) : loadState.status === "error" ? (
                <div className="messages-error">{loadState.message}</div>
            ) : conversations.length === 0 ? (
                <div className="messages-empty">No conversations yet.</div>
            ) : (
                <div className="messages-centerLayout">
                    <div className="messages-centerList">
                        {conversations.map((c) => {
                            const selected = c.id === effectiveId;
                            const name = c.type === "FRIEND" ? (c.otherUserName ?? "Friend") : "Marketplace";
                            const letter = (name.trim()?.[0] ?? "U").toUpperCase();
                            const isNew = newIds.has(c.id);

                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    className={`messages-centerItem ${selected ? "is-active" : ""}`}
                                    onClick={() => handlePick(c.id)}
                                >
                                    <div className="messages-centerAvatar">
                                        {c.otherUserProfileImageUrl ? (
                                            <img className="messages-centerAvatarImg" src={c.otherUserProfileImageUrl} alt="" />
                                        ) : (
                                            <span className="messages-centerAvatarLetter">{letter}</span>
                                        )}
                                    </div>

                                    <div className="messages-centerText">
                                        <div className="messages-centerNameRow">
                                            <div className="messages-centerName">{name}</div>
                                            {isNew ? <span className="messages-badge">NEW</span> : null}
                                        </div>
                                        <div className="messages-centerTime">
                                            {new Date(c.lastMessageAt).toLocaleString()}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="messages-centerChat">
                        {isChatOpen && activeConversation ? (
                            <ChatModal conversationId={activeConversation.id} onClose={handleClose} />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
