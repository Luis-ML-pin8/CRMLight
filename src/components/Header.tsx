'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { UserCircle } from 'lucide-react';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('crmlight-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 z-10 border-b">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground">
          CRMLight
        </h1>
        <div className="flex items-center space-x-2">
          <UserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          {user && (
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              {user.nombre} {user.apellidos}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
