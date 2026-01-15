type Props = {
    onLogin: () => void;
    onLoginOther: () => void;
    onGoToSignUp: () => void;
};

export default function LoginBox({ onLogin, onLoginOther, onGoToSignUp }: Props) {
    return (
        <div className="box">
            <h2>Login</h2>

            <button className="primary-btn" onClick={onLogin}>
                Login with GitHub
            </button>

            <button className="link-btn" onClick={onLoginOther}>
                Login with another GitHub account
            </button>

            <p>Don't have an account?</p>

            <button className="link-btn" onClick={onGoToSignUp}>
                Sign Up
            </button>
        </div>
    );
}
