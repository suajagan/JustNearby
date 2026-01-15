import axios from "axios";

axios.defaults.withCredentials = true;


export const loadUser = () => {
    return axios.get("/api/auth/me")
        .then(res => res.data)
        .catch(() => null);
};


export const checkUserExists = (email: string) => {
    return axios.get(`/api/auth/exists?email=${email}`)
        .then(res => res.data);
};

export type UserCardResponse = {
    id: string;
    name: string;
    email: string;
    city: string | null;
    profileImageUrl: string | null;
};

export const getNearbyUsers = () => {
    return axios.get<UserCardResponse[]>("/api/users/nearby")
        .then(res => res.data);
};
