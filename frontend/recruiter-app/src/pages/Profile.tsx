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
  getFileSignedUrl,
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
  });

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
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-red-600">
            Failed to load your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Heading */}

      <div className="mb-8">
        <p className="text-sm font-semibold text-violet-600">Account</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage your recruiter profile and account information.
        </p>
      </div>

      {/* Profile card */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}

        <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}

              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-100 to-indigo-100">
                  {profile?.avatarFileId ? (
                    <img
                      src={avatarUrlQuery.data}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User
                      className="h-8 w-8 text-violet-600"
                      strokeWidth={1.7}
                    />
                  )}
                </div>

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-white bg-white text-slate-500 shadow-sm transition-colors hover:bg-violet-50 hover:text-violet-600"
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

              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-slate-900">
                  {profile?.firstName || profile?.lastName
                    ? `${profile.firstName ?? ""} ${
                        profile.lastName ?? ""
                      }`.trim()
                    : "Recruiter"}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {profile?.headline || "Recruiter Account"}
                </p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:shadow-violet-200"
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
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
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
              value={isEditing ? form.firstName : (profile?.firstName ?? "")}
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
              value={isEditing ? form.lastName : (profile?.lastName ?? "")}
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
              value={isEditing ? form.username : (profile?.username ?? "")}
              editing={isEditing}
              onChange={(value) =>
                setForm({
                  ...form,
                  username: value,
                })
              }
            />

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <Mail className="h-4 w-4 text-slate-400" />

                <span className="truncate text-sm text-slate-600">
                  {profile?.email}
                </span>
              </div>
            </div>

            <ProfileField
              label="Phone"
              value={isEditing ? form.phone : (profile?.phone ?? "")}
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
              value={isEditing ? form.location : (profile?.location ?? "")}
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
              value={isEditing ? form.headline : (profile?.headline ?? "")}
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
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Bio
            </label>

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
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            ) : (
              <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
                {profile?.bio || "No bio added yet."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account actions */}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
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
      <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </label>

      <div className="relative mt-2">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          value={value}
          disabled={!editing}
          onChange={(event) => onChange(event.target.value)}
          className={`
            w-full rounded-xl border
            border-slate-200
            bg-slate-50
            px-3 py-2.5
            text-sm text-slate-900
            outline-none
            transition-colors
            ${icon ? "pl-10" : ""}
            ${
              editing
                ? "focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                : "cursor-default opacity-80"
            }
          `}
        />
      </div>
    </div>
  );
}