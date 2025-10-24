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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Account, Contact } from '@/types';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { BrainCircuit } from 'lucide-react';

const contactFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  apellidos: z.string().min(2, { message: 'Los apellidos son requeridos.' }),
  email: z.string().email({ message: 'Debe ser un email válido.' }),
  telefono: z.string().min(9, { message: 'El teléfono debe tener al menos 9 dígitos.' }),
  cargo: z.string().optional(),
  idAccount: z.string().optional(),
  report: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onContactSaved: () => void;
  accounts: Account[];
  contactToEdit?: Contact | null;
  onOpenReport: () => void;
}

const NO_ACCOUNT_VALUE = '__NONE__';

export function ContactForm({
  isOpen,
  onOpenChange,
  onContactSaved,
  accounts,
  contactToEdit,
  onOpenReport,
}: ContactFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!contactToEdit;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nombre: '',
      apellidos: '',
      email: '',
      telefono: '',
      cargo: '',
      idAccount: undefined,
      report: '',
    },
  });

  useEffect(() => {
    if (isEditing && contactToEdit) {
      form.reset({
        ...contactToEdit,
        idAccount: contactToEdit.idAccount || undefined,
      });
    } else {
      form.reset({
        nombre: '',
        apellidos: '',
        email: '',
        telefono: '',
        cargo: '',
        idAccount: undefined,
        report: '',
      });
    }
  }, [contactToEdit, form, isEditing, isOpen]);


  const onSubmit = async (data: ContactFormValues) => {
    setApiError(null);
    try {
      const payload = { ...data };
      if (payload.idAccount === NO_ACCOUNT_VALUE) {
        payload.idAccount = undefined;
      }
      
      if (isEditing && contactToEdit) {
        await api.updateContact(contactToEdit.id, payload);
      } else {
        await api.createContact(payload);
      }
      onContactSaved();
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Contacto' : 'Añadir Nuevo Contacto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos del contacto.'
              : 'Complete los datos para crear un nuevo contacto.'}
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
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cargo"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="idAccount"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Cliente asociado (Opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || NO_ACCOUNT_VALUE}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar un cliente" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value={NO_ACCOUNT_VALUE}>-- Sin cliente asociado --</SelectItem>
                        {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                            {acc.nombre}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />

            {apiError && <p className="text-sm text-red-600">{apiError}</p>}

            <DialogFooter className="sm:justify-between">
              <div>
                {isEditing && (
                    <Button type="button" variant="outline" onClick={onOpenReport}>
                       <BrainCircuit className="mr-2 h-4 w-4" />
                       Generar Informe IA
                    </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
