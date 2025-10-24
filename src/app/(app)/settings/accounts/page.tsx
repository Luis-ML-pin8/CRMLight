'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { User } from '@/types';
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
import { UserForm } from './UserForm';
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

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('crmlight-user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserSaved = () => {
    fetchData();
    handleCloseModal();
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const baseBadgeStyle = "inline-block text-xs mr-2 px-2.5 py-0.5 rounded-full";
  const roleBadgeStyle = `${baseBadgeStyle} bg-accent/10 border border-accent/20 text-accent`;
  const noRoleBadgeStyle = `${baseBadgeStyle} bg-muted text-muted-foreground`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cuentas de Usuario</CardTitle>
            <Button size="sm" onClick={handleOpenCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando usuarios...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-center">Nombre</TableHead>
                    <TableHead className="font-semibold text-center">Email</TableHead>
                    <TableHead className="text-center font-semibold">Roles</TableHead>
                    <TableHead className="text-center font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isSelf = currentUser?.id === user.id;
                    const isDeleteDisabled = !user.isDeletable || isSelf;

                    let deleteTooltip = '';
                    if (!user.isDeletable) deleteTooltip = 'No se puede eliminar al único administrador.';
                    else if (isSelf) deleteTooltip = 'No puede eliminar su propia cuenta.';

                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          {user.nombre} {user.apellidos}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className='text-center'>
                            <div className='space-x-1'>
                              {user.isAdministrator && <div className={roleBadgeStyle}>Admin</div>}
                              {user.isCoordinator && <div className={roleBadgeStyle}>Coord.</div>}
                              {user.isAgent && <div className={roleBadgeStyle}>Agent</div>}
                              {!user.isAdministrator && !user.isCoordinator && !user.isAgent && <div className={noRoleBadgeStyle}>N/A</div>}
                            </div>
                        </TableCell>
                        <TableCell className="text-center space-x-2">
                          <Button variant="action" size="icon" onClick={() => handleOpenEditModal(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <span title={deleteTooltip}>
                                <Button variant="action" size="icon" disabled={isDeleteDisabled}>
                                  <Trash2 className={cn('h-4 w-4', isDeleteDisabled ? 'text-muted-foreground/50' : 'text-destructive')} />
                                </Button>
                              </span>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto eliminará permanentemente
                                  el usuario y todos sus datos asociados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                  Borrar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
       <UserForm
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onUserSaved={handleUserSaved}
        userToEdit={editingUser}
      />
    </div>
  );
}
