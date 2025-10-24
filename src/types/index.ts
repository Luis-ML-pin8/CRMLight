export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  movil: string;
  usuario: string;
  password?: string; // El password es opcional para no exponerlo en el cliente
  isAdministrator?: boolean;
  isAgent?: boolean; // Columna virtual
  isCoordinator?: boolean; // Columna virtual
  isDeletable?: boolean; // Columna virtual
}

export interface Agent {
  id: string;
  idUser: string; // Foreign key to User
  idCoordinator?: string; // Foreign key to Coordinator
}

export interface Coordinator {
  id: string;
  idUser: string; // Foreign key to User
}

export interface Account {
  id: string;
  nombre: string;
  cifnif: string;
  direccion: string;
  poblacion: string;
  provincia: string;
  cp: string;
  pais: string;
  telefono: string;
  email: string;
  website?: string;
}

export interface Contact {
  id: string;
  idAccount?: string; // Foreign key to Account (opcional)
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  cargo?: string;
  report?: string; // Informe generado por IA
}

export interface Portfolio {
  id: string;
  idAgent: string; // Foreign key to Agent
  idAccount: string; // Foreign key to Account
}

export const opportunityPhases = ['Detección', 'Comunicación', 'Formalización', 'Oferta', 'Petición'] as const;
export type OpportunityPhase = typeof opportunityPhases[number];

export const opportunityStates = ['Ganada', 'Perdida', 'Cancelada', 'Espera cliente', 'Espera interna'] as const;
export type OpportunityState = typeof opportunityStates[number];

export interface Opportunity {
  id: string;
  idAccount: string; // Foreign key to Account
  idAgent: string; // Foreign key to Agent
  contactIds: string[]; // Foreign keys to Contact
  concepto: string;
  descripcion?: string;
  importe: number;
  fase: OpportunityPhase;
  estado: OpportunityState;
  fechaCreacion: string; // Formato YYYY-MM-DD
  fechaVencimiento: string; // Formato YYYY-MM-DD
  fechaCierre?: string; // Formato YYYY-MM-DD
}

export const activityTypes = ['Administrativa', 'Comunicación', 'Reunión'] as const;
export type ActivityType = typeof activityTypes[number];

export const activityStates = ['Pendiente', 'Completada', 'Cancelada'] as const;
export type ActivityState = typeof activityStates[number];

export interface Activity {
  id: string;
  idOpportunity: string; // Foreign key to Opportunity
  idAgent: string; // Foreign key to Agent (dueño de la actividad)
  tipo: ActivityType;
  estado: ActivityState;
  fechaCreacion: string; // Formato YYYY-MM-DD
  fechaVencimiento: string; // Formato YYYY-MM-DD
  fechaFinReal?: string; // Formato YYYY-MM-DD (solo si está completada/cancelada)
  concepto: string;
  notas?: string;
  expectativa?: string; // Específico para reuniones: qué se espera conseguir.
  nuevosDatosOportunidad?: { // Para registrar cambios en la oportunidad al completar
    fase?: OpportunityPhase;
    estado?: OpportunityState;
  };
}

export interface AIAgent {
  id: string;
  nombre: string;
  prompt: string;
}


// --- ENTIDADES LÓGICAS (CON JOIN) ---

// Representa un Agent con la información completa del User asociado
export type LogicalAgent = User & Agent & { agentId: string };

// Representa un Coordinator con la información completa del User asociado
export type LogicalCoordinator = User & Coordinator & { coordinatorId: string };

// Representa un Contact con el nombre de la Account asociada (si existe)
export type LogicalContact = Contact & { accountName?: string };

// Representa una Opportunity con los nombres del cliente y agente asociados
export type LogicalOpportunity = Opportunity & {
  accountName: string;
  agentName: string;
};

// Representa una Activity con datos denormalizados para fácil visualización
export type LogicalActivity = Activity & {
  opportunityConcepto: string;
  accountName: string;
  agentName: string;
};

// --- TIPOS PARA DASHBOARDS ---

export interface WeeklyData {
    week: string;
    [key: string]: any;
}

export interface DashboardMetrics {
    // Métricas para Agente
    assignedAccounts?: number;
    openOpportunities?: number;
    portfolioValue?: number;
    pendingActivities?: number;

    // Métricas para Admin/Coordinador
    totalUsers?: number;
    totalAccounts?: number;
    totalOpportunities?: number;
    totalRevenue?: number;
    recentActivities?: LogicalActivity[];
    opportunitiesEvolution?: WeeklyData[];
    activitiesEvolution?: WeeklyData[];

    // Métricas solo para Admin
    conversionRate?: number;
    avgOpportunityValue?: number;
    activitiesPerOpportunity?: number;
    newCustomerRevenueRate?: number;
}
