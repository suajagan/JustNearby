import axios from "axios";

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type FriendRequestResponse = {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: FriendRequestStatus;
    createdAt: string;
};

export const sendFriendRequest = (toUserId: string) => {
    return axios.post<FriendRequestResponse>("/api/friends/requests", { toUserId })
        .then(res => res.data);
};

export const getIncomingRequests = () => {
    return axios.get<FriendRequestResponse[]>("/api/friends/requests/incoming")
        .then(res => res.data);
};

export const getOutgoingRequests = () => {
    return axios.get<FriendRequestResponse[]>("/api/friends/requests/outgoing")
        .then(res => res.data);
};

export const acceptRequest = (id: string) => {
    return axios.post<FriendRequestResponse>(`/api/friends/requests/${id}/accept`)
        .then(res => res.data);
};

export const rejectRequest = (id: string) => {
    return axios.post<FriendRequestResponse>(`/api/friends/requests/${id}/reject`)
        .then(res => res.data);
};
export const getFriends = () => {
    return axios.get<string[]>("/api/friends")
        .then(res => res.data);
};
