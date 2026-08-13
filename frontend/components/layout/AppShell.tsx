'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children: ReactNode;
}

function getUserInitial(email: string): string {
  return email.charAt(0).toUpperCase();
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateZone = () => {
    router.push('/hosted-zones/create');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="w-72 bg-slate-900 text-slate-100">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-sm uppercase tracking-[0.2em] text-aws-orange">Route53</div>
            <div className="mt-1 text-lg font-semibold">Console</div>
          </div>

          <nav className="space-y-1 p-3">
            <NavItem active label="Dashboard" />
            <NavItem label="Hosted zones" />
            <NavItem label="Traffic policies" />
            <NavItem label="Health checks" />
            <NavItem label="Resolver" />
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in as</div>
                <div className="text-lg font-semibold">{user?.email ?? '—'}</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCreateZone}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  Create hosted zone
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign out
                </button>
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-aws-orange text-sm font-bold text-white"
                  title={user?.email}
                >
                  {user ? getUserInitial(user.email) : '—'}
                </div>
              </div>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition ${
        active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
