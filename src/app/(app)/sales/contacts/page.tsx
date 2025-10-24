'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { Account, LogicalContact, Contact } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { ContactReportModal } from './ContactReportModal';
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

export default function ContactsPage() {
  const [allContacts, setAllContacts] = useState<LogicalContact[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<LogicalContact | null>(null);
  const [contactForReport, setContactForReport] = useState<LogicalContact | null>(null);

  // Estados para filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  async function fetchData() {
    try {
      setLoading(true);
      const [contactsData, accountsData] = await Promise.all([
        api.getContacts(),
        api.getAccounts(),
      ]);
      setAllContacts(contactsData);
      setAllAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredContacts = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    if (!lowercasedFilter) {
      return allContacts;
    }
    
    return allContacts.filter(contact => {
      const searchableString = [
        contact.nombre,
        contact.apellidos,
        contact.email,
        contact.telefono,
        contact.cargo,
        contact.accountName,
      ].join(' ').toLowerCase();
      
      return searchableString.includes(lowercasedFilter);
    });
  }, [allContacts, searchTerm]);

  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContacts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);
  
  const handleContactSaved = () => {
    fetchData();
    setIsFormModalOpen(false);
  };
  
  const handleReportGenerated = async (contactId: string) => {
    const updatedContacts = await api.getContacts();
    setAllContacts(updatedContacts);
    const updatedContact = updatedContacts.find(c => c.id === contactId);
    if (updatedContact) {
      setContactForReport(updatedContact);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingContact(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (contact: LogicalContact) => {
    setEditingContact(contact);
    setIsFormModalOpen(true);
  };

  const handleOpenReportModal = (contact: LogicalContact) => {
    setContactForReport(contact);
    setIsReportModalOpen(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await api.deleteContact(contactId);
      fetchData();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contactos</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contacto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <p>Cargando contactos...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Teléfono</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Cliente Asociado</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedContacts.length > 0 ? paginatedContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.nombre} {contact.apellidos}</TableCell>
                      <TableCell className="hidden sm:table-cell">{contact.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{contact.telefono}</TableCell>
                      <TableCell className="hidden md:table-cell">{contact.accountName || <span className="text-muted-foreground">N/A</span>}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button variant="action" size="icon" onClick={() => handleOpenEditModal(contact)}>
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
                                el contacto.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteContact(contact.id)}>
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
                totalItems={filteredContacts.length}
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
       <ContactForm
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onContactSaved={handleContactSaved}
        accounts={allAccounts}
        contactToEdit={editingContact}
        onOpenReport={() => {
            setIsFormModalOpen(false); // Cierra el modal de edición
            handleOpenReportModal(editingContact!);
        }}
      />
       <ContactReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        contact={contactForReport}
        onReportGenerated={handleReportGenerated}
        onBackToEdit={() => {
            setIsReportModalOpen(false);
            setIsFormModalOpen(true);
        }}
      />
    </div>
  );
}
