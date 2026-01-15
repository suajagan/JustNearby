import { NavLink, Outlet } from "react-router-dom";
import { useRef, useState } from "react";
import type { ProfileResponse } from "../api/profileApi";
import RightCategoryPanel from "./RightCategoryPanel";
import { listConversations, type ConversationResponse } from "../api/conversationApi";
import { getIncomingRequests, type FriendRequestResponse } from "../api/friendApi";

type Props = {
    profile: ProfileResponse | null;
};

type BadgeState = {
    unreadMessages: number;
    newRequests: number;
};

const SEEN_CONV_KEY = "conversationLastSeenAt";
const SEEN_REQ_KEY = "friendRequestsLastSeenAt";

function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

function computeUnreadConversations(convs: ConversationResponse[]): number {
    const seen = readJson<Record<string, string>>(SEEN_CONV_KEY, {});
    let count = 0;

    for (const c of convs) {
        const lastSeenAt = seen[c.id];

        if (!lastSeenAt) {
            count += 1;
            continue;
        }

        if (new Date(c.lastMessageAt).getTime() > new Date(lastSeenAt).getTime()) {
            count += 1;
        }
    }

    return count;
}

function computeNewRequests(reqs: FriendRequestResponse[]): number {
    const lastSeen = readJson<string | null>(SEEN_REQ_KEY, null);
    if (!lastSeen) return reqs.length;

    const lastSeenMs = new Date(lastSeen).getTime();

    let count = 0;
    for (const r of reqs) {
        const createdMs = new Date(r.createdAt).getTime();
        if (createdMs > lastSeenMs) count += 1;
    }
    return count;
}

export default function AppShell({ profile }: Props) {
    const city = profile?.address?.city ?? "";

    const [badges, setBadges] = useState<BadgeState>({ unreadMessages: 0, newRequests: 0 });

    const didStartRef = useRef(false);
    const intervalRef = useRef<number | null>(null);

    const refreshBadges = async () => {
        const [convs, incoming] = await Promise.all([listConversations(), getIncomingRequests()]);
        const unreadMessages = computeUnreadConversations(convs);
        const newRequests = computeNewRequests(incoming);
        setBadges({ unreadMessages, newRequests });
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

        refreshBadges().catch(() => {});

        intervalRef.current = window.setInterval(() => {
            refreshBadges().catch(() => {});
        }, 5000);
    };

    return (
        <div ref={mountRef} className="app-shell">
            <div className="shell-grid">
                <aside className="shell-left">
                    <div className="shell-card">
                        <nav className="side-nav">
                            <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
                                🏠 Home
                            </NavLink>

                            <NavLink to="/posts/new" className={({ isActive }) => (isActive ? "active" : "")}>
                                ➕ Add Post
                            </NavLink>

                            <NavLink to="/people" className={({ isActive }) => (isActive ? "active" : "")}>
                                👥 People
                            </NavLink>

                            <NavLink to="/messages" className={({ isActive }) => (isActive ? "active" : "")}>
                                <span className="nav-row">
                                    <span>💬 Messages  </span>
                                    {badges.unreadMessages > 0 ? (
                                        <span className="nav-badge">{badges.unreadMessages}</span>
                                    ) : null}
                                </span>
                            </NavLink>

                            <NavLink to="/requests" className={({ isActive }) => (isActive ? "active" : "")}>
                                <span className="nav-row">
                                    <span>✉️ Friend Requests</span>
                                    {badges.newRequests > 0 ? (
                                        <span className="nav-badge">{badges.newRequests}</span>
                                    ) : null}
                                </span>
                            </NavLink>
                        </nav>
                    </div>
                </aside>

                <main className="shell-center">
                    <div className="center-stack">
                        <Outlet />
                    </div>
                </main>

                <aside className="shell-right">
                    <div className="shell-card">
                        <div style={{ fontWeight: 800, marginBottom: 6 }}>Your area</div>
                        <div style={{ color: "#666", fontSize: 14 }}>
                            {city ? city : "Set your city in profile"}
                        </div>
                    </div>
                    <div style={{ height: 12 }} />
                    <RightCategoryPanel />
                </aside>
            </div>
        </div>
    );
}
