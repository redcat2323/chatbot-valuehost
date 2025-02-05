
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface UsageChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  title: string;
}

export function UsageChart({ data, title }: UsageChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer className="h-[300px]" config={{
          primary: { theme: { light: "rgb(59, 130, 246)", dark: "rgb(59, 130, 246)" } }
        }}>
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="count"
              strokeWidth={2}
              activeDot={{
                r: 6,
                className: "fill-primary",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
