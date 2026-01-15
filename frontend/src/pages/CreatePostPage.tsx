import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    createPost,
    type ItemCondition,
    type OfferType,
    type PostCategory,
} from "../api/postApi";
import { getMyProfile, type ProfileResponse } from "../api/profileApi";

function categoryLabel(c: PostCategory): string {
    switch (c) {
        case "ANNOUNCEMENT":
            return "Announcement";
        case "SEARCH":
            return "Search";
        case "OFFER":
            return "Offer (Marketplace)";
        case "RECOMMENDATION":
            return "Recommendation";
        case "EVENT":
            return "Event";
        default:
            return c;
    }
}

function categoryHint(c: PostCategory): string {
    switch (c) {
        case "ANNOUNCEMENT":
            return "General neighborhood message.";
        case "SEARCH":
            return "Looking for something or someone to help.";
        case "OFFER":
            return "Sell / give away items (marketplace).";
        case "RECOMMENDATION":
            return "Recommend a business, place, or service.";
        case "EVENT":
            return "Share an event with date/time.";
        default:
            return "";
    }
}

export default function CreatePostPage() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [category, setCategory] = useState<PostCategory>("ANNOUNCEMENT");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [locationText, setLocationText] = useState("");

    const [offerType, setOfferType] = useState<OfferType>("SELL");
    const [price, setPrice] = useState<string>("");
    const [condition, setCondition] = useState<ItemCondition | "">("");

    const [eventStartLocal, setEventStartLocal] = useState<string>("");
    const [eventEndLocal, setEventEndLocal] = useState<string>("");
    const [eventLocation, setEventLocation] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [imageError, setImageError] = useState<string | null>(null);


    useEffect(() => {
        getMyProfile()
            .then(setProfile)
            .catch(() => setProfile(null))
            .finally(() => setLoadingProfile(false));
    }, []);

    const authorName = useMemo(() => {
        if (!profile) return "User";
        return (
            (profile.name && profile.name.trim()) ||
            (profile.email && profile.email.trim()) ||
            "User"
        );
    }, [profile]);


    const authorRole = useMemo(() => profile?.roles?.[0] ?? undefined, [profile]);
    const authorProfileImageUrl = useMemo(
        () => profile?.profileImageUrl ?? null,
        [profile]
    );

    const canSubmit =
        title.trim().length > 0 && description.trim().length > 0 && !saving;

    const handleCategoryChange = (value: PostCategory) => {
        setCategory(value);
        setError(null);
        setImageUrls([]);
        setImageError(null);

        if (value !== "OFFER") {
            setOfferType("SELL");
            setPrice("");
            setCondition("");
        }
        if (value !== "EVENT") {
            setEventStartLocal("");
            setEventEndLocal("");
            setEventLocation("");
            setIsPublic(true);
        }
    };
    async function filesToDataUrls(files: FileList, max: number): Promise<string[]> {
        const arr = Array.from(files).slice(0, max);

        const promises = arr.map(
            (file) =>
                new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = () => reject(new Error("Failed to read file"));
                    reader.readAsDataURL(file);
                })
        );

        return Promise.all(promises);
    }


    const handleSubmit = async () => {
        setError(null);

        if (!title.trim()) return setError("Title is required");
        if (!description.trim()) return setError("Description is required");

        // OFFER validation
        let parsedPrice: number | undefined = undefined;
        if (category === "OFFER") {
            if (!offerType) return setError("Please select Sell or Give away");

            if (offerType === "SELL") {
                if (!price.trim()) return setError("Price is required for Sell");
                const n = Number(price);
                if (Number.isNaN(n) || n <= 0)
                    return setError("Price must be a valid number > 0");
                parsedPrice = n;
            }
        }

        let eventStartIso: string | undefined = undefined;
        let eventEndIso: string | undefined = undefined;

        if (category === "EVENT") {
            if (!eventStartLocal) return setError("Event start date/time is required");
            if (!eventLocation.trim()) return setError("Event location is required");

            const start = new Date(eventStartLocal);
            if (Number.isNaN(start.getTime()))
                return setError("Invalid event start date/time");
            eventStartIso = start.toISOString();

            if (eventEndLocal) {
                const end = new Date(eventEndLocal);
                if (Number.isNaN(end.getTime()))
                    return setError("Invalid event end date/time");
                eventEndIso = end.toISOString();
            }
        }

        try {
            setSaving(true);

            await createPost({
                category,
                title: title.trim(),
                description: description.trim(),
                locationText: locationText.trim() ? locationText.trim() : undefined,

                authorName,
                authorRole,
                authorProfileImageUrl,
                imageUrls: imageUrls.length ? imageUrls : undefined,

                // OFFER
                offerType: category === "OFFER" ? offerType : undefined,
                price: category === "OFFER" ? parsedPrice : undefined,
                currency: category === "OFFER" ? "EUR" : undefined,
                condition: category === "OFFER" && condition ? condition : undefined,

                // EVENT
                eventStart: category === "EVENT" ? eventStartIso : undefined,
                eventEnd: category === "EVENT" ? eventEndIso : undefined,
                eventLocation: category === "EVENT" ? eventLocation.trim() : undefined,
                isPublic: category === "EVENT" ? isPublic : undefined,

            });

            navigate("/home");
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to create post";
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    if (loadingProfile) return <p>Loading...</p>;
    if (!profile) return <p>Please login to create a post.</p>;

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div>
                    <h2>Create Post</h2>
                    <p className="profile-subtitle">{categoryHint(category)}</p>
                </div>

                <button className="secondary-btn" onClick={() => navigate("/home")}>
                    Back
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="profile-form">
                <label className="role-field">
                    Category
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value as PostCategory)}
                    >
                        <option value="ANNOUNCEMENT">{categoryLabel("ANNOUNCEMENT")}</option>
                        <option value="SEARCH">{categoryLabel("SEARCH")}</option>
                        <option value="OFFER">{categoryLabel("OFFER")}</option>
                        <option value="RECOMMENDATION">{categoryLabel("RECOMMENDATION")}</option>
                        <option value="EVENT">{categoryLabel("EVENT")}</option>
                    </select>
                </label>

                <label className="role-field">
                    Title
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Short title…"
                    />
                </label>

                <label className="bio-field">
                    Description
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        placeholder="Write your post…"
                    />
                </label>

                <label className="role-field">
                    Location (optional)
                    <input
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        placeholder="e.g. Aachen Hbf / City Center"
                    />
                </label>

                <div className="post-images">
                    <label className="role-field">
                        Photos (optional, max 5)
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={async (e) => {
                                setImageError(null);
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                try {
                                    const urls = await filesToDataUrls(files, 5);
                                    setImageUrls(urls);
                                } catch {
                                    setImageError("Could not read images");
                                }
                            }}
                        />
                    </label>

                    {imageError && <p className="error">{imageError}</p>}

                    {imageUrls.length > 0 && (
                        <div className="post-images-grid">
                            {imageUrls.map((src, idx) => (
                                <div key={src} className="post-image-item">
                                    <img src={src} alt={`upload-${idx}`} />
                                    <button
                                        type="button"
                                        className="post-image-remove"
                                        onClick={() =>
                                            setImageUrls((prev) => prev.filter((_, i) => i !== idx))
                                        }
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {category === "OFFER" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <label className="role-field">
                            Offer type
                            <select
                                value={offerType}
                                onChange={(e) => setOfferType(e.target.value as OfferType)}
                            >
                                <option value="SELL">Sell</option>
                                <option value="GIVE_AWAY">Give away</option>
                            </select>
                        </label>

                        {offerType === "SELL" && (
                            <label className="role-field">
                                Price (EUR)
                                <input
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="e.g. 25"
                                />
                            </label>
                        )}

                        <label className="role-field">
                            Condition (optional)
                            <select
                                value={condition}
                                onChange={(e) =>
                                    setCondition(e.target.value as ItemCondition | "")
                                }
                            >
                                <option value="">Select…</option>
                                <option value="NEW">New</option>
                                <option value="USED">Used</option>
                            </select>
                        </label>
                    </div>
                )}
                {category === "EVENT" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <label className="role-field">
                            Start date & time
                            <input
                                type="datetime-local"
                                value={eventStartLocal}
                                onChange={(e) => setEventStartLocal(e.target.value)}
                            />
                        </label>

                        <label className="role-field">
                            End date & time (optional)
                            <input
                                type="datetime-local"
                                value={eventEndLocal}
                                onChange={(e) => setEventEndLocal(e.target.value)}
                            />
                        </label>

                        <label className="role-field">
                            Event location
                            <input
                                value={eventLocation}
                                onChange={(e) => setEventLocation(e.target.value)}
                                placeholder="e.g. Community Center / Park / Street name"
                            />
                        </label>

                        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            Public event
                        </label>
                    </div>
                )}

                <div className="profile-actions">
                    <button
                        className="primary-btn"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                    >
                        {saving ? "Posting..." : "Post"}
                    </button>

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/home")}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
