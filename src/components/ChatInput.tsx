import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSend(message);
      setMessage("");
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-adjust height
    e.target.style.height = 'auto';
    const newHeight = Math.min(e.target.scrollHeight, 200);
    e.target.style.height = `${newHeight}px`;
    setIsExpanded(newHeight >= 200);
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative w-full">
        <textarea
          rows={1}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem para o GPT"
          className={`w-full resize-none bg-[#2F2F2F] px-4 py-4 pr-12 focus:outline-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent ${isExpanded ? 'rounded-[5px]' : 'rounded-full'}`}
          style={{
            minHeight: "56px",
            maxHeight: "200px",
            overflowY: "auto"
          }}
          disabled={isLoading}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;