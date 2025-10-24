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
import { Account } from '@/types';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { countries } from '@/lib/countries';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

const accountFormSchema = z.object({
  nombre: z.string().min(2, { message: 'El nombre es requerido.' }),
  cifnif: z.string().min(9, { message: 'El CIF/NIF debe tener al menos 9 caracteres.' }),
  direccion: z.string().min(5, { message: 'La dirección es requerida.' }),
  poblacion: z.string().min(2, { message: 'La población es requerida.' }),
  provincia: z.string().min(2, { message: 'La provincia es requerida.' }),
  cp: z.string().min(5, { message: 'El CP debe tener 5 dígitos.' }).max(5),
  pais: z.string().min(2, { message: 'El país es requerido.' }),
  telefono: z.string().min(9, { message: 'El teléfono debe tener al menos 9 dígitos.' }),
  email: z.string().email({ message: 'Debe ser un email válido.' }),
  website: z.string().url({ message: 'Debe ser una URL válida.' }).optional().or(z.literal('')),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAccountSaved: () => void;
  accountToEdit?: Account | null;
}

export function AccountForm({
  isOpen,
  onOpenChange,
  onAccountSaved,
  accountToEdit,
}: AccountFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isEditing = !!accountToEdit;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      nombre: '',
      cifnif: '',
      direccion: '',
      poblacion: '',
      provincia: '',
      cp: '',
      pais: 'España',
      telefono: '',
      email: '',
      website: '',
    },
  });

  useEffect(() => {
    if (isEditing && accountToEdit) {
      form.reset(accountToEdit);
    } else {
      form.reset({
        nombre: '',
        cifnif: '',
        direccion: '',
        poblacion: '',
        provincia: '',
        cp: '',
        pais: 'España',
        telefono: '',
        email: '',
        website: '',
      });
    }
  }, [accountToEdit, form, isEditing, isOpen]);


  const onSubmit = async (data: AccountFormValues) => {
    setApiError(null);
    try {
      if (isEditing && accountToEdit) {
        await api.updateAccount(accountToEdit.id, data);
      } else {
        await api.createAccount(data);
      }
      onAccountSaved();
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
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos del cliente.'
              : 'Complete los datos para crear un nuevo cliente.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                    <FormItem className="md:col-span-7">
                        <FormLabel>Nombre o Razón Social</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cifnif"
                    render={({ field }) => (
                    <FormItem className="md:col-span-3">
                        <FormLabel>CIF / NIF</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                    control={form.control}
                    name="poblacion"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Población</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="cp"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>C.P.</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value
                                ? countries.find(
                                    (country) => country === field.value
                                  )
                                : 'Seleccione un país'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar país..." defaultValue={field.value ?? ''} />
                            <CommandEmpty>No se encontró el país.</CommandEmpty>
                            <CommandGroup>
                                <div className="max-h-60 overflow-y-auto">
                                    {countries.map((country) => (
                                    <CommandItem
                                        value={country}
                                        key={country}
                                        onSelect={() => {
                                          form.setValue('pais', country);
                                          setIsPopoverOpen(false);
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            country === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                        />
                                        {country}
                                    </CommandItem>
                                    ))}
                                </div>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sitio Web</FormLabel>
                        <FormControl><Input {...field} placeholder="https://www.ejemplo.com" /></FormControl>
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
