
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

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

const Log = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    </div>
  );
}

export default Log;
