import { Camera, LogOut, Mail, MapPin, Phone, Save } from "lucide-react";
import { toast } from "sonner";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  getMyProfile,
  getFileSignedUrl,
  updateMyAvatar,
  updateMyProfile,
  type MentorUserProfile,
} from "../services/mentor.api";

export default function Profile() {

  const [profile, setProfile] = useState<MentorUserProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null) ; // temporary signed URL used to display the private avatar stored in the File Service/S3

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    headline: "",
    location: "",
    bio: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();

        setProfile(data);

        // if an avatar exists, ask the File Service for a temporary signed URL so the browser can display the private image 

        if(data.avatarFileId) {
          try {

            const signedUrl = await getFileSignedUrl(data.avatarFileId) ; 

            setAvatarUrl(signedUrl) ; 
          } catch (error) {
            console.error("Failed to load profile avatar: ", error) ; 

            toast.error("Unable to load your profile picture.") ; 
          } 
        }

        setForm({
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
        console.error("Failed to load profile:", error);

        // tell the mentor immediately that profile loading failed

        toast.error("Unable to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);

    const toastId = toast.loading("Saving your profile..."); // give immediate feedback while the API request is running

    try {
      const updatedProfile = await updateMyProfile(form); // update the mentor's normal user profile

      setProfile(updatedProfile);

      toast.success("Profile updated successfully.", {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);

      // show an actionable error instead of failing silently

      toast.error("Failed to update your profile. Please try again.", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // get the first selected image

    if (!file) return;

    // prevent obviously invalid uploads on the frontend

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    // keep the avatar reasonably small before uploading

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 5MB");
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    const toastId = toast.loading("Uploading profile photo..."); // Show upload progress through a loading toast.

    try {
      const updatedProfile = await updateMyAvatar(file);

      setProfile(updatedProfile);

      // fetch a fresh signed URL for the newly uploaded private avatar 

      if (updatedProfile.avatarFileId) {
        const signedUrl = await getFileSignedUrl(updatedProfile.avatarFileId)

        setAvatarUrl(signedUrl) ;
      } else {
        setAvatarUrl(null) ; // clear the displayed avatar if the backend no longer has oe 
      }

      // replace loading state with success feedback 

      toast.success("Profile photo updated successfully.", {
        id: toastId 
      })
    } catch (error) {
      console.error("Failed to update avatar:", error);

      // tell the mentor upload failed 

      toast.error("Failed to upload profile photo. Please try again.", {
        id: toastId 
      })
    } finally {
      setUploadingAvatar(false);

      event.target.value = "";
    }
  };

  const handleLogout = async () => {
    try {
      await window.__AUTH_BRIDGE__?.logout(); // ask the shell to clear the authenticated session 

      toast.success("Logged out successfully.") ; // let the mentor know logout was triggered successfully 
    } catch (error) {
      console.error("Failed to logout: ", error) ; 
      
      toast.error("Failed to logout. Please try again.")
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-3xl border border-red-100 bg-white p-8 text-red-600 shadow-sm">
        Unable to load your profile.
      </div>
    );
  }

  const initials =
    `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`
      .trim()
      .toUpperCase() || "M";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-medium text-violet-600">Account</p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Your Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Keep your mentor profile updated so candidates know who they are
          learning from.
        </p>
      </div>

      {/* Profile hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 p-8 text-white shadow-xl shadow-violet-200">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-white text-3xl font-bold text-violet-600 shadow-xl">
            {avatarUrl ? (
              // displaying the temporary signed S3 URL returned by the file service 

              <img
                src={avatarUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              initials
            )}
            </div>

            <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg transition hover:scale-105">
              <Camera size={17} />

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {profile.firstName || "Mentor"} {profile.lastName || ""}
            </h2>

            <p className="mt-1 text-sm text-white/80">
              {profile.headline || "Mentor at AI Interview Platform"}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <Mail size={14} />
                {profile.email}
              </span>

              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleSave}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="mb-7">
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the information candidates will see on your profile.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              First name
            </label>

            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Last name
            </label>

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Username
            </label>

            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>

            <div className="relative mt-2">
              <Phone
                size={16}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Professional headline
            </label>

            <input
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="Senior Full Stack Developer & Technical Mentor"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Location
            </label>

            <div className="relative mt-2">
              <MapPin
                size={16}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Delhi, India"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              About you
            </label>

            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={5}
              placeholder="Tell candidates about your experience and what you can help them with..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Social links */}
        <div className="mt-8 border-t border-slate-100 pt-7">
          <h3 className="font-semibold text-slate-900">Professional Links</h3>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="relative">
              <FaGithub
                size={17}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="GitHub profile"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div className="relative">
              <FaLinkedin
                size={17}
                className="absolute left-4 top-3.5 text-slate-400"
              />

              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn profile"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.01] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Logout */}
      <div className="rounded-3xl border border-red-100 bg-red-50/60 p-6">
        <h2 className="font-semibold text-slate-900">Account</h2>

        <p className="mt-1 text-sm text-slate-500">
          Sign out of your mentor account.
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}
