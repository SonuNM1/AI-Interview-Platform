import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  ChevronRight,
  IndianRupee,
  Save,
  Sparkles,
  Tags,
} from "lucide-react";
import {
  getMyMentorProfile,
  updateMyMentorProfile,
} from "../services/mentor.api";
import { toast } from "sonner";

export default function MentorshipSettings() {
  const [amount, setAmount] = useState("");
  const [expertise, setExpertise] = useState("");
  const [enabled, setEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getMyMentorProfile();

        if (profile) {
          setAmount(
            String(profile.monthlyMentorshipAmount),
          );

          setExpertise(
            profile.mentorshipExpertise.join(", "),
          );

          setEnabled(profile.mentorshipEnabled);
        }
      } catch (error) {
        console.error(
          "Failed to load mentorship settings:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {

    event.preventDefault();

    const expertiseList = expertise
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    // basic frontend validation before calling the API 

    const numericAmount = Number(amount) ; 

    if(!Number.isInteger(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid monthly mentorship price.") ; 
      return ; 
    }

    if(expertiseList.length === 0) {
      toast.error("Please add at least one area of expertise.") ; 
      return ; 
    }

    setSaving(true);

    // show a loading toast while the API request is running 

    const toastId = toast.loading("Saving mentorship settings...") ; 

    try {

      // save the mentor marketplace configuration 

      const updatedProfile = await updateMyMentorProfile({
        monthlyMentorshipAmount: Number(amount),
        mentorshipExpertise: expertiseList,
        mentorshipEnabled: enabled,
      }); 

      // keep the UI synchronized with the saved backend values 

      setAmount(String(updatedProfile.monthlyMentorshipAmount)) ; 

      setExpertise(updatedProfile.mentorshipExpertise.join(", ")) ; 

      setEnabled(updatedProfile.mentorshipEnabled) ; 

      // replace the loading notification with success feedback 

      toast.success("Mentorship settings saved successfully.", {
        id: toastId 
      })

    } catch (error) {
      console.error(
        "Failed to update mentorship settings:",
        error,
      );

      // replace the loading notification with an error 

      toast.error("Failed to save mentorship settings. Please try again.", {
        id: toastId
      })
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />

          <p className="text-sm text-slate-500">
            Loading mentorship settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700">
          <Sparkles size={13} />

          Mentor Marketplace
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Mentorship Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Configure your mentorship offering, set your price,
          and tell candidates what you can help them with.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Pricing */}
        <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-7 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                <IndianRupee size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Monthly Pricing
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Set what candidates pay for your mentorship.
                </p>
              </div>
            </div>
          </div>

          <div className="p-7">
            <label
              htmlFor="amount"
              className="text-sm font-semibold text-slate-700"
            >
              Monthly mentorship price
            </label>

            <div className="relative mt-3 max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                ₹
              </span>

              <input
                id="amount"
                type="number"
                min="1"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="2500"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                required
              />
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Candidates will be charged this amount every
              month.
            </p>
          </div>
        </section>

        {/* Expertise */}
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-7 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <Tags size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Your Expertise
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell candidates what you can mentor them in.
                </p>
              </div>
            </div>
          </div>

          <div className="p-7">
            <label
              htmlFor="expertise"
              className="text-sm font-semibold text-slate-700"
            >
              Technologies & areas
            </label>

            <input
              id="expertise"
              type="text"
              value={expertise}
              onChange={(event) =>
                setExpertise(event.target.value)
              }
              placeholder="React, Node.js, AWS, System Design"
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              required
            />

            <p className="mt-2 text-xs text-slate-400">
              Separate multiple areas with commas.
            </p>

            {expertise.trim() && (
              <div className="mt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Preview
                </p>

                <div className="flex flex-wrap gap-2">
                  {expertise
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-3 py-1.5 text-xs font-medium text-violet-700"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Marketplace visibility */}
        <section className="overflow-hidden rounded-3xl border border-fuchsia-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-fuchsia-50 to-violet-50 px-7 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-fuchsia-600 shadow-sm">
                <Sparkles size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Marketplace Visibility
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Control whether candidates can discover you.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-900">
                  Accept mentorship
                </h3>

                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                    enabled
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {enabled ? "Active" : "Hidden"}
                </span>
              </div>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {enabled
                  ? "Your profile can appear in the mentor marketplace and candidates can subscribe."
                  : "Your profile is hidden from the mentor marketplace until you enable mentorship."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setEnabled((value) => !value)
              }
              className={[
                "relative h-8 w-14 shrink-0 cursor-pointer rounded-full p-1 transition-colors",
                enabled
                  ? "bg-violet-600"
                  : "bg-slate-300",
              ].join(" ")}
              aria-label="Toggle mentorship visibility"
            >
              <span
                className={[
                  "block h-6 w-6 rounded-full bg-white shadow-md transition-transform",
                  enabled
                    ? "translate-x-6"
                    : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>
        </section>

        {/* Save area */}
        <div className="flex flex-col gap-4 rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              Ready to update your offering?
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your changes will be reflected in your mentor
              marketplace profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}