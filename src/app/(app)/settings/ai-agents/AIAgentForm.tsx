
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
import { Textarea } from '@/components/ui/textarea';
import { AIAgent } from '@/types';
import api from '@/lib/api';
import { useEffect, useState } from 'react';

const agentFormSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre es requerido.' }),
  prompt: z.string().min(50, { message: 'El prompt debe tener al menos 50 caracteres.' }),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface AIAgentFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAgentSaved: () => void;
  agentToEdit?: AIAgent | null;
}

export function AIAgentForm({
  isOpen,
  onOpenChange,
  onAgentSaved,
  agentToEdit,
}: AIAgentFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const isEditing = !!agentToEdit;

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      nombre: '',
      prompt: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && agentToEdit) {
        form.reset(agentToEdit);
      } else {
        form.reset({
          nombre: '',
          prompt: '',
        });
      }
    }
  }, [agentToEdit, form, isEditing, isOpen]);


  const onSubmit = async (data: AgentFormValues) => {
    setApiError(null);
    try {
      if (isEditing && agentToEdit) {
        await api.updateAIAgent(agentToEdit.id, data);
      } else {
        await api.createAIAgent(data);
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agente de IA' : 'Nuevo Agente de IA'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la configuración del agente.'
              : 'Define un nuevo agente especializado para tareas de IA.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Agente</FormLabel>
                  <FormControl><Input {...field} placeholder="Ej: Detective Privado" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt del Sistema</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={12} placeholder="Define el rol, contexto, tareas y formato de respuesta del agente de IA..." />
                  </FormControl>
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
