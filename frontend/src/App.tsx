import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import CreatePostPage from "./pages/CreatePostPage";
import type { User } from "./types/User";
import { getMyProfile, type ProfileResponse } from "./api/profileApi";

import Header from "./components/Header";
import Modal from "./components/Modal";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignUpForm";
import ProfileGuard from "./components/ProfileGuard";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import ProfilePage from "./pages/ProfilePage";
import PostDetailsPage from "./pages/PostDetailsPage";

import NearbyPeoplePage from "./pages/NearbyPeoplePage";
import FriendRequestsPage from "./pages/FriendRequestsPage";

import AppShell from "./components/AppShell";
import ConversationsPage from "./pages/ConversationsPage.tsx";

function ProtectedRoute({
                            user,
                            children,
                        }: {
    user: User | null | undefined;
    children: ReactNode;
}) {
    if (user === undefined) return <div>Loading...</div>;
    if (user === null) return <Navigate to="/" replace />;
    return <>{children}</>;
}

function profileToUser(profile: ProfileResponse): User {
    return {
        login: profile.email ?? profile.name ?? "user",
        name: profile.name ?? undefined,
        email: profile.email ?? undefined,
    };
}

function AppRouter() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);

    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    const navigate = useNavigate();

    const refreshProfileAndUser = async (): Promise<ProfileResponse | null> => {
        try {
            const p = await getMyProfile();
            setProfile(p);
            setUser(profileToUser(p));
            return p;
        } catch {
            setProfile(null);
            setUser(null);
            return null;
        }
    };

    const refreshWithRetry = async (): Promise<ProfileResponse | null> => {
        const delays = [0, 200, 500, 900];
        for (const ms of delays) {
            if (ms > 0) await new Promise((r) => setTimeout(r, ms));
            const p = await refreshProfileAndUser();
            if (p) return p;
        }
        return null;
    };

    useEffect(() => {
        let alive = true;

        const load = async () => {
            try {
                const p = await getMyProfile();
                if (!alive) return;
                setProfile(p);
                setUser(profileToUser(p));
            } catch {
                if (!alive) return;
                setProfile(null);
                setUser(null);
            }
        };

        load();

        return () => {
            alive = false;
        };

    }, []);


    return (
        <>
            <Header
                user={user}
                profileImageUrl={profile?.profileImageUrl ?? null}
                onLogin={() => setShowLogin(true)}
                onSignup={() => setShowSignup(true)}
                onLogout={() => {
                    setUser(null);
                    setProfile(null);
                }}
            />

            {showLogin && (
                <Modal onClose={() => setShowLogin(false)}>
                    <LoginForm
                        onSuccess={async () => {
                            setShowLogin(false);

                            const p = await refreshWithRetry();

                            if (!p) {
                                navigate("/");
                                return;
                            }

                            navigate(p.profileComplete ? "/home" : "/profile");
                        }}
                    />
                </Modal>
            )}

            {showSignup && (
                <Modal onClose={() => setShowSignup(false)}>
                    <SignupForm
                        onSuccess={() => {
                            setShowSignup(false);
                            setShowLogin(true);
                        }}
                    />
                </Modal>
            )}

            <Routes>
                <Route path="/" element={<LandingPage onSignup={() => setShowSignup(true)} />} />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute user={user}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    element={
                        <ProtectedRoute user={user}>
                            <ProfileGuard profile={profile}>
                                <AppShell profile={profile} />
                            </ProfileGuard>
                        </ProtectedRoute>
                    }
                >
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/posts/new" element={<CreatePostPage />} />
                    <Route path="/people" element={<NearbyPeoplePage />} />
                    <Route path="/requests" element={<FriendRequestsPage />} />
                    <Route path="/messages" element={<ConversationsPage />} />
                </Route>

                <Route
                    path="/posts/:id"
                    element={
                        <ProtectedRoute user={user}>
                            <PostDetailsPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
    );
}
