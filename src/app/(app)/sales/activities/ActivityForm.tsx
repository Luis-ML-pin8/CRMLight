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
import { Activity, LogicalAgent, LogicalOpportunity, User, activityStates, activityTypes, opportunityPhases, opportunityStates } from '@/types';
import api from '@/lib/api';
import { useEffect, useState, useMemo } from 'react';
import { allowedStatesMatrix } from '@/lib/opportunities-matrix';

const activityFormSchema = z.object({
  idOpportunity: z.string().min(1, 'Debe seleccionar una oportunidad.'),
  idAgent: z.string().min(1, 'Debe seleccionar un agente.'),
  tipo: z.enum(activityTypes),
  estado: z.enum(activityStates),
  fechaVencimiento: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Fecha inválida.' }),
  concepto: z.string().min(3, 'El concepto es requerido.'),
  notas: z.string().optional(),
  expectativa: z.string().optional(),
  // Campos para actualizar la oportunidad
  updateOpportunityPhase: z.enum(opportunityPhases).optional(),
  updateOpportunityState: z.enum(opportunityStates).optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onActivitySaved: () => void;
  allOpportunities: LogicalOpportunity[];
  allAgents: LogicalAgent[];
  currentUser: User;
  activityToEdit?: Activity | null;
  // Si se proporciona, el formulario se inicializará con esta oportunidad (para creación)
  defaultOpportunityId?: string;
}

export function ActivityForm({
  isOpen,
  onOpenChange,
  onActivitySaved,
  allOpportunities,
  allAgents,
  currentUser,
  activityToEdit,
  defaultOpportunityId,
}: ActivityFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!activityToEdit;

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      idOpportunity: '',
      idAgent: '',
      tipo: 'Comunicación',
      estado: 'Pendiente',
      fechaVencimiento: '',
      concepto: '',
      notas: '',
      expectativa: '',
      updateOpportunityPhase: undefined,
      updateOpportunityState: undefined,
    },
  });
  
  const selectedType = form.watch('tipo');
  const selectedStatus = form.watch('estado');
  const selectedOpportunityId = form.watch('idOpportunity');

  const selectedOpportunity = useMemo(() => {
    return allOpportunities.find(o => o.id === selectedOpportunityId);
  }, [selectedOpportunityId, allOpportunities]);
  
  const opportunityDisplayText = useMemo(() => {
    if (!selectedOpportunity) return "N/A";
    return `${selectedOpportunity.concepto} (${selectedOpportunity.accountName})`;
  }, [selectedOpportunity]);

  const availableOppStates = useMemo(() => {
    const phase = form.watch('updateOpportunityPhase') || selectedOpportunity?.fase;
    if (!phase) return [];
    return allowedStatesMatrix[phase] || [];
  }, [form, selectedOpportunity]);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && activityToEdit) {
        form.reset({
          ...activityToEdit,
          updateOpportunityPhase: undefined,
          updateOpportunityState: undefined,
        });
      } else {
        const agentRecord = allAgents.find(a => a.idUser === currentUser.id);
        form.reset({
          idOpportunity: defaultOpportunityId || '',
          idAgent: agentRecord?.agentId || '',
          tipo: 'Comunicación',
          estado: 'Pendiente',
          fechaVencimiento: new Date().toISOString().split('T')[0],
          concepto: '',
          notas: '',
          expectativa: '',
        });
      }
    }
  }, [activityToEdit, form, isEditing, isOpen, currentUser, allAgents, defaultOpportunityId]);
  
  useEffect(() => {
    if (selectedOpportunity) {
      form.setValue('updateOpportunityPhase', selectedOpportunity.fase);
      form.setValue('updateOpportunityState', selectedOpportunity.estado);
    }
  }, [selectedOpportunity, form]);

  useEffect(() => {
    // Si el estado de oportunidad que se quiere poner deja de ser válido por un cambio de fase, se resetea.
    const newPhase = form.watch('updateOpportunityPhase');
    if (newPhase) {
      const allowedStates = allowedStatesMatrix[newPhase];
      if (!allowedStates.includes(form.getValues('updateOpportunityState')!)) {
        form.setValue('updateOpportunityState', allowedStates[0]);
      }
    }
  }, [form.watch('updateOpportunityPhase'), form]);

  const onSubmit = async (data: ActivityFormValues) => {
    setApiError(null);
    try {
      const activityPayload = {
        idOpportunity: data.idOpportunity,
        idAgent: data.idAgent,
        tipo: data.tipo,
        estado: data.estado,
        fechaVencimiento: data.fechaVencimiento,
        concepto: data.concepto,
        notas: data.notas,
        expectativa: data.expectativa,
        fechaFinReal: data.estado !== 'Pendiente' ? new Date().toISOString().split('T')[0] : undefined,
        nuevosDatosOportunidad: data.estado === 'Completada' && (data.updateOpportunityPhase || data.updateOpportunityState) ? {
            fase: data.updateOpportunityPhase,
            estado: data.updateOpportunityState,
        } : undefined,
      };

      if (isEditing && activityToEdit) {
        await api.updateActivity(activityToEdit.id, activityPayload);
      } else {
        await api.createActivity(activityPayload);
      }
      onActivitySaved();
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
          <DialogTitle>{isEditing ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifique los datos de la actividad.'
              : 'Complete los datos para crear una nueva actividad.'}
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
               <FormField control={form.control} name="idOpportunity" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Oportunidad</FormLabel>
                       <FormControl>
                          <Input
                              readOnly
                              value={opportunityDisplayText}
                              className="bg-muted/50 cursor-not-allowed"
                          />
                      </FormControl>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField control={form.control} name="fechaVencimiento" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fecha Vencimiento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="tipo" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                {activityTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
                                {activityStates.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
            </div>
            
            {selectedType === 'Reunión' && (
                <FormField control={form.control} name="expectativa" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Expectativa de la reunión</FormLabel>
                        <FormControl><Textarea {...field} rows={2} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}/>
            )}

            <FormField control={form.control} name="notas" render={({ field }) => (
                <FormItem>
                    <FormLabel>
                        {selectedType === 'Reunión' ? 'Acta / Resumen de la reunión' : 'Notas'}
                    </FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            
            {selectedStatus === 'Completada' && selectedOpportunity && (
              <div className="p-4 border rounded-lg bg-accent/20 space-y-4">
                <h3 className="text-sm font-semibold">Actualizar Oportunidad Asociada</h3>
                <p className="text-xs text-muted-foreground">Al completar esta actividad, puede actualizar el estado de la oportunidad '{selectedOpportunity.concepto}'.</p>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="updateOpportunityPhase" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nueva Fase</FormLabel>
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
                  <FormField control={form.control} name="updateOpportunityState" render={({ field }) => (
                      <FormItem>
                          <FormLabel>Nuevo Estado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                  {availableOppStates.map((state) => (
                                      <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                          <FormMessage />
                      </FormItem>
                  )}/>
                </div>
              </div>
            )}


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
