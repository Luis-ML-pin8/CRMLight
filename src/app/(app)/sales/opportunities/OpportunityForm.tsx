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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Account, Contact, LogicalAgent, Opportunity, User, opportunityPhases, opportunityStates } from '@/types';
import api from '@/lib/api';
import { useEffect, useState, useMemo } from 'react';
import { allowedStatesMatrix } from '@/lib/opportunities-matrix';

const opportunityFormSchema = z.object({
  concepto: z.string().min(3, 'El concepto es requerido.'),
  idAccount: z.string().min(1, 'Debe seleccionar un cliente.'),
  idAgent: z.string().min(1, 'Debe seleccionar un agente.'),
  importe: z.coerce.number().min(0, 'El importe no puede ser negativo.'),
  fase: z.enum(opportunityPhases),
  estado: z.enum(opportunityStates),
  fechaVencimiento: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida.' }),
  descripcion: z.string().optional(),
  contactIds: z.array(z.string()).optional(),
});

type OpportunityFormValues = z.infer<typeof opportunityFormSchema>;

interface OpportunityFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpportunitySaved: () => void;
  allAccounts: Account[];
  allAgents: LogicalAgent[];
  allContacts: Contact[];
  currentUser: User;
  opportunityToEdit?: Opportunity | null;
}

export function OpportunityForm({
  isOpen,
  onOpenChange,
  onOpportunitySaved,
  allAccounts,
  allAgents,
  allContacts,
  currentUser,
  opportunityToEdit,
}: OpportunityFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!opportunityToEdit;

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: {
      concepto: '',
      idAccount: '',
      idAgent: '',
      importe: 0,
      fase: 'Detección',
      estado: 'Espera cliente',
      fechaVencimiento: '',
      descripcion: '',
      contactIds: [],
    },
  });

  const selectedAccountId = form.watch('idAccount');
  const selectedPhase = form.watch('fase');
  
  const availableContacts = useMemo(() => {
    return allContacts.filter(c => c.idAccount === selectedAccountId);
  }, [selectedAccountId, allContacts]);

  const availableStates = useMemo(() => {
    return allowedStatesMatrix[selectedPhase] || [];
  }, [selectedPhase]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && opportunityToEdit) {
        form.reset({
          ...opportunityToEdit,
          contactIds: opportunityToEdit.contactIds || [],
          fechaVencimiento: opportunityToEdit.fechaVencimiento,
        });
      } else {
        const agentRecord = allAgents.find(a => a.idUser === currentUser.id);
        form.reset({
          concepto: '',
          idAccount: '',
          idAgent: agentRecord?.agentId || '',
          importe: 0,
          fase: 'Detección',
          estado: 'Espera cliente',
          fechaVencimiento: '',
          descripcion: '',
          contactIds: [],
        });
      }
    }
  }, [opportunityToEdit, form, isEditing, isOpen, currentUser, allAgents]);
  
   useEffect(() => {
    // Resetear contactos si cambia la cuenta
    form.setValue('contactIds', []);
  }, [selectedAccountId, form]);

  useEffect(() => {
    // Ajustar el estado si el actual no es válido para la nueva fase
    if (!availableStates.includes(form.getValues('estado'))) {
      form.setValue('estado', availableStates[0]);
    }
  }, [selectedPhase, availableStates, form]);


  const onSubmit = async (data: OpportunityFormValues) => {
    setApiError(null);
    try {
      if (isEditing && opportunityToEdit) {
        await api.updateOpportunity(opportunityToEdit.id, data);
      } else {
        await api.createOpportunity(data);
      }
      onOpportunitySaved();
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
          <DialogTitle>{isEditing ? 'Editar Oportunidad' : 'Nueva Oportunidad'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos de la oportunidad.'
              : 'Complete los datos para crear una nueva oportunidad de venta.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField control={form.control} name="concepto" render={({ field }) => (
                <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="idAccount" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar un cliente" /></SelectTrigger></FormControl>
                            <SelectContent><SelectContent>
                                {allAccounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>{acc.nombre}</SelectItem>
                                ))}
                            </SelectContent></SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="idAgent" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Agente responsable</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!currentUser.isAdministrator && !currentUser.isCoordinator}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar un agente" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {allAgents.map((agent) => (
                                    <SelectItem key={agent.agentId} value={agent.agentId}>
                                        {agent.nombre} {agent.apellidos}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
             <FormField control={form.control} name="descripcion" render={({ field }) => (
                <FormItem>
                    <FormLabel>Descripción detallada</FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <FormField control={form.control} name="importe" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Importe (€)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="fechaVencimiento" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fecha Vencimiento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="fase" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fase</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {opportunityPhases.map((phase) => (
                                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="estado" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {availableStates.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            <FormField
              control={form.control}
              name="contactIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Contactos Implicados</FormLabel>
                  </div>
                  {availableContacts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableContacts.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="contactIds"
                        render={({ field }) => {
                          return (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.nombre} {item.apellidos}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                        No hay contactos para el cliente seleccionado o no se ha seleccionado un cliente.
                    </p>
                  )}
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
