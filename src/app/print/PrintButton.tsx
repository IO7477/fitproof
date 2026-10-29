'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save as PDF</span>
    </button>
  );
}

