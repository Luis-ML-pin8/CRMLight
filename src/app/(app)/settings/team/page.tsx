'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TeamManagementPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Equipos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Aquí se ubicarán las herramientas para la gestión de equipos por lotes,
              como la reasignación de agentes entre coordinadores o la gestión masiva de carteras de clientes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
