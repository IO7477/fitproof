import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, AlertOctagon } from 'lucide-react';
import { CompatibilityStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: CompatibilityStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const configs: Record<
    CompatibilityStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    SUPPORTED: {
      label: 'SUPPORTED',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
    },
    CONDITIONAL: {
      label: 'CONDITIONAL',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />,
    },
    INCOMPATIBLE: {
      label: 'INCOMPATIBLE',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
      icon: <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />,
    },
    INSUFFICIENT_INFORMATION: {
      label: 'INSUFFICIENT INFORMATION',
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-800 dark:text-slate-200',
      border: 'border-slate-300 dark:border-slate-700',
      icon: <HelpCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />,
    },
    CONFLICTING_EVIDENCE: {
      label: 'CONFLICTING EVIDENCE',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-800',
      icon: <AlertOctagon className="w-4 h-4 text-purple-600 flex-shrink-0" />,
    },
  };

  const config = configs[status] || configs.INSUFFICIENT_INFORMATION;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}

