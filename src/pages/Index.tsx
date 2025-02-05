import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';

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
  const [customInstructions, setCustomInstructions] = useState<CustomInstruction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomInstructions();
  }, []);

  const fetchCustomInstructions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_instructions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCustomInstructions(data || []);
    } catch (error: any) {
      console.error('Error fetching custom instructions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar instruções personalizadas",
        variant: "destructive"
      });
    }
  };

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
        .map(instruction => instruction.content)
        .join('\n\n');

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
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          {messages.length === 0 ? (
            <div className="w-full max-w-3xl px-4">
              <div>
                <h1 className="mb-8 text-4xl font-semibold text-center">Como posso ajudar?</h1>
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div className="w-full max-w-3xl mx-auto px-4 py-2">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">
                O GPT pode cometer erros. Verifique informações importantes.
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;