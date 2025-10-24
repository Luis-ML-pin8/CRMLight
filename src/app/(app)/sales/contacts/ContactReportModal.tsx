'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Contact } from '@/types';
import api from '@/lib/api';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';

interface ContactReportModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  contact: Contact | null;
  onReportGenerated: (contactId: string) => void;
  onBackToEdit: () => void;
}

export function ContactReportModal({
  isOpen,
  onOpenChange,
  contact,
  onReportGenerated,
  onBackToEdit,
}: ContactReportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!contact) return null;

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.generateContactReport(contact);
      onReportGenerated(contact.id);
    } catch (err: any) {
      setError(err.message || 'No se pudo generar el informe.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Informe de IA: {contact.nombre} {contact.apellidos}</DialogTitle>
          <DialogDescription>
            Informe generado por el agente "Detective Privado". Puede solicitar una nueva versión.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <Textarea
                readOnly
                value={contact.report || 'Aún no se ha generado un informe para este contacto.'}
                className="h-80 resize-none bg-muted/30"
            />
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <DialogFooter className="sm:justify-between">
           <Button type="button" variant="ghost" onClick={onBackToEdit}>
             <ArrowLeft className="mr-2 h-4 w-4" />
             Volver a Edición
           </Button>
           <Button onClick={handleGenerateReport} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Nuevo Informe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
