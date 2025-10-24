'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import AgentDashboard from './AgentDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import AdminDashboard from './AdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = sessionStorage.getItem('crmlight-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
       <div className="p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // Lógica de selección de Dashboard por rol
  if (user?.isAdministrator && !user.isCoordinator) {
    return <AdminDashboard user={user} />;
  }
  
  if (user?.isCoordinator) {
    return <CoordinatorDashboard user={user} />;
  }
  
  if (user?.isAgent) {
    return <AgentDashboard user={user} />;
  }

  return (
    <div className="flex-1 p-8">
      <p>No se ha podido determinar un rol para mostrar el dashboard.</p>
    </div>
  );
}
