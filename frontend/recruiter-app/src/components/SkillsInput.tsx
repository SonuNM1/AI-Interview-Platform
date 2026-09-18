import { useState } from "react";
import { X } from "lucide-react";

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsInput({
  value,
  onChange,
}: SkillsInputProps) {
  const [input, setInput] = useState("");

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();

    if (!trimmedSkill) {
      return;
    }

    const alreadyExists = value.some(
      (currentSkill) =>
        currentSkill.toLowerCase() === trimmedSkill.toLowerCase(),
    );

    if (alreadyExists) {
      setInput("");
      return;
    }

    onChange([...value, trimmedSkill]);
    setInput("");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(input);
    }

    if (
      event.key === "Backspace" &&
      !input &&
      value.length > 0
    ) {
      onChange(value.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(
      value.filter((skill) => skill !== skillToRemove),
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition-colors focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 rounded-lg border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
          >
            {skill}

            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="cursor-pointer text-violet-400 transition-colors hover:text-red-500"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addSkill(input)}
          placeholder={
            value.length === 0
              ? "Type a skill and press Enter..."
              : "Add another skill..."
          }
          className="min-w-[180px] flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}