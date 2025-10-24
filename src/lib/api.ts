
import { User, Agent, Coordinator, LogicalAgent, LogicalCoordinator, Account, Portfolio, Opportunity, Contact, LogicalContact, LogicalOpportunity, Activity, LogicalActivity, DashboardMetrics, WeeklyData, AIAgent } from '@/types';
import { 
  users as initialUsers, 
  agents as initialAgents, 
  coordinators as initialCoordinators, 
  accounts as initialAccounts,
  contacts as initialContacts,
  portfolios as initialPortfolios,
  opportunities as initialOpportunities,
  activities as initialActivities,
  aiAgents as initialAIAgents
} from './data';
import { generateContactReport } from '@/ai/flows/generateContactReportFlow';

// --- Capa de acceso a datos simulada (como una base de datos en memoria) ---
class DataAPI {
  private users: User[];
  private agents: Agent[];
  private coordinators: Coordinator[];
  private accounts: Account[];
  private contacts: Contact[];
  private portfolios: Portfolio[];
  private opportunities: Opportunity[];
  private activities: Activity[];
  private aiAgents: AIAgent[];

  private lastUserId: number;
  private lastAgentId: number;
  private lastCoordinatorId: number;
  private lastAccountId: number;
  private lastContactId: number;
  private lastPortfolioId: number;
  private lastOpportunityId: number;
  private lastActivityId: number;
  private lastAIAgentId: number;

  constructor() {
    // Usamos JSON.parse(JSON.stringify(...)) para crear copias profundas y evitar
    // que las modificaciones en la API afecten a los datos originales importados.
    this.users = JSON.parse(JSON.stringify(initialUsers));
    this.agents = JSON.parse(JSON.stringify(initialAgents));
    this.coordinators = JSON.parse(JSON.stringify(initialCoordinators));
    this.accounts = JSON.parse(JSON.stringify(initialAccounts));
    this.contacts = JSON.parse(JSON.stringify(initialContacts));
    this.portfolios = JSON.parse(JSON.stringify(initialPortfolios));
    this.opportunities = JSON.parse(JSON.stringify(initialOpportunities));
    this.activities = JSON.parse(JSON.stringify(initialActivities));
    this.aiAgents = JSON.parse(JSON.stringify(initialAIAgents));
    
    // Inicializamos los contadores para los IDs autoincrementales
    this.lastUserId = this.users.reduce((max, u) => Math.max(max, parseInt(u.id, 10)), 0);
    this.lastAgentId = this.agents.reduce((max, a) => Math.max(max, parseInt(a.id, 10)), 0);
    this.lastCoordinatorId = this.coordinators.reduce((max, c) => Math.max(max, parseInt(c.id, 10)), 0);
    this.lastAccountId = this.accounts.reduce((max, a) => Math.max(max, parseInt(a.id, 10)), 0);
    this.lastContactId = this.contacts.reduce((max, c) => Math.max(max, parseInt(c.id, 10)), 0);
    this.lastPortfolioId = this.portfolios.reduce((max, p) => Math.max(max, parseInt(p.id, 10)), 0);
    this.lastOpportunityId = this.opportunities.reduce((max, o) => Math.max(max, parseInt(o.id, 10)), 0);
    this.lastActivityId = this.activities.reduce((max, a) => Math.max(max, parseInt(a.id, 10)), 0);
    this.lastAIAgentId = this.aiAgents.reduce((max, a) => Math.max(max, parseInt(a.id, 10)), 0);
  }

  // --- MÉTODOS CRUD "FÍSICOS" PARA LA ENTIDAD User ---

  async getUsers(): Promise<User[]> {
    const agents = await this.getPhysicalAgents();
    const coordinators = await this.getPhysicalCoordinators();
    const adminCount = this.users.filter(u => u.isAdministrator).length;

    // Añadimos las columnas virtuales a cada usuario
    const logicalUsers = this.users.map(user => {
      const isLastAdmin = !!user.isAdministrator && adminCount === 1;
      return {
        ...user,
        isAgent: agents.some(a => a.idUser === user.id),
        isCoordinator: coordinators.some(c => c.idUser === user.id),
        isDeletable: !isLastAdmin,
      };
    });
    
    return Promise.resolve(logicalUsers);
  }

  getUserById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id);
    return Promise.resolve(user || null);
  }
  
  getUserByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email);
    return Promise.resolve(user || null);
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    if (this.users.some(u => u.usuario === userData.usuario)) {
      return Promise.reject(new Error(`El usuario "${userData.usuario}" ya está en uso.`));
    }
    if (this.users.some(u => u.email === userData.email)) {
      return Promise.reject(new Error(`El email "${userData.email}" ya está en uso.`));
    }

    this.lastUserId++;
    const newUser: User = {
      id: this.lastUserId.toString(),
      nombre: userData.nombre,
      apellidos: userData.apellidos,
      email: userData.email,
      movil: userData.movil,
      usuario: userData.usuario,
      password: userData.password,
      isAdministrator: userData.isAdministrator || false,
    };

    this.users.push(newUser);
    
    // Aplicar roles
    if (userData.isCoordinator) {
        await this.createCoordinator({ idUser: newUser.id });
    }
    if (userData.isAgent) {
        await this.createAgent({ idUser: newUser.id });
    }

    return Promise.resolve(newUser);
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return Promise.reject(new Error(`Usuario con ID "${id}" no encontrado.`));
    }
    const currentUser = this.users[userIndex];

    // Validar unicidad de usuario y email si se están actualizando
    if (updates.usuario && this.users.some(u => u.usuario === updates.usuario && u.id !== id)) {
      return Promise.reject(new Error(`El nombre de usuario "${updates.usuario}" ya está en uso.`));
    }
    if (updates.email && this.users.some(u => u.email === updates.email && u.id !== id)) {
      return Promise.reject(new Error(`El email "${updates.email}" ya está en uso.`));
    }

    // --- Lógica de gestión de roles ---
    const currentlyIsAdmin = !!currentUser.isAdministrator;
    const currentlyIsCoordinator = this.coordinators.some(c => c.idUser === id);
    const currentlyIsAgent = this.agents.some(a => a.idUser === id);

    const desiredIsAdmin = 'isAdministrator' in updates ? !!updates.isAdministrator : currentlyIsAdmin;
    const desiredIsCoordinator = 'isCoordinator' in updates ? !!updates.isCoordinator : currentlyIsCoordinator;
    const desiredIsAgent = 'isAgent' in updates ? !!updates.isAgent : currentlyIsAgent;
    
    // 1. Actualizar los datos básicos del usuario
    const updatedUser = { ...currentUser, ...updates };
    // Asegurarse de que el campo isAdministrator se establece correctamente
    updatedUser.isAdministrator = desiredIsAdmin;
    this.users[userIndex] = updatedUser;

    // 2. REGLA DE NEGOCIO: Si un usuario es o se convierte en administrador, no puede tener otros roles.
    if (desiredIsAdmin) {
        if (currentlyIsAgent) {
            const agentRole = this.agents.find(a => a.idUser === id);
            if (agentRole) await this.deleteAgentRole(agentRole.id);
        }
        if (currentlyIsCoordinator) {
            const coordinatorRole = this.coordinators.find(c => c.idUser === id);
            if (coordinatorRole) await this.deleteCoordinatorRole(coordinatorRole.id);
        }
    } else {
        // 3. Aplicar roles de Coordinador
        if (desiredIsCoordinator && !currentlyIsCoordinator) {
            // REGLA: Si un agente es promovido a coordinador, se desasigna de su coordinador actual.
            const agentRecord = this.agents.find(a => a.idUser === id);
            if (agentRecord) {
                agentRecord.idCoordinator = undefined;
            }
            await this.createCoordinator({ idUser: id });
        } else if (!desiredIsCoordinator && currentlyIsCoordinator) {
            const coordinatorRole = this.coordinators.find(c => c.idUser === id);
            if (coordinatorRole) await this.deleteCoordinatorRole(coordinatorRole.id);
        }

        // 4. Aplicar roles de Agente
        if (desiredIsAgent && !currentlyIsAgent) {
            await this.createAgent({ idUser: id });
        } else if (!desiredIsAgent && currentlyIsAgent) {
            const agentRole = this.agents.find(a => a.idUser === id);
            if (agentRole) await this.deleteAgentRole(agentRole.id);
        }
    }
    
    return Promise.resolve(updatedUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.find(u => u.id === id);
    if (!user) {
        return Promise.reject(new Error(`Usuario con ID "${id}" no encontrado.`));
    }

    // REGLA DE NEGOCIO: No se puede borrar el usuario administrador principal.
    const users = await this.getUsers();
    const logicalUser = users.find(u => u.id === id);

    if (!logicalUser?.isDeletable) {
        return Promise.reject(new Error('Este usuario no puede ser eliminado.'));
    }

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return Promise.reject(new Error(`Usuario con ID "${id}" no encontrado.`));
    }
    
    // Simular borrado en cascada (ON DELETE CASCADE)
    // Buscamos si el usuario era agente o coordinador para borrar también esos registros.
    const agentToDelete = this.agents.find(a => a.idUser === id);
    if (agentToDelete) {
      await this.deleteAgentRole(agentToDelete.id);
    }
    const coordinatorToDelete = this.coordinators.find(c => c.idUser === id);
    if (coordinatorToDelete) {
      await this.deleteCoordinatorRole(coordinatorToDelete.id);
    }

    this.users.splice(userIndex, 1);
    return Promise.resolve(true);
  }

  // --- MÉTODOS CRUD "FÍSICOS" PARA LA ENTIDAD Agent ---

  private getPhysicalAgents(): Promise<Agent[]> {
    return Promise.resolve(this.agents);
  }

  createAgent(agentData: Omit<Agent, 'id'>): Promise<Agent> {
    // Validaciones de integridad referencial
    const user = this.users.find(u => u.id === agentData.idUser);
    if (!user) {
      return Promise.reject(new Error(`El usuario con idUser "${agentData.idUser}" no existe.`));
    }
    // REGLA DE NEGOCIO: Un admin no puede ser agente.
    if (user.isAdministrator) {
      return Promise.reject(new Error(`Un Administrador no puede tener el rol de Agente.`));
    }
    if (this.agents.some(a => a.idUser === agentData.idUser)) {
      return Promise.reject(new Error(`El usuario con idUser "${agentData.idUser}" ya es un agente.`));
    }
    if (agentData.idCoordinator && !this.coordinators.some(c => c.id === agentData.idCoordinator)) {
      return Promise.reject(new Error(`El coordinador con idCoordinator "${agentData.idCoordinator}" no existe.`));
    }

    this.lastAgentId++;
    const newAgent: Agent = {
      id: this.lastAgentId.toString(),
      ...agentData,
    };

    this.agents.push(newAgent);
    return Promise.resolve(newAgent);
  }
  
  updateAgent(id: string, updates: Partial<Omit<Agent, 'id' | 'idUser'>>): Promise<Agent> {
    const agentIndex = this.agents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
        return Promise.reject(new Error(`Agente con ID "${id}" no encontrado.`));
    }
    if (updates.idCoordinator && !this.coordinators.some(c => c.id === updates.idCoordinator)) {
        return Promise.reject(new Error(`El coordinador con idCoordinator "${updates.idCoordinator}" no existe.`));
    }

    const updatedAgent = { ...this.agents[agentIndex], ...updates };
    this.agents[agentIndex] = updatedAgent;
    return Promise.resolve(updatedAgent);
  }

  async deleteAgentRole(id: string): Promise<boolean> {
    const agentIndex = this.agents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
        return Promise.resolve(false);
    }
    const agentToDelete = this.agents[agentIndex];
    const userId = agentToDelete.idUser;
    
    // ON DELETE CASCADE: Borrar cartera y oportunidades del agente
    this.portfolios = this.portfolios.filter(p => p.idAgent !== id);
    this.opportunities = this.opportunities.filter(o => o.idAgent !== id);

    this.agents.splice(agentIndex, 1);

    // Lógica para borrar usuario si no tiene más roles
    const user = await this.getUserById(userId);
    if (user) {
        const hasCoordinatorRole = this.coordinators.some(c => c.idUser === userId);
        const hasAgentRole = this.agents.some(a => a.idUser === userId); // Volver a comprobar por si acaso
        if (!user.isAdministrator && !hasCoordinatorRole && !hasAgentRole) {
            await this.deleteUser(userId);
        }
    }

    return Promise.resolve(true);
  }

  // --- MÉTODOS CRUD "FÍSICOS" PARA LA ENTIDAD Coordinator ---

  private getPhysicalCoordinators(): Promise<Coordinator[]> {
    return Promise.resolve(this.coordinators);
  }

  createCoordinator(coordinatorData: Omit<Coordinator, 'id'>): Promise<Coordinator> {
    // Validaciones de integridad referencial
    const user = this.users.find(u => u.id === coordinatorData.idUser);
    if (!user) {
      return Promise.reject(new Error(`El usuario con idUser "${coordinatorData.idUser}" no existe.`));
    }
    // REGLA DE NEGOCIO: Un admin no puede ser coordinador.
    if (user.isAdministrator) {
        return Promise.reject(new Error(`Un Administrador no puede tener el rol de Coordinador.`));
    }
    if (this.coordinators.some(c => c.idUser === coordinatorData.idUser)) {
      return Promise.reject(new Error(`El usuario con idUser "${coordinatorData.idUser}" ya es un coordinador.`));
    }

    this.lastCoordinatorId++;
    const newCoordinator: Coordinator = {
      id: this.lastCoordinatorId.toString(),
      ...coordinatorData,
    };

    this.coordinators.push(newCoordinator);
    return Promise.resolve(newCoordinator);
  }

  updateCoordinator(id: string, updates: Partial<Omit<Coordinator, 'id' | 'idUser'>>): Promise<Coordinator> {
    const coordinatorIndex = this.coordinators.findIndex(c => c.id === id);
    if (coordinatorIndex === -1) {
        return Promise.reject(new Error(`Coordinador con ID "${id}" no encontrado.`));
    }

    const updatedCoordinator = { ...this.coordinators[coordinatorIndex], ...updates };
    this.coordinators[coordinatorIndex] = updatedCoordinator;
    return Promise.resolve(updatedCoordinator);
  }

  async deleteCoordinatorRoleAndReassignAgents(coordinatorId: string, newCoordinatorId?: string): Promise<boolean> {
    const coordinatorIndex = this.coordinators.findIndex(c => c.id === coordinatorId);
    if (coordinatorIndex === -1) {
        return Promise.resolve(false);
    }
    
    const agentsToReassign = this.agents.filter(agent => agent.idCoordinator === coordinatorId);
    agentsToReassign.forEach(agent => {
        agent.idCoordinator = newCoordinatorId; // Quedarán como undefined si no se pasa newCoordinatorId
    });

    return this.deleteCoordinatorRole(coordinatorId);
  }


  async deleteCoordinatorRole(id: string): Promise<boolean> {
    const coordinatorIndex = this.coordinators.findIndex(c => c.id === id);
    if (coordinatorIndex === -1) {
        return Promise.resolve(false);
    }
    const coordinatorToDelete = this.coordinators[coordinatorIndex];
    const userId = coordinatorToDelete.idUser;
    
    // Simular borrado en cascada: Desasignar coordinador de sus agentes (ON DELETE SET NULL)
    this.agents.forEach(agent => {
      if (agent.idCoordinator === id) {
        agent.idCoordinator = undefined;
      }
    });

    this.coordinators.splice(coordinatorIndex, 1);

     // Lógica para borrar usuario si no tiene más roles
    const user = await this.getUserById(userId);
    if (user) {
        const hasCoordinatorRole = this.coordinators.some(c => c.idUser === userId); // Volver a comprobar
        const hasAgentRole = this.agents.some(a => a.idUser === userId);
        if (!user.isAdministrator && !hasCoordinatorRole && !hasAgentRole) {
            await this.deleteUser(userId);
        }
    }

    return Promise.resolve(true);
  }
  
  // --- MÉTODOS CRUD PARA LA ENTIDAD Account ---
  
  async getAccounts(): Promise<Account[]> {
    return Promise.resolve(this.accounts);
  }

  createAccount(accountData: Omit<Account, 'id'>): Promise<Account> {
    if (this.accounts.some(a => a.cifnif.toLowerCase() === accountData.cifnif.toLowerCase())) {
        return Promise.reject(new Error(`Ya existe un cliente con el CIF/NIF "${accountData.cifnif}".`));
    }
    if (this.accounts.some(a => a.email.toLowerCase() === accountData.email.toLowerCase())) {
        return Promise.reject(new Error(`Ya existe un cliente con el email "${accountData.email}".`));
    }

    this.lastAccountId++;
    const newAccount: Account = {
        id: this.lastAccountId.toString(),
        ...accountData,
    };
    this.accounts.push(newAccount);
    return Promise.resolve(newAccount);
  }

  updateAccount(id: string, updates: Partial<Omit<Account, 'id'>>): Promise<Account> {
    const accountIndex = this.accounts.findIndex(a => a.id === id);
    if (accountIndex === -1) {
        return Promise.reject(new Error(`Cliente con ID "${id}" no encontrado.`));
    }

    // Validar unicidad de CIF/NIF y email
    if (updates.cifnif && this.accounts.some(a => a.cifnif.toLowerCase() === updates.cifnif!.toLowerCase() && a.id !== id)) {
        return Promise.reject(new Error(`El CIF/NIF "${updates.cifnif}" ya está en uso.`));
    }
    if (updates.email && this.accounts.some(a => a.email.toLowerCase() === updates.email!.toLowerCase() && a.id !== id)) {
        return Promise.reject(new Error(`El email "${updates.email}" ya está en uso.`));
    }
    
    const updatedAccount = { ...this.accounts[accountIndex], ...updates };
    this.accounts[accountIndex] = updatedAccount;
    return Promise.resolve(updatedAccount);
  }

  deleteAccount(id: string): Promise<boolean> {
    const accountIndex = this.accounts.findIndex(a => a.id === id);
    if (accountIndex === -1) {
        return Promise.reject(new Error(`Cliente con ID "${id}" no encontrado.`));
    }
    
    // ON DELETE CASCADE para carteras y oportunidades
    this.portfolios = this.portfolios.filter(p => p.idAccount !== id);
    this.opportunities = this.opportunities.filter(o => o.idAccount !== id);
    
    this.accounts.splice(accountIndex, 1);
    return Promise.resolve(true);
  }

  // --- MÉTODOS CRUD PARA LA ENTIDAD Contact ---

  async getContacts(): Promise<LogicalContact[]> {
      const allAccounts = await this.getAccounts();
      
      const logicalContacts: LogicalContact[] = this.contacts.map(contact => {
          const account = allAccounts.find(acc => acc.id === contact.idAccount);
          return {
              ...contact,
              accountName: account?.nombre || undefined,
          };
      });

      return Promise.resolve(logicalContacts);
  }

  async getContactById(id: string): Promise<Contact | null> {
      const contact = this.contacts.find(c => c.id === id);
      return Promise.resolve(contact || null);
  }

  async createContact(contactData: Omit<Contact, 'id'>): Promise<Contact> {
      if (this.contacts.some(c => c.email.toLowerCase() === contactData.email.toLowerCase())) {
          return Promise.reject(new Error(`Ya existe un contacto con el email "${contactData.email}".`));
      }

      this.lastContactId++;
      const newContact: Contact = {
          id: this.lastContactId.toString(),
          ...contactData,
          report: contactData.report || '',
      };
      this.contacts.push(newContact);
      return Promise.resolve(newContact);
  }

  async updateContact(id: string, updates: Partial<Omit<Contact, 'id'>>): Promise<Contact> {
      const contactIndex = this.contacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
          return Promise.reject(new Error(`Contacto con ID "${id}" no encontrado.`));
      }

      // Validar unicidad de email
      if (updates.email && this.contacts.some(c => c.email.toLowerCase() === updates.email!.toLowerCase() && c.id !== id)) {
          return Promise.reject(new Error(`El email "${updates.email}" ya está en uso.`));
      }

      const updatedContact = { ...this.contacts[contactIndex], ...updates };
      // Asegurarse de que un valor vacío en el select se guarda como undefined
      if ('idAccount' in updatedContact && !updatedContact.idAccount) {
          updatedContact.idAccount = undefined;
      }
      this.contacts[contactIndex] = updatedContact;
      return Promise.resolve(updatedContact);
  }

  async deleteContact(id: string): Promise<boolean> {
      const contactIndex = this.contacts.findIndex(c => c.id === id);
      if (contactIndex === -1) {
          return Promise.reject(new Error(`Contacto con ID "${id}" no encontrado.`));
      }
      this.contacts.splice(contactIndex, 1);
      return Promise.resolve(true);
  }

  async generateContactReport(contact: Contact): Promise<string> {
    const detectiveAgent = this.aiAgents.find(a => a.nombre === 'Detective Privado');
    if (!detectiveAgent) {
        throw new Error('Agente de IA "Detective Privado" no encontrado. Por favor, créelo en la sección de configuración.');
    }

    const account = contact.idAccount ? this.accounts.find(a => a.id === contact.idAccount) : null;

    try {
      const result = await generateContactReport({
        contactName: `${contact.nombre} ${contact.apellidos}`,
        contactRole: contact.cargo || 'No especificado',
        companyName: account?.nombre || 'No asociada',
        agentPrompt: detectiveAgent.prompt,
      });

      const finalReport = result.report.substring(0, 2000);
      await this.updateContact(contact.id, { report: finalReport });
      return finalReport;

    } catch (error: any) {
      console.error("Error al generar el informe con Genkit:", error);
      throw new Error(`Error del servicio de IA: ${error.message || 'No se pudo generar el informe.'}`);
    }
  }

  // --- MÉTODOS CRUD PARA LA ENTIDAD Opportunity ---

  async getOpportunitiesByUser(currentUser: User): Promise<LogicalOpportunity[]> {
    const allAccounts = await this.getAccounts();
    const allAgents = await this.getAgents();

    // Filtra las oportunidades basado en el rol del usuario
    let visibleOpportunities: Opportunity[] = [];

    if (currentUser.isAdministrator) {
        visibleOpportunities = this.opportunities;
    } else if (currentUser.isCoordinator) {
        const coordinatorRecord = this.coordinators.find(c => c.idUser === currentUser.id);
        const teamAgentIds = allAgents
            .filter(a => a.idCoordinator === coordinatorRecord?.coordinatorId)
            .map(a => a.agentId);
        visibleOpportunities = this.opportunities.filter(o => teamAgentIds.includes(o.idAgent));
    } else if (currentUser.isAgent) {
        const agentRecord = this.agents.find(a => a.idUser === currentUser.id);
        visibleOpportunities = this.opportunities.filter(o => o.idAgent === agentRecord?.agentId);
    }
    
    // Mapea a LogicalOpportunity
    const logicalOpportunities = visibleOpportunities.map(opp => {
      const account = allAccounts.find(acc => acc.id === opp.idAccount);
      const agent = allAgents.find(a => a.agentId === opp.idAgent);
      return {
        ...opp,
        accountName: account?.nombre || 'Desconocido',
        agentName: agent ? `${agent.nombre} ${agent.apellidos}` : 'Desconocido',
      };
    });

    return Promise.resolve(logicalOpportunities);
  }

  async createOpportunity(opportunityData: Omit<Opportunity, 'id' | 'fechaCreacion'>): Promise<Opportunity> {
      this.lastOpportunityId++;
      const newOpportunity: Opportunity = {
          id: this.lastOpportunityId.toString(),
          ...opportunityData,
          fechaCreacion: new Date().toISOString().split('T')[0],
      };
      this.opportunities.push(newOpportunity);
      return Promise.resolve(newOpportunity);
  }

  async updateOpportunity(id: string, updates: Partial<Omit<Opportunity, 'id'>>): Promise<Opportunity> {
      const opportunityIndex = this.opportunities.findIndex(o => o.id === id);
      if (opportunityIndex === -1) {
          return Promise.reject(new Error(`Oportunidad con ID "${id}" no encontrada.`));
      }
      const updatedOpportunity = { ...this.opportunities[opportunityIndex], ...updates };

      // Si se está cerrando la oportunidad, registrar la fecha de cierre
      if (['Ganada', 'Perdida', 'Cancelada'].includes(updatedOpportunity.estado) && !updatedOpportunity.fechaCierre) {
        updatedOpportunity.fechaCierre = new Date().toISOString().split('T')[0];
      }

      this.opportunities[opportunityIndex] = updatedOpportunity;
      return Promise.resolve(updatedOpportunity);
  }

  async deleteOpportunity(id: string): Promise<boolean> {
      const opportunityIndex = this.opportunities.findIndex(o => o.id === id);
      if (opportunityIndex === -1) {
          return Promise.reject(new Error(`Oportunidad con ID "${id}" no encontrada.`));
      }
      this.opportunities.splice(opportunityIndex, 1);
      return Promise.resolve(true);
  }

  // --- MÉTODOS CRUD PARA LA ENTIDAD Activity ---

  async getActivitiesByUser(currentUser: User): Promise<LogicalActivity[]> {
    const allOpportunities = await this.getOpportunitiesByUser(currentUser);
    const allAccounts = await this.getAccounts();
    const allAgents = await this.getAgents();

    const visibleOpportunityIds = allOpportunities.map(o => o.id);

    const visibleActivities = this.activities.filter(a => visibleOpportunityIds.includes(a.idOpportunity));

    const logicalActivities = visibleActivities.map(activity => {
      const opportunity = allOpportunities.find(o => o.id === activity.idOpportunity);
      const account = allAccounts.find(acc => acc.id === opportunity?.idAccount);
      const agent = allAgents.find(a => a.agentId === activity.idAgent);
      
      return {
        ...activity,
        opportunityConcepto: opportunity?.concepto || 'Desconocida',
        accountName: account?.nombre || 'Desconocido',
        agentName: agent ? `${agent.nombre} ${agent.apellidos}` : 'Desconocido',
      };
    });
    
    return Promise.resolve(logicalActivities);
  }
  
  async createActivity(activityData: Omit<Activity, 'id' | 'fechaCreacion'>): Promise<Activity> {
      this.lastActivityId++;
      const newActivity: Activity = {
          id: this.lastActivityId.toString(),
          ...activityData,
          fechaCreacion: new Date().toISOString().split('T')[0],
      };
      
      // Si la actividad actualiza la oportunidad, hazlo aquí
      if (newActivity.nuevosDatosOportunidad) {
          await this.updateOpportunity(newActivity.idOpportunity, newActivity.nuevosDatosOportunidad);
      }
      
      this.activities.push(newActivity);
      return Promise.resolve(newActivity);
  }

  async updateActivity(id: string, updates: Partial<Omit<Activity, 'id'>>): Promise<Activity> {
      const activityIndex = this.activities.findIndex(a => a.id === id);
      if (activityIndex === -1) {
          return Promise.reject(new Error(`Actividad con ID "${id}" no encontrada.`));
      }

      // Si la actividad actualiza la oportunidad, hazlo aquí
      if (updates.nuevosDatosOportunidad && updates.idOpportunity) {
          await this.updateOpportunity(updates.idOpportunity, updates.nuevosDatosOportunidad);
      }
      // Limpia el campo para que no se quede en la 'base de datos'
      const updateDataClean = { ...updates };
      delete updateDataClean.nuevosDatosOportunidad;

      const updatedActivity = { ...this.activities[activityIndex], ...updateDataClean };
      this.activities[activityIndex] = updatedActivity;
      return Promise.resolve(updatedActivity);
  }

  async deleteActivity(id: string): Promise<boolean> {
      const activityIndex = this.activities.findIndex(a => a.id === id);
      if (activityIndex === -1) {
          return Promise.reject(new Error(`Actividad con ID "${id}" no encontrada.`));
      }
      this.activities.splice(activityIndex, 1);
      return Promise.resolve(true);
  }


  // --- MÉTODOS DE GESTIÓN DE CARTERA Y OPORTUNIDADES ---

  async getPortfolioForAgent(agentId: string): Promise<Account[]> {
    const portfolioLinks = this.portfolios.filter(p => p.idAgent === agentId);
    const accountIds = portfolioLinks.map(p => p.idAccount);
    const agentAccounts = this.accounts.filter(acc => accountIds.includes(acc.id));
    return Promise.resolve(agentAccounts);
  }

  async getOpportunitiesForAgent(agentId: string, accountId: string): Promise<Opportunity[]> {
      const agentOpportunities = this.opportunities.filter(
          opp => opp.idAgent === agentId && opp.idAccount === accountId
      );
      return Promise.resolve(agentOpportunities);
  }


  // --- MÉTODOS DE LECTURA "LÓGICOS" (CON JOIN SIMULADO) ---

  async getAgents(): Promise<LogicalAgent[]> {
    const agents = await this.getPhysicalAgents();
    const users = this.users; // No necesitamos getUsers() para evitar recursión.

    const logicalAgents = agents.map(agent => {
        const user = users.find(u => u.id === agent.idUser);
        if (!user) return null; // En una BD real, esto no pasaría por las FK
        
        return {
            ...user, // Propiedades del usuario
            ...agent, // id, idUser, idCoordinator
            agentId: agent.id, // Renombramos 'id' de agent para evitar colisión con 'id' de user
        };
    }).filter((a): a is LogicalAgent => a !== null); // Filtramos nulos si los hubiera

    return logicalAgents;
  }

  async getCoordinators(): Promise<LogicalCoordinator[]> {
    const coordinators = await this.getPhysicalCoordinators();
    const users = this.users;

    const logicalCoordinators = coordinators.map(coordinator => {
        const user = users.find(u => u.id === coordinator.idUser);
        if (!user) return null;
        
        return {
            ...user,
            ...coordinator,
            coordinatorId: coordinator.id
        };
    }).filter((c): c is LogicalCoordinator => c !== null);

    return logicalCoordinators;
  }
  
  // --- MÉTODOS CRUD PARA AGENTES DE IA ---

  async getAIAgents(): Promise<AIAgent[]> {
    return Promise.resolve(this.aiAgents);
  }

  createAIAgent(agentData: Omit<AIAgent, 'id'>): Promise<AIAgent> {
    this.lastAIAgentId++;
    const newAgent: AIAgent = {
      id: this.lastAIAgentId.toString(),
      ...agentData,
    };
    this.aiAgents.push(newAgent);
    return Promise.resolve(newAgent);
  }

  updateAIAgent(id: string, updates: Partial<Omit<AIAgent, 'id'>>): Promise<AIAgent> {
    const agentIndex = this.aiAgents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      return Promise.reject(new Error(`Agente IA con ID "${id}" no encontrado.`));
    }
    const updatedAgent = { ...this.aiAgents[agentIndex], ...updates };
    this.aiAgents[agentIndex] = updatedAgent;
    return Promise.resolve(updatedAgent);
  }

  deleteAIAgent(id: string): Promise<boolean> {
    const agentIndex = this.aiAgents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      return Promise.reject(new Error(`Agente IA con ID "${id}" no encontrado.`));
    }
    this.aiAgents.splice(agentIndex, 1);
    return Promise.resolve(true);
  }


  // --- DASHBOARD ---
  private getWeekLabel(date: Date): string {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDays = (date.getTime() - firstDay.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
    return `${date.getFullYear()}-S${weekNumber.toString().padStart(2, '0')}`;
  }

  async getDashboardMetrics(user: User): Promise<DashboardMetrics> {
    const opportunities = await this.getOpportunitiesByUser(user);
    const activities = await this.getActivitiesByUser(user);
    const allAccounts = await this.getAccounts();
    const users = await this.getUsers();

    if (user.isAdministrator) {
        // --- Métricas para Administrador ---
        const wonOpportunities = this.opportunities.filter(o => o.estado === 'Ganada');
        const closedOpportunities = this.opportunities.filter(o => ['Ganada', 'Perdida'].includes(o.estado));
        const conversionRate = closedOpportunities.length > 0 ? wonOpportunities.length / closedOpportunities.length : 0;
        
        const totalRevenue = wonOpportunities.reduce((sum, opp) => sum + opp.importe, 0);

        // Lógica para ingresos por captación
        const wonOppsByDate = wonOpportunities.sort((a, b) => new Date(a.fechaCierre!).getTime() - new Date(b.fechaCierre!).getTime());
        const firstWonAccountIds = new Set<string>();
        let newCustomerRevenue = 0;
        
        for (const opp of wonOppsByDate) {
            if (!firstWonAccountIds.has(opp.idAccount)) {
                newCustomerRevenue += opp.importe;
                firstWonAccountIds.add(opp.idAccount);
            }
        }
        
        const newCustomerRevenueRate = totalRevenue > 0 ? newCustomerRevenue / totalRevenue : 0;

        return {
            totalUsers: users.length,
            totalAccounts: allAccounts.length,
            totalOpportunities: this.opportunities.length,
            conversionRate: conversionRate,
            avgOpportunityValue: this.opportunities.length > 0 ? this.opportunities.reduce((sum, opp) => sum + opp.importe, 0) / this.opportunities.length : 0,
            activitiesPerOpportunity: this.opportunities.length > 0 ? this.activities.length / this.opportunities.length : 0,
            newCustomerRevenueRate,
        };
    }
    
    if (user.isCoordinator) {
        const totalRevenue = this.opportunities
            .filter(opp => opp.estado === 'Ganada')
            .reduce((sum, opp) => sum + opp.importe, 0);

        // --- Lógica para gráficos ---
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        const weeklyOppData: { [key: string]: { opened: number, closed: number } } = {};
        const weeklyActData: { [key: string]: { completed: number, pending: number, overdue: number } } = {};

        // Inicializar semanas
        for (let d = new Date(threeMonthsAgo); d <= today; d.setDate(d.getDate() + 7)) {
            const weekLabel = this.getWeekLabel(new Date(d));
            weeklyOppData[weekLabel] = { opened: 0, closed: 0 };
            weeklyActData[weekLabel] = { completed: 0, pending: 0, overdue: 0 };
        }

        // Procesar Oportunidades
        this.opportunities.forEach(opp => {
            const creationDate = new Date(opp.fechaCreacion);
            if (creationDate >= threeMonthsAgo) {
                const weekLabel = this.getWeekLabel(creationDate);
                if (weeklyOppData[weekLabel]) weeklyOppData[weekLabel].opened++;
            }
            if (opp.fechaCierre) {
                const closeDate = new Date(opp.fechaCierre);
                if (closeDate >= threeMonthsAgo) {
                    const weekLabel = this.getWeekLabel(closeDate);
                    if (weeklyOppData[weekLabel]) weeklyOppData[weekLabel].closed++;
                }
            }
        });

        // Procesar Actividades
        this.activities.forEach(act => {
            const creationDate = new Date(act.fechaCreacion);
             if (creationDate >= threeMonthsAgo) {
                const weekLabel = this.getWeekLabel(creationDate);
                 if (!weeklyActData[weekLabel]) return;

                if (act.estado === 'Completada' || act.estado === 'Cancelada') {
                    weeklyActData[weekLabel].completed++;
                } else if (act.estado === 'Pendiente') {
                    if (new Date(act.fechaVencimiento) < today) {
                        weeklyActData[weekLabel].overdue++;
                    } else {
                        weeklyActData[weekLabel].pending++;
                    }
                }
            }
        });

        const opportunitiesEvolution: WeeklyData[] = Object.keys(weeklyOppData).map(week => ({
            week,
            Abiertas: weeklyOppData[week].opened,
            Cerradas: weeklyOppData[week].closed
        })).sort((a,b) => a.week.localeCompare(b.week));

        const activitiesEvolution: WeeklyData[] = Object.keys(weeklyActData).map(week => ({
            week,
            Completadas: weeklyActData[week].completed,
            Pendientes: weeklyActData[week].pending,
            Vencidas: weeklyActData[week].overdue,
        })).sort((a,b) => a.week.localeCompare(b.week));

        return {
            totalUsers: users.length,
            totalAccounts: allAccounts.length,
            totalOpportunities: this.opportunities.length,
            totalRevenue: totalRevenue,
            recentActivities: activities.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()).slice(0, 5),
            opportunitiesEvolution,
            activitiesEvolution,
        };
    }

    if (user.isAgent) {
        const agentRecord = this.agents.find(a => a.idUser === user.id);
        const portfolioAccountIds = this.portfolios
            .filter(p => p.idAgent === agentRecord?.agentId)
            .map(p => p.idAccount);
        
        const openOpportunities = opportunities.filter(opp => !['Ganada', 'Perdida', 'Cancelada'].includes(opp.estado));
        const portfolioValue = openOpportunities.reduce((sum, opp) => sum + opp.importe, 0);
        const pendingActivities = activities.filter(act => act.estado === 'Pendiente');

        return {
            assignedAccounts: portfolioAccountIds.length,
            openOpportunities: openOpportunities.length,
            portfolioValue: portfolioValue,
            pendingActivities: pendingActivities.length,
        };
    }

    // Fallback for users with no specific role dashboard
    return {};
  }
}

// Exportamos una única instancia (Singleton Pattern) para mantener un estado consistente
const api = new DataAPI();
export default api;
