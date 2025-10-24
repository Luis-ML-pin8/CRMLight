'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { LogicalAgent, LogicalCoordinator } from '@/types';
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
import { AgentForm } from './AgentForm';
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
import { cn } from '@/lib/utils';

export default function AgentsPage() {
  const [agents, setAgents] = useState<LogicalAgent[]>([]);
  const [coordinators, setCoordinators] = useState<LogicalCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<LogicalAgent | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const [agentsData, coordinatorsData] = await Promise.all([
        api.getAgents(),
        api.getCoordinators(),
      ]);
      setAgents(agentsData);
      setCoordinators(coordinatorsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAgentSaved = () => {
    fetchData();
    handleCloseModal();
  };

  const handleOpenCreateModal = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (agent: LogicalAgent) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
  }
  
  const handleDeleteAgent = async (agentId: string) => {
    try {
      await api.deleteAgentRole(agentId);
      fetchData();
    } catch (error) {
      console.error('Error deleting agent role:', error);
    }
  };

  const getCoordinatorName = (coordinatorId?: string) => {
    if (!coordinatorId) return <span className="text-muted-foreground">N/A</span>;
    const coordinator = coordinators.find((c) => c.coordinatorId === coordinatorId);
    return coordinator ? `${coordinator.nombre} ${coordinator.apellidos}` : <span className="text-destructive">Desconocido</span>;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agentes</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando agentes...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Coordinador</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">
                        {agent.nombre} {agent.apellidos}
                      </TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>
                        {getCoordinatorName(agent.idCoordinator)}
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="action" size="icon" onClick={() => handleOpenEditModal(agent)}>
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
                                rol de agente del usuario. Si no tiene otros roles, se eliminará su cuenta.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAgent(agent.agentId)}>
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
      <AgentForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        coordinators={coordinators}
        onAgentSaved={handleAgentSaved}
        agentToEdit={editingAgent}
      />
    </div>
  );
}
