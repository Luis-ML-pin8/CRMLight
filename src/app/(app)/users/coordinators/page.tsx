'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { LogicalCoordinator } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { CoordinatorForm } from './CoordinatorForm';
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

export default function CoordinatorsPage() {
  const [coordinators, setCoordinators] = useState<LogicalCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoordinator, setEditingCoordinator] = useState<LogicalCoordinator | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const coordinatorsData = await api.getCoordinators();
      setCoordinators(coordinatorsData);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleCoordinatorSaved = () => {
    fetchData();
    handleCloseModal();
  };

  const handleOpenCreateModal = () => {
    setEditingCoordinator(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coordinator: LogicalCoordinator) => {
    setEditingCoordinator(coordinator);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoordinator(null);
  }
  
  const handleDeleteCoordinator = async (coordinatorId: string) => {
    try {
      await api.deleteCoordinatorRole(coordinatorId);
      fetchData();
    } catch (error) {
      console.error('Error deleting coordinator role:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Coordinadores</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando coordinadores...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-center">Nombre</TableHead>
                    <TableHead className="font-semibold text-center">Email</TableHead>
                    <TableHead className="text-center font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coordinators.map((coordinator) => (
                    <TableRow key={coordinator.coordinatorId}>
                      <TableCell className="font-medium">
                        {coordinator.nombre} {coordinator.apellidos}
                      </TableCell>
                      <TableCell>{coordinator.email}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="action" size="icon" onClick={() => handleOpenEditModal(coordinator)}>
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
                                Esta acción no se puede deshacer. Esto eliminará el
                                rol de coordinador del usuario. Si no tiene otros roles, se eliminará su cuenta. El equipo a su cargo quedará sin asignar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCoordinator(coordinator.coordinatorId)}>
                                Borrar Rol
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
       <CoordinatorForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCoordinatorSaved={handleCoordinatorSaved}
        coordinatorToEdit={editingCoordinator}
      />
    </div>
  );
}
