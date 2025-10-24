'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { WeeklyData } from '@/types';

interface OpportunitiesChartProps {
    data?: WeeklyData[];
}

export function OpportunitiesChart({ data = [] }: OpportunitiesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Oportunidades</CardTitle>
          <CardDescription>Últimos 3 meses</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No hay datos para mostrar.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Oportunidades</CardTitle>
        <CardDescription>Abiertas vs. Cerradas por semana en los últimos 3 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          Abiertas: { label: 'Abiertas', color: 'hsl(var(--primary))' },
          Cerradas: { label: 'Cerradas', color: 'hsl(var(--secondary))' },
        }}>
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(-3)} // Muestra S01, S02...
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="Abiertas" fill="var(--color-Abiertas)" radius={4} />
            <Bar dataKey="Cerradas" fill="var(--color-Cerradas)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
