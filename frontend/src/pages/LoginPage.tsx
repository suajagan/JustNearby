import LoginBox from "../components/LoginBox";

type Props = {
    onLogin: () => void;
    onLoginOther: () => void;
    goToSignUp: () => void;
};

export default function LoginPage({ onLogin, onLoginOther, goToSignUp }: Props) {
    return (
        <LoginBox
            onLogin={onLogin}
            onLoginOther={onLoginOther}
            onGoToSignUp={goToSignUp}
        />
    );
}
