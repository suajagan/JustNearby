export default function LogoutButton() {

    function logout() {
        const host =
            window.location.host === "localhost:5173"
                ? "http://localhost:8080"
                : window.location.origin;

        window.open(host + "/logout", "_self");
    }

    return (
        <button className="primary-btn" onClick={logout}>
            Logout
        </button>
    );
}
