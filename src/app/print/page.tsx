import React from 'react';
import { computeAssessment } from '@/app/actions';
import { StatusBadge } from '@/components/StatusBadge';
import { Shield, Printer, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { PrintButton } from './PrintButton';

interface Props {
  searchParams: {
    laptopId?: string;
    slotId?: string;
    partId?: string;
  };
}

export default async function PrintAssessmentPage({ searchParams }: Props) {
  const { laptopId, slotId, partId } = searchParams;

  if (!laptopId || !slotId || !partId) {
    return <div className="p-8 text-center text-sm">Invalid parameters for printable report.</div>;
  }

  const { assessment, laptop, slot, part, relevantEvidence } = await computeAssessment(
    laptopId,
    slotId,
    partId
  );

  return (
    <div className="bg-white text-black p-8 sm:p-12 max-w-4xl mx-auto space-y-6">
      {/* Controls Bar (hidden when printing) */}
      <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
        <span className="text-xs text-slate-500">
          Printable Assessment Report • Ready for export or physical archive
        </span>
        <PrintButton />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold">
              FP
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              FitProof Compatibility Report
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Deterministic Hardware Decision Support System • Engine v{assessment.ruleEngineVersion}
          </p>
        </div>

        <div className="text-right text-xs text-slate-600 font-mono">
          <div>Report Date: {new Date(assessment.computedAt).toISOString().split('T')[0]}</div>
          <div className="text-amber-800 font-sans font-bold text-[10px] uppercase mt-1">
            Prototype — Synthetic Data
          </div>
        </div>
      </div>

      {/* Primary Conclusion Box */}
      <div className="border border-slate-300 p-5 rounded-lg space-y-2 bg-slate-50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
            Formal Assessment Conclusion
          </span>
          <StatusBadge status={assessment.status} size="lg" />
        </div>
        <div className="text-base font-bold text-slate-900">
          {assessment.shortExplanation}
        </div>
      </div>

      {/* Target & Hardware Specification Manifest */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="border border-slate-200 p-4 rounded-lg space-y-1.5">
          <div className="font-bold text-slate-900 text-sm border-b pb-1">
            Identified Laptop Target
          </div>
          <div><strong>Manufacturer:</strong> {laptop.manufacturer}</div>
          <div><strong>Model Family:</strong> {laptop.modelFamily}</div>
          <div><strong>Model Code:</strong> {laptop.modelCode}</div>
          <div><strong>Variant:</strong> {laptop.variantName}</div>
          <div><strong>Target Slot/Bay:</strong> {slot.identifier} ({slot.formFactor})</div>
          <div><strong>Current Occupancy:</strong> {slot.currentOccupancy}</div>
        </div>

        <div className="border border-slate-200 p-4 rounded-lg space-y-1.5">
          <div className="font-bold text-slate-900 text-sm border-b pb-1">
            Candidate Component
          </div>
          <div><strong>Manufacturer:</strong> {part.manufacturer}</div>
          <div><strong>Part Number:</strong> {part.partNumber}</div>
          <div><strong>Category:</strong> {part.category}</div>
          <div><strong>Capacity:</strong> {part.capacityGb}GB</div>
          <div><strong>Interface / Generation:</strong> {part.ddrGen || part.protocol}</div>
          <div><strong>Form Factor:</strong> {part.formFactor}</div>
        </div>
      </div>

      {/* Conditions, Limitations & Unknowns */}
      {(assessment.conditionsOrLimitations.length > 0 || assessment.unknownRequirements.length > 0) && (
        <div className="border border-slate-200 p-4 rounded-lg text-xs space-y-2">
          <div className="font-bold text-slate-900 border-b pb-1">
            Conditions, Platform Limitations & Required Next Actions
          </div>
          {assessment.conditionsOrLimitations.map((c) => (
            <div key={c.id} className="text-slate-800">
              • <strong>[{c.type}]:</strong> {c.title} — {c.detail}
            </div>
          ))}
          {assessment.unknownRequirements.map((u) => (
            <div key={u.id} className="text-slate-800">
              • <strong>[UNKNOWN]:</strong> {u.title} — {u.nextAction}
            </div>
          ))}
        </div>
      )}

      {/* Supporting Evidence Citations */}
      <div className="border border-slate-200 p-4 rounded-lg text-xs space-y-2">
        <div className="font-bold text-slate-900 border-b pb-1">
          Supporting Technical Evidence & Verified Citations
        </div>
        {relevantEvidence.length === 0 ? (
          <div className="text-slate-500 italic">No specific external citations linked.</div>
        ) : (
          relevantEvidence.map((ev) => (
            <div key={ev.id} className="border-b border-slate-100 pb-2 last:border-b-0">
              <div className="font-semibold text-slate-900">
                [{ev.evidenceType}] {ev.sourceTitle} (Status: {ev.reviewStatus})
              </div>
              <div className="text-slate-700 italic">"{ev.excerpt}"</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Submitter: {ev.submitterName} ({ev.submitterRole}) • Exact Claim: {ev.exactClaim}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legal & Honesty Footer */}
      <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
        <p>
          <strong>Non-Warranty Notice:</strong> This assessment is generated algorithmically from reviewed technical specifications and empirical bench observations. FitProof does not claim manufacturer endorsement or guarantee compatibility. Always verify physical clearances and disconnect AC/battery power before opening laptop chassis.
        </p>
        <p className="font-mono">
          Document UUID: fitproof-{laptop.modelCode}-{part.partNumber}-{Date.now()}
        </p>
      </div>
    </div>
  );
}

