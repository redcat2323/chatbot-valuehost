import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface LogStats {
  weeklyCount: number;
  monthlyCount: number;
  yearlyCount: number;
  totalUsers: number;
  averageQueriesPerUser: number;
}

interface ChartData {
  date: string;
  count: number;
}

interface CustomInstruction {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const APP_ID = 'lovable-chat';

const Log = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["logStats"],
    queryFn: async () => {
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(2025, 0, 1);

      const { count: weeklyCount, error: weeklyError } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString());

      const { count: monthlyCount, error: monthlyError } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      const { count: yearlyCount, error: yearlyError } = await supabase
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfYear.toISOString());

      const { data: users, error: usersError } = await supabase
        .from('usage_logs')
        .select('user_id')
        .not('user_id', 'is', null);

      if (weeklyError || monthlyError || yearlyError || usersError) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const uniqueUsers = new Set(users?.map(log => log.user_id));
      const totalUsers = uniqueUsers.size;
      const averageQueriesPerUser = totalUsers > 0 ? Math.round((yearlyCount || 0) / totalUsers) : 0;

      return {
        weeklyCount: weeklyCount || 0,
        monthlyCount: monthlyCount || 0,
        yearlyCount: yearlyCount || 0,
        totalUsers,
        averageQueriesPerUser,
      };
    },
    enabled: isAuthenticated,
  });

  const { data: chartData, isLoading: isLoadingChart } = useQuery({
    queryKey: ["logChartData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_logs')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dailyCount = data.reduce((acc: Record<string, number>, item) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(dailyCount).map(([date, count]) => ({
        date,
        count,
      }));
    },
    enabled: isAuthenticated,
  });

  const { data: instructions, isLoading: isLoadingInstructions } = useQuery({
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
    enabled: isAuthenticated,
  });

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Painel de Monitoramento</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {isLoadingStats ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))
        ) : (
          <>
            <StatCard
              title="Consultas na Semana"
              value={stats?.weeklyCount || 0}
            />
            <StatCard
              title="Consultas no Mês"
              value={stats?.monthlyCount || 0}
            />
            <StatCard
              title="Consultas em 2025"
              value={stats?.yearlyCount || 0}
            />
            <StatCard
              title="Total de Usuários"
              value={stats?.totalUsers || 0}
            />
            <StatCard
              title="Média de Consultas/Usuário"
              value={stats?.averageQueriesPerUser || 0}
            />
          </>
        )}
      </div>

      {isLoadingChart ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <UsageChart 
          data={chartData || []} 
          title="Histórico de Consultas"
        />
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Instruções Personalizadas</h2>
        
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

        <div className="grid gap-4">
          {isLoadingInstructions ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[200px] w-full" />
            ))
          ) : instructions?.map((instruction) => (
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
      </div>
    </div>
  );
};

export default Log;