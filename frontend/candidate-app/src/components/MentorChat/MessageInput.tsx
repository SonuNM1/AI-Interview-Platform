import { Paperclip, Send, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

interface MessageInputProps {
  disabled?: boolean;
  onSend: (message: string, file?: File) => void | Promise<void>;
}

export function MessageInput({
  disabled = false,
  onSend,
}: MessageInputProps) {
  
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    // Reset the input so selecting the same file again works.
    event.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(undefined);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    // A message can contain text, an attachment, or both.
    if ((!trimmedMessage && !selectedFile) || disabled) {
      return;
    }

    await onSend(trimmedMessage, selectedFile);

    setMessage("");
    setSelectedFile(undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-200 bg-white px-4 py-3"
    >
      {selectedFile && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <Paperclip
            size={16}
            className="shrink-0 text-violet-600"
          />

          <span className="min-w-0 flex-1 truncate text-xs text-slate-600">
            {selectedFile.name}
          </span>

          <button
            type="button"
            onClick={removeSelectedFile}
            disabled={disabled}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed"
            aria-label="Remove attachment"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-violet-50 hover:text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Attach file"
        >
          <Paperclip size={19} />
        </button>

        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={disabled}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            disabled ||
            (!message.trim() && !selectedFile)
          }
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}