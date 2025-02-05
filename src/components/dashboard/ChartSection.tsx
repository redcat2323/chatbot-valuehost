import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsageChart } from "./UsageChart";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartSection = () => {
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
  });

  if (isLoadingChart) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <UsageChart 
      data={chartData || []} 
      title="Histórico de Consultas"
    />
  );
};