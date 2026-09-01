import {
  Camera,
  Mail,
  MapPin,
  Phone,
  User,
  Pencil,
  Check,
  X,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getFileSignedUrl
} from "../services/user.api";
import axios from "axios";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    headline: "",
    location: "",
    bio: "",
  });

  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
  });

  // fetch the temporary signed URL whenever the recruiter has an avatar 

  const avatarUrlQuery = useQuery({
    queryKey: ["my-profile-avatar", profile?.avatarFileId],
  queryFn: () => getFileSignedUrl(profile!.avatarFileId!),
  enabled: !!profile?.avatarFileId,
  })

  const handleEdit = () => {
    if (!profile) return;

    setForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      username: profile.username ?? "",
      phone: profile.phone ?? "",
      headline: profile.headline ?? "",
      location: profile.location ?? "",
      bio: profile.bio ?? "",
    });

    setIsEditing(true);
  };

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["my-profile"], updatedProfile);

      setIsEditing(false);
      toast.success("Profile updated successfully");
    },

    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Failed to update profile");
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(form);
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,

    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["my-profile"], updatedProfile);

      toast.success("Profile picture updated successfully");
    },

    onError: (error) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      toast.error(message || "Failed to upload profile picture");
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    uploadAvatarMutation.mutate(file);
  };

  const handleLogout = async () => {
    try {
      await window.__AUTH_BRIDGE__?.logout();
    } catch (error) {
      console.error("Logout failed: ", error);

      toast.error("Unable to log out. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-8">
          <p className="text-sm text-[#817A72]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-8">
          <p className="text-sm text-[#D98260]">Failed to load your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Heading */}

      <div className="mb-8">
        <p className="text-sm font-medium text-[#D98260]">Account</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EDE4]">
          Profile
        </h1>

        <p className="mt-2 text-sm text-[#817A72]">
          Manage your recruiter profile and account information.
        </p>
      </div>

      {/* Profile card */}

      <div className="overflow-hidden rounded-2xl border border-[#2F2B27] bg-[#181715]">
        {/* Header */}

        <div className="border-b border-[#2F2B27] px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}

              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#D98260]/10">
                  {profile?.avatarFileId ? (
                    <img
                      src={avatarUrlQuery.data}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User
                      className="h-8 w-8 text-[#D98260]"
                      strokeWidth={1.7}
                    />
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex opacity-80 h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#2F2B27] bg-[#24211E] text-[#A9A29A] transition hover:text-[#F2EDE4]"
                >
                  <Camera className="h-3.5 w-3.5" />

                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadAvatarMutation.isPending}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#F2EDE4]">
                  {profile?.firstName || profile?.lastName
                    ? `${profile.firstName ?? ""} ${
                        profile.lastName ?? ""
                      }`.trim()
                    : "Recruiter"}
                </h2>

                <p className="mt-1 text-sm text-[#817A72]">
                  {profile?.headline || "Recruiter Account"}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#D98260] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#C96F4F]"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={updateProfileMutation.isPending}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2F2B27] px-4 py-2 text-sm text-[#A9A29A] hover:bg-[#24211E]"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#B9674B] px-4 py-2 text-sm font-medium text-white hover:bg-[#A85C42] disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Information */}

        <div className="p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <ProfileField
              label="First Name"
              value={isEditing ? form.firstName : profile?.firstName ?? ""}
              editing={isEditing}
              onChange={(value) =>
                setForm({
                  ...form,
                  firstName: value,
                })
              }
            />

            <ProfileField
              label="Last Name"
              value={isEditing ? form.lastName : profile?.lastName ?? ""}
              editing={isEditing}
              onChange={(value) =>
                setForm({
                  ...form,
                  lastName: value,
                })
              }
            />

            <ProfileField
              label="Username"
              value={isEditing ? form.username : profile?.username ?? ""}
              editing={isEditing}
              onChange={(value) =>
                setForm({
                  ...form,
                  username: value,
                })
              }
            />

            <div>
              <label className="text-xs text-[#6F6962]">Email</label>

              <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5">
                <Mail className="h-4 w-4 text-[#6F6962]" />

                <span className="text-sm text-[#A9A29A]">{profile?.email}</span>
              </div>
            </div>

            <ProfileField
              label="Phone"
              value={isEditing ? form.phone : profile?.phone ?? ""}
              editing={isEditing}
              icon={<Phone className="h-4 w-4" />}
              onChange={(value) =>
                setForm({
                  ...form,
                  phone: value,
                })
              }
            />

            <ProfileField
              label="Location"
              value={isEditing ? form.location : profile?.location ?? ""}
              editing={isEditing}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) =>
                setForm({
                  ...form,
                  location: value,
                })
              }
            />
          </div>

          <div className="mt-6">
            <ProfileField
              label="Headline"
              value={isEditing ? form.headline : profile?.headline ?? ""}
              editing={isEditing}
              onChange={(value) =>
                setForm({
                  ...form,
                  headline: value,
                })
              }
            />
          </div>

          <div className="mt-6">
            <label className="text-xs text-[#6F6962]">Bio</label>

            {isEditing ? (
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm({
                    ...form,
                    bio: event.target.value,
                  })
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none focus:border-[#B9674B]"
              />
            ) : (
              <p className="mt-2 rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-3 text-sm leading-6 text-[#A9A29A]">
                {profile?.bio || "No bio added yet."}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

function ProfileField({
  label,
  value,
  editing,
  onChange,
  icon,
}: ProfileFieldProps) {
  return (
    <div>
      <label className="text-xs text-[#6F6962]">{label}</label>

      <div className="relative mt-2">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6962]">
            {icon}
          </div>
        )}

        <input
          value={value}
          disabled={!editing}
          onChange={(event) => onChange(event.target.value)}
          className={`
            w-full rounded-lg border
            border-[#2F2B27]
            bg-[#211F1C]
            px-3 py-2.5
            text-sm text-[#F2EDE4]
            outline-none
            ${icon ? "pl-10" : ""}
            ${editing ? "focus:border-[#B9674B]" : "cursor-default opacity-80"}
          `}
        />
      </div>
    </div>
  );
}
