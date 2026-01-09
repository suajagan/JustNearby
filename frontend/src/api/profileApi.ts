import axios from "axios";

export type Address = {
    street: string;
    city: string;
    state: string;
    pincode:string;
};

export type ProfileResponse={
    name: string;
    email: string;
    phoneNumber: string;
    address?: Address;
    bio?: string;
    roles?: string[];
    profileImageUrl?: string;
    profileComplete: boolean;
};

export type ProfileUpdateRequest = {
    phoneNumber?: string;
    address?: Address;
    bio?: string;
    roles?: string[];
    profileImageUrl?: string;
};


export type ProfileFormState = {
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    bio?: string;
    roles?: string[];
    profileImageUrl?: string;
};


export const getMyProfile = async (): Promise<ProfileResponse> =>{
    const res = await  axios.get("api/profile/me");
    return res.data;
}

export const updateMyProfile = async (
    data: ProfileUpdateRequest
): Promise<ProfileResponse> => {
    const res = await axios.put("/api/profile/me", data);
    return res.data;
};

