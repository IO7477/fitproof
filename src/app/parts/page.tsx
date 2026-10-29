import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Cpu, HardDrive, ArrowRight, Search } from 'lucide-react';
import { PartsCatalogClient } from './PartsCatalogClient';

export default async function PartsPage() {
  const parts = await prisma.part.findMany({
    include: {
      evidence: true,
      testObservations: true,
    },
    orderBy: { partNumber: 'asc' },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-6 h-6 text-sky-700" />
          <span>RAM & SSD Component Catalog</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Catalog of synthetic replacement modules, memory densities, M.2 form factors, and transmission protocols.
        </p>
      </div>

      <PartsCatalogClient parts={parts} />
    </div>
  );
}

