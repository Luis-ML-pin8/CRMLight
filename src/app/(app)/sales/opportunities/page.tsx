'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { LogicalOpportunity, User, Account, LogicalAgent, Contact, LogicalActivity } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search, ClipboardList } from 'lucide-react';
import { OpportunityForm } from './OpportunityForm';
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
import { Pagination } from '@/components/ui/pagination';
import { OpportunityActivitiesModal } from './OpportunityActivitiesModal';

export default function OpportunitiesPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allOpportunities, setAllOpportunities] = useState<LogicalOpportunity[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [allAgents, setAllAgents] = useState<LogicalAgent[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<LogicalOpportunity | null>(null);

  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const [selectedOppForActivities, setSelectedOppForActivities] = useState<LogicalOpportunity | null>(null);

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
        const [opportunitiesData, accountsData, agentsData, contactsData] = await Promise.all([
          api.getOpportunitiesByUser(user),
          api.getAccounts(),
          api.getAgents(),
          api.getContacts(),
        ]);
        setAllOpportunities(opportunitiesData);
        setAllAccounts(accountsData);
        setAllAgents(agentsData);
        setAllContacts(contactsData);
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

  const filteredOpportunities = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) {
      return allOpportunities;
    }
    
    return allOpportunities.filter(opp => {
      const searchableString = [
        opp.concepto,
        opp.accountName,
        opp.agentName,
        opp.fase,
        opp.estado,
      ].join(' ').toLowerCase();
      
      return searchableString.includes(lowercasedFilter);
    });
  }, [allOpportunities, searchTerm]);

  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOpportunities.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOpportunities, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);
  
  const handleOpportunitySaved = () => {
    fetchData();
    handleCloseFormModal();
  };

  const handleOpenCreateModal = () => {
    setEditingOpportunity(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (opp: LogicalOpportunity) => {
    setEditingOpportunity(opp);
    setIsFormModalOpen(true);
  };
  
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingOpportunity(null);
  }

  const handleOpenActivitiesModal = (opp: LogicalOpportunity) => {
    setSelectedOppForActivities(opp);
    setIsActivitiesModalOpen(true);
  }
  
  const handleCloseActivitiesModal = () => {
    setIsActivitiesModalOpen(false);
    setSelectedOppForActivities(null);
    fetchData(); // Recargar datos por si se actualizó una oportunidad desde una actividad
  }


  const handleDeleteOpportunity = async (opportunityId: string) => {
    try {
      await api.deleteOpportunity(opportunityId);
      fetchData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
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
            <CardTitle>Oportunidades</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar oportunidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <p>Cargando oportunidades...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Concepto</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Cliente</TableHead>
                    <TableHead className="font-semibold hidden xl:table-cell">Agente</TableHead>
                    <TableHead className="font-semibold">Importe</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Fase</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Estado</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Vencimiento</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOpportunities.length > 0 ? paginatedOpportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell className="font-medium">{opp.concepto}</TableCell>
                      <TableCell className="hidden lg:table-cell">{opp.accountName}</TableCell>
                      <TableCell className="hidden xl:table-cell">{opp.agentName}</TableCell>
                      <TableCell>{formatCurrency(opp.importe)}</TableCell>
                      <TableCell className="hidden md:table-cell">{opp.fase}</TableCell>
                      <TableCell className="hidden md:table-cell">{opp.estado}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(opp.fechaVencimiento)}</TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="action" size="icon" title="Gestionar Actividades" onClick={() => handleOpenActivitiesModal(opp)}>
                          <ClipboardList className="h-4 w-4" />
                        </Button>
                        <Button variant="action" size="icon" title="Editar Oportunidad" onClick={() => handleOpenEditModal(opp)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="action" size="icon" title="Eliminar Oportunidad">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la oportunidad.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteOpportunity(opp.id)}>
                                Borrar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
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
                totalItems={filteredOpportunities.length}
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
        <>
          <OpportunityForm
            isOpen={isFormModalOpen}
            onOpenChange={setIsFormModalOpen}
            onOpportunitySaved={handleOpportunitySaved}
            allAccounts={allAccounts}
            allAgents={allAgents}
allContacts={allContacts}
            currentUser={currentUser}
            opportunityToEdit={editingOpportunity}
          />
          <OpportunityActivitiesModal
            isOpen={isActivitiesModalOpen}
            onOpenChange={handleCloseActivitiesModal}
            opportunity={selectedOppForActivities}
            allAgents={allAgents}
            allOpportunities={allOpportunities}
            currentUser={currentUser}
          />
        </>
      )}
    </div>
  );
}
