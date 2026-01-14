import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import {
    getPost,
    getComments,
    createComment,
    type PostResponse,
    type CommentResponse,
} from "../api/postApi";



function formatDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

export default function PostDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [commentError, setCommentError] = useState<string | null>(null);
    const [commentSaving, setCommentSaving] = useState(false);


    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        getPost(id)
            .then(setPost)
            .catch((e) => setError(e instanceof Error ? e.message : "Failed to load post"))
            .finally(() => setLoading(false));
    }, [id]);

    const loadComments = async (postId: string) => {
        setLoadingComments(true);
        try {
            const data = await getComments(postId);
            setComments(data);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        loadComments(id);
    }, [id]);


    const handleAddComment = async () => {
        if (!id) return;
        setCommentError(null);

        const txt = commentText.trim();
        if (!txt) return setCommentError("Please write a comment");

        try {
            setCommentSaving(true);
            await createComment(id, txt);
            setCommentText("");
            await loadComments(id);
        } catch (e) {
            setCommentError(e instanceof Error ? e.message : "Failed to add comment");
        } finally {
            setCommentSaving(false);
        }
    };


    const images = post?.imageUrls ?? [];

    const nextImg = () =>
        setGalleryIndex((i) => (images.length ? (i + 1) % images.length : 0));
    const prevImg = () =>
        setGalleryIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));

    if (loading) return <p>Loading…</p>;
    if (error) return <p className="error">{error}</p>;
    if (!post) return null;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div>
                    <h2>{post.title}</h2>
                    <p className="profile-subtitle">
                        {post.category} • {formatDate(post.createdAt)}
                        {post.locationText ? ` • ${post.locationText}` : ""}
                    </p>
                </div>

                <button className="secondary-btn" onClick={() => navigate("/home")}>
                    Back
                </button>
            </div>

            <div className="post-details-card">
                <div className="post-details-author">
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
                        <div className="post-meta">{post.category}</div>
                    </div>
                </div>

                <div className="post-desc" style={{ marginTop: 12 }}>
                    {post.description}
                </div>

                {images.length > 0 && (
                    <div className="post-details-images">
                        <div className="post-images-grid">
                            {images.map((src, idx) => (
                                <div key={src} className="post-image-item">
                                    <img
                                        src={src}
                                        alt={`img-${idx}`}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            setGalleryIndex(idx);
                                            setGalleryOpen(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="comments">
                <h3 className="comments-title">Comments ({comments.length})</h3>

                {loadingComments && <p>Loading comments…</p>}

                {!loadingComments && comments.length === 0 && (
                    <p className="comments-empty">No comments yet. Be the first 🙂</p>
                )}

                {!loadingComments && comments.length > 0 && (
                    <div className="comments-list">
                        {comments.map((c) => (
                            <div key={c.id} className="comment-item">
                                <div className="comment-head">
                                    <div className="comment-author">
                                        <div className="comment-avatar">
                                            {c.authorProfileImageUrl ? (
                                                <img src={c.authorProfileImageUrl} alt="Author" />
                                            ) : (
                                                <span>{(c.authorName?.trim()?.[0] ?? "U").toUpperCase()}</span>
                                            )}
                                        </div>

                                        <div>
                                            <div className="comment-author-name">
                                                {c.authorName}
                                                {c.authorRole ? <span className="comment-author-role"> • {c.authorRole}</span> : null}
                                            </div>
                                            <div className="comment-date">{formatDate(c.createdAt)}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="comment-text">{c.text}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="comment-form">
                   <textarea
                       value={commentText}
                       onChange={(e) => setCommentText(e.target.value)}
                       onKeyDown={(e) => {
                           if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                               e.preventDefault();
                               handleAddComment();
                           }
                       }}
                       rows={3}
                       placeholder="Write a comment…"
                   />
                    {commentError && <p className="error">{commentError}</p>}

                    <button
                        className="primary-btn"
                        type="button"
                        onClick={handleAddComment}
                        disabled={commentSaving || commentText.trim().length === 0}
                    >
                        {commentSaving ? "Posting…" : "Add Comment"}
                    </button>

                </div>
            </div>


            {galleryOpen && images.length > 0 && (
                <Modal onClose={() => setGalleryOpen(false)}>
                    <div className="gallery">
                        <img className="gallery-img" src={images[galleryIndex]} alt="Gallery" />
                        <div className="gallery-actions">
                            <button type="button" onClick={prevImg}>←</button>
                            <span>
                {galleryIndex + 1}/{images.length}
              </span>
                            <button type="button" onClick={nextImg}>→</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
