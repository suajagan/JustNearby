import { Link } from "react-router-dom";
import collageImg from "../assets/landing-collage.jpg";

type Props = {
    onSignup: () => void;
};

export default function LandingPage({ onSignup }: Props) {
    return (
        <div className="landing">
            <section className="landing-hero landing-hero-split">
                <div className="landing-hero-bg" />

                <div className="landing-hero-left">
                    <h1>Your neighborhood, in one place.</h1>
                    <p className="landing-lead">
                        Connect with people nearby, share updates, ask for help, and discover local offers —
                        all in one friendly community feed.
                    </p>

                    <div className="landing-cta">
                        <Link className="secondary-btn" to="/home">
                            Explore feed
                        </Link>
                    </div>

                    <div className="landing-chips">
                        <span className="chip">✅ Verified profiles</span>
                        <span className="chip">📍 Local-only feed</span>
                        <span className="chip">🖼️ Photos in posts</span>
                        <span className="chip">💬 Comments</span>
                    </div>

                    <div className="landing-trust">
                        <div className="trust-item">
                            <div className="trust-title">Simple & fast</div>
                            <div className="trust-text">Post in under 30 seconds.</div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-title">Marketplace</div>
                            <div className="trust-text">Sell or give away locally.</div>
                        </div>
                        <div className="trust-item">
                            <div className="trust-title">Help</div>
                            <div className="trust-text">Find services around you.</div>
                        </div>
                    </div>

                    <div className="landing-mini-stats">
                        <div className="stat">
                            <div className="stat-num">5</div>
                            <div className="stat-label">post types</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">1</div>
                            <div className="stat-label">local feed</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">∞</div>
                            <div className="stat-label">neighbors</div>
                        </div>
                    </div>
                </div>

                <div className="landing-hero-right">
                    <div className="landing-preview">
                        <div className="preview-card">
                            <span className="preview-pill">Announcement</span>
                            <div className="preview-title">Coffee meetup today ☕</div>
                            <div className="preview-text">Anyone wants to catch up near the city center?</div>
                        </div>

                        <div className="preview-card">
                            <span className="preview-pill">Offer</span>
                            <div className="preview-title">Couch for sale</div>
                            <div className="preview-text">Good condition, pickup in Aachen.</div>
                        </div>

                        <div className="preview-card">
                            <span className="preview-pill">Help</span>
                            <div className="preview-title">Need an electrician</div>
                            <div className="preview-text">Small repair needed this week.</div>
                        </div>
                    </div>

                    <div className="landing-image-wrap">
                        <img className="landing-image" src={collageImg} alt="JustNearby community" />
                    </div>
                </div>
            </section>

            <section className="landing-section">
                <h2>What you can do</h2>

                <div className="landing-grid-3">
                    <div className="landing-card">
                        <h3>Community messages</h3>
                        <p>
                            Post announcements, recommendations, searches and events — everything stays
                            neighborhood-first.
                        </p>
                    </div>

                    <div className="landing-card">
                        <h3>Marketplace</h3>
                        <p>Sell or give away items nearby — faster and easier pickup with less hassle.</p>
                    </div>

                    <div className="landing-card">
                        <h3>Help</h3>
                        <p>
                            Ask for help or offer your skills (electrician, tutor, cleaner, etc.). Build trust
                            locally.
                        </p>
                    </div>
                </div>
            </section>

            <section className="landing-section">
                <h2>Why JustNearby?</h2>

                <div className="landing-grid-3">
                    <div className="landing-card">
                        <h3>Local by design</h3>
                        <p>Only people in your city can connect — less noise, more relevance.</p>
                    </div>

                    <div className="landing-card">
                        <h3>Trust first</h3>
                        <p>Profiles and clear identity help keep interactions more reliable and friendly.</p>
                    </div>

                    <div className="landing-card">
                        <h3>Faster coordination</h3>
                        <p>Comments and messages make it easy to organize help, pickups, and meetups.</p>
                    </div>
                </div>
            </section>

            <section className="landing-section">
                <h2>How it works</h2>

                <div className="landing-steps">
                    <div className="step">
                        <div className="step-badge">1</div>
                        <div className="step-body">
                            <div className="step-title">Create an account</div>
                            <div className="step-text">Sign up and set your profile picture + role.</div>
                            <button className="primary-btn step-btn" onClick={onSignup} type="button">
                                Create account
                            </button>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-badge">2</div>
                        <div className="step-body">
                            <div className="step-title">Post in your neighborhood</div>
                            <div className="step-text">Share updates, offers, or events — with images.</div>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-badge">3</div>
                        <div className="step-body">
                            <div className="step-title">Connect</div>
                            <div className="step-text">Get comments and build your local network.</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-section landing-safety">
                <div className="landing-card">
                    <h2>Safer sharing</h2>
                    <p>
                        Your profile + role gives context. Posts can include location text, and you can keep
                        event visibility simple.
                    </p>
                    <ul className="landing-checks">
                        <li>Clear identity (name / picture)</li>
                        <li>Helpful categories</li>
                        <li>Simple reporting later (we can add)</li>
                    </ul>
                </div>

                <div className="landing-card">
                    <h2>Built for real life</h2>
                    <p>
                        Use it for daily neighborhood stuff: quick help requests, recommendations, or selling
                        things you don’t need.
                    </p>
                    <ul className="landing-checks">
                        <li>Fast create post</li>
                        <li>Images support</li>
                        <li>Comments to coordinate</li>
                    </ul>
                </div>
            </section>

            <section className="landing-section">
                <h2>FAQ</h2>

                <div className="landing-faq">
                    <details className="faq-item">
                        <summary>What can I post?</summary>
                        <p>
                            Announcements, searches, offers (marketplace), recommendations, and events. Each type
                            shows the right fields.
                        </p>
                    </details>

                    <details className="faq-item">
                        <summary>Can I add photos?</summary>
                        <p>Yes. You can upload up to 5 photos per post.</p>
                    </details>

                    <details className="faq-item">
                        <summary>How do I interact with posts?</summary>
                        <p>You can view the feed, open a post, and add comments. Next we’ll add likes.</p>
                    </details>
                </div>
            </section>

            <footer className="landing-footer">
                <div>© {new Date().getFullYear()} JustNearby</div>
                <div className="landing-footer-links">
                    <span>Privacy</span>
                    <span>Terms</span>
                    <span>Contact</span>
                </div>
            </footer>
        </div>
    );
}
