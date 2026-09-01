import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Send } from "lucide-react";
import { CreateInterviewModal } from "../components/CreateInterviewModal";
import {
  createInterview,
  deleteInterview,
  getInterviews,
  publishInterview,
  type CreateInterviewData,
} from "../services/interview.api";

export default function Interviews() {
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateInterviewData>({
    title: "",
    description: "",
    role: "",
    skills: [],
    duration: 30,
    scheduledAt: "",
    difficulty: "MEDIUM",
    experience: 0,
    type: "TECHNICAL",
    candidateId: "",
  });

  const {
    data: interviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recruiter-interviews"],
    queryFn: getInterviews,
  });

  const createMutation = useMutation({
    mutationFn: createInterview,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recruiter-interviews"],
      });

      setIsCreating(false);

      setForm({
        title: "",
        description: "",
        role: "",
        skills: [],
        duration: 30,
        scheduledAt: "",
        difficulty: "MEDIUM",
        experience: 0,
        type: "TECHNICAL",
        candidateId: "",
      });

      toast.success("Interview created successfully.");
    },

    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Failed to create interview.";

      toast.error(message);
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishInterview,

    onSuccess: async ({ shareLink }) => {
      queryClient.invalidateQueries({
        queryKey: ["recruiter-interviews"],
      });

      await navigator.clipboard.writeText(shareLink);

      toast.success("Interview published and link copied.");
    },

    onError: () => {
      toast.error("Failed to publish interview.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterview,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["recruiter-interviews"],
      });

      toast.success("Interview deleted");
    },

    onError: () => {
      toast.error("Failed to delete interview");
    },
  });

  const handleCreate = () => {
    if (!form.title.trim()) {
      toast.error("Interview title is required");
      return;
    }

    if (!form.role.trim()) {
      toast.error("Role is required");
      return;
    }

    if (!form.candidateId.trim()) {
      toast.error("Please select a candidate");
      return;
    }

    if (!form.scheduledAt) {
      toast.error("Interview date and time are required");
      return;
    }

    createMutation.mutate({
      ...form,
      skills: form.skills,
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#D98260]">
            Recruiter Workspace
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#F2EDE4]">
            Interviews
          </h1>

          <p className="mt-3 text-sm text-[#817A72]">
            Create, schedule, publish, and manage your AI interviews.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#D98260] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#C96F4F]"
        >
          <Plus className="h-4 w-4" />
          Create Interview
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-8 rounded-2xl border border-[#2F2B27] bg-[#181715] p-8">
          <p className="text-sm text-[#817A72]">Loading interviews...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="mt-8 rounded-2xl border border-[#2F2B27] bg-[#181715] p-8">
          <p className="text-sm text-red-400">Failed to load interviews.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && interviews.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[#332B27] bg-[#181715] p-12 text-center">
          <p className="text-sm text-[#817A72]">No interviews created yet.</p>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="mt-4 cursor-pointer text-sm font-medium text-[#D98260] transition hover:text-[#C96F4F]"
          >
            Create your first interview
          </button>
        </div>
      )}

      {/* Interview List */}
      {!isLoading && !isError && interviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-6"
            >
              <div className="flex items-start justify-between gap-6">
                {/* Interview Information */}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#F2EDE4]">
                    {interview.title}
                  </h2>

                  <p className="mt-1 text-sm text-[#817A72]">
                    {interview.role}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-md bg-[#24211E] px-2.5 py-1 text-xs text-[#A9A29A]">
                      {interview.type}
                    </span>

                    <span className="rounded-md bg-[#24211E] px-2.5 py-1 text-xs text-[#A9A29A]">
                      {interview.difficulty}
                    </span>

                    <span className="rounded-md bg-[#24211E] px-2.5 py-1 text-xs text-[#A9A29A]">
                      {interview.duration} min
                    </span>

                    <span className="rounded-md bg-[#24211E] px-2.5 py-1 text-xs text-[#A9A29A]">
                      {interview.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {!interview.accessToken && (
                    <button
                      type="button"
                      onClick={() => publishMutation.mutate(interview._id)}
                      disabled={publishMutation.isPending}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#D98260] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#C96F4F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />

                      {publishMutation.isPending ? "Publishing..." : "Publish"}
                    </button>
                  )}

                  {interview.accessToken && (
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(
                            `${window.location.origin}/interview/${interview.accessToken}`,
                          )
                          .then(() => toast.success("Interview link copied"))
                      }
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#2F2B27] px-3 py-2 text-sm text-[#A9A29A] transition hover:bg-[#24211E] hover:text-[#F2EDE4]"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Delete this interview?")) {
                        deleteMutation.mutate(interview._id);
                      }
                    }}
                    className="flex cursor-pointer items-center justify-center rounded-lg border border-red-500/30 p-2 text-red-400 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Interview Details */}
              <div className="mt-5 grid gap-4 border-t border-[#2F2B27] pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#6F6962]">Candidate</p>

                  <p className="mt-1 truncate text-sm text-[#A9A29A]">
                    {interview.candidateId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#6F6962]">Scheduled</p>

                  <p className="mt-1 text-sm text-[#A9A29A]">
                    {new Date(interview.scheduledAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Interview Modal */}
      {isCreating && (
        <CreateInterviewModal
          form={form}
          setForm={setForm}
          isPending={createMutation.isPending}
          onClose={() => setIsCreating(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
