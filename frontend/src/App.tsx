import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

export default function App() {
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);

    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    const refreshProfileAndUser = () => {
        getMyProfile()
            .then((p) => {
                setProfile(p);
                setUser(profileToUser(p));
            })
            .catch(() => {
                setProfile(null);
                setUser(null);
            });
    };

    useEffect(() => {
        refreshProfileAndUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <BrowserRouter>
            <Header
                user={user}
                profileImageUrl={profile?.profileImageUrl ?? null}
                onLogin={() => setShowLogin(true)}
                onSignup={() => setShowSignup(true)}
                onLogout={() => {
                    // If you also store a token in localStorage, clear it here.
                    // localStorage.removeItem("token");
                    setUser(null);
                    setProfile(null);
                }}
            />

            {/* LOGIN MODAL */}
            {showLogin && (
                <Modal onClose={() => setShowLogin(false)}>
                    <LoginForm
                        onSuccess={() => {
                            setShowLogin(false);
                            refreshProfileAndUser(); // ✅ updates header to logged-in state
                        }}
                    />
                </Modal>
            )}

            {/* SIGNUP MODAL */}
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
                            <ProfilePage  />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute user={user}>
                            <ProfileGuard profile={profile}>
                                <HomePage />
                            </ProfileGuard>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/account"
                    element={
                        <ProtectedRoute user={user}>
                            <ProfileGuard profile={profile}>
                                <AccountPage />
                            </ProfileGuard>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/posts/new"
                    element={
                        <ProtectedRoute user={user}>
                            <ProfileGuard profile={profile}>
                                <CreatePostPage />
                            </ProfileGuard>
                        </ProtectedRoute>
                    }
                />
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
        </BrowserRouter>
    );
}
