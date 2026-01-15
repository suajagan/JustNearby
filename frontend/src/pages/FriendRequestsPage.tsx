import { useEffect, useState } from "react";
import { acceptRequest, getIncomingRequests, rejectRequest, type FriendRequestResponse } from "../api/friendApi";
import { getAxiosErrorMessage } from "../api/error";

export default function FriendRequestsPage() {
    const [incoming, setIncoming] = useState<FriendRequestResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [actingOn, setActingOn] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getIncomingRequests();
                setIncoming(data);
                localStorage.setItem("friendRequestsLastSeenAt", new Date().toISOString());
            } catch (e: unknown) {
                setError(getAxiosErrorMessage(e));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function onAccept(id: string) {
        try {
            setActingOn(id);
            setError(null);
            await acceptRequest(id);
            setIncoming((prev) => prev.filter((r) => r.id !== id));
        } catch (e: unknown) {
            setError(getAxiosErrorMessage(e));
        } finally {
            setActingOn(null);
        }
    }

    async function onReject(id: string) {
        try {
            setActingOn(id);
            setError(null);
            await rejectRequest(id);
            setIncoming((prev) => prev.filter((r) => r.id !== id));
        } catch (e: unknown) {
            setError(getAxiosErrorMessage(e));
        } finally {
            setActingOn(null);
        }
    }

    return (
        <div className="frq-page">
            <div className="frq-header">
                <h2 className="frq-title">Friend Requests</h2>
                <p className="frq-subtitle">Accept or reject incoming requests.</p>
            </div>

            {error && <div className="frq-alert">{error}</div>}

            {loading ? (
                <div className="frq-loading">Loading…</div>
            ) : incoming.length === 0 ? (
                <div className="frq-empty">No incoming requests.</div>
            ) : (
                <div className="frq-list">
                    {incoming.map((r) => {
                        const disabled = actingOn === r.id;

                        return (
                            <div key={r.id} className="frq-card">
                                <div className="frq-info">
                                    <div className="frq-line">
                                        <span className="frq-label">From</span>
                                        <span className="frq-value">{r.fromUserId}</span>
                                    </div>
                                    <div className="frq-line">
                                        <span className="frq-label">Sent</span>
                                        <span className="frq-value">{new Date(r.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="frq-actions">
                                    <button
                                        type="button"
                                        className="frq-btn"
                                        disabled={disabled}
                                        onClick={() => onAccept(r.id)}
                                    >
                                        {disabled ? "Working…" : "Accept"}
                                    </button>

                                    <button
                                        type="button"
                                        className="frq-btn"
                                        disabled={disabled}
                                        onClick={() => onReject(r.id)}
                                    >
                                        {disabled ? "Working…" : "Reject"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
