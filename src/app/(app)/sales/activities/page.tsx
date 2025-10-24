'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { LogicalActivity, User, LogicalOpportunity, LogicalAgent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { ActivityForm } from './ActivityForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export default function ActivitiesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allActivities, setAllActivities] = useState<LogicalActivity[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<LogicalOpportunity[]>([]);
  const [allAgents, setAllAgents] = useState<LogicalAgent[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<LogicalActivity | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  async function fetchData() {
    try {
      setLoading(true);
      const userData = sessionStorage.getItem('crmlight-user');
      const user = userData ? JSON.parse(userData) : null;
      setCurrentUser(user);

      if (user) {
        const [activitiesData, opportunitiesData, agentsData] = await Promise.all([
            api.getActivitiesByUser(user),
            api.getOpportunitiesByUser(user),
            api.getAgents(),
        ]);
        setAllActivities(activitiesData);
        setAllOpportunities(opportunitiesData);
        setAllAgents(agentsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredActivities = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) {
      return allActivities;
    }
    
    return allActivities.filter(activity => {
      const searchableString = [
        activity.concepto,
        activity.opportunityConcepto,
        activity.accountName,
        activity.agentName,
        activity.tipo,
        activity.estado,
      ].join(' ').toLowerCase();
      
      return searchableString.includes(lowercasedFilter);
    });
  }, [allActivities, searchTerm]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredActivities, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handleActivitySaved = () => {
    fetchData();
    handleCloseModal();
  };

  const handleOpenCreateModal = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (activity: LogicalActivity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await api.deleteActivity(activityId);
      fetchData();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Actividades</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal} disabled>
              <Plus className="h-4 w-4 mr-2" />
              Nueva (desde Oportunidad)
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar actividad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <p>Cargando actividades...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Concepto</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Oportunidad</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Estado</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Vencimiento</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedActivities.length > 0 ? paginatedActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.concepto}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div title={`Cliente: ${activity.accountName}`}>
                          {activity.opportunityConcepto}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{activity.tipo}</TableCell>
                      <TableCell className="hidden md:table-cell">{activity.estado}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(activity.fechaVencimiento)}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="action" size="icon" onClick={() => handleOpenEditModal(activity)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="action" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la actividad.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteActivity(activity.id)}>
                                Borrar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No se encontraron resultados.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter>
             <Pagination
                totalItems={filteredActivities.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
            />
          </CardFooter>
        </Card>
      </div>
       {currentUser && (
        <ActivityForm
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onActivitySaved={handleActivitySaved}
          allOpportunities={allOpportunities}
          allAgents={allAgents}
          currentUser={currentUser}
          activityToEdit={editingActivity}
        />
      )}
    </div>
  );
}
