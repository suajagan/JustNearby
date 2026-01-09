import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "../types/User";

type HeaderProps = {
    user: User | null | undefined;
    profileImageUrl?: string | null;
    onLogin: () => void;
    onSignup: () => void;
    onLogout: () => void;
};

export default function Header({
                                   user,
                                   profileImageUrl,
                                   onLogin,
                                   onSignup,
                                   onLogout,
                               }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const displayName =
        user?.name && user.name.trim() !== "" ? user.name : user?.login ?? "User";
    const avatarLetter = (displayName.trim()[0] ?? "U").toUpperCase();

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="logo">
                    JustNearby
                </Link>
            </div>

            <div className="navbar-right">
                {!user && (
                    <>
                        <button onClick={onLogin}>Login</button>
                        <button onClick={onSignup}>Register</button>
                    </>
                )}

                {user && (
                    <div className="profile-menu">
                        <span className="welcome">Hi {displayName}</span>

                        <div className="avatar" onClick={() => setMenuOpen((v) => !v)}>
                            {profileImageUrl ? (
                                <img className="avatar-img" src={profileImageUrl} alt="Profile" />
                            ) : (
                                <span className="avatar-letter">{avatarLetter}</span>
                            )}
                        </div>

                        {menuOpen && (
                            <div className="dropdown">
                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                >
                                    My Profile
                                </button>

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/account");
                                    }}
                                >
                                    Account Settings
                                </button>

                                <button
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onLogout();
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
