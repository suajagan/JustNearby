import type {ProfileResponse} from "../api/profileApi";

export function getProfileCompletion(profile: ProfileResponse): number {
    let score = 0;
    if (profile.phoneNumber) score += 25;
    if (profile.address) score += 25;
    if (profile.bio) score += 25;
    if (profile.roles && profile.roles.length > 0) score += 25;
    return score;
}
