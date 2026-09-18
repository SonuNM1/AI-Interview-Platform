import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import {
  searchCandidates,
  type CandidateSearchResult,
} from "../services/interview.api";

interface CandidateSelectorProps {
  onChange: (candidateId: string) => void;
}

export default function CandidateSelector({
  onChange,
}: CandidateSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateSearchResult | null>(null);

  const { data: candidates = [], isFetching } = useQuery({
    queryKey: ["candidate-search", query],
    queryFn: () => searchCandidates(query),
    enabled: query.trim().length >= 2,
  });

  const handleSelect = (candidate: CandidateSearchResult) => {
    setSelectedCandidate(candidate);
    onChange(candidate.id);
    setQuery("");
  };

  const handleRemove = () => {
    setSelectedCandidate(null);
    onChange("");
  };

  const getCandidateName = (candidate: CandidateSearchResult) => {
    const fullName = [candidate.firstName, candidate.lastName]
      .filter(Boolean)
      .join(" ");

    return fullName || candidate.username || candidate.email;
  };

  if (selectedCandidate) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {getCandidateName(selectedCandidate)}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {selectedCandidate.email}
            </p>

            {selectedCandidate.username && (
              <p className="mt-1 truncate text-xs text-slate-400">
                @{selectedCandidate.username}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="ml-3 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Remove candidate"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition-colors focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search candidate by name, username or email..."
          className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          {isFetching && (
            <div className="px-4 py-3 text-sm text-slate-500">
              Searching candidates...
            </div>
          )}

          {!isFetching && candidates.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-500">
              No candidates found.
            </div>
          )}

          {!isFetching &&
            candidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => handleSelect(candidate)}
                className="block w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-violet-50/60"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {getCandidateName(candidate)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {candidate.email}
                </p>

                {candidate.username && (
                  <p className="mt-1 text-xs text-slate-400">
                    @{candidate.username}
                  </p>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}