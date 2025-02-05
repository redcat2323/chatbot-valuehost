import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CustomInstruction {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const APP_ID = 'valuehost';

export const InstructionList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: instructions, isLoading } = useQuery({
    queryKey: ["customInstructions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_instructions")
        .select("*")
        .eq('app_id', APP_ID)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CustomInstruction[];
    },
  });

  const deleteInstruction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_instructions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customInstructions"] });
      toast({
        title: "Instrução removida",
        description: "A instrução personalizada foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a instrução. " + error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {instructions?.map((instruction) => (
        <Card key={instruction.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{instruction.title}</CardTitle>
                <CardDescription>
                  Criado em: {new Date(instruction.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteInstruction.mutate(instruction.id)}
                disabled={deleteInstruction.isPending}
              >
                Remover
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{instruction.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};