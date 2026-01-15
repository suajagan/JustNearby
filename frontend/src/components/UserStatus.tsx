import LogoutButton from "./LogoutButton";

type UserData = {
    [key: string]: unknown;
};

type Props = {
    user: UserData | null | undefined;
};

export default function UserStatus({ user }: Props) {

    if (user === undefined) {
        return <p style={{ textAlign: "center" }}>Loading...</p>;
    }

    if (user === null) {
        return <p style={{ textAlign: "center" }}>Not logged in</p>;
    }

    const name =
        (user["login"] as string) ||
        (user["name"] as string) ||
        "User";

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>Logged in as {name}</p>
            <LogoutButton />
        </div>
    );
}
