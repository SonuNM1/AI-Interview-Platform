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
  const handleInterviewTypeChange = (value: CreateInterviewData["type"]) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#2F2B27] bg-[#181715]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2F2B27] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#F2EDE4]">
              Create Interview
            </h2>

            <p className="mt-1 text-sm text-[#817A72]">
              Create and assign an AI interview to a candidate.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="cursor-pointer rounded-lg p-2 text-[#817A72] transition-colors hover:bg-[#24211E] hover:text-[#F2EDE4]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm text-[#A9A29A]">Title</label>

            <input
              value={form.title}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
              placeholder="MERN Full Stack Interview"
              className="w-full rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none placeholder:text-[#6F6962] focus:border-[#D98260]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-2 block text-sm text-[#A9A29A]">Role</label>

            <input
              value={form.role}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  role: e.target.value,
                }))
              }
              placeholder="Full Stack Developer"
              className="w-full rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none placeholder:text-[#6F6962] focus:border-[#D98260]"
            />
          </div>

          {/* Candidate */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-[#A9A29A]">
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
            <label className="mb-2 block text-sm text-[#A9A29A]">
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
              className="w-full rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none focus:border-[#D98260]"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-[#A9A29A]">
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
              className="w-full resize-none rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none placeholder:text-[#6F6962] focus:border-[#D98260]"
            />
          </div>

          {/* Skills */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-[#A9A29A]">Skills</label>

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
            <label className="mb-2 block text-sm text-[#A9A29A]">
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
              className="w-full rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none focus:border-[#D98260]"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="mb-2 block text-sm text-[#A9A29A]">
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
              className="w-full rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none focus:border-[#D98260]"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-2 block text-sm text-[#A9A29A]">
              Difficulty
            </label>

            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  difficulty: e.target
                    .value as CreateInterviewData["difficulty"],
                }))
              }
              className="w-full cursor-pointer rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none focus:border-[#D98260]"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Interview Type */}
          <div>
            <label className="mb-2 block text-sm text-[#A9A29A]">
              Interview Type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                handleInterviewTypeChange(
                  e.target.value as CreateInterviewData["type"],
                )
              }
              className="w-full cursor-pointer rounded-lg border border-[#2F2B27] bg-[#211F1C] px-3 py-2.5 text-sm text-[#F2EDE4] outline-none focus:border-[#D98260]"
            >
              <option value="TECHNICAL">Technical</option>
              <option value="HR">HR</option>
              <option value="SYSTEM_DESIGN">System Design</option>
              <option value="DSA">DSA</option>
            </select>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 border-t border-[#2F2B27] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[#2F2B27] px-4 py-2.5 text-sm text-[#A9A29A] transition-colors hover:bg-[#24211E]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isPending}
            className="cursor-pointer rounded-lg bg-[#D98260] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#C96F4F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
