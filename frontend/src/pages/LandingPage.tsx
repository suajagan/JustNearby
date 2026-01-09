type LandingPageProps = {
    onSignup: () => void;
};

export default function LandingPage({ onSignup }: LandingPageProps) {
    return (
        <main className="hero">
            <div className="hero-text">
                <h1>
                    JUSTNEARBY IN <span>AACHEN</span>
                </h1>

                <p>
                    JustNearby helps neighbors connect, share help, and build stronger local communities.
                </p>

                <button
                    className="hero-cta"
                    onClick={onSignup}
                >
                    Create Account
                </button>
            </div>
        </main>
    );
}
