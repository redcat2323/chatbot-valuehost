import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

type MessageAvatarProps = {
  isAssistant: boolean;
  isThinking?: boolean;
};

const MessageAvatar = ({ isAssistant, isThinking = false }: MessageAvatarProps) => {
  return (
    <Avatar className={`h-8 w-8 ${isThinking ? 'animate-pulse' : ''}`}>
      <AvatarFallback 
        className={`
          ${isAssistant ? 'bg-green-600' : 'bg-slate-600'}
          ${isThinking ? 'animate-pulse' : ''}
        `}
      >
        {isAssistant ? (
          <Bot className="h-5 w-5 text-white" />
        ) : (
          <User className="h-5 w-5 text-white" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default MessageAvatar;