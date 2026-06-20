import Link from 'next/link';
import { logout } from './actions';

/** Barra superior del panel con pestañas para cambiar de sección. */
export default function AdminHeader({
  active,
}: {
  active: 'propiedades' | 'sargazo';
}) {
  return (
    <header className="sticky top-0 z-10 bg-ink text-sand">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <h1 className="font-display text-lg font-semibold shrink-0">Panel</h1>
          <nav className="flex items-center gap-1 text-sm overflow-x-auto">
            <Tab href="/admin" active={active === 'propiedades'}>
              Propiedades
            </Tab>
            <Tab href="/admin/sargazo" active={active === 'sargazo'}>
              🌊 Bot de sargazo
            </Tab>
          </nav>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/es"
            className="text-lagoon/70 text-xs hover:text-lagoon hidden sm:inline"
          >
            ← Sitio
          </Link>
          <form action={logout}>
            <button className="text-sm bg-sand/10 hover:bg-sand/20 rounded-lg px-3 py-2 transition-colors">
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-lg px-3 py-1.5 transition-colors ${
        active
          ? 'bg-sand/20 text-sand font-semibold'
          : 'text-lagoon/70 hover:text-lagoon hover:bg-sand/10'
      }`}
    >
      {children}
    </Link>
  );
}
