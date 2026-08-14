'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';

interface AppShellProps {
  children: ReactNode;
}

const SIDEBAR_SECTIONS = [
  {
    title: null,
    items: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Hosted zones', href: '/hosted-zones' },
      { label: 'Health checks', href: '#' },
      { label: 'Profiles', href: '#' },
    ],
  },
  {
    title: 'Global Resolver',
    items: [
      { label: 'Global resolvers', href: '#', badge: 'New' },
      { label: 'Shared DNS views', href: '#', badge: 'New' },
    ],
  },
  {
    title: 'VPC Resolver',
    items: [
      { label: 'VPCs', href: '#' },
      { label: 'Inbound endpoints', href: '#' },
      { label: 'Outbound endpoints', href: '#' },
      { label: 'Rules', href: '#' },
    ],
  },
  {
    title: 'Domains',
    items: [
      { label: 'Registered domains', href: '#' },
      { label: 'Requests', href: '#' },
    ],
  },
  {
    title: 'IP-based routing',
    items: [{ label: 'CIDR collections', href: '#' }],
  },
  {
    title: 'Traffic flow',
    items: [{ label: 'Traffic policies', href: '#' }],
  },
];

function getUserInitial(email: string): string {
  return email.charAt(0).toUpperCase();
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Global Resolver': true,
    'VPC Resolver': false,
    Domains: false,
    'IP-based routing': false,
    'Traffic flow': false,
  });

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex min-h-screen flex-col bg-aws-gray">
      {/* Global AWS header */}
      <header className="flex h-10 shrink-0 items-center bg-aws-slate px-3 text-white">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button type="button" className="rounded p-1 hover:bg-white/10" aria-label="Services">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="4" height="4" rx="0.5" />
              <rect x="6" y="1" width="4" height="4" rx="0.5" />
              <rect x="11" y="1" width="4" height="4" rx="0.5" />
              <rect x="1" y="6" width="4" height="4" rx="0.5" />
              <rect x="6" y="6" width="4" height="4" rx="0.5" />
              <rect x="11" y="6" width="4" height="4" rx="0.5" />
              <rect x="1" y="11" width="4" height="4" rx="0.5" />
              <rect x="6" y="11" width="4" height="4" rx="0.5" />
              <rect x="11" y="11" width="4" height="4" rx="0.5" />
            </svg>
          </button>

          <Link href="/dashboard" className="flex shrink-0 items-center gap-1.5 text-white no-underline">
            <span className="text-sm font-bold tracking-tight">aws</span>
          </Link>

          <div className="hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-aws-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search"
                className="h-7 w-full rounded border-0 bg-[#37475a] pl-8 pr-16 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-aws-link"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400">
                [Alt+S]
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <HeaderIcon label="Notifications">
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold">
              1
            </span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </HeaderIcon>
          <HeaderIcon label="Help">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </HeaderIcon>
          <HeaderIcon label="Settings">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </HeaderIcon>

          <div className="mx-2 hidden h-5 w-px bg-white/20 sm:block" />

          <button type="button" className="hidden px-2 text-xs text-slate-300 hover:text-white sm:block">
            Global
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/10"
            title={user?.email ?? 'Account'}
          >
            <span className="hidden max-w-[120px] truncate text-xs sm:inline">{user?.email ?? 'Account'}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-aws-orange text-xs font-bold text-aws-slateDark">
              {user ? getUserInitial(user.email) : '?'}
            </span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Light sidebar */}
        {sidebarOpen ? (
          <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-aws-border bg-white lg:block">
            <div className="flex items-center justify-between border-b border-aws-borderLight px-4 py-3">
              <span className="text-sm font-bold text-aws-text">Route 53</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="text-aws-muted hover:text-aws-text"
                aria-label="Collapse sidebar"
              >
                ‹
              </button>
            </div>

            <nav className="py-1">
              {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.title ? (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title!)}
                      className="flex w-full items-center gap-1 px-4 py-2 text-left text-xs font-bold text-aws-text hover:bg-aws-grayPanel"
                    >
                      <span className="text-[10px] text-aws-muted">{expandedSections[section.title] ? '▼' : '▶'}</span>
                      {section.title}
                    </button>
                  ) : null}

                  {(section.title ? expandedSections[section.title] : true) &&
                    section.items.map((item) => {
                      const isActive =
                        item.href !== '#' &&
                        (pathname === item.href ||
                          (item.href === '/hosted-zones' && pathname.startsWith('/hosted-zones')));
                      const content = (
                        <>
                          <span>{item.label}</span>
                          {'badge' in item && item.badge ? (
                            <span className="ml-1 rounded bg-aws-link/10 px-1 py-0.5 text-[10px] font-semibold text-aws-link">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      );

                      const className = clsx(
                        'flex w-full items-center px-4 py-1.5 text-left text-sm transition',
                        section.title ? 'pl-7' : '',
                        isActive
                          ? 'border-l-[3px] border-aws-orange bg-aws-grayPanel font-medium text-aws-text'
                          : 'border-l-[3px] border-transparent text-aws-text hover:bg-aws-grayPanel',
                      );

                      if (item.href === '#') {
                        return (
                          <span key={item.label} className={clsx(className, 'cursor-default opacity-70')}>
                            {content}
                          </span>
                        );
                      }

                      return (
                        <Link key={item.label} href={item.href} className={clsx(className, 'no-underline')}>
                          {content}
                        </Link>
                      );
                    })}
                </div>
              ))}
            </nav>
          </aside>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Sub-header bar with sidebar toggle — breadcrumbs render in page content below */}
          <div className="flex h-9 shrink-0 items-center border-b border-aws-border bg-white px-4">
            {!sidebarOpen ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-aws-link text-sm text-white hover:bg-aws-linkHover"
                aria-label="Open sidebar"
              >
                ☰
              </button>
            ) : null}
          </div>

          <main className="flex-1 overflow-auto p-5">{children}</main>
        </div>
      </div>

      {/* AWS footer */}
      <footer className="flex shrink-0 items-center justify-between bg-aws-slate px-4 py-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span>CloudShell</span>
          <span>Feedback</span>
          <span className="hidden sm:inline">Console mobile app</span>
        </div>
        <div className="flex items-center gap-3">
          <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
          <span className="hidden sm:inline">Privacy</span>
          <span className="hidden sm:inline">Terms</span>
        </div>
      </footer>
    </div>
  );
}

function HeaderIcon({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      className="relative rounded p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
      aria-label={label}
    >
      {children}
    </button>
  );
}
