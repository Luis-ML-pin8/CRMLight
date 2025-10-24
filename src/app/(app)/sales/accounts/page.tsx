'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Account } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { AccountForm } from './AccountForm';
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

export default function AccountsPage() {
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  async function fetchData() {
    try {
      setLoading(true);
      const accountsData = await api.getAccounts();
      setAllAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAccounts = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) {
      return allAccounts;
    }
    
    return allAccounts.filter(account => {
      // Concatenamos todos los campos relevantes en una sola cadena de texto
      const searchableString = [
        account.nombre,
        account.cifnif,
        account.telefono,
        account.email,
        account.poblacion,
        account.provincia,
        account.pais,
      ].join(' ').toLowerCase();
      
      return searchableString.includes(lowercasedFilter);
    });
  }, [allAccounts, searchTerm]);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAccounts, currentPage, itemsPerPage]);

  useEffect(() => {
    // Reset a la página 1 si los filtros cambian
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);
  
  const handleAccountSaved = () => {
    fetchData();
    handleCloseModal();
  };

  const handleOpenCreateModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await api.deleteAccount(accountId);
      fetchData();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Clientes</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent>
            {/* --- FILTRO UNIFICADO --- */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <p>Cargando clientes...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">CIF/NIF</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Teléfono</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Email</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAccounts.length > 0 ? paginatedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.nombre}</TableCell>
                      <TableCell>{account.cifnif}</TableCell>
                      <TableCell className="hidden md:table-cell">{account.telefono}</TableCell>
                      <TableCell className="hidden lg:table-cell">{account.email}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="action" size="icon" onClick={() => handleOpenEditModal(account)}>
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
                                Esta acción no se puede deshacer. Esto eliminará permanentemente
                                el cliente y todos sus datos asociados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAccount(account.id)}>
                                Borrar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
                totalItems={filteredAccounts.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => setItemsPerPage(Number(value))}
            />
          </CardFooter>
        </Card>
      </div>
       <AccountForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAccountSaved={handleAccountSaved}
        accountToEdit={editingAccount}
      />
    </div>
  );
}
