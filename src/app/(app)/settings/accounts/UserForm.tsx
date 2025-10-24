'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const getUserFormSchema = (isEditing: boolean) =>
  z.object({
    nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
    apellidos: z.string().min(2, { message: 'Los apellidos son requeridos.' }),
    email: z.string().email({ message: 'Debe ser un email válido.' }),
    movil: z
      .string()
      .min(9, { message: 'El móvil debe tener al menos 9 dígitos.' }),
    usuario: z
      .string()
      .min(3, { message: 'El usuario debe tener al menos 3 caracteres.' }),
    password: isEditing
      ? z
          .string()
          .optional()
          .refine((val) => !val || val.length >= 6, {
            message: 'La contraseña debe tener al menos 6 caracteres.',
          })
      : z
          .string()
          .min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
    isAdministrator: z.boolean().default(false),
    isCoordinator: z.boolean().default(false),
    isAgent: z.boolean().default(false),
  });

type UserFormValues = z.infer<ReturnType<typeof getUserFormSchema>>;

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUserSaved: () => void;
  userToEdit?: User | null;
}

export function UserForm({
  isOpen,
  onOpenChange,
  onUserSaved,
  userToEdit,
}: UserFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!userToEdit;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(getUserFormSchema(isEditing)),
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      movil: '',
      usuario: '',
      password: '',
      isAdministrator: false,
      isCoordinator: false,
      isAgent: false,
    },
  });

  const isAdministratorWatcher = form.watch('isAdministrator');

  useEffect(() => {
    if (isEditing && userToEdit) {
      form.reset({
        nombre: userToEdit.nombre,
        apellidos: userToEdit.apellidos,
        email: userToEdit.email,
        movil: userToEdit.movil,
        usuario: userToEdit.usuario,
        password: '',
        isAdministrator: !!userToEdit.isAdministrator,
        isCoordinator: !!userToEdit.isCoordinator,
        isAgent: !!userToEdit.isAgent,
      });
    } else {
      form.reset({
        nombre: '',
        apellidos: '',
        email: '',
        movil: '',
        usuario: '',
        password: '',
        isAdministrator: false,
        isCoordinator: false,
        isAgent: false,
      });
    }
  }, [userToEdit, form, isEditing, isOpen]);
  
  useEffect(() => {
    if (isAdministratorWatcher) {
      form.setValue('isCoordinator', false);
      form.setValue('isAgent', false);
    }
  }, [isAdministratorWatcher, form]);


  const onSubmit = async (data: UserFormValues) => {
    setApiError(null);
    try {
        const userData: Partial<User> & { password?: string } = {
            nombre: data.nombre,
            apellidos: data.apellidos,
            email: data.email,
            movil: data.movil,
            usuario: data.usuario,
            isAdministrator: data.isAdministrator,
            isCoordinator: data.isCoordinator,
            isAgent: data.isAgent,
            ...(data.password ? { password: data.password } : {}),
        };

        if (isEditing && userToEdit) {
            await api.updateUser(userToEdit.id, userData);
        } else {
            await api.createUser({
                ...userData,
                password: data.password!, // Requerido en creación
            } as Omit<User, 'id'>);
        }
      
      onUserSaved();
    } catch (error: any) {
      setApiError(error.message || 'Ocurrió un error inesperado.');
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setApiError(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos y roles del usuario.'
              : 'Complete los datos para crear un nuevo usuario y asígnele roles.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="movil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Móvil</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="usuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} placeholder={isEditing ? 'Dejar en blanco para no cambiar' : ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 rounded-lg border p-4">
                <h3 className="text-sm font-medium">Roles de Usuario</h3>
                <div className="flex items-center space-x-8">
                    <FormField
                        control={form.control}
                        name="isAdministrator"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="font-normal">Administrador</FormLabel>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="isCoordinator"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isAdministratorWatcher}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">Coordinador</FormLabel>
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="isAgent"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={isAdministratorWatcher}
                                    />
                                </FormControl>
                                <FormLabel className="font-normal">Agente</FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
                {isAdministratorWatcher && <p className="text-xs text-muted-foreground pt-2">Un administrador no puede ser también agente o coordinador.</p>}
            </div>

             {apiError && <p className="text-sm text-red-600">{apiError}</p>}
             
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
