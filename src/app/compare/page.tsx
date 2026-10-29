import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { computeAssessment } from '@/app/actions';
import { StatusBadge } from '@/components/StatusBadge';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Scale, Cpu, HardDrive } from 'lucide-react';

interface Props {
  searchParams: {
    laptopId?: string;
    slotId?: string;
    partIds?: string;
  };
}

export default async function ComparePage({ searchParams }: Props) {
  const { laptopId, slotId, partIds } = searchParams;

  if (!laptopId || !slotId || !partIds) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Incomplete Comparison Parameters</h2>
        <p className="text-xs text-slate-500">
          Please select a laptop, target slot, and up to three candidate parts to compare.
        </p>
        <Link
          href="/check"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go to Compatibility Checker</span>
        </Link>
      </div>
    );
  }

  const ids = partIds.split(',').filter(Boolean).slice(0, 3);

  // Compute assessments for all candidate parts
  const results = await Promise.all(
    ids.map((id) => computeAssessment(laptopId, slotId, id))
  );

  const { laptop, slot } = results[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <Link
            href={`/check`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Wizard</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-700" />
            <span>Candidate Comparison: {slot.identifier}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Comparing up to 3 candidate parts for <strong>{laptop.variantName}</strong> ({laptop.modelCode})
          </p>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-700 w-1/4">Evaluation Dimension</th>
              {results.map(({ part, assessment }) => (
                <th key={part.id} className="p-4 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                  <div className="space-y-1">
                    <span className="font-mono text-[11px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded">
                      {part.partNumber}
                    </span>
                    <div className="text-sm font-bold text-slate-900 leading-tight">
                      {part.name}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Verdict Status */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 bg-slate-50/50">
                Compatibility Verdict
              </td>
              {results.map(({ part, assessment }) => (
                <td key={part.id} className="p-4 border-l border-slate-200">
                  <div className="space-y-2">
                    <StatusBadge status={assessment.status} size="md" />
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {assessment.shortExplanation}
                    </p>
                  </div>
                </td>
              ))}
            </tr>

            {/* Capacity & Form Factor */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 bg-slate-50/50">
                Capacity & Physical Layout
              </td>
              {results.map(({ part }) => (
                <td key={part.id} className="p-4 border-l border-slate-200 font-mono text-[11px]">
                  <div>Capacity: <strong>{part.capacityGb}GB</strong></div>
                  <div>Form Factor: {part.formFactor}</div>
                  {part.moduleLengthMm && <div>Module Length: {part.moduleLengthMm}mm</div>}
                  <div>PCB: {part.isDoubleSided ? 'Double-Sided' : 'Single-Sided'}</div>
                </td>
              ))}
            </tr>

            {/* Interface & Protocol */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 bg-slate-50/50">
                Interface / Protocol
              </td>
              {results.map(({ part }) => (
                <td key={part.id} className="p-4 border-l border-slate-200 font-mono text-[11px]">
                  {part.category === 'RAM' ? (
                    <div>
                      <div>Generation: {part.ddrGen}</div>
                      <div>Speed: {part.speedMt} MT/s</div>
                      <div>Voltage: {part.voltage || 'Standard'}</div>
                    </div>
                  ) : (
                    <div>
                      <div>Protocol: {part.protocol}</div>
                      <div>Bus: {part.pcieGen || 'SATA 6Gbps'}</div>
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Failed Checks */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 bg-slate-50/50">
                Blocking Incompatibilities
              </td>
              {results.map(({ part, assessment }) => (
                <td key={part.id} className="p-4 border-l border-slate-200">
                  {assessment.failedChecks.length === 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      0 Blocking Mismatches
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      {assessment.failedChecks.map((f) => (
                        <div key={f.id} className="text-rose-700 font-medium text-[11px] flex items-start gap-1">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span>{f.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Conditions & Limitations */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 bg-slate-50/50">
                Conditions / Limitations
              </td>
              {results.map(({ part, assessment }) => (
                <td key={part.id} className="p-4 border-l border-slate-200">
                  {assessment.conditionsOrLimitations.length === 0 ? (
                    <span className="text-slate-400 text-[11px]">None</span>
                  ) : (
                    <div className="space-y-1.5">
                      {assessment.conditionsOrLimitations.map((c) => (
                        <div key={c.id} className="text-amber-800 text-[11px] flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                          <span>{c.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              ))}
            </tr>

            {/* Direct Link to Full Report */}
            <tr>
              <td className="p-4 font-semibold text-slate-700 bg-slate-50/50">
                Full Assessment
              </td>
              {results.map(({ part }) => (
                <td key={part.id} className="p-4 border-l border-slate-200">
                  <Link
                    href={`/check/result?laptopId=${laptop.id}&slotId=${slot.id}&partId=${part.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 font-semibold rounded text-xs transition-colors"
                  >
                    <span>View Provenance & Checks</span>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

