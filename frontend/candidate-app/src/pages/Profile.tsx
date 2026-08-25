import { useEffect, useState, type ReactNode } from "react";
import { FaGithub, FaLinkedin,  FaMailBulk, FaPhoneAlt   } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import {
  getMyProfile,
  type UserProfile,
} from "../services/user.api";

/**
 * Candidate profile page.
 *
 * For this first version we are only READing the profile.
 *
 * Editing, avatar upload and resume management will be
 * added in the next steps.
 */
export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the logged-in candidate's profile
   * when the page is opened.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyProfile();

        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch candidate profile:", error);

        setError(
          "Unable to load your profile. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-8">
          <p className="text-sm text-[#918A82]">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error state.
   */
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
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ") || "Candidate";

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

      <section>
        <p className="text-sm font-medium text-[#B9674B]">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EDE4]">
          Your Profile
        </h1>

        <p className="mt-2 text-sm text-[#918A82]">
          Manage your personal and professional information.
        </p>
      </section>

      {/* =====================================================
          PROFILE HEADER CARD
      ===================================================== */}

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}

          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#B9674B] text-2xl font-semibold text-[#F8F3EC]">
            {initials}
          </div>

          {/* Basic information */}

          <div className="min-w-0">
            <h2 className="text-2xl font-semibold text-[#F2EDE4]">
              {fullName}
            </h2>

            {profile.headline && (
              <p className="mt-1 text-sm text-[#B7AFA6]">
                {profile.headline}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#817A72]">
              {profile.email && (
                <span className="flex items-center gap-2">
                  <FaMailBulk className="h-4 w-4" />
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

          <p className="mt-1 text-sm text-[#817A72]">
            Your basic personal details.
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <ProfileField
            label="First Name"
            value={profile.firstName}
          />

          <ProfileField
            label="Last Name"
            value={profile.lastName}
          />

          <ProfileField
            label="Username"
            value={
              profile.username
                ? `@${profile.username}`
                : null
            }
          />

          <ProfileField
            label="Phone"
            value={profile.phone}
            icon={<FaPhoneAlt className="h-4 w-4" />}
          />

          <ProfileField
            label="Email"
            value={profile.email}
            icon={<FaMailBulk className="h-4 w-4" />}
          />

          <ProfileField
            label="Location"
            value={profile.location}
            icon={<IoLocationSharp className="h-4 w-4" />}
          />
        </div>
      </section>

      {/* =====================================================
          PROFESSIONAL INFORMATION
      ===================================================== */}

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917]">
        <div className="border-b border-[#2F2B27] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#F2EDE4]">
            Professional Information
          </h2>

          <p className="mt-1 text-sm text-[#817A72]">
            Information that helps recruiters understand
            your professional background.
          </p>
        </div>

        <div className="space-y-6 p-6">
          <ProfileField
            label="Professional Headline"
            value={profile.headline}
          />

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#706A63]">
              Bio
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#C8C0B7]">
              {profile.bio || "No bio added yet."}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <ProfileLink
              label="GitHub"
              value={profile.github}
              icon={<FaGithub className="h-4 w-4" />}
            />

            <ProfileLink
              label="LinkedIn"
              value={profile.linkedin}
              icon={<FaLinkedin className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          RESUME
      ===================================================== */}

      <section className="rounded-2xl border border-[#2F2B27] bg-[#1B1917]">
        <div className="border-b border-[#2F2B27] px-6 py-5">
          <h2 className="text-lg font-semibold text-[#F2EDE4]">
            Resume
          </h2>

          <p className="mt-1 text-sm text-[#817A72]">
            Your resume will be used for interview preparation
            and future AI-powered features.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#E5DED5]">
              {profile.resumeFileId
                ? "Resume uploaded"
                : "No resume uploaded"}
            </p>

            <p className="mt-1 text-xs text-[#817A72]">
              {profile.resumeFileId
                ? "Your current resume is stored securely."
                : "Upload your latest resume to complete your profile."}
            </p>
          </div>

          <button
            type="button"
            className="cursor-pointer rounded-lg border border-[#4A4039] px-4 py-2.5 text-sm font-medium text-[#D7CFC5] transition hover:border-[#B9674B] hover:bg-[#B9674B]/10 hover:text-[#F2EDE4]"
          >
            {profile.resumeFileId
              ? "Replace Resume"
              : "Upload Resume"}
          </button>
        </div>
      </section>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string | null;
  icon?: ReactNode;
}

function ProfileField({
  label,
  value,
  icon,
}: ProfileFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#706A63]">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {icon && (
          <span className="text-[#817A72]">
            {icon}
          </span>
        )}

        <p className="text-sm text-[#D7CFC5]">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

/* =============================================================
   PROFILE LINK
============================================================= */

interface ProfileLinkProps {
  label: string;
  value: string | null;
  icon: ReactNode;
}

function ProfileLink({
  label,
  value,
  icon,
}: ProfileLinkProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#706A63]">
        {label}
      </p>

      {value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-2 text-sm text-[#C47A5E] transition hover:text-[#D98260]"
        >
          {icon}
          <span className="truncate">
            {value}
          </span>
        </a>
      ) : (
        <p className="mt-2 text-sm text-[#817A72]">
          Not provided
        </p>
      )}
    </div>
  );
}