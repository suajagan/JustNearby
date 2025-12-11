import { useEffect, useState } from "react";
import { loadUser } from "./api/UserApi.ts";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import UserStatus from "./components/UserStatus";

type UserData = {
    login?: string;
    name?: string;
    email?: string;
    [key: string]: unknown;
};

export default function App() {

    const [user, setUser] = useState<UserData | null | undefined>(undefined);

    const [screen, setScreen] = useState<"landing" | "login" | "signup">("landing");

    useEffect(() => {
        loadUser().then(setUser);
    }, []);

    function loginWithGithub(forceSelect = false) {
        const host = window.location.host === "localhost:5173"
            ? "http://localhost:8080"
            : window.location.origin;

        const baseUrl = host + "/oauth2/authorization/github";
        const url = forceSelect ? baseUrl + "?prompt=select_account" : baseUrl;

        window.open(url, "_self");
    }


    return (
        <>
            <UserStatus user={user} />

            {screen === "landing" && (
                <LandingPage
                    goToLogin={() => setScreen("login")}
                    goToSignUp={() => setScreen("signup")}
                />
            )}

            {screen === "login" && (
                <LoginPage
                    onLogin={() => loginWithGithub(false)}
                    onLoginOther={() => loginWithGithub(true)}
                    goToSignUp={() => setScreen("signup")}
                />
            )}

            {screen === "signup" && (
                <SignUpPage
                    onSignUp={loginWithGithub}
                    goToLogin={() => setScreen("login")}
                />
            )}
        </>
    );
}
