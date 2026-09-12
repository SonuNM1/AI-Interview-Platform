import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaGithub, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FiCamera, FiLogOut } from "react-icons/fi";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadResume,
  getFileSignedUrl,
  getFileMetadata,
  requestAccountDeletion,
  verifyAccountDeletion,
  type UpdateUserProfileData,
} from "../services/user.api";
import { toast } from "sonner";
import { AccountDeletionModal } from "../components/AccountDeletionModal";

export function Profile() {
  const queryClient = useQueryClient(); // access tanstack cache so we can invalidate server data after profile changes

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserProfileData>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch the authenticated candidate's profile. TanStack Query handles loading, caching, errors, refetching and keeping the server state available
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  // Updates the candidate profile on the server. After success, the profile query is invalidated so TanStack Query fetches the latest saved profile
  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile, // sends the edited profile data to the backend

    // the backend profile is now changed, so the cached profile may contain old data
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      setIsEditing(false);

      toast.success("Profile updated successfully.");
    },

    onError: (error) => {
      console.error("Failed to update profile: ", error);

      toast.error("Failed to update profile.");
    },
  });

  // uploads a new profile avatar and refreshes the profile query so the new avatarField is available
  const avatarMutation = useMutation({
    mutationFn: uploadAvatar, // uploads the new avatar and updates the user's avatarFileId

    // the profile now contains a new avatarFileId so refresh the cached profile
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      toast.success("Profile picture updated successfully.");
    },

    onError: (error) => {
      console.error("Failed to upload avatar: ", error);

      toast.error("Failed to update profile picture.");
    },
  });

  // requests an OTP before allowing the candidate to delete the account
  const requestDeletionMutation = useMutation({
    mutationFn: requestAccountDeletion,

    onSuccess: () => {
      setIsDeleteModalOpen(true);
      toast.success("Verification OTP sent to your mail.");
    },

    onError: (error: any) => {
      console.error("Account deletion request failed: ", error);

      toast.error(
        error?.response?.data?.message || "Failed to send account deletion OTP",
      );
    },
  });

  // Verifies the OTP and completes account deletion
  const verifyDeletionMutation = useMutation({
    mutationFn: verifyAccountDeletion,

    onSuccess: async () => {
      setIsDeleteModalOpen(false);

      toast.success("Your account has been deleted.");

      // Authentication is owned by the Shell.
      await window.__AUTH_BRIDGE__?.logout();
    },

    onError: (error: any) => {
      console.error("Account deletion verification failed:", error);

      toast.error(error?.response?.data?.message || "Invalid or expired OTP.");
    },
  });

  // generate a temporary signed URL for the private avatar. the query only runs when an avatar exists
  const avatarUrlQuery = useQuery({
    queryKey: ["file-signed-url", profile?.avatarFileId],
    queryFn: () => getFileSignedUrl(profile!.avatarFileId!),
    enabled: !!profile?.avatarFileId,
  });

  // Fetch resume metadata so the UI can display the actual uploaded filename and file type
  const resumeMetadataQuery = useQuery({
    queryKey: ["file-metadata", profile?.resumeFileId],
    queryFn: () => getFileMetadata(profile!.resumeFileId!),
    enabled: !!profile?.resumeFileId,
  });

  const handleFieldChange = (
    field: keyof UpdateUserProfileData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ask the shell to handle logout - The candidate MFE doesn't call the logout API directly
  const handleLogout = async () => {
    try {
      await window.__AUTH_BRIDGE__?.logout();
    } catch (error) {
      console.error("Logout failed: ", error);

      toast.error("Unable to log out. Please try again.");
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    avatarMutation.mutate(file);

    event.target.value = ""; // allows selecting the same file again later
  };

  const resumeMutation = useMutation({
    mutationFn: uploadResume, // uploads/replaces the candidate's resume

    // the profile now contains the new resumeFileId, so refresh the cached profile
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });

      toast.success("Resume uploaded successfully.");
    },

    onError: (error) => {
      console.error("Failed to upload resume: ", error);

      toast.error("Failed to upload resume.");
    },
  });

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // allow PDF, old word .doc, and modern word .docx
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    resumeMutation.mutate(file);
    event.target.value = "";
  };

  const extension = resumeMetadataQuery.data?.extension?.toLowerCase();

  // generate a temporary signed URL for the private resume and open the resume in a new browser tab
  const handleResumeOpen = async () => {
    if (!profile?.resumeFileId) return;

    try {
      const url = await queryClient.fetchQuery({
        queryKey: ["file-signed-url", profile.resumeFileId],
        queryFn: () => getFileSignedUrl(profile.resumeFileId!),
      });

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open resume:", error);

      toast.error("Unable to open resume.");
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  // Loading state.
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state.
  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error instanceof Error
              ? error.message
              : "We could not find your profile."}
          </p>
        </div>
      </div>
    );
  }

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Candidate";

  /* Generate initials for the avatar placeholder */
  const initials =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((name) => name?.charAt(0).toUpperCase())
      .join("") || "C";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">Account</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Your Profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Manage your personal and professional information
          </p>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);

                  setFormData({
                    username: profile.username ?? "",
                    firstName: profile.firstName ?? "",
                    lastName: profile.lastName ?? "",
                    phone: profile.phone ?? "",
                    headline: profile.headline ?? "",
                    location: profile.location ?? "",
                    bio: profile.bio ?? "",
                    github: profile.github ?? "",
                    linkedin: profile.linkedin ?? "",
                  });
                }}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* Profile header card */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="relative h-24 w-24 shrink-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-semibold text-white">
              {avatarUrlQuery.data ? (
                <img
                  src={avatarUrlQuery.data || undefined}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-violet-600 text-white transition hover:bg-violet-700"
            >
              {avatarMutation.isPending ? (
                <span className="text-xs">...</span>
              ) : (
                <FiCamera className="h-4 w-4" />
              )}
            </label>

            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={avatarMutation.isPending}
            />
          </div>

          {/* Basic information */}
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>

            {profile.headline && (
              <p className="mt-1 text-sm text-slate-500">{profile.headline}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              {profile.email && (
                <span className="flex items-center gap-2">
                  <IoIosMail className="h-4 w-4" />
                  {profile.email}
                </span>
              )}

              {profile.location && (
                <span className="flex items-center gap-2">
                  <IoLocationSharp className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Personal information */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <EditableProfileField
            label="First Name"
            field="firstName"
            value={profile.firstName}
            formValue={formData.firstName}
            editing={isEditing}
            onChange={handleFieldChange}
          />

          <EditableProfileField
            label="Last Name"
            field="lastName"
            value={profile.lastName}
            formValue={formData.lastName}
            editing={isEditing}
            onChange={handleFieldChange}
          />

          <EditableProfileField
            label="Username"
            field="username"
            value={profile.username}
            formValue={formData.username}
            editing={isEditing}
            onChange={handleFieldChange}
          />

          <EditableProfileField
            label="Phone"
            field="phone"
            value={profile.phone}
            formValue={formData.phone}
            editing={isEditing}
            onChange={handleFieldChange}
            icon={<FaPhoneAlt className="h-4 w-4" />}
          />

          <ProfileField
            label="Email"
            value={profile.email}
            icon={<IoIosMail className="h-4 w-4" />}
          />

          <EditableProfileField
            label="Location"
            field="location"
            value={profile.location}
            formValue={formData.location}
            editing={isEditing}
            onChange={handleFieldChange}
            icon={<IoLocationSharp className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* Professional Information */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Professional Information
          </h2>
        </div>

        <div className="space-y-6 p-6">
          <EditableProfileField
            label="Professional Headline"
            field="headline"
            value={profile.headline}
            formValue={formData.headline}
            editing={isEditing}
            onChange={handleFieldChange}
          />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Bio
            </p>

            {isEditing ? (
              <textarea
                value={formData.bio ?? ""}
                onChange={(event) =>
                  handleFieldChange("bio", event.target.value)
                }
                rows={5}
                placeholder="Tell recruiters about yourself..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {profile.bio || "No bio added yet."}
              </p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <EditableProfileField
              label="GitHub"
              field="github"
              value={profile.github}
              formValue={formData.github}
              editing={isEditing}
              onChange={handleFieldChange}
              icon={<FaGithub className="h-4 w-4" />}
            />

            <EditableProfileField
              label="LinkedIn"
              field="linkedin"
              value={profile.linkedin}
              formValue={formData.linkedin}
              editing={isEditing}
              onChange={handleFieldChange}
              icon={<FaLinkedin className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {/* Resume */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">Resume</h2>

          <p className="mt-1 text-sm text-slate-500">
            Your resume will be used for interview preparation and future
            AI-powered features.
          </p>
        </div>

        {profile.resumeFileId ? (
          // resume exists - show the uploaded file
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 p-6">
            {/* clicking the file opens the resume in a new browser tab */}
            <button
              type="button"
              onClick={handleResumeOpen}
              className="flex min-w-0 cursor-pointer items-center gap-4 text-left transition hover:opacity-80"
            >
              {/* file type indicator */}
              <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                {extension === ".pdf"
                  ? "PDF"
                  : extension === ".doc"
                    ? "DOC"
                    : extension === ".docx"
                      ? "DOCX"
                      : "FILE"}
              </div>

              {/* resume filename */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {resumeMetadataQuery.data?.originalName ?? "Resume"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Click to open resume
                </p>
              </div>
            </button>

            {/* replace resume button */}
            <label
              htmlFor="resume-upload"
              className="shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
            >
              {resumeMutation.isPending ? "Uploading..." : "Upload Resume"}
            </label>

            {/* hidden file input */}
            <input
              id="resume-upload"
              type="file"
              accept=".pdf, .doc, .docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={resumeMutation.isPending}
            />
          </div>
        ) : (
          // no resume exists - show the upload state
          <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-100 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                No resume uploaded
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Upload your latest resume to complete your profile
              </p>
            </div>

            {/* upload resume button */}
            <label
              htmlFor="resume-upload"
              className="cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              {resumeMutation.isPending ? "Uploading..." : "Upload Resume"}
            </label>

            {/* hidden file input */}
            <input
              id="resume-upload"
              type="file"
              accept=".pdf, .doc, .docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={resumeMutation.isPending}
            />
          </div>
        )}
      </section>

      {/* Account actions */}
      <div className="flex items-center justify-between pt-2">
        {/* Delete account */}

        <div className="group relative">
          <button
            type="button"
            onClick={() => requestDeletionMutation.mutate()}
            disabled={requestDeletionMutation.isPending}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Delete Account"
          >
            <span className="text-lg leading-none">×</span>

            {requestDeletionMutation.isPending
              ? "Sending OTP..."
              : "Delete Account"}
          </button>

          {/* Delete account tooltip */}
          <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-64 rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg group-hover:block">
            <span className="font-semibold">Delete account:</span> Your account
            will be disabled after OTP verification.
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          <FiLogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Account deletion OTP modal */}
      <AccountDeletionModal
        open={isDeleteModalOpen}
        loading={verifyDeletionMutation.isPending}
        onClose={() => setIsDeleteModalOpen(false)}
        onVerify={(otp) => verifyDeletionMutation.mutate(otp)}
      />
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string | null;
  icon?: ReactNode;
}

function ProfileField({ label, value, icon }: ProfileFieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}

        <p className="text-sm text-slate-700">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

interface EditableProfileFieldProps {
  label: string;
  field: keyof UpdateUserProfileData;
  value: string | null | undefined;
  formValue: string | null | undefined;
  editing: boolean;
  onChange: (field: keyof UpdateUserProfileData, value: string) => void;
  icon?: ReactNode;
}

function EditableProfileField({
  label,
  field,
  value,
  formValue,
  editing,
  onChange,
  icon,
}: EditableProfileFieldProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}

          <input
            value={formValue ?? ""}
            onChange={(event) => onChange(field, event.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}

          <p className="text-sm text-slate-700">{value || "Not provided"}</p>
        </div>
      )}
    </div>
  );
}
