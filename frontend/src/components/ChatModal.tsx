import { useEffect, useMemo, useRef, useState } from "react";
import { listMessages, sendMessage, type MessageResponse } from "../api/conversationApi";

type Props = {
    conversationId: string;
    onClose: () => void;
};

export default function ChatModal({ conversationId, onClose }: Props) {
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [text, setText] = useState("");

    const bottomRef = useRef<HTMLDivElement | null>(null);

    const sorted = useMemo(() => {
        return [...messages].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [messages]);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        listMessages(conversationId)
            .then((data) => {
                if (!alive) return;
                setMessages(data);
            })
            .catch((e: unknown) => {
                if (!alive) return;
                const msg = e instanceof Error ? e.message : "Failed to load messages";
                setError(msg);
            })
            .finally(() => {
                if (!alive) return;
                setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [sorted.length]);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed) return;

        setSending(true);
        setError(null);

        try {
            const msg = await sendMessage(conversationId, trimmed);
            setMessages((prev) => [...prev, msg]);
            setText("");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to send";
            setError(msg);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="chat-modal-overlay" onMouseDown={onClose}>
            <div className="chat-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="chat-modal-header">
                    <div className="chat-modal-title">Chat</div>
                    <button className="chat-modal-close" type="button" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="chat-modal-body">
                    {loading && <p>Loading messages...</p>}
                    {error && <p className="error">{error}</p>}

                    {!loading && !error && (
                        <div className="chat-thread">
                            {sorted.map((m) => (
                                <div key={m.id} className="chat-bubble">
                                    <div className="chat-text">{m.text}</div>
                                    <div className="chat-time">
                                        {new Date(m.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                <div className="chat-modal-footer">
                    <input
                        className="chat-input"
                        value={text}
                        placeholder="Write a message…"
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") void handleSend();
                        }}
                    />
                    <button
                        className="chat-send"
                        type="button"
                        disabled={sending || text.trim().length === 0}
                        onClick={() => void handleSend()}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
