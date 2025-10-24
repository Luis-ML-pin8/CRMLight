'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { LogicalActivity, LogicalOpportunity, LogicalAgent, User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ActivityForm } from '../activities/ActivityForm';
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
import { Badge } from '@/components/ui/badge';


interface OpportunityActivitiesModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  opportunity: LogicalOpportunity | null;
  allAgents: LogicalAgent[];
  allOpportunities: LogicalOpportunity[];
  currentUser: User | null;
}

export function OpportunityActivitiesModal({
  isOpen,
  onOpenChange,
  opportunity,
  allAgents,
  allOpportunities,
  currentUser,
}: OpportunityActivitiesModalProps) {
  const [activities, setActivities] = useState<LogicalActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<LogicalActivity | null>(null);

  async function fetchActivities() {
    if (!currentUser || !opportunity) return;
    try {
      setLoading(true);
      // Obtenemos TODAS las actividades del usuario y luego filtramos
      const allUserActivities = await api.getActivitiesByUser(currentUser);
      const opportunityActivities = allUserActivities.filter(a => a.idOpportunity === opportunity.id);
      setActivities(opportunityActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, opportunity, currentUser]);

  const handleActivitySaved = () => {
    fetchActivities();
    setIsActivityFormOpen(false);
    setEditingActivity(null);
  };

  const handleOpenCreateActivityModal = () => {
    setEditingActivity(null);
    setIsActivityFormOpen(true);
  };

  const handleOpenEditActivityModal = (activity: LogicalActivity) => {
    setEditingActivity(activity);
    setIsActivityFormOpen(true);
  };
  
  const handleCloseActivityForm = () => {
    setIsActivityFormOpen(false);
    setEditingActivity(null);
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await api.deleteActivity(activityId);
      fetchActivities();
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
  };

  if (!opportunity || !currentUser) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Actividades de la Oportunidad</DialogTitle>
            <DialogDescription>
              Gestiona las actividades para: <span className="font-semibold">{opportunity.concepto}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
             <div className="flex justify-end mb-4">
                 <Button size="sm" onClick={handleOpenCreateActivityModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Actividad
                </Button>
            </div>
            {loading ? (
              <p>Cargando actividades...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length > 0 ? activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.concepto}</TableCell>
                      <TableCell>{activity.tipo}</TableCell>
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
                      <TableCell>{formatDate(activity.fechaVencimiento)}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="action" size="icon" onClick={() => handleOpenEditActivityModal(activity)}>
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
                                Esta acción eliminará permanentemente la actividad.
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
                      </TableCell>DEPRECATED
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No hay actividades para esta oportunidad.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* El formulario de actividad se renderiza fuera del principal para evitar problemas de anidamiento de modales */}
      <ActivityForm
          isOpen={isActivityFormOpen}
          onOpenChange={handleCloseActivityForm}
          onActivitySaved={handleActivitySaved}
          allOpportunities={allOpportunities}
          allAgents={allAgents}
          currentUser={currentUser}
          activityToEdit={editingActivity}
          defaultOpportunityId={opportunity.id}
      />
    </>
  );
}
