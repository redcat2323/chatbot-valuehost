import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

const Message = ({ role, content, isLoading = false }: MessageProps) => {
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/---/g, '\n')
      .split('\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0 whitespace-pre-wrap break-words">
          {paragraph.trim()}
        </p>
      ));
  };

  return (
    <div className="py-6">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <MessageAvatar isAssistant={role === 'assistant'} isThinking={isLoading} />
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div 
            className={`
              ${role === 'user' 
                ? 'bg-[#343541] text-white rounded-2xl px-6 pb-3 pt-3 inline-block max-w-[80%] shadow-md' 
                : 'text-left leading-relaxed max-w-[80%]'
              }
            `}
          >
            {isLoading && role === 'assistant' ? (
              <div className="flex flex-col space-y-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none">
                {formatContent(content)}
              </div>
            )}
          </div>
          {role === 'assistant' && <MessageActions content={content} />}
        </div>
      </div>
    </div>
  );
};

export default Message;