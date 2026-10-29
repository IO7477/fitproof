import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  Cpu,
  HardDrive,
  ArrowLeft,
  ArrowRight,
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default async function PartDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const part = await prisma.part.findUnique({
    where: { id: params.id },
    include: {
      evidence: {
        include: { testObservations: true, laptop: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!part) return notFound();

  const isRam = part.category === 'RAM';

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/parts"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Parts Catalog</span>
        </Link>

        <Link
          href={`/check`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-bold hover:bg-sky-800 transition-colors shadow-sm"
        >
          <span>Check Compatibility with a Laptop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded">
                {part.partNumber}
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {part.category} Component
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              {part.name}
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Manufacturer: <strong>{part.manufacturer}</strong> • Form Factor: {part.formFactor}
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
            SYNTHETIC DEMO RECORD
          </span>
        </div>

        {part.notes && (
          <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 italic">
            {part.notes}
          </p>
        )}
      </div>

      {/* Specifications Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-700" />
          <span>Category Technical Specifications</span>
        </h2>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden font-mono text-[11px]">
          <div className="p-3 bg-slate-50 flex justify-between font-sans font-bold text-slate-700">
            <span>Property</span>
            <span>Recorded Specification Value</span>
          </div>

          <div className="p-3 flex justify-between">
            <span className="text-slate-500 font-sans">Capacity:</span>
            <span className="font-bold text-slate-900">{part.capacityGb}GB</span>
          </div>

          <div className="p-3 flex justify-between">
            <span className="text-slate-500 font-sans">Physical Form Factor:</span>
            <span className="text-slate-800">{part.formFactor}</span>
          </div>

          {isRam ? (
            <>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">DDR Generation:</span>
                <span className="text-slate-800">{part.ddrGen || 'N/A'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">Operating Speed:</span>
                <span className="text-slate-800">{part.speedMt ? `${part.speedMt} MT/s` : 'Standard'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">Operating Voltage:</span>
                <span className="text-slate-800">{part.voltage || '1.2V JEDEC'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">Pin Count:</span>
                <span className="text-slate-800">{part.pinCount ? `${part.pinCount}-pin` : 'Standard'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">Transmission Protocol:</span>
                <span className="text-slate-800">{part.protocol || 'PCIe NVMe'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">PCIe Bus Lanes:</span>
                <span className="text-slate-800">{part.pcieGen || 'Standard'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">Module Length:</span>
                <span className="text-slate-800">{part.moduleLengthMm ? `${part.moduleLengthMm}mm` : 'N/A'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">PCB Component Density:</span>
                <span className="text-slate-800">{part.isDoubleSided ? 'Double-Sided PCB (NAND on underside)' : 'Single-Sided PCB'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-slate-500 font-sans">Factory Attached Heatsink:</span>
                <span className="text-slate-800">{part.heatsinkIncluded ? 'Yes' : 'No'}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Associated Evidence & Observations */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-700" />
          <span>Recorded Evidence & Test Observations ({part.evidence.length})</span>
        </h2>

        {part.evidence.length === 0 ? (
          <div className="text-slate-500 italic py-2">
            No specific test observations recorded for this part yet.
          </div>
        ) : (
          <div className="space-y-3">
            {part.evidence.map((ev) => (
              <div key={ev.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ev.sourceTitle}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {ev.reviewStatus}
                  </span>
                </div>
                <div className="text-slate-700 italic">"{ev.excerpt}"</div>
                <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/50">
                  <span>Exact Claim: <strong>{ev.exactClaim}</strong></span>
                  <span>Target Laptop: {ev.laptop?.modelCode || 'Any'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

