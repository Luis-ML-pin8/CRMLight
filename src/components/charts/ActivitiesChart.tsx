'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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

interface ActivitiesChartProps {
  data?: WeeklyData[];
}

export function ActivitiesChart({ data = [] }: ActivitiesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Actividades</CardTitle>
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
        <CardTitle>Evolución de Actividades</CardTitle>
        <CardDescription>Completadas, pendientes y vencidas por semana en los últimos 3 meses.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          Completadas: { label: 'Completadas', color: 'hsl(var(--success))' },
          Pendientes: { label: 'Pendientes', color: 'hsl(var(--primary))' },
          Vencidas: { label: 'Vencidas', color: 'hsl(var(--destructive))' },
        }}>
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(-3)}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="Completadas" stackId="1" fill="var(--color-Completadas)" stroke="var(--color-Completadas)" />
            <Area type="monotone" dataKey="Pendientes" stackId="1" fill="var(--color-Pendientes)" stroke="var(--color-Pendientes)" />
            <Area type="monotone" dataKey="Vencidas" stackId="1" fill="var(--color-Vencidas)" stroke="var(--color-Vencidas)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
