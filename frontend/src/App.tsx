import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { loadUser } from "./api/UserApi";
import Header from "./components/Header";
import Modal from "./components/Modal";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignUpForm";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";

type UserData = {
    name?: string;
    email?: string;
    login?: string;
    [key: string]: unknown;
};

function ProtectedRoute({
                            user,
                            children,
                        }: {
    user: UserData | null | undefined;
    children: React.ReactNode;
}) {
    if (user === undefined) return <div>Loading...</div>;
    if (user === null) return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function App() {
    const [user, setUser] = useState<UserData | null | undefined>(undefined);
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);

    useEffect(() => {
        loadUser()
            .then(setUser)
            .catch(() => setUser(null));
    }, []);

    return (
        <BrowserRouter>
            {/* HEADER / NAVBAR */}
            <Header
                user={user}
                onLogin={() => setShowLogin(true)}
                onSignup={() => setShowSignup(true)}
                onLogout={() => setUser(null)}
            />

            {/* LOGIN MODAL */}
            {showLogin && (
                <Modal onClose={() => setShowLogin(false)}>
                    <LoginForm onSuccess={() => setShowLogin(false)} />
                </Modal>
            )}

            {showSignup && (
                <Modal onClose={() => setShowSignup(false)}>
                    <SignupForm
                        onSuccess={() => {
                            setShowSignup(false); // close signup modal
                            setShowLogin(true);   // open login modal
                        }}
                    />
                </Modal>
            )}


            {/* ROUTES */}
            <Routes>
                {/* PUBLIC */}
                <Route
                    path="/"
                    element={<LandingPage onSignup={() => setShowSignup(true)} />}
                />

                {/* PROTECTED */}
                <Route
                    path="/home"
                    element={
                        <ProtectedRoute user={user}>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/account"
                    element={
                        <ProtectedRoute user={user}>
                            <AccountPage />
                        </ProtectedRoute>
                    }
                />

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
