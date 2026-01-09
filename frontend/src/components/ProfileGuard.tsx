import { Navigate } from "react-router-dom";
import type {ProfileResponse} from "../api/profileApi";

type Props = {
    profile: ProfileResponse | null;
    children: React.ReactNode;
};

export default function ProfileGuard({ profile, children }: Props) {
    if (!profile) {
        return <Navigate to="/profile" replace />;
    }

    if (!profile.profileComplete) {
        return <Navigate to="/profile" replace />;
    }

    return <>{children}</>;
}
