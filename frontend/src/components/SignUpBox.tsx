type Props = {
    onSignUp: () => void;
    onGoToLogin: () => void;
};

export default function SignUpBox({ onSignUp, onGoToLogin }: Props) {
    return (
        <div className="box">
            <h2>Create Account</h2>

            <button className="primary-btn" onClick={onSignUp}>
                Sign Up with GitHub
            </button>

            <p>Already have an account?</p>

            <button className="link-btn" onClick={onGoToLogin}>
                Login
            </button>
        </div>
    );
}
