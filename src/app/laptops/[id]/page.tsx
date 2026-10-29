import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  Laptop as LaptopIcon,
  Layers,
  Cpu,
  HardDrive,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
} from 'lucide-react';

export default async function LaptopDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const laptop = await prisma.laptop.findUnique({
    where: { id: params.id },
    include: {
      upgradeTargets: true,
      evidence: {
        include: { testObservations: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!laptop) return notFound();

  let knownSpecsObj: Record<string, string> = {};
  let unknownSpecsObj: Record<string, string> = {};
  try {
    knownSpecsObj = JSON.parse(laptop.knownSpecs || '{}');
    unknownSpecsObj = JSON.parse(laptop.unknownSpecs || '{}');
  } catch (e) {
    // fallback
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Nav */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/laptops"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Laptop Catalog</span>
        </Link>

        <Link
          href={`/check`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-bold hover:bg-sky-800 transition-colors shadow-sm"
        >
          <span>Select this Laptop in Checker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded">
                {laptop.manufacturer}
              </span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Model: {laptop.modelCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
              {laptop.variantName}
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              Family: <strong>{laptop.modelFamily}</strong> • Released: {laptop.releaseYear || 'N/A'} • Revision: {laptop.regionRevision || 'Standard'}
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
            SYNTHETIC DEMO RECORD
          </span>
        </div>

        <p className="text-sm text-slate-700 pt-2 border-t border-slate-100 leading-relaxed">
          {laptop.configurationNotes}
        </p>
      </div>

      {/* Motherboard Upgrade Targets Map */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-700" />
            <span>Motherboard Slots & Storage Bays ({laptop.upgradeTargets.length})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Hardware interface topology, pinout generations, and occupancy constraints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {laptop.upgradeTargets.map((target) => {
            const isRam = target.slotType === 'RAM';

            return (
              <div
                key={target.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                      isRam
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isRam ? <Cpu className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
                    {target.slotType}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      target.isSoldered
                        ? 'bg-rose-100 text-rose-800'
                        : target.currentOccupancy === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : target.currentOccupancy === 'OCCUPIED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {target.isSoldered
                      ? 'SOLDERED (NON-UPGRADEABLE)'
                      : target.currentOccupancy === 'AVAILABLE'
                      ? 'FREE / AVAILABLE'
                      : target.currentOccupancy === 'OCCUPIED'
                      ? 'OCCUPIED'
                      : 'OCCUPANCY UNKNOWN'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{target.identifier}</h3>
                  <div className="font-mono text-slate-600 mt-0.5">
                    {target.formFactor} {target.ddrGeneration ? `(${target.ddrGeneration})` : ''}
                    {target.protocolSupported ? `• ${target.protocolSupported}` : ''}
                    {target.pcieGenLanes ? `• ${target.pcieGenLanes}` : ''}
                  </div>
                </div>

                <div className="space-y-1 text-slate-600 border-t border-slate-200/60 pt-2 font-mono text-[11px]">
                  {isRam && (
                    <>
                      <div>Max Per Slot: {target.maxCapacityPerSlotGb ? `${target.maxCapacityPerSlotGb}GB` : 'Unspecified'}</div>
                      <div>System Max: {target.maxTotalSystemCapacityGb ? `${target.maxTotalSystemCapacityGb}GB` : 'Unspecified'}</div>
                      {target.solderedCapacityGb && <div>Soldered Onboard: {target.solderedCapacityGb}GB</div>}
                    </>
                  )}
                  {!isRam && (
                    <>
                      <div>Lengths: {target.supportedLengths || 'Standard 2280'}</div>
                      <div>Boot Support: {target.bootSupported ? 'Yes (UEFI)' : 'No (Data only)'}</div>
                    </>
                  )}
                </div>

                {target.hardwareNotes && (
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800 font-sans text-[11px]">
                    <strong>Hardware Kit:</strong> {target.hardwareNotes}
                  </div>
                )}
                {target.clearanceNotes && (
                  <div className="p-2 bg-slate-100 rounded border border-slate-200 text-slate-700 font-sans text-[11px]">
                    <strong>Clearance:</strong> {target.clearanceNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Specifications Breakdown (Known vs Unknown) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Verified Known Specs */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Documented / Verified Specifications</span>
          </div>
          <div className="space-y-1.5 divide-y divide-slate-100 font-mono text-[11px]">
            {Object.entries(knownSpecsObj).map(([key, value]) => (
              <div key={key} className="pt-1.5 flex justify-between">
                <span className="text-slate-500 font-sans">{key}:</span>
                <span className="font-bold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unknown Requirements */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Unconfirmed / Missing Parameters</span>
          </div>
          {Object.keys(unknownSpecsObj).length === 0 ? (
            <div className="text-slate-500 text-xs italic py-2">
              No critical unknowns recorded for this variant.
            </div>
          ) : (
            <div className="space-y-1.5 divide-y divide-slate-100 font-mono text-[11px]">
              {Object.entries(unknownSpecsObj).map(([key, value]) => (
                <div key={key} className="pt-1.5 flex justify-between">
                  <span className="text-slate-500 font-sans">{key}:</span>
                  <span className="text-amber-800 font-sans">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Documented Evidence History */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-700" />
            <span>Evidence Records for this Model ({laptop.evidence.length})</span>
          </h2>
        </div>

        {laptop.evidence.length === 0 ? (
          <div className="text-slate-500 italic py-2">
            No specific empirical citations submitted yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {laptop.evidence.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{ev.sourceTitle}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {ev.reviewStatus}
                  </span>
                </div>
                <div className="text-slate-700 italic">"{ev.excerpt}"</div>
                <div className="text-[10px] text-slate-500">Claim: {ev.exactClaim}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

