import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, type PostCategory, type PostResponse } from "../api/postApi";
import Modal from "../components/Modal";

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

    if (p.offerType === "SELL") {
        const cur = p.currency ?? "EUR";
        const price = typeof p.price === "number" ? p.price : undefined;
        if (price !== undefined) {
            return cur === "EUR" ? `€ ${price}` : `${price} ${cur}`;
        }
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
    if (p.eventLocation && p.eventLocation.trim())
        parts.push(p.eventLocation.trim());

    return parts.length ? parts.join(" • ") : null;
}

export default function HomePage() {
    const navigate = useNavigate();

    const [category, setCategory] = useState<PostCategory | "ALL">("ALL");
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Gallery modal state
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryIndex, setGalleryIndex] = useState(0);

    const openGallery = (images: string[], startIndex = 0) => {
        setGalleryImages(images);
        setGalleryIndex(startIndex);
        setGalleryOpen(true);
    };

    const nextImg = () =>
        setGalleryIndex((i) =>
            galleryImages.length ? (i + 1) % galleryImages.length : 0
        );

    const prevImg = () =>
        setGalleryIndex((i) =>
            galleryImages.length ? (i - 1 + galleryImages.length) % galleryImages.length : 0
        );

    const selectedCategory = useMemo(
        () => (category === "ALL" ? undefined : category),
        [category]
    );

    useEffect(() => {
        let alive = true;

        getPosts(selectedCategory)
            .then((data) => {
                if (!alive) return;
                setPosts(data);
            })
            .catch((e) => {
                if (!alive) return;
                const msg = e instanceof Error ? e.message : "Failed to load posts";
                setError(msg);
            })
            .finally(() => {
                if (!alive) return;
                setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, [selectedCategory]);

    const handleCategoryChange = (value: PostCategory | "ALL") => {
        setLoading(true);
        setError(null);
        setCategory(value);
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div>
                    <h2>Neighborhood Feed</h2>
                    <p className="profile-subtitle">
                        See what’s happening nearby and share your own post.
                    </p>
                </div>

                <button className="primary-btn" onClick={() => navigate("/posts/new")}>
                    + Create Post
                </button>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: 12 }}>
                <label className="role-field">
                    Filter by category
                    <select
                        value={category}
                        onChange={(e) =>
                            handleCategoryChange(e.target.value as PostCategory | "ALL")
                        }
                    >
                        <option value="ALL">All</option>
                        <option value="ANNOUNCEMENT">{categoryLabel("ANNOUNCEMENT")}</option>
                        <option value="SEARCH">{categoryLabel("SEARCH")}</option>
                        <option value="OFFER">{categoryLabel("OFFER")}</option>
                        <option value="RECOMMENDATION">
                            {categoryLabel("RECOMMENDATION")}
                        </option>
                        <option value="EVENT">{categoryLabel("EVENT")}</option>
                    </select>
                </label>
            </div>

            {loading && <p>Loading posts...</p>}
            {error && <p className="error">{error}</p>}

            {!loading && !error && posts.length === 0 && (
                <p>No posts yet. Create the first one 🙂</p>
            )}

            {!loading && !error && posts.length > 0 && (
                <div className="posts-list">
                    {posts.map((p) => {
                        const offer = offerMeta(p);
                        const cond = conditionMeta(p);
                        const event = eventMeta(p);

                        return (
                            <div
                                key={p.id}
                                className="post-card"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/posts/${p.id}`)}
                            >
                            <div className="post-card-header">
                                    <div className="post-author">
                                        <div className="avatar">
                                            {p.authorProfileImageUrl ? (
                                                <img
                                                    className="avatar-img"
                                                    src={p.authorProfileImageUrl}
                                                    alt="Author"
                                                />
                                            ) : (
                                                <span className="avatar-letter">
                          {(p.authorName?.trim()?.[0] ?? "U").toUpperCase()}
                        </span>
                                            )}
                                        </div>

                                        <div>
                                            <div className="post-author-name">
                                                {p.authorName}
                                                {p.authorRole ? (
                                                    <span className="post-author-role"> • {p.authorRole}</span>
                                                ) : null}
                                            </div>

                                            <div className="post-meta">
                                                {categoryLabel(p.category)} • {formatDate(p.createdAt)}
                                                {p.locationText ? ` • ${p.locationText}` : ""}
                                                {offer ? ` • ${offer}` : ""}
                                                {cond ? ` • ${cond}` : ""}
                                                {event ? ` • ${event}` : ""}
                                            </div>
                                        </div>
                                    </div>

                                    <span className="post-badge">{categoryLabel(p.category)}</span>
                                </div>

                                <div className="post-card-body">
                                    <div className="post-title">{p.title}</div>
                                    <div className="post-desc">{p.description}</div>

                                    {p.imageUrls && p.imageUrls.length > 0 && (
                                        <div className="post-image-preview">
                                            <img
                                                src={p.imageUrls[0]}
                                                alt="Post"
                                                onClick={() => openGallery(p.imageUrls ?? [], 0)}
                                                style={{ cursor: "pointer" }}
                                            />
                                            {p.imageUrls.length > 1 && (
                                                <div className="post-image-more">
                                                    +{p.imageUrls.length - 1} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* GALLERY MODAL */}
            {galleryOpen && (
                <Modal onClose={() => setGalleryOpen(false)}>
                    <div className="gallery">
                        <img
                            className="gallery-img"
                            src={galleryImages[galleryIndex]}
                            alt="Gallery"
                        />

                        <div className="gallery-actions">
                            <button type="button" onClick={prevImg}>
                                ←
                            </button>
                            <span>
                {galleryImages.length ? galleryIndex + 1 : 0}/{galleryImages.length}
              </span>
                            <button type="button" onClick={nextImg}>
                                →
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
