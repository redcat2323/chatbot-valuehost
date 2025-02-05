import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "./StatCard";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsSection = () => {
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
  });

  if (isLoadingStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-[120px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
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
    </div>
  );
};