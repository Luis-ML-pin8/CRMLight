'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardMetrics, User } from '@/types';
import { Briefcase, Building2, ClipboardList, Target } from 'lucide-react';
import { MetricCard, MetricCardSkeleton } from '@/components/ui/metric-card';

interface AgentDashboardProps {
  user: User;
}

export default function AgentDashboard({ user }: AgentDashboardProps) {
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

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Tu Panel de Agente</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Clientes en Cartera"
          value={metrics?.assignedAccounts ?? 0}
          icon={Building2}
          description="Total de clientes que gestionas."
        />
        <MetricCard
          title="Oportunidades Abiertas"
          value={metrics?.openOpportunities ?? 0}
          icon={Target}
          description="Oportunidades en curso."
        />
        <MetricCard
          title="Valor de Cartera"
          value={formatCurrency(metrics?.portfolioValue)}
          icon={Briefcase}
          description="Suma de importes de oportunidades abiertas."
        />
        <MetricCard
          title="Actividades Pendientes"
          value={metrics?.pendingActivities ?? 0}
          icon={ClipboardList}
          description="Tus tareas y seguimientos por hacer."
        />
      </div>
    </div>
  );
}
