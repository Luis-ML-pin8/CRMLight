import { User, Agent, Coordinator, Account, Contact, Portfolio, Opportunity, Activity, AIAgent } from '@/types';

// --- Helper para fechas ---
const getDateString = (offsetDays: number = 0, baseDate: Date = new Date()): string => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString().split('T')[0];
};


// Datos de prueba para usuarios
export const users: User[] = [
  {
    id: '1',
    nombre: 'Admin',
    apellidos: 'Principal',
    email: 'admin@crmlight.com',
    movil: '600000001',
    usuario: 'admin',
    password: 'password123',
    isAdministrator: true,
  },
  {
    id: '2',
    nombre: 'Juan',
    apellidos: 'Pérez',
    email: 'juan.perez@example.com',
    movil: '600000002',
    usuario: 'jperez',
    password: 'password123',
    isAdministrator: false,
  },
  {
    id: '3',
    nombre: 'Ana',
    apellidos: 'García',
    email: 'ana.garcia@example.com',
    movil: '600000003',
    usuario: 'agarcia',
    password: 'password123',
    isAdministrator: false,
  },
  {
    id: '4',
    nombre: 'Carlos',
    apellidos: 'Sánchez',
    email: 'carlos.sanchez@example.com',
    movil: '600000004',
    usuario: 'csanchez',
    password: 'password123',
    isAdministrator: false,
  },
];

// Datos de prueba para coordinadores
export const coordinators: Coordinator[] = [
  {
    id: '1',
    idUser: '4', // Carlos Sánchez es un coordinador
  }
];

// Datos de prueba para agentes
export const agents: Agent[] = [
  {
    id: '1',
    idUser: '2', // Juan Pérez es un agente
    idCoordinator: '1', // Su coordinador es Carlos Sánchez
  },
  {
    id: '2',
    idUser: '3', // Ana García es una agente
    idCoordinator: '1', // Su coordinadora es también Carlos Sánchez
  },
];

// Datos de prueba para cuentas/clientes
export const accounts: Account[] = Array.from({ length: 35 }, (_, i) => ({
    id: (i + 1).toString(),
    nombre: `Empresa Ejemplo ${i + 1}`,
    cifnif: `A123456${i.toString().padStart(2, '0')}`,
    direccion: `Calle Falsa ${i + 1}, ${i % 2 === 0 ? 'Piso 2' : 'Local B'}`,
    poblacion: 'Ciudad Ejemplo',
    provincia: 'Provincia Ficticia',
    cp: `${28001 + i}`,
    pais: 'España',
    telefono: `9100000${i.toString().padStart(2, '0')}`,
    email: `contacto${i + 1}@empresa-ejemplo.com`,
    website: `www.empresa-ejemplo${i + 1}.com`,
}));

// Nueva entidad: Contactos
export const contacts: Contact[] = [
  { id: '1', idAccount: '1', nombre: 'Lucía', apellidos: 'Martín', email: 'lucia.martin@empresa-ejemplo.com', telefono: '611223344', cargo: 'Directora de Compras', report: '' },
  { id: '2', idAccount: '1', nombre: 'David', apellidos: 'Ruiz', email: 'david.ruiz@empresa-ejemplo.com', telefono: '611223355', cargo: 'Jefe de IT', report: '' },
  { id: '3', idAccount: '2', nombre: 'Elena', apellidos: 'Blanco', email: 'elena.blanco@otra-empresa.es', telefono: '622334455', cargo: 'Gerente', report: '' },
  { id: '4', nombre: 'Javier', apellidos: 'Soria', email: 'javier.soria@consultorindependiente.com', telefono: '633445566', cargo: 'Consultor Freelance', report: '' },
  { id: '5', idAccount: '3', nombre: 'Pedro', apellidos: 'Jimenez', email: 'pedro.jimenez@empresa-ejemplo3.com', telefono: '644556677', cargo: 'Director Financiero', report: '' },
  { id: '6', idAccount: '4', nombre: 'Sofia', apellidos: 'Nuñez', email: 'sofia.nunez@empresa-ejemplo4.com', telefono: '655667788', cargo: 'Responsable de Marketing', report: '' },
];


// Nueva entidad: Cartera (relación Agente-Cuenta)
export const portfolios: Portfolio[] = [
  // Juan Pérez (agente id '1') tiene 3 clientes en su cartera
  { id: '1', idAgent: '1', idAccount: '1' },
  { id: '2', idAgent: '1', idAccount: '2' },
  { id: '3', idAgent: '1', idAccount: '3' },

  // Ana García (agente id '2') tiene 2 clientes, uno de ellos compartido con Juan
  { id: '4', idAgent: '2', idAccount: '3' },
  { id: '5', idAgent: '2', idAccount: '4' },
];

// Nueva entidad: Oportunidades
export const opportunities: Opportunity[] = [
    { 
        id: '1', idAccount: '1', idAgent: '1', contactIds: ['1', '2'],
        concepto: 'Renovación Licencia Anual', 
        descripcion: 'Renovación de las 50 licencias del software CRM para todo el equipo de ventas.',
        importe: 1500, fase: 'Oferta', estado: 'Espera cliente', 
        fechaCreacion: getDateString(-80), fechaVencimiento: getDateString(10)
    },
    { 
        id: '2', idAccount: '1', idAgent: '1', contactIds: ['2'],
        concepto: 'Soporte Premium 24/7', 
        descripcion: 'Contratación del servicio de soporte premium con atención 24/7 y SLA de 1 hora.',
        importe: 2500, fase: 'Formalización', estado: 'Espera interna',
        fechaCreacion: getDateString(-70), fechaVencimiento: getDateString(20)
    },
    { 
        id: '3', idAccount: '3', idAgent: '1', contactIds: ['5'],
        concepto: 'Implantación nuevo módulo CRM', 
        descripcion: 'Proyecto de implantación del nuevo módulo de marketing automation.',
        importe: 8000, fase: 'Detección', estado: 'Espera cliente',
        fechaCreacion: getDateString(-60), fechaVencimiento: getDateString(30)
    },
    { 
        id: '4', idAccount: '3', idAgent: '2', contactIds: ['5'],
        concepto: 'Formación avanzada de usuarios', 
        descripcion: 'Curso de formación avanzada para 10 usuarios clave sobre el nuevo módulo de reporting.',
        importe: 3000, fase: 'Petición', estado: 'Ganada', 
        fechaCreacion: getDateString(-50), fechaVencimiento: getDateString(-20), fechaCierre: getDateString(-15)
    },
    { 
        id: '5', idAccount: '4', idAgent: '2', contactIds: ['6'],
        concepto: 'Consultoría SEO/SEM', 
        descripcion: 'Servicios de consultoría para mejorar el posicionamiento y la captación de leads.',
        importe: 4500, fase: 'Comunicación', estado: 'Perdida', 
        fechaCreacion: getDateString(-40), fechaVencimiento: getDateString(-10), fechaCierre: getDateString(-5)
    },
    { 
        id: '6', idAccount: '5', idAgent: '1', contactIds: [],
        concepto: 'Migración a Cloud', 
        descripcion: 'Proyecto para migrar la infraestructura actual a la nube.',
        importe: 12000, fase: 'Detección', estado: 'Espera cliente', 
        fechaCreacion: getDateString(-35), fechaVencimiento: getDateString(45)
    },
     { 
        id: '7', idAccount: '6', idAgent: '2', contactIds: [],
        concepto: 'Desarrollo App Móvil', 
        descripcion: 'Creación de una aplicación móvil para iOS y Android.',
        importe: 25000, fase: 'Oferta', estado: 'Espera cliente', 
        fechaCreacion: getDateString(-30), fechaVencimiento: getDateString(60)
    },
    { 
        id: '8', idAccount: '7', idAgent: '1', contactIds: [],
        concepto: 'Contrato de Mantenimiento',
        descripcion: 'Contrato anual de mantenimiento de software.',
        importe: 5000, fase: 'Petición', estado: 'Ganada', 
        fechaCreacion: getDateString(-25), fechaVencimiento: getDateString(-5), fechaCierre: getDateString(-2)
    },
     { 
        id: '9', idAccount: '8', idAgent: '2', contactIds: [],
        concepto: 'Auditoría de Seguridad',
        descripcion: 'Realización de una auditoría de seguridad completa.',
        importe: 7500, fase: 'Comunicación', estado: 'Cancelada', 
        fechaCreacion: getDateString(-20), fechaVencimiento: getDateString(15), fechaCierre: getDateString(-1)
    },
    { 
        id: '10', idAccount: '9', idAgent: '1', contactIds: [],
        concepto: 'Renovación de Hardware',
        descripcion: 'Plan de renovación de equipos informáticos.',
        importe: 15000, fase: 'Detección', estado: 'Espera cliente',
        fechaCreacion: getDateString(-10), fechaVencimiento: getDateString(80)
    },
     { 
        id: '11', idAccount: '10', idAgent: '2', contactIds: [],
        concepto: 'Licencias de Software',
        descripcion: 'Compra de 100 licencias de software de ofimática.',
        importe: 4000, fase: 'Oferta', estado: 'Espera interna',
        fechaCreacion: getDateString(-5), fechaVencimiento: getDateString(25)
    },
];

// Nueva entidad: Actividades
export const activities: Activity[] = [
    { id: '1', idOpportunity: '1', idAgent: '1', tipo: 'Comunicación', estado: 'Completada', fechaCreacion: getDateString(-80), fechaVencimiento: getDateString(-75), fechaFinReal: getDateString(-75), concepto: 'Llamada de seguimiento sobre la oferta', notas: 'El cliente ha recibido la oferta y la está revisando. Volver a llamar en una semana.' },
    { id: '2', idOpportunity: '1', idAgent: '1', tipo: 'Comunicación', estado: 'Pendiente', fechaCreacion: getDateString(-75), fechaVencimiento: getDateString(2), concepto: 'Segunda llamada de seguimiento', notas: 'Preguntar si tienen alguna duda sobre la oferta.' },
    { id: '3', idOpportunity: '2', idAgent: '1', tipo: 'Reunión', estado: 'Completada', fechaCreacion: getDateString(-70), fechaVencimiento: getDateString(-65), fechaFinReal: getDateString(-65), concepto: 'Reunión de formalización de contrato', notas: 'Se firman los documentos. Todo en orden.' },
    { id: '4', idOpportunity: '3', idAgent: '1', tipo: 'Administrativa', estado: 'Pendiente', fechaCreacion: getDateString(-60), fechaVencimiento: getDateString(5), concepto: 'Preparar borrador de la propuesta técnica', notas: 'Incluir detalles sobre la integración con su ERP.' },
    { id: '5', idOpportunity: '4', idAgent: '2', tipo: 'Administrativa', estado: 'Completada', fechaCreacion: getDateString(-50), fechaVencimiento: getDateString(-45), fechaFinReal: getDateString(-45), concepto: 'Emitir factura de la formación', notas: 'Factura enviada al departamento financiero.' },
    { id: '6', idOpportunity: '5', idAgent: '2', tipo: 'Comunicación', estado: 'Completada', fechaCreacion: getDateString(-40), fechaVencimiento: getDateString(-38), fechaFinReal: getDateString(-38), concepto: 'Email de cierre', notas: 'Agradecer el tiempo y confirmar que se archiva la oportunidad como perdida.' },
    { id: '7', idOpportunity: '5', idAgent: '2', tipo: 'Administrativa', estado: 'Cancelada', fechaCreacion: getDateString(-39), fechaVencimiento: getDateString(-35), fechaFinReal: getDateString(-35), concepto: 'Reserva de sala para Kick-off', notas: 'Se cancela ya que la oportunidad se ha perdido.' },
    { id: '8', idOpportunity: '7', idAgent: '2', tipo: 'Reunión', estado: 'Pendiente', fechaCreacion: getDateString(-30), fechaVencimiento: getDateString(12), concepto: 'Reunión inicial de toma de requisitos' },
    { id: '9', idOpportunity: '8', idAgent: '1', tipo: 'Administrativa', estado: 'Completada', fechaCreacion: getDateString(-25), fechaVencimiento: getDateString(-20), fechaFinReal: getDateString(-20), concepto: 'Envío de contrato' },
    { id: '10', idOpportunity: '9', idAgent: '2', tipo: 'Comunicación', estado: 'Completada', fechaCreacion: getDateString(-20), fechaVencimiento: getDateString(-19), fechaFinReal: getDateString(-19), concepto: 'Llamada de cancelación', notas: 'El cliente cancela el proyecto por motivos internos.' },
    { id: '11', idOpportunity: '10', idAgent: '1', tipo: 'Reunión', estado: 'Pendiente', fechaCreacion: getDateString(-10), fechaVencimiento: getDateString(20), concepto: 'Demostración de producto' },
    { id: '12', idOpportunity: '11', idAgent: '2', tipo: 'Comunicación', estado: 'Pendiente', fechaCreacion: getDateString(-5), fechaVencimiento: getDateString(18), concepto: 'Enviar presupuesto por email' },
    { id: '13', idOpportunity: '6', idAgent: '1', tipo: 'Administrativa', estado: 'Completada', fechaCreacion: getDateString(-35), fechaVencimiento: getDateString(-30), fechaFinReal: getDateString(-30), concepto: 'Estudio de viabilidad inicial' },
    { id: '14', idOpportunity: '6', idAgent: '1', tipo: 'Comunicación', estado: 'Pendiente', fechaCreacion: getDateString(-28), fechaVencimiento: getDateString(-2), concepto: 'Contactar para presentar estudio', notas: 'Fecha límite vencida' },
];

export const aiAgents: AIAgent[] = [
    {
        id: '1',
        nombre: 'Detective Privado',
        prompt: `Eres un experto analista de inteligencia de negocio y un detective financiero. Tu misión es recopilar y sintetizar información pública disponible sobre una empresa o un individuo para generar un informe comercial y financiero exhaustivo de no más de 2000 caracteres.

Debes investigar los siguientes aspectos:
1.  **Información Corporativa**: Estructura de la empresa, principales directivos, noticias recientes (fusiones, adquisiciones, lanzamientos de productos, etc.), presencia en medios y reputación online.
2.  **Análisis Financiero**: Busca datos financieros públicos como ingresos, beneficios, ratios de solvencia o cualquier indicador económico relevante. Analiza su salud financiera y su posición en el mercado.
3.  **Contexto del Mercado**: Identifica a sus principales competidores, su cuota de mercado estimada y las tendencias clave del sector en el que opera.
4.  **Para Contactos Individuales**: Investiga su trayectoria profesional (LinkedIn), publicaciones, apariciones en medios o cualquier información relevante que ayude a entender su perfil profesional y sus posibles necesidades o puntos de interés.

Tu informe debe ser estructurado, objetivo y basado únicamente en datos públicamente accesibles. Finaliza con un resumen ejecutivo que destaque los puntos clave, oportunidades y posibles riesgos para una relación comercial.`
    }
];
