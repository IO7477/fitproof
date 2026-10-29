'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Wrench,
  CheckSquare,
  Search,
  Laptop as LaptopIcon,
  Cpu,
  FileText,
  User,
} from 'lucide-react';
import { setDemoRoleAction } from '@/app/actions';
import { UserRoleSession } from '@/lib/types';

interface NavbarProps {
  currentUser: UserRoleSession;
}

export function Navbar({ currentUser }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    const formData = new FormData();
    formData.append('role', newRole);
    startTransition(async () => {
      await setDemoRoleAction(formData);
    });
  };

  const navLinks = [
    { href: '/check', label: 'Check Compatibility', icon: Search },
    { href: '/laptops', label: 'Laptops', icon: LaptopIcon },
    { href: '/parts', label: 'Parts', icon: Cpu },
    { href: '/technician', label: 'Technician Desk', icon: Wrench },
    { href: '/reviewer', label: 'Review Queue', icon: CheckSquare },
    { href: '/evidence', label: 'Evidence Archive', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Prototype Synthetic Data Alert Banner */}
      <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-semibold text-center border-b border-amber-600/30 flex items-center justify-center gap-2">
        <span className="bg-amber-950 text-white text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
          Prototype
        </span>
        <span>
          Synthetic Demonstration Data Only. Evidence-backed decision support with strict honesty invariants.
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-sky-700 flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-sky-800 transition-colors">
                <ShieldCheck className="w-5 h-5 text-sky-100" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors">
                  FitProof
                </span>
                <span className="block text-[11px] text-slate-500 font-medium leading-none">
                  Evidence-Backed Hardware Compatibility
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Demo Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider leading-tight">
                  Demo Identity
                </span>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </span>
              </div>

              <select
                value={currentUser.role}
                onChange={handleRoleChange}
                disabled={isPending}
                className="ml-2 text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                title="Switch role for local prototype testing"
              >
                <option value="BUYER">Buyer (Morgan Blake)</option>
                <option value="TECHNICIAN">Technician (Alex Chen)</option>
                <option value="REVIEWER">Reviewer (Jordan Vance)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

