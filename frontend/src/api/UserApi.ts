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
