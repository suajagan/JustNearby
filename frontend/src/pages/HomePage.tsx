import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPosts, type PostCategory, type PostResponse } from "../api/postApi";
import PostCard from "../components/PostCard";

function isPostCategory(v: string | null): v is PostCategory {
    return (
        v === "ANNOUNCEMENT" ||
        v === "SEARCH" ||
        v === "OFFER" ||
        v === "RECOMMENDATION" ||
        v === "EVENT"
    );
}

type FeedState = {
    posts: PostResponse[];
    loadedKey: string | null;
    error: string | null;
    errorKey: string | null;
};

export default function HomePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const urlCategoryParam = searchParams.get("category");
    const urlCategory: PostCategory | "ALL" = isPostCategory(urlCategoryParam)
        ? urlCategoryParam
        : "ALL";

    const selectedCategory = useMemo(
        () => (urlCategory === "ALL" ? undefined : urlCategory),
        [urlCategory]
    );

    const selectedKey = selectedCategory ?? "ALL";

    const [state, setState] = useState<FeedState>({
        posts: [],
        loadedKey: null,
        error: null,
        errorKey: null,
    });
    const loading = state.loadedKey !== selectedKey && state.errorKey !== selectedKey;
    const errorForThisKey = state.errorKey === selectedKey ? state.error : null;

    useEffect(() => {
        let alive = true;

        getPosts(selectedCategory)
            .then((data) => {
                if (!alive) return;
                setState({
                    posts: data,
                    loadedKey: selectedKey,
                    error: null,
                    errorKey: null,
                });
            })
            .catch((e: unknown) => {
                if (!alive) return;
                const msg = e instanceof Error ? e.message : "Failed to load posts";
                setState((prev) => ({
                    posts: prev.posts,
                    loadedKey: prev.loadedKey,
                    error: msg,
                    errorKey: selectedKey,
                }));
            });

        return () => {
            alive = false;
        };
    }, [selectedCategory, selectedKey]);

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

            {loading && <p>Loading posts...</p>}
            {errorForThisKey && <p className="error">{errorForThisKey}</p>}

            {!loading && !errorForThisKey && state.posts.length === 0 && (
                <p>No posts yet. Create the first one 🙂</p>
            )}

            {!loading && !errorForThisKey && state.posts.length > 0 && (
                <div className="posts-list">
                    {state.posts.map((p) => (
                        <PostCard key={p.id} post={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
