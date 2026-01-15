import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "../types/User";
import Modal from "./Modal";
import CategoryPickerModal from "./CategoryPickerModal";
import type { PostCategory } from "../api/postApi";

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
    const [pickerOpen, setPickerOpen] = useState(false);
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

                {user && (
                    <>
                        <input
                            className="top-search"
                            placeholder="Search"
                            readOnly
                            onClick={() => setPickerOpen(true)}
                        />

                    </>
                )}
            </div>

            <div className="navbar-right">
                {!user && (
                    <div className="auth-actions">
                        <button className="nav-btn" onClick={onLogin}>Login</button>
                        <button className="nav-btn nav-btn-primary" onClick={onSignup}>Register</button>
                    </div>
                )}

                {user && (
                    <div className="profile-menu">
                        <span className="welcome">Hi {displayName}</span>

                        <button
                            type="button"
                            className="avatar"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label="Open menu"
                        >
                            {profileImageUrl ? (
                                <img className="avatar-img" src={profileImageUrl} alt="Profile" />
                            ) : (
                                <span className="avatar-letter">{avatarLetter}</span>
                            )}
                        </button>

                        {menuOpen && (
                            <div className="dropdown">
                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/profile");
                                    }}
                                >
                                    My Profile
                                </button>

                                <button
                                    className="dropdown-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/account");
                                    }}
                                >
                                    Account Settings
                                </button>

                                <button
                                    className="dropdown-item danger"
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

            {pickerOpen && (
                <Modal onClose={() => setPickerOpen(false)}>
                    <CategoryPickerModal
                        onPick={(cat: PostCategory) => {
                            setPickerOpen(false);
                            navigate(`/home?category=${cat}`);
                        }}
                    />
                </Modal>
            )}
        </nav>
    );
}
