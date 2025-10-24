
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AIAgent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { AIAgentForm } from './AIAgentForm';
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

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      const agentsData = await api.getAIAgents();
      setAgents(agentsData);
    } catch (error) {
      console.error('Error fetching AI agents:', error);
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

  const handleOpenEditModal = (agent: AIAgent) => {
    setEditingAgent(agent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await api.deleteAIAgent(agentId);
      fetchData();
    } catch (error) {
      console.error('Error deleting AI agent:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agentes de IA</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Agente IA
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
                    <TableHead className="font-semibold hidden md:table-cell">Prompt (resumen)</TableHead>
                    <TableHead className="font-semibold text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.nombre}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {agent.prompt.substring(0, 150)}...
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
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el agente de IA.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAgent(agent.id)}>
                                Borrar
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
      <AIAgentForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAgentSaved={handleAgentSaved}
        agentToEdit={editingAgent}
      />
    </div>
  );
}
