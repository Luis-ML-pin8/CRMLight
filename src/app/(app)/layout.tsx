'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { User } from '@/types';
import {
  Users,
  Briefcase,
  Settings,
  User as UserIcon,
  UserCog,
  Building2,
  TrendingUp,
  ClipboardList,
  LayoutDashboard,
  Contact,
  BrainCircuit, // Icono para Agentes IA
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  subItems: NavItem[];
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userData = sessionStorage.getItem('crmlight-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const menuOptions: (NavItem | NavGroup)[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: 'Ventas',
      icon: Briefcase,
      subItems: [
        { href: '/sales/accounts', label: 'Clientes', icon: Building2 },
        { href: '/sales/contacts', label: 'Contactos', icon: Contact },
        { href: '/sales/opportunities', label: 'Oportunidades', icon: TrendingUp },
        { href: '/sales/activities', label: 'Actividades', icon: ClipboardList },
      ],
    },
    {
      label: 'Usuarios',
      icon: Users,
      subItems: [
        { href: '/users/agents', label: 'Agentes', icon: UserIcon },
        { href: '/users/coordinators', label: 'Coordinadores', icon: UserCog },
      ],
    },
  ];

  if (user?.isAdministrator) {
    let settingsMenu = menuOptions.find(opt => 'subItems' in opt && opt.label === 'Configuración') as NavGroup | undefined;
    
    if (!settingsMenu) {
        settingsMenu = {
            label: 'Configuración',
            icon: Settings,
            subItems: [],
        };
        menuOptions.push(settingsMenu);
    }

    // Asegurar que 'Cuentas' está presente
    if (!settingsMenu.subItems.some(item => item.href === '/settings/accounts')) {
        settingsMenu.subItems.push({ href: '/settings/accounts', label: 'Cuentas', icon: Users });
    }
    
    // Añadir 'Equipo'
    if (!settingsMenu.subItems.some(item => item.href === '/settings/team')) {
        settingsMenu.subItems.push({ href: '/settings/team', label: 'Equipo', icon: Users });
    }
    
    // Añadir 'Agentes IA'
    if (!settingsMenu.subItems.some(item => item.href === '/settings/ai-agents')) {
        settingsMenu.subItems.push({ href: '/settings/ai-agents', label: 'Agentes IA', icon: BrainCircuit });
    }
  }


  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = pathname === item.href;
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={cn(
            'flex items-center p-2 rounded-lg transition-colors duration-200',
            isSubItem ? 'pl-11' : 'pl-3',
            isActive
              ? 'bg-accent'
              : 'text-gray-600 hover:bg-orange-100/50 dark:text-gray-300 dark:hover:bg-orange-100/50'
          )}
        >
          {isSubItem && <item.icon className="w-5 h-5" />}
          <span className={cn('ml-3 font-medium', isSubItem && 'text-sm')}>{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background dark:bg-gray-900">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white shadow-md dark:bg-gray-800 p-4">
          <nav>
            <ul className="space-y-1">
              {menuOptions.map((option) => {
                if ('href' in option) {
                  return renderNavItem(option);
                } else {
                  return (
                    <li key={option.label}>
                      <div className="flex items-center p-2 text-gray-800 dark:text-gray-200 pl-3">
                        <option.icon className="w-5 h-5" />
                        <span className="ml-3 font-semibold">{option.label}</span>
                      </div>
                      <ul className="space-y-1 mt-1">
                        {option.subItems.map((subItem) => renderNavItem(subItem, true))}
                      </ul>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
