import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNearbyUsers, type UserCardResponse } from "../api/UserApi";
import { getOutgoingRequests, getFriends, sendFriendRequest, type FriendRequestResponse } from "../api/friendApi";
import { createFriendConversation } from "../api/conversationApi";
import { getAxiosErrorMessage } from "../api/error";

export default function NearbyPeoplePage() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<UserCardResponse[]>([]);
    const [outgoing, setOutgoing] = useState<FriendRequestResponse[]>([]);
    const [friends, setFriends] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState<string | null>(null);
    const [openingTo, setOpeningTo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [u, o, f] = await Promise.all([getNearbyUsers(), getOutgoingRequests(), getFriends()]);
                setUsers(u);
                setOutgoing(o);
                setFriends(f);
            } catch (e: unknown) {
                setError(getAxiosErrorMessage(e));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const outgoingToUserIds = useMemo(() => new Set(outgoing.map((r) => r.toUserId)), [outgoing]);
    const friendUserIds = useMemo(() => new Set(friends), [friends]);

    async function onSendRequest(toUserId: string) {
        try {
            setSendingTo(toUserId);
            setError(null);
            const created = await sendFriendRequest(toUserId);
            setOutgoing((prev) => [created, ...prev]);
        } catch (e: unknown) {
            setError(getAxiosErrorMessage(e));
        } finally {
            setSendingTo(null);
        }
    }

    async function onMessage(toUserId: string) {
        try {
            setOpeningTo(toUserId);
            setError(null);
            const convo = await createFriendConversation(toUserId);
            navigate(`/messages?open=${encodeURIComponent(convo.id)}`);
        } catch (e: unknown) {
            setError(getAxiosErrorMessage(e));
        } finally {
            setOpeningTo(null);
        }
    }

    return (
        <div className="nearby-page">
            <div className="nearby-header">
                <h2 className="nearby-title">People in your city</h2>
                <p className="nearby-subtitle">
                    You can send friend requests only to people in your city.
                </p>
            </div>

            {error && <div className="nearby-alert">{error}</div>}

            {loading ? (
                <div className="nearby-loading">Loading…</div>
            ) : users.length === 0 ? (
                <div className="nearby-empty">No users found in your city yet.</div>
            ) : (
                <div className="nearby-list">
                    {users.map((u) => {
                        const isFriend = friendUserIds.has(u.id);
                        const alreadySent = outgoingToUserIds.has(u.id);
                        const isSending = sendingTo === u.id;
                        const isOpening = openingTo === u.id;

                        return (
                            <div key={u.id} className="nearby-card">
                                <div className="nearby-avatar">
                                    {u.profileImageUrl ? (
                                        <img className="nearby-avatarImg" src={u.profileImageUrl} alt="" />
                                    ) : (
                                        <span className="nearby-avatarLetter">
                                            {(u.name?.trim()?.[0] ?? "U").toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="nearby-info">
                                    <div className="nearby-name">{u.name}</div>
                                    <div className="nearby-meta">{u.city ?? ""}</div>
                                </div>

                                <div className="nearby-actions">
                                    {isFriend ? (
                                        <button
                                            type="button"
                                            className="nearby-btn"
                                            onClick={() => onMessage(u.id)}
                                            disabled={isOpening}
                                        >
                                            {isOpening ? "Opening…" : "Message"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="nearby-btn"
                                            onClick={() => onSendRequest(u.id)}
                                            disabled={alreadySent || isSending}
                                        >
                                            {alreadySent ? "Request sent" : isSending ? "Sending…" : "Add friend"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
