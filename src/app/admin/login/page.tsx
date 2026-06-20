import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { login } from '../actions';
import { isAuthenticated, isAdminConfigured } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin · Login',
  robots: { index: false, follow: false },
};

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) redirect('/admin');
  const { error } = await searchParams;
  const configured = isAdminConfigured();

  return (
    <main className="min-h-screen flex items-center justify-center bg-sand px-5">
      <div className="w-full max-w-sm bg-shell rounded-2xl border border-line shadow-lg p-8">
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">
          Panel RivieraMayaPass
        </h1>
        <p className="text-ink-soft text-sm mb-6">Acceso restringido</p>

        {!configured && (
          <p className="mb-4 rounded-lg bg-sun-bg text-ink text-sm px-3 py-2">
            Falta configurar <code className="font-mono">ADMIN_PASSWORD</code> en
            las variables de entorno.
          </p>
        )}

        {error === '1' && (
          <p className="mb-4 rounded-lg bg-coral-bg text-coral text-sm px-3 py-2">
            Contraseña incorrecta.
          </p>
        )}
        {error === 'config' && (
          <p className="mb-4 rounded-lg bg-coral-bg text-coral text-sm px-3 py-2">
            El servidor no tiene la contraseña configurada.
          </p>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="w-full rounded-xl border border-line bg-sand/50 px-4 py-3 text-ink outline-none focus:border-sea focus:ring-2 focus:ring-sea/20"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-coral text-white font-body font-bold rounded-xl px-6 py-3 hover:bg-coral/90 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
