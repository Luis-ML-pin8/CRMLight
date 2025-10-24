'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@crmlight.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = await api.getUserByEmail(email);

      if (user && user.password === password) {
        // Simulación de sesión: guardar usuario en sessionStorage
        sessionStorage.setItem('crmlight-user', JSON.stringify(user));
        router.push('/dashboard');
      } else {
        setError('Las credenciales son incorrectas.');
      }
    } catch (err) {
      setError('Ha ocurrido un error durante el login.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-input bg-background rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-input bg-background rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
