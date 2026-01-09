export type PostCategory =
    | "ANNOUNCEMENT"
    | "SEARCH"
    | "OFFER"
    | "RECOMMENDATION"
    | "EVENT";

export type OfferType = "SELL" | "GIVE_AWAY";
export type ItemCondition = "NEW" | "USED";

export type CreatePostRequest = {
    category : PostCategory;
    title: string;
    description: string;
    locationText?: string;

    authorName: string;
    authorRole?: string;
    authorProfileImageUrl?: string | null;
    offerType?: OfferType;
    price?: number; // required if offerType=SELL (we enforce in UI next)
    currency?: "EUR";
    condition?: ItemCondition;
    itemCategory?: string;
    eventStart?: string;     // ISO string
    eventEnd?: string;       // ISO string
    eventLocation?: string;
    isPublic?: boolean;
    imageUrls?: string[];
};

export type PostResponse = {
    id: string;
    category : PostCategory;
    title: string;
    description: string;
    locationText?: string;

    authorName: string;
    authorRole?: string;
    authorProfileImageUrl?: string | null;

    createdAt: string;
    updatedAt: string;
    offerType?: OfferType;
    price?: number;
    currency?: string;
    condition?: ItemCondition;
    itemCategory?: string;
    eventStart?: string;     // ISO string
    eventEnd?: string;       // ISO string
    eventLocation?: string;
    isPublic?: boolean;
    imageUrls?: string[];
};

export type CommentResponse = {
    id: string;
    postId: string;
    text: string;
    authorName: string;
    authorRole?: string | null;
    authorProfileImageUrl?: string | null;
    createdAt: string;
};

export type CreateCommentRequest = {
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

export function getPosts(category?: PostCategory): Promise<PostResponse[]> {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    return request<PostResponse[]>(`/api/posts${q}`);
}

export async function getPost(id: string): Promise<PostResponse> {
    const res = await fetch(`/api/posts/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load post");
    return res.json();
}

export function createPost(payload: CreatePostRequest): Promise<PostResponse> {
    return request<PostResponse>("/api/posts", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getComments(postId: string): Promise<CommentResponse[]> {
    const res = await fetch(`/api/posts/${postId}/comments`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load comments");
    return res.json();
}

export async function createComment(
    postId: string,
    text: string
): Promise<CommentResponse> {
    const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text } satisfies CreateCommentRequest),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    return res.json();
}

