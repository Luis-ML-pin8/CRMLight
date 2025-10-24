'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DashboardMetrics, User } from '@/types';
import { Briefcase, Building2, Users, TrendingUp } from 'lucide-react';
import { MetricCard, MetricCardSkeleton } from '@/components/ui/metric-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OpportunitiesChart } from '@/components/charts/OpportunitiesChart';
import { ActivitiesChart } from '@/components/charts/ActivitiesChart';

interface CoordinatorDashboardProps {
  user: User;
}

export default function CoordinatorDashboard({ user }: CoordinatorDashboardProps) {
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
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };


  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
        <Card>
            <CardHeader><CardTitle>Actividad Reciente</CardTitle></CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div className="h-8 w-full bg-muted rounded-md animate-pulse"></div>
                    <div className="h-8 w-full bg-muted rounded-md animate-pulse"></div>
                    <div className="h-8 w-full bg-muted rounded-md animate-pulse"></div>
                 </div>
            </CardContent>
        </Card>
      </div>
    );
  }

  const roleText = user.isAdministrator ? 'Global' : 'Coordinador';

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold tracking-tight mb-6">Panel de {roleText}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          description="Oportunidades globales."
        />
        <MetricCard
          title="Ingresos (Ganadas)"
          value={formatCurrency(metrics?.totalRevenue)}
          icon={TrendingUp}
          description="Suma de importes de oportunidades ganadas."
        />
        <MetricCard
          title="Usuarios Activos"
          value={metrics?.totalUsers ?? 0}
          icon={Users}
          description="Total de cuentas de usuario."
        />
      </div>

      <div className="grid gap-6 mt-8 md:grid-cols-2">
          <OpportunitiesChart data={metrics?.opportunitiesEvolution} />
          <ActivitiesChart data={metrics?.activitiesEvolution} />
      </div>


      {user.isCoordinator && !user.isAdministrator && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente del Equipo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="hidden md:table-cell">Agente</TableHead>
                          <TableHead className="hidden lg:table-cell">Oportunidad</TableHead>
                          <TableHead className="hidden md:table-cell">Vencimiento</TableHead>
                          <TableHead>Estado</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {metrics?.recentActivities && metrics.recentActivities.length > 0 ? (
                          metrics.recentActivities.map(activity => (
                              <TableRow key={activity.id}>
                                  <TableCell className="font-medium">{activity.concepto}</TableCell>
                                  <TableCell className="hidden md:table-cell">{activity.agentName}</TableCell>
                                  <TableCell className="hidden lg:table-cell">{activity.opportunityConcepto}</TableCell>
                                  <TableCell className="hidden md:table-cell">{formatDate(activity.fechaVencimiento)}</TableCell>
                                  <TableCell>
                                      <Badge
                                          variant={
                                              activity.estado === 'Completada' ? 'success' :
                                              activity.estado === 'Cancelada' ? 'destructive' :
                                              'secondary'
                                          }
                                      >
                                          {activity.estado}
                                      </Badge>
                                  </TableCell>
                              </TableRow>
                          ))
                      ) : (
                          <TableRow>
                              <TableCell colSpan={5} className="h-24 text-center">No hay actividad reciente.</TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
