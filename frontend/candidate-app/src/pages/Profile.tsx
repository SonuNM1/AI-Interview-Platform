import { useEffect, useState, type ReactNode } from "react";
import { FaGithub, FaLinkedin, FaPhoneAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { IoIosMail } from "react-icons/io";
import { FiCamera } from "react-icons/fi";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadResume,
  getFileSignedUrl,
  getFileMetadata,
  type UserProfile,
  type UpdateUserProfileData,
} from "../services/user.api";
import { toast } from "sonner";
import axios from "axios";

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [resumeFileName, setResumeFileName] = useState<string | null>(null) ; // stores the original filename of the uploaded resume 
  const [resumeFileType, setResumeFileType] = useState<string | null>(null) ; 

  const [formData, setFormData] = useState<UpdateUserProfileData>({});

  const handleFieldChange = (
    field: keyof UpdateUserProfileData,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fetch the logged-in candidate's profile when the page is opened.

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyProfile();

        setProfile(data);

        // fetch resume metadata separately because the user profile only stores the resume file ID, not the original filename 

        if(data.resumeFileId) {
          try {
            const resumeFile = await getFileMetadata(data.resumeFileId) ; 

            setResumeFileName(resumeFile.originalName) ; 
            setResumeFileType(resumeFile.extension.toLowerCase())
          } catch (error) {
            console.error("Failed to load resume metadata: ", error) ; 

            setResumeFileName(null) ; 
          } 
        } else {
          setResumeFileName(null) ;
          setResumeFileType(null) ; 
        }

        if (data.avatarFileId) {
          try {
            const url = await getFileSignedUrl(data.avatarFileId);

            setAvatarUrl(url);
          } catch (error) {
            console.error("Failed to load avatar: ", error);

            setAvatarUrl(null);
          }
        } else {
          setAvatarUrl(null);
        }

        setFormData({
          username: data.username ?? "",
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
          headline: data.headline ?? "",
          location: data.location ?? "",
          bio: data.bio ?? "",
          github: data.github ?? "",
          linkedin: data.linkedin ?? "",
        });
      } catch (error) {
        console.error("Failed to fetch candidate profile:", error);

        setError("Unable to load your profile. Please try again.");

        toast.error("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image");

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB");
      event.target.value = "";
      return;
    }

    try {
      setAvatarUploading(true);

      const updatedProfile = await uploadAvatar(file);
      setProfile(updatedProfile);

      if (updatedProfile.avatarFileId) {
        const url = await getFileSignedUrl(updatedProfile.avatarFileId);

        setAvatarUrl(url);
      }

      toast.success("Profile picture updated successfully.");
    } catch (error) {
      console.error("Failed to upload avatar: ", error);

      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const handleResumeUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");

      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      setResumeUploading(true);

      const updatedProfile = await uploadResume(file);

      setProfile(updatedProfile);

      // fetch the new resume's filename after the upload. The profile only stores the file ID

      if(updatedProfile.resumeFileId) {
        const resumeFile = await getFileMetadata(updatedProfile.resumeFileId) ; 

        setResumeFileName(resumeFile.originalName)
        setResumeFileType(resumeFile.extension.toLowerCase())
      }

      toast.success(
        updatedProfile.resumeFileId
          ? "Resume uploaded successfully"
          : "Resume updated successfully",
      );
    } catch (error) {
      console.error("Failed to upload resume: ", error);

      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setResumeUploading(false);
      event.target.value = "";
    }
  };

  // generate a temporary signed URL for the private resume and open the resume in a new browser tab 

  const handleResumeOpen = async () => {
    if(!profile?.resumeFileId) return ; 

    try {
      const url = await getFileSignedUrl(profile.resumeFileId) ; 

      window.open(url, "_blank", "noopener, noreferrer") ; 
    } catch (error) {
      console.error("Failed to open resume: ", error) ; 

      toast.error("Unable to open resume. Please try again")
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true);

      const updatedProfile = await updateMyProfile(formData);

      setProfile(updatedProfile);

      setFormData({
        username: updatedProfile.username ?? "",
        firstName: updatedProfile.firstName ?? "",
        lastName: updatedProfile.lastName ?? "",
        phone: updatedProfile.phone ?? "",
        headline: updatedProfile.headline ?? "",
        location: updatedProfile.location ?? "",
        bio: updatedProfile.bio ?? "",
        github: updatedProfile.github ?? "",
        linkedin: updatedProfile.linkedin ?? "",
      });

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile: ", error);

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error(error.response.data?.message ?? "Username already taken");
      } else {
        toast.error("Failed to update your profile. Please try again");
      }
    } finally {
      setSaving(false);
    }
  };

  // Loading state.

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-8">
          <p className="text-sm text-[#918A82]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  //Error state.

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-[#3A2C28] bg-[#1B1917] p-8">
          <h1 className="text-lg font-semibold text-[#F2EDE4]">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-[#918A82]">
            {error ?? "We could not find your profile."}
          </p>
        </div>
      </div>
    );
  }

  const fullName =
    [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
    "Candidate";

  /**
   * Generate initials for the avatar placeholder.
   */
  const initials =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .map((name) => name?.charAt(0).toUpperCase())
      .join("") || "C";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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
                disabled={saving}
                className="cursor-pointer rounded-lg bg-[#B9674B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#A85C42] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
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
              {avatarUrl ? (
                <img
                  src={avatarUrl}
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
              {avatarUploading ? (
                <span className="text-xs">
                  ...
                </span>
              ): (
                <FiCamera className="h-4 w-4"/>
              )}
            </label>

            <input
              id="avatar-upload"
              type="file"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={avatarUploading}
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

      {/* =====================================================
          PERSONAL INFORMATION
      ===================================================== */}

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

            <button type="button" onClick={handleResumeOpen} className="flex min-w-0 items-center gap-4 text-left transition hover:opacity-80 cursor-pointer">

              {/* file type indicator */}

              <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-md bg-[#D71920] text-sm font-bold text-white">
                {resumeFileType === ".pdf" ? "PDF" : resumeFileType === ".doc" ? "DOC": resumeFileType === ".docx" ? "DOCX": "FILE"} 
              </div>

              {/* resume filename */}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#F2EDE4]">
                  {resumeFileName ?? "Resume"}
                </p>
                <p className="mt-1 text-xs text-[#817A72]">
                  Click to open resume 
                </p>
              </div>
            </button>

            {/* replace resume button */}

            <label htmlFor="resume-upload" className="shrink-0 cursor-pointer rounded-lg border border-[#484039] px-5 py-3 text-sm font-medium text-[#F2EDE4] transition hover:bg-[#24211E]">
              {resumeUploading ? "Uploading..." : "Upload Resume "}
            </label>

            {/* hidden file input */}

            <input id="resume-upload" type="file" accept=".pdf, .doc, .docx" className="hidden" onChange={handleResumeOpen} disabled={resumeUploading} />
          </div>
        ): (

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

            <label htmlFor="resume-upload" className="cursor-pointer rounded-lg bg-[#B9674B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#A85C42]">
              {resumeUploading ? "Uploading..." : "Upload Resume"}
            </label>

            {/* hidden file input */}

            <input id="resume-upload" type="file" accept=".pdf, .doc, .docx" className="hidden" onChange={handleResumeUpload} disabled={resumeUploading}/>
          </div>
        )}
      </section>
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
