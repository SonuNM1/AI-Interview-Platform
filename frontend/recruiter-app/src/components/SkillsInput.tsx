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
    <div className="rounded-lg border border-[#332B27] bg-[#181715] px-3 py-2">
      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1 rounded-md bg-[#2A2521] px-2.5 py-1 text-xs text-[#F2EDE4]"
          >
            {skill}

            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="cursor-pointer text-[#817A72] transition hover:text-[#D98260]"
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
          className="min-w-[180px] flex-1 bg-transparent py-1 text-sm text-[#F2EDE4] outline-none placeholder:text-[#6F6962]"
        />
      </div>
    </div>
  );
}