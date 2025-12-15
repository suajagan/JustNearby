type UserData = {
    name?: string;
    email?: string;
    login?: string;
};

type HeaderProps = {
    user: UserData | null | undefined;
    onLogin: () => void;
    onSignup: () => void;
    onLogout: () => void;
};

export default function Header({
                                   user,
                                   onLogin,
                                   onSignup,
                                   onLogout,
                               }: HeaderProps) {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h2>JustNearby</h2>
            </div>

            <div className="navbar-right">
                {!user && (
                    <>
                        <button onClick={onLogin}>Login</button>
                        <button onClick={onSignup}>Register</button>
                    </>
                )}

                {user && (
                    <>
                       <span>
                           Hi, {user.name && user.name.trim() !== ""
                           ? user.name
                           : user.login}
                      </span>
                        <button onClick={onLogout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}
