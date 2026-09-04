import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import {
  getInterviewReport,
  getCandidateProfile,
} from "../services/interview.api";
import jsPDF from "jspdf";

export default function InterviewReport() {
  const navigate = useNavigate();
  const { interviewId } = useParams<{ interviewId: string }>();

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["interview-report", interviewId],
    queryFn: () => {
      if (!interviewId) {
        throw new Error("Interview ID is missing");
      }

      return getInterviewReport(interviewId);
    },
    enabled: !!interviewId,
  });

  const { data: candidate } = useQuery({
    queryKey: ["candidate-profile", report?.candidateId],
    queryFn: () => {
      if (!report?.candidateId) {
        throw new Error("Candidate ID is missing");
      }

      return getCandidateProfile(report.candidateId);
    },
    enabled: !!report?.candidateId,
  });

  const handleDownloadPDF = () => {
    if (!report) return;

    const pdf = new jsPDF();

    const candidateName =
      `${candidate?.firstName ?? ""} ${candidate?.lastName ?? ""}`.trim() ||
      candidate?.username ||
      "Candidate";

    const formatDate = (date?: string) => {
      if (!date) return "N/A";

      return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    };

    let y = 20;

    // PDF title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Interview Report", 20, y);

    y += 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("Candidate Evaluation", 20, y);

    y += 12;

    // Candidate and interview information
    pdf.setFontSize(10);

    pdf.text(`Candidate: ${candidateName}`, 20, y);
    y += 6;

    pdf.text(`Interview: ${report.interviewTitle}`, 20, y);
    y += 6;

    pdf.text(`Role: ${report.role}`, 20, y);
    y += 6;

    pdf.text(`Scheduled: ${formatDate(report.scheduledAt)}`, 20, y);
    y += 6;

    pdf.text(`Completed: ${formatDate(report.completedAt)}`, 20, y);

    y += 12;

    // Scores
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.text("Scores", 20, y);

    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    pdf.text(`Overall Score: ${Math.round(report.overallScore)} / 10`, 20, y);

    y += 7;

    pdf.text(
      `Communication Score: ${Math.round(report.communicationScore)} / 10`,
      20,
      y,
    );

    y += 12;

    // Recommendation
    pdf.setFont("helvetica", "bold");
    pdf.text("Recommendation", 20, y);

    y += 7;

    pdf.setFont("helvetica", "normal");
    pdf.text(report.recommendation, 20, y);

    y += 12;

    // Summary
    pdf.setFont("helvetica", "bold");
    pdf.text("Summary", 20, y);

    y += 7;

    pdf.setFont("helvetica", "normal");

    const summaryLines = pdf.splitTextToSize(report.summary, 170);

    pdf.text(summaryLines, 20, y);

    y += summaryLines.length * 5 + 8;

    // Strengths
    pdf.setFont("helvetica", "bold");
    pdf.text("Strengths", 20, y);

    y += 7;

    pdf.setFont("helvetica", "normal");

    report.strengths.forEach((strength) => {
      const lines = pdf.splitTextToSize(`• ${strength}`, 170);

      pdf.text(lines, 20, y);

      y += lines.length * 5 + 2;
    });

    y += 5;

    // Areas for improvement
    pdf.setFont("helvetica", "bold");
    pdf.text("Areas for Improvement", 20, y);

    y += 7;

    pdf.setFont("helvetica", "normal");

    report.weaknesses.forEach((weakness) => {
      const lines = pdf.splitTextToSize(`• ${weakness}`, 170);

      pdf.text(lines, 20, y);

      y += lines.length * 5 + 2;
    });

    // Download the generated PDF.
    pdf.save(`${candidateName.replace(/\s+/g, "-")}-Interview-Report.pdf`);
  };

  // Loading state while the report is being fetched.

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-8">
          <p className="text-sm text-[#817A72]">Loading interview report...</p>
        </div>
      </div>
    );
  }

  // Error state when the report cannot be loaded.
  if (isError || !report) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-8">
          <p className="text-sm text-red-400">
            Failed to load interview report.
          </p>

          <button
            type="button"
            onClick={() => navigate("/recruiter/interviews")}
            className="mt-4 text-sm text-[#D98260]"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Page header */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/recruiter/interviews")}
            className="rounded-lg border border-[#2F2B27] p-2 text-[#A9A29A] transition hover:bg-[#24211E] hover:text-[#F2EDE4]"
            aria-label="Back to interviews"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <p className="text-sm font-medium text-[#D98260]">
              Interview Report
            </p>

            <h1 className="mt-1 text-3xl font-semibold text-[#F2EDE4]">
              Candidate Evaluation
            </h1>
          </div>
        </div>

        {/* Small PDF download button for recruiters. */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={!candidate}
          className="flex items-center gap-2 rounded-lg border border-[#2F2B27] px-3 py-2 text-sm text-[#A9A29A] transition hover:bg-[#24211E] hover:text-[#F2EDE4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>

      {/* Overall scores */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-6">
          <p className="text-sm text-[#817A72]">Overall Score</p>

          <p className="mt-2 text-4xl font-semibold text-[#F2EDE4]">
            {Math.round(report.overallScore)}
            <span className="text-lg text-[#817A72]"> / 10</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#2F2B27] bg-[#181715] p-6">
          <p className="text-sm text-[#817A72]">Communication Score</p>

          <p className="mt-2 text-4xl font-semibold text-[#F2EDE4]">
            {Math.round(report.communicationScore)}
            <span className="text-lg text-[#817A72]"> / 10</span>
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 rounded-2xl border border-[#2F2B27] bg-[#181715] p-6">
        <p className="text-sm text-[#817A72]">Recommendation</p>

        <p className="mt-2 text-2xl font-semibold text-[#D98260]">
          {report.recommendation}
        </p>
      </div>

      {/* Summary */}
      <div className="mt-4 rounded-2xl border border-[#2F2B27] bg-[#181715] p-6">
        <h2 className="text-lg font-semibold text-[#F2EDE4]">Summary</h2>

        <p className="mt-3 text-sm leading-7 text-[#A9A29A]">
          {report.summary}
        </p>
      </div>

      {/* Strengths */}
      <div className="mt-4 rounded-2xl border border-[#2F2B27] bg-[#181715] p-6">
        <h2 className="text-lg font-semibold text-[#F2EDE4]">Strengths</h2>

        <ul className="mt-4 space-y-2">
          {report.strengths.map((strength, index) => (
            <li key={index} className="text-sm leading-6 text-[#A9A29A]">
              • {strength}
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="mt-4 rounded-2xl border border-[#2F2B27] bg-[#181715] p-6">
        <h2 className="text-lg font-semibold text-[#F2EDE4]">
          Areas for Improvement
        </h2>

        <ul className="mt-4 space-y-2">
          {report.weaknesses.map((weakness, index) => (
            <li key={index} className="text-sm leading-6 text-[#A9A29A]">
              • {weakness}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
