import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getComments,
    createComment,
    type CommentResponse,
    type PostResponse,
    type PostCategory,
} from "../api/postApi";
import { createMarketplaceConversation } from "../api/conversationApi";

function categoryLabel(c: PostCategory): string {
    switch (c) {
        case "ANNOUNCEMENT":
            return "Announcement";
        case "SEARCH":
            return "Search";
        case "OFFER":
            return "Offer";
        case "RECOMMENDATION":
            return "Recommendation";
        case "EVENT":
            return "Event";
        default:
            return c;
    }
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function offerMeta(p: PostResponse): string | null {
    if (p.category !== "OFFER") return null;
    if (p.offerType === "GIVE_AWAY") return "Free";
    if (p.offerType === "SELL" && typeof p.price === "number") {
        const cur = p.currency ?? "EUR";
        return cur === "EUR" ? `€ ${p.price}` : `${p.price} ${cur}`;
    }
    return null;
}

function conditionMeta(p: PostResponse): string | null {
    if (p.category !== "OFFER") return null;
    if (!p.condition) return null;
    return p.condition === "NEW" ? "New" : "Used";
}

function eventMeta(p: PostResponse): string | null {
    if (p.category !== "EVENT") return null;
    const parts: string[] = [];
    if (p.eventStart) parts.push(formatDate(p.eventStart));
    if (p.eventLocation && p.eventLocation.trim()) parts.push(p.eventLocation.trim());
    return parts.length ? parts.join(" • ") : null;
}

type Props = {
    post: PostResponse;
};

export default function PostCard({ post }: Props) {
    const navigate = useNavigate();

    const [liked, setLiked] = useState(false);

    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [draft, setDraft] = useState("");
    const [savingComment, setSavingComment] = useState(false);

    const [startingChat, setStartingChat] = useState(false);

    const loadComments = async () => {
        setLoadingComments(true);
        try {
            const data = await getComments(post.id);
            setComments(data);
        } finally {
            setLoadingComments(false);
        }
    };

    const toggleComments = async () => {
        const next = !commentsOpen;
        setCommentsOpen(next);
        if (next && comments.length === 0) {
            await loadComments();
        }
    };

    const submitComment = async () => {
        const txt = draft.trim();
        if (!txt) return;
        setSavingComment(true);
        try {
            await createComment(post.id, txt);
            setDraft("");
            await loadComments();
        } finally {
            setSavingComment(false);
        }
    };

    const startMarketplaceChat = async () => {
        if (startingChat) return;
        setStartingChat(true);

        try {
            const conv = await createMarketplaceConversation(post.id);
            navigate(`/messages?open=${encodeURIComponent(conv.id)}`);
        } catch {
            alert("Could not start chat. Please try again.");
        } finally {
            setStartingChat(false);
        }
    };

    const offer = offerMeta(post);
    const cond = conditionMeta(post);
    const event = eventMeta(post);

    return (
        <div className="post-card" onClick={() => navigate(`/posts/${post.id}`)}>
            <div className="post-card-header">
                <div className="post-author">
                    <div className="avatar">
                        {post.authorProfileImageUrl ? (
                            <img className="avatar-img" src={post.authorProfileImageUrl} alt="Author" />
                        ) : (
                            <span className="avatar-letter">
                {(post.authorName?.trim()?.[0] ?? "U").toUpperCase()}
              </span>
                        )}
                    </div>

                    <div>
                        <div className="post-author-name">
                            {post.authorName}
                            {post.authorRole ? <span className="post-author-role"> • {post.authorRole}</span> : null}
                        </div>

                        <div className="post-meta">
                            {categoryLabel(post.category)} • {formatDate(post.createdAt)}
                            {post.locationText ? ` • ${post.locationText}` : ""}
                            {offer ? ` • ${offer}` : ""}
                            {cond ? ` • ${cond}` : ""}
                            {event ? ` • ${event}` : ""}
                        </div>
                    </div>
                </div>

                <span className="post-badge">{categoryLabel(post.category)}</span>
            </div>

            <div className="post-card-body">
                <div className="post-title">{post.title}</div>
                <div className="post-desc">{post.description}</div>

                {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="post-image-preview">
                        <img src={post.imageUrls[0]} alt="Post" />
                        {post.imageUrls.length > 1 && (
                            <div className="post-image-more">+{post.imageUrls.length - 1} more</div>
                        )}
                    </div>
                )}

                <div className="post-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        className={`post-action-chip ${liked ? "liked" : ""}`}
                        onClick={() => setLiked((v) => !v)}
                    >
                        {liked ? "❤️ Liked" : "🤍 Like"}
                    </button>

                    <button type="button" className="post-action-chip" onClick={toggleComments}>
                        💬 Comment
                    </button>

                    {post.category === "OFFER" && (
                        <button
                            type="button"
                            className="post-action-chip interested-chip"
                            onClick={() => void startMarketplaceChat()}
                            disabled={startingChat}
                            title="Start a chat with the seller"
                        >
                            {startingChat ? "…" : "🛒 I'm interested"}
                        </button>
                    )}
                </div>

                {commentsOpen && (
                    <div className="post-comments" onClick={(e) => e.stopPropagation()}>
                        {loadingComments && <p>Loading comments…</p>}

                        {!loadingComments && comments.length === 0 && (
                            <p className="comments-empty">No comments yet. Be the first 🙂</p>
                        )}

                        {!loadingComments && comments.length > 0 && (
                            <div className="comments-list">
                                {comments.map((c) => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-author-name">{c.authorName}</div>
                                        <div className="comment-text">{c.text}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="comment-input-row">
                            <input
                                className="comment-input"
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                placeholder="Write a comment..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        void submitComment();
                                    }
                                }}
                            />

                            <button
                                type="button"
                                className="comment-send-btn"
                                onClick={() => void submitComment()}
                                disabled={savingComment || draft.trim().length === 0}
                                title="Send"
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
