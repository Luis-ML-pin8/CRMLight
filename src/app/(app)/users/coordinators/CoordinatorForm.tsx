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
import { LogicalCoordinator, User } from '@/types';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

const getCoordinatorFormSchema = (isEditing: boolean) =>
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
  });

type CoordinatorFormValues = z.infer<ReturnType<typeof getCoordinatorFormSchema>>;

interface CoordinatorFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCoordinatorSaved: () => void;
  coordinatorToEdit?: LogicalCoordinator | null;
}

export function CoordinatorForm({
  isOpen,
  onOpenChange,
  onCoordinatorSaved,
  coordinatorToEdit,
}: CoordinatorFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!coordinatorToEdit;

  const form = useForm<CoordinatorFormValues>({
    resolver: zodResolver(getCoordinatorFormSchema(isEditing)),
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      movil: '',
      usuario: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isEditing && coordinatorToEdit) {
      form.reset({
        nombre: coordinatorToEdit.nombre,
        apellidos: coordinatorToEdit.apellidos,
        email: coordinatorToEdit.email,
        movil: coordinatorToEdit.movil,
        usuario: coordinatorToEdit.usuario,
        password: '',
      });
    } else {
      form.reset({
        nombre: '',
        apellidos: '',
        email: '',
        movil: '',
        usuario: '',
        password: '',
      });
    }
  }, [coordinatorToEdit, form, isEditing, isOpen]);


  const onSubmit = async (data: CoordinatorFormValues) => {
    setApiError(null);
    try {
      if (isEditing && coordinatorToEdit) {
          // --- MODO EDICIÓN ---
          const userUpdates: Partial<User> = {
              nombre: data.nombre,
              apellidos: data.apellidos,
              email: data.email,
              movil: data.movil,
              usuario: data.usuario,
              ...(data.password && { password: data.password }),
          };
          await api.updateUser(coordinatorToEdit.idUser, userUpdates);
          // El rol de coordinador no tiene campos adicionales que actualizar
      } else {
          // --- MODO CREACIÓN ---
          const userPayload: Omit<User, 'id'> = {
              nombre: data.nombre,
              apellidos: data.apellidos,
              email: data.email,
              movil: data.movil,
              usuario: data.usuario,
              password: data.password!,
              isCoordinator: true, // Se asigna el rol en la creación
          };
          
          await api.createUser(userPayload);
      }
      
      onCoordinatorSaved();
    } catch (error: any)      {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Coordinador' : 'Añadir Nuevo Coordinador'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos del coordinador.'
              : 'Complete los datos para crear un nuevo usuario y asignarle el rol de coordinador.'}
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
