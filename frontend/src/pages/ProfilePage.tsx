import { useEffect, useState } from "react";
import {
    getMyProfile,
    updateMyProfile,
    type ProfileResponse,
    type ProfileUpdateRequest,
} from "../api/profileApi";

/* -------------------------------
   AVAILABLE ROLES
-------------------------------- */
const AVAILABLE_ROLES = [
    "HANDYMAN",
    "ELECTRICIAN",
    "PLUMBER",
    "GARDENER",
    "CLEANER",
    "PET_SITTER",
    "TUTOR",
    "IT_SUPPORT",
    "DOCTOR",
    "BABYSITTER",
] as const;

type Role = (typeof AVAILABLE_ROLES)[number];

function formatRole(role: string) {
    return role
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

/* -------------------------------
   FORM STATE
-------------------------------- */
type ProfileFormState = {
    phoneNumber?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        pincode?: string;
    };
    bio?: string;
    roles?: string[]; // backend expects array; we store single-select as [role]
    profileImageUrl?: string;
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [form, setForm] = useState<ProfileFormState>({});
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* -------------------------------
       LOAD PROFILE
    -------------------------------- */
    useEffect(() => {
        getMyProfile()
            .then((data) => {
                setProfile(data);
                setForm({
                    phoneNumber: data.phoneNumber,
                    address: data.address ? { ...data.address } : undefined,
                    bio: data.bio,
                    roles: data.roles,
                    profileImageUrl: data.profileImageUrl,
                });
            })
            .catch(() => setError("Failed to load profile"))
            .finally(() => setLoading(false));
    }, []);

    /* -------------------------------
       HANDLERS
    -------------------------------- */
    const handleChange = <K extends keyof ProfileFormState>(
        field: K,
        value: ProfileFormState[K]
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (
        field: keyof NonNullable<ProfileFormState["address"]>,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            address: {
                ...(prev.address ?? {}),
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            const payload: ProfileUpdateRequest = {
                phoneNumber: form.phoneNumber,
                bio: form.bio,
                roles: form.roles,
                profileImageUrl: form.profileImageUrl,
                address:
                    form.address &&
                    form.address.street &&
                    form.address.city &&
                    form.address.pincode
                        ? {
                            street: form.address.street,
                            city: form.address.city,
                            pincode: form.address.pincode,
                            state: form.address.state ?? "",
                        }
                        : undefined,
            };

            const updated = await updateMyProfile(payload);
            setProfile(updated);
            setEditing(false);
        } catch {
            setError("Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!profile) return null;

    const selectedRole = (form.roles?.[0] ?? "") as Role | "";

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div>
                    <h2>My Profile</h2>
                    <p className="profile-subtitle">
                        Manage your contact details and your role.
                    </p>
                </div>

                {!editing && (
                    <button className="primary-btn" onClick={() => setEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-info">
                <div className="profile-info-item">
                    <div className="label">Name</div>
                    <div className="value">{profile.name}</div>
                </div>

                <div className="profile-info-item">
                    <div className="label">Email</div>
                    <div className="value">{profile.email}</div>
                </div>

                <div className="profile-info-item">
                    <div className="label">Status</div>
                    <div className={`value badge ${profile.profileComplete ? "ok" : "warn"}`}>
                        {profile.profileComplete ? "Complete" : "Incomplete"}
                    </div>
                </div>
            </div>

            {!editing && (
                <div className="profile-view">
                    <div className="profile-view-left">
                        {profile.profileImageUrl ? (
                            <img
                                src={profile.profileImageUrl}
                                alt="Profile"
                                className="profile-image-preview"
                            />
                        ) : (
                            <div className="profile-image-placeholder">No image</div>
                        )}
                    </div>

                    <div className="profile-view-right">
                        <div className="profile-view-row">
                            <div className="label">Phone</div>
                            <div className="value">{profile.phoneNumber || "-"}</div>
                        </div>

                        <div className="profile-view-row">
                            <div className="label">Role</div>
                            <div className="value">
                                {profile.roles?.length ? formatRole(profile.roles[0]) : "-"}
                            </div>
                        </div>

                        <div className="profile-view-row">
                            <div className="label">Bio</div>
                            <div className="value">{profile.bio || "-"}</div>
                        </div>
                    </div>
                </div>
            )}

            {editing && (
                <div className="profile-edit-grid">
                    {/* LEFT: IMAGE */}
                    <div className="profile-image-section">
                        <h3>Profile Picture</h3>
                        <p className="muted">Optional. This will appear in your header avatar.</p>

                        {form.profileImageUrl ? (
                            <img
                                src={form.profileImageUrl}
                                alt="Profile"
                                className="profile-image-preview"
                            />
                        ) : (
                            <div className="profile-image-placeholder">No image selected</div>
                        )}

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const result = reader.result;
                                    if (typeof result === "string") {
                                        handleChange("profileImageUrl", result);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                    </div>

                    <div className="profile-form">
                        <label>
                            Phone Number
                            <input
                                value={form.phoneNumber ?? ""}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                placeholder="e.g. +49 123 456789"
                            />
                        </label>

                        <label>
                            Street
                            <input
                                value={form.address?.street ?? ""}
                                onChange={(e) => handleAddressChange("street", e.target.value)}
                                placeholder="Street name"
                            />
                        </label>

                        <label>
                            City
                            <input
                                value={form.address?.city ?? ""}
                                onChange={(e) => handleAddressChange("city", e.target.value)}
                                placeholder="City"
                            />
                        </label>

                        <label>
                            Pincode
                            <input
                                value={form.address?.pincode ?? ""}
                                onChange={(e) => handleAddressChange("pincode", e.target.value)}
                                placeholder="Postal code"
                            />
                        </label>

                        <label className="role-field">
                            Role
                            <select
                                value={selectedRole}
                                onChange={(e) => {
                                    const value = e.target.value as Role | "";
                                    handleChange("roles", value ? [value] : []);
                                }}
                            >
                                <option value="">Select a role</option>
                                {AVAILABLE_ROLES.map((role) => (
                                    <option key={role} value={role}>
                                        {formatRole(role)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="bio-field">
                            Bio
                            <textarea
                                value={form.bio ?? ""}
                                onChange={(e) => handleChange("bio", e.target.value)}
                                placeholder="Tell neighbors a bit about you…"
                                rows={4}
                            />
                        </label>

                        <div className="profile-actions">
                            <button className="primary-btn" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </button>

                            <button
                                onClick={() => setEditing(false)}
                                disabled={saving}
                                className="secondary-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
