import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import SkillsInput from "./SkillsInput";
import type { CreateInterviewData } from "../services/interview.api";
import { toast } from "sonner";
import CandidateSelector from "./CandidateSelector";

interface CreateInterviewModalProps {
  form: CreateInterviewData;
  setForm: Dispatch<SetStateAction<CreateInterviewData>>;
  isPending: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreateInterviewModal({
  form,
  setForm,
  isPending,
  onClose,
  onSubmit,
}: CreateInterviewModalProps) {
  const handleInterviewTypeChange = (
    value: CreateInterviewData["type"],
  ) => {
    if (value !== "TECHNICAL") {
      toast.info(
        "Only Technical interviews are currently supported. Other interview types are coming soon.",
      );

      return;
    }

    setForm((current) => ({
      ...current,
      type: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-7">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Create Interview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create and assign an AI interview to a candidate.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              flex h-9 w-9
              cursor-pointer
              items-center justify-center
              rounded-xl
              text-slate-400
              transition-colors
              hover:bg-violet-50
              hover:text-violet-600
            "
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-7">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              value={form.title}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
              placeholder="MERN Full Stack Interview"
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Role
            </label>

            <input
              value={form.role}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  role: e.target.value,
                }))
              }
              placeholder="Full Stack Developer"
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />
          </div>

          {/* Candidate */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Candidate
            </label>

            <CandidateSelector
              onChange={(candidateId) =>
                setForm((current) => ({
                  ...current,
                  candidateId,
                }))
              }
            />
          </div>

          {/* Scheduled At */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Scheduled At
            </label>

            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  scheduledAt: e.target.value,
                }))
              }
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  description: e.target.value,
                }))
              }
              rows={3}
              placeholder="Interview description"
              className="
                w-full resize-none rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />
          </div>

          {/* Skills */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Skills
            </label>

            <SkillsInput
              value={form.skills}
              onChange={(skills) =>
                setForm((current) => ({
                  ...current,
                  skills,
                }))
              }
            />
          </div>

          {/* Duration */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Duration (minutes)
            </label>

            <input
              type="number"
              min={10}
              value={form.duration}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  duration: Number(e.target.value),
                }))
              }
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />
          </div>

          {/* Experience */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Experience (years)
            </label>

            <input
              type="number"
              min={0}
              value={form.experience}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  experience: Number(e.target.value),
                }))
              }
              className="
                w-full rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Difficulty
            </label>

            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  difficulty:
                    e.target
                      .value as CreateInterviewData["difficulty"],
                }))
              }
              className="
                w-full cursor-pointer rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Interview Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Interview Type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                handleInterviewTypeChange(
                  e.target
                    .value as CreateInterviewData["type"],
                )
              }
              className="
                w-full cursor-pointer rounded-xl
                border border-slate-200
                bg-slate-50
                px-3.5 py-2.5
                text-sm text-slate-900
                outline-none
                transition
                focus:border-violet-400
                focus:bg-white
                focus:ring-4
                focus:ring-violet-100
              "
            >
              <option value="TECHNICAL">Technical</option>
              <option value="HR">HR</option>
              <option value="SYSTEM_DESIGN">
                System Design
              </option>
              <option value="DSA">DSA</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="
              cursor-pointer rounded-xl
              border border-slate-200
              bg-white
              px-4 py-2.5
              text-sm font-medium
              text-slate-600
              transition-colors
              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="
              cursor-pointer rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-indigo-600
              px-4 py-2.5
              text-sm font-semibold
              text-white
              shadow-md shadow-violet-200
              transition-all
              hover:-translate-y-0.5
              hover:from-violet-700
              hover:to-indigo-700
              hover:shadow-lg
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isPending ? "Creating..." : "Create Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}