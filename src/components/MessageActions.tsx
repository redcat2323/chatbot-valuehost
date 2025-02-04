import { Copy, RotateCcw, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type MessageActionsProps = {
  content: string;
};

const MessageActions = ({ content }: MessageActionsProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        description: "Mensagem copiada para a área de transferência",
        duration: 2000,
        className: "bg-[#9b87f5] text-white border-none",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erro ao copiar mensagem",
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex items-center gap-2 text-gray-400">
      <button 
        className="p-1 hover:text-white transition-colors" 
        onClick={handleCopy}
        title="Copiar mensagem"
      >
        <Copy className="h-4 w-4" />
      </button>
      <button className="p-1 hover:text-white transition-colors">
        <RotateCcw className="h-4 w-4" />
      </button>
      <button className="p-1 hover:text-white transition-colors">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
};

export default MessageActions;