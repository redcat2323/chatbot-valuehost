import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import CodeEditor from '@/components/CodeEditor';
import { useQuery } from '@tanstack/react-query';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type CustomInstruction = {
  id: string;
  title: string;
  content: string;
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [htmlCode, setHtmlCode] = useState('<html>\n  <body>\n    <h1>Hello World!</h1>\n  </body>\n</html>');
  const { toast } = useToast();

  // Fetch custom instructions using React Query
  const { data: customInstructions = [] } = useQuery({
    queryKey: ['customInstructions'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      
      if (!session?.user) return [];

      const { data: instructions, error } = await supabase
        .from('custom_instructions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching custom instructions:', error);
        throw error;
      }
      return instructions || [];
    }
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newMessages = [
        ...messages,
        { role: 'user', content } as const
      ];
      
      setMessages(newMessages);

      // Prepare system message with custom instructions
      const systemMessage = customInstructions
        .map(instruction => `${instruction.title}:\n${instruction.content}`)
        .join('\n\n');

      console.log('System message being sent:', systemMessage); // Debug log

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: [
            { role: 'system', content: systemMessage },
            ...newMessages
          ]
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.content
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error: any) {
      console.error('Error in chat:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <main className="flex-1">
        <ChatHeader />
        
        <div className="flex h-full flex-col pt-[60px] pb-4 px-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold mb-2">Editor HTML</h2>
              <CodeEditor 
                value={htmlCode}
                onChange={(value) => setHtmlCode(value || '')}
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div className="w-full h-[500px] bg-white rounded-lg overflow-hidden">
                <iframe
                  srcDoc={htmlCode}
                  title="preview"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>

          <div className="flex-1">
            <MessageList messages={messages} isLoading={isLoading} />
            <div className="w-full max-w-3xl mx-auto py-2">
              <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            </div>
            <div className="text-xs text-center text-gray-500 py-2">
              O GPT pode cometer erros. Verifique informações importantes.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
