import { useState } from "react";
import * as React from "react";
import axios from "axios";

type SignUpFormProps = {
    onSuccess?: () => void;
};

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        try {
            await axios.post("/api/auth/signup", {
                name,
                email,
                password,
            });

            setSuccessMessage("Your account has been created. Please login.");

            // small delay so user can read the message
            setTimeout(() => {
                onSuccess?.();
            }, 1200);

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(
                    typeof err.response?.data === "string"
                        ? err.response.data
                        : "Signup failed"
                );
            } else {
                setError("Signup failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-form">
            <h2>Create Account</h2>

            <form onSubmit={handleSignup} className="modal-form">
                <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit" className="primary-btn" disabled={loading}>
                    {loading ? "Creating..." : "Sign Up"}
                </button>
            </form>

            {error && <p className="error">{error}</p>}
            {successMessage && (
                <p style={{ color: "green", textAlign: "center", marginTop: "8px" }}>
                    {successMessage}
                </p>
            )}
        </div>
    );
}
