import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Laptop as LaptopIcon, ArrowRight, Layers, Cpu, HardDrive } from 'lucide-react';

export default async function LaptopsPage() {
  const laptops = await prisma.laptop.findMany({
    include: { upgradeTargets: true },
    orderBy: { modelFamily: 'asc' },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <LaptopIcon className="w-6 h-6 text-sky-700" />
          <span>Laptop Catalog</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore synthetic device profiles, expansion slots, motherboard layouts, and documented specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {laptops.map((laptop) => {
          const ramSlots = laptop.upgradeTargets.filter((t) => t.slotType === 'RAM');
          const ssdBays = laptop.upgradeTargets.filter((t) => t.slotType === 'SSD');

          return (
            <div
              key={laptop.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {laptop.manufacturer}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {laptop.modelCode}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {laptop.variantName}
                  </h3>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Family: {laptop.modelFamily} • {laptop.releaseYear || 'N/A'}
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3">
                  {laptop.configurationNotes}
                </p>

                {/* Slots Breakdown */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    {ramSlots.length} RAM {ramSlots.length === 1 ? 'slot' : 'slots'}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                    {ssdBays.length} SSD {ssdBays.length === 1 ? 'bay' : 'bays'}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/laptops/${laptop.id}`}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900"
                >
                  View Motherboard Map
                </Link>

                <Link
                  href={`/check`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1.5 rounded transition-colors"
                >
                  <span>Check Fit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

