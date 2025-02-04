import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';

type MessageProps = {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
};

const Message = ({ role, content, isLoading = false }: MessageProps) => {
  // Função para formatar o texto removendo asteriscos e melhorando a apresentação
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove asteriscos duplos
      .replace(/---/g, '\n') // Converte --- em quebras de linha
      .split('\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-2">
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
                ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' 
                : 'text-left leading-relaxed'
              }
            `}
          >
            {isLoading && role === 'assistant' ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            ) : (
              formatContent(content)
            )}
          </div>
          {role === 'assistant' && <MessageActions />}
        </div>
      </div>
    </div>
  );
};

export default Message;