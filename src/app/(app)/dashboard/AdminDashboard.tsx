'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardMetrics, User } from '@/types';
import { Building2, Briefcase, Users, TrendingUp, Target, ClipboardList } from 'lucide-react';
import { MetricCard, MetricCardSkeleton } from '@/components/ui/metric-card';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        const data = await api.getDashboardMetrics(user);
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [user]);
  
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '€ 0,00';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '0,00 %';
    return `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value * 100)} %`;
  };
  
  const formatRatio = (value: number | undefined) => {
      if (value === undefined) return '0.00';
      return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <Card className="mt-8">
            <CardHeader><CardTitle>Métricas Clave de la Herramienta</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                 <MetricCardSkeleton />
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Panel de Administración</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total de Clientes"
          value={metrics?.totalAccounts ?? 0}
          icon={Building2}
          description="Clientes registrados en el sistema."
        />
        <MetricCard
          title="Total de Oportunidades"
          value={metrics?.totalOpportunities ?? 0}
          icon={Briefcase}
          description="Oportunidades globales registradas."
        />
        <MetricCard
          title="Usuarios Activos"
          value={metrics?.totalUsers ?? 0}
          icon={Users}
          description="Total de cuentas de usuario."
        />
      </div>

       <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Métricas Clave de la Herramienta</CardTitle>
              <CardDescription>
                Ratios de rendimiento y uso del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                 <MetricCard
                    title="Ingresos por Captación"
                    value={formatPercentage(metrics?.newCustomerRevenueRate)}
                    icon={Target}
                    description="Porcentaje de ingresos de primeras ventas."
                />
                <MetricCard
                    title="Ratio de Conversión"
                    value={formatPercentage(metrics?.conversionRate)}
                    icon={TrendingUp}
                    description="% de oportunidades ganadas sobre cerradas."
                />
                <MetricCard
                    title="Valor Medio de Oportunidad"
                    value={formatCurrency(metrics?.avgOpportunityValue)}
                    icon={Briefcase}
                    description="Importe medio de todas las oportunidades."
                />
                <MetricCard
                    title="Actividades / Oportunidad"
                    value={formatRatio(metrics?.activitiesPerOpportunity)}
                    icon={ClipboardList}
                    description="Promedio de actividades por oportunidad."
                />
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
