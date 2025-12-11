import SignUpBox from "../components/SignUpBox.tsx";

type Props= {
    onSignUp:() => void;
    goToLogin: () => void;
}

export default function SignUpPage({ onSignUp, goToLogin }: Props) {
    return(
        <SignUpBox
            onSignUp={onSignUp}
            onGoToLogin={goToLogin}
            />
    );
}