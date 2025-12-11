type Props = {
    goToLogin: () => void;
    goToSignUp: () => void;
};

export default function LandingPage({ goToLogin, goToSignUp }: Props) {
    return (
        <div className="box">
            <h1>JustNearby</h1>
            <p>Connect with your neighborhood</p>

            <button className="primary-btn" onClick={goToSignUp}>
                Sign Up
            </button>

            <button className="primary-btn" onClick={goToLogin}>
                Login
            </button>
        </div>
    );
}
