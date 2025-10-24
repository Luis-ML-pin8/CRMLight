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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LogicalCoordinator, LogicalAgent, User } from '@/types';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

const getAgentFormSchema = (isEditing: boolean) =>
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
    idCoordinator: z.string().optional(),
  });

type AgentFormValues = z.infer<ReturnType<typeof getAgentFormSchema>>;

interface AgentFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  coordinators: LogicalCoordinator[];
  onAgentSaved: () => void;
  agentToEdit?: LogicalAgent | null;
}

export function AgentForm({
  isOpen,
  onOpenChange,
  coordinators,
  onAgentSaved,
  agentToEdit,
}: AgentFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!agentToEdit;

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(getAgentFormSchema(isEditing)),
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      movil: '',
      usuario: '',
      password: '',
      idCoordinator: undefined,
    },
  });

  useEffect(() => {
    if (isEditing && agentToEdit) {
      form.reset({
        nombre: agentToEdit.nombre,
        apellidos: agentToEdit.apellidos,
        email: agentToEdit.email,
        movil: agentToEdit.movil,
        usuario: agentToEdit.usuario,
        password: '',
        idCoordinator: agentToEdit.idCoordinator,
      });
    } else {
      form.reset({
        nombre: '',
        apellidos: '',
        email: '',
        movil: '',
        usuario: '',
        password: '',
        idCoordinator: undefined,
      });
    }
  }, [agentToEdit, form, isEditing, isOpen]);


  const onSubmit = async (data: AgentFormValues) => {
    setApiError(null);
    try {
      if (isEditing && agentToEdit) {
          // --- MODO EDICIÓN ---
          const userUpdates: Partial<User> = {
              nombre: data.nombre,
              apellidos: data.apellidos,
              email: data.email,
              movil: data.movil,
              usuario: data.usuario,
              ...(data.password && { password: data.password }),
          };
          await api.updateUser(agentToEdit.idUser, userUpdates);

          // Actualizar el coordinador del agente si ha cambiado
          if (data.idCoordinator !== agentToEdit.idCoordinator) {
              await api.updateAgent(agentToEdit.agentId, {
                  idCoordinator: data.idCoordinator || undefined,
              });
          }

      } else {
          // --- MODO CREACIÓN ---
          const userPayload: Omit<User, 'id'> = {
              nombre: data.nombre,
              apellidos: data.apellidos,
              email: data.email,
              movil: data.movil,
              usuario: data.usuario,
              password: data.password!,
              isAgent: true,
          };
          
          const newUser = await api.createUser(userPayload);

          // Si se especificó un coordinador, lo asignamos al nuevo agente
          if (data.idCoordinator) {
              const agentRole = await api.getAgents().then(agents => agents.find(a => a.idUser === newUser.id));
              if (agentRole) {
                  await api.updateAgent(agentRole.agentId, { idCoordinator: data.idCoordinator });
              }
          }
      }
      
      onAgentSaved();
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agente' : 'Añadir Nuevo Agente'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos del agente.'
              : 'Complete los datos para crear un nuevo usuario y asignarle el rol de agente.'}
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
            <FormField
              control={form.control}
              name="idCoordinator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coordinador (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Asignar un coordinador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coordinators.map((c) => (
                        <SelectItem key={c.coordinatorId} value={c.coordinatorId}>
                          {c.nombre} {c.apellidos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
