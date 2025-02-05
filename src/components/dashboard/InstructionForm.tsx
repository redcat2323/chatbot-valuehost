import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const APP_ID = 'valuehost';

export const InstructionForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createInstruction = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("custom_instructions")
        .insert([{ 
          title, 
          content,
          user_id: session.user.id,
          app_id: APP_ID
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customInstructions"] });
      toast({
        title: "Instrução criada",
        description: "A instrução personalizada foi criada com sucesso.",
      });
      setTitle("");
      setContent("");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a instrução. " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    createInstruction.mutate({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Nova Instrução</CardTitle>
          <CardDescription>
            Adicione uma nova instrução personalizada para o ChatGPT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Instruções para atendimento ao cliente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite as instruções detalhadas aqui..."
              className="min-h-[150px]"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={createInstruction.isPending}
          >
            {createInstruction.isPending ? "Salvando..." : "Salvar Instrução"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};