import { useState } from "react";
import * as React from "react";
import axios from "axios";
import {loadUser} from "../api/UserApi.ts";

type LoginFormProps = {
    onSuccess?: () => void;
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.post("/api/auth/login", {
                email,
                password,
            });
            await loadUser();
            onSuccess?.();
            window.location.href = "/home";
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    typeof err.response?.data === "string"
                        ? err.response.data
                        : "Login failed your user name or password incorrect"
                );
            } else {
                setError("Login failed your user name or password incorrect");
            }
        } finally {
            setLoading(false);
        }
    };

    const loginWithGitHub = () => {
        const host =
            window.location.host === "localhost:5173"
                ? "http://localhost:8080"
                : window.location.origin;

        window.open(`${host}/oauth2/authorization/github`, "_self");
    };

    return (
        <div className="modal-form">
            <h2>Login</h2>

            <form onSubmit={handleLogin} className="modal-form">
                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            <hr />

            <button className="github-btn" onClick={loginWithGitHub}>
                Login with GitHub
            </button>
        </div>
    );
}
