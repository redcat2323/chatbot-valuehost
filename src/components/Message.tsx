import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import { Loader2 } from 'lucide-react';

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

const Message = ({ role, content, isLoading = false }: MessageProps) => {
  return (
    <div className="py-6">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div className={`${role === 'user' ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' : ''}`}>
            {content}
            {isLoading && (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-400">Processando...</span>
              </div>
            )}
          </div>
          {role === 'assistant' && <MessageActions />}
        </div>
      </div>
    </div>
  );
};

export default Message;