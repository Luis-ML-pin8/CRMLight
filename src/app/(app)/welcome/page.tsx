'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function WelcomePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido a CRMLight</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Esta es su página de inicio. Use el menú de la izquierda para
              navegar por la aplicación.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
