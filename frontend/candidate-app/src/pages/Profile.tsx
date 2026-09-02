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

    onSuccess: ()=> {
      setIsDeleteModalOpen(true) ; 
      toast.success("Verification OTP sent to your mail.")
    },

    onError: (error: any) => {
      console.error("Account deletion request failed: ", error) ; 

      toast.error(error?.response?.data?.message || "Failed to send account deletion OTP")
    }
  })

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

    toast.error(
      error?.response?.data?.message ||
        "Invalid or expired OTP.",
    );
     },
});

  // generate a temporary signed URL for the private avatar. The query only runs when an avatar exists

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
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // browser's MIME type for a .docx word document
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
        <div className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-8">
          <p className="text-sm text-[#918A82]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  //Error state.

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-[#3A2C28] bg-[#1B1917] p-8">
          <h1 className="text-lg font-semibold text-[#F2EDE4]">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-[#918A82]">
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
      {/* page header */}

      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#B9674B]">Account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EDE4]">
            Your Profile
          </h1>

          <p>Manage your personal and professional information</p>
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
                className="cursor-pointer rounded-lg border border-[#3A3530] px-4 py-2.5 text-sm font-medium text-[#B7AFA6] transition hover:bg-[#24211E] hover:text-[#F2EDE4]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="cursor-pointer rounded-lg bg-[#B9674B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer rounded-lg bg-[#B9674B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#A85C42]"
            >
              Edit Profile
            </button>
          )}
        </div>
      </section>

      {/* Profile header card */}

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}

          <div className="relative h-24 w-24 shrink-0">
            <div className="flex h-24 w-24 overflow-hidden items-center justify-center rounded-full bg-[#B9674B] text-2xl font-semibold text-[#F8F3EC]">
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
              className="absolute bottom-0 right-0
      flex h-8 w-8 cursor-pointer
      items-center justify-center
      rounded-full
      border-2 border-[#1B1917]
      bg-[#B9674B]
      text-white
      transition
      hover:bg-[#A85C42]"
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
            <h2 className="text-2xl font-semibold text-[#F2EDE4]">
              {fullName}
            </h2>

            {profile.headline && (
              <p className="mt-1 text-sm text-[#B7AFA6]">{profile.headline}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#817A72]">
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

      {/* personal information */}

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917]">
        <div className="border-b border-[#2F2B27] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#F2EDE4]">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-[#817A72]"></p>
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

      {/* Profile Information */}

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917]">
        <div className="border-b border-[#2F2B27] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#F2EDE4]">
            Professional Information
          </h2>

          <p className="mt-1 text-sm text-[#817A72]"></p>
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
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#706A63]">
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
                className="mt-2 w-full resize-none rounded-lg border border-[#3A3530] bg-[#201E1B] p-3 text-sm text-[#F2EDE4] outline-none focus:border-[#B9674B]"
              />
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#C8C0B7]">
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

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917]">
        <div className="border-b border-[#2F2B27] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#F2EDE4]">Resume</h2>

          <p className="mt-1 text-sm text-[#817A72]">
            Your resume will be used for interview preparation and future
            AI-powered features.
          </p>
        </div>

        {profile.resumeFileId ? (
          // resume exists - show the uploaded file

          <div className="flex items-center justify-between gap-4 border-t border-[#2F2B27] p-6">
            {/* clicking the file opens the resume in a new browser tab */}

            <button
              type="button"
              onClick={handleResumeOpen}
              className="flex min-w-0 items-center gap-4 text-left transition hover:opacity-80 cursor-pointer"
            >
              {/* file type indicator */}

              <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-md bg-[#D71920] text-sm font-bold text-white">
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
                <p className="truncate text-sm font-medium text-[#F2EDE4]">
                  {resumeMetadataQuery.data?.originalName ?? "Resume"}
                </p>
                <p className="mt-1 text-xs text-[#817A72]">
                  Click to open resume
                </p>
              </div>
            </button>

            {/* replace resume button */}

            <label
              htmlFor="resume-upload"
              className="shrink-0 cursor-pointer rounded-lg border border-[#484039] px-5 py-3 text-sm font-medium text-[#F2EDE4] transition hover:bg-[#24211E]"
            >
              {resumeMutation.isPending ? "Uploading..." : "Upload Resume "}
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

          <div className="flex items-center justify-between gap-4 border-t border-[#2F2B27] p-6">
            <div>
              <h3 className="text-sm font-semibold text-[#F2EDE4]">
                No resume uploaded
              </h3>
              <p className="mt-1 text-sm text-[#817A72]">
                Upload your latest resume to complete your profile
              </p>
            </div>

            {/* upload resume button */}

            <label
              htmlFor="resume-upload"
              className="cursor-pointer rounded-lg bg-[#B9674B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#A85C42]"
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

      {/* logout */}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
        >
          <FiLogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

        {/* Account actions */}
<div className="space-y-4 pt-2">
  {/* Delete account */}
  <div className="flex flex-col gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h3 className="text-sm font-semibold text-[#F2EDE4]">
        Delete account
      </h3>

      <p className="mt-1 text-sm text-[#817A72]">
        Your account will be disabled after OTP verification.
      </p>
    </div>

    <button
      type="button"
      onClick={() => requestDeletionMutation.mutate()}
      disabled={requestDeletionMutation.isPending}
      className="shrink-0 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {requestDeletionMutation.isPending
        ? "Sending OTP..."
        : "Delete Account"}
    </button>
  </div>

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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#706A63]">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {icon && <span className="text-[#817A72]">{icon}</span>}

        <p className="text-sm text-[#D7CFC5]">{value || "Not provided"}</p>
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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#706A63]">
        {label}
      </p>

      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          {icon && <span className="text-[#817A72]">{icon}</span>}

          <input
            value={formValue ?? ""}
            onChange={(event) => onChange(field, event.target.value)}
            className="h-10 w-full rounded-lg border border-[#3A3530] bg-[#201E1B] px-3 text-sm text-[#F2EDE4] outline-none transition focus:border-[#B9674B]"
          />
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          {icon && <span className="text-[#817A72]">{icon}</span>}

          <p className="text-sm text-[#D7CFC5]">{value || "Not provided"}</p>
        </div>
      )}
    </div>
  );
}
