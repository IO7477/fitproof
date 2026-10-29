import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Shield,
  Printer,
  Layers,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  ExternalLink,
  Wrench,
  Cpu,
  HardDrive,
  Clock,
  User,
  Scale,
} from 'lucide-react';
import { computeAssessment } from '@/app/actions';
import { StatusBadge } from '@/components/StatusBadge';

interface Props {
  searchParams: {
    laptopId?: string;
    slotId?: string;
    partId?: string;
  };
}

export default async function CheckResultPage({ searchParams }: Props) {
  const { laptopId, slotId, partId } = searchParams;

  if (!laptopId || !slotId || !partId) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Missing Required Parameters</h2>
        <p className="text-xs text-slate-500">
          A laptop, target slot, and candidate part must all be selected to run an evidence-backed assessment.
        </p>
        <Link
          href="/check"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-lg text-xs font-semibold hover:bg-sky-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Compatibility Checker</span>
        </Link>
      </div>
    );
  }

  let data;
  try {
    data = await computeAssessment(laptopId, slotId, partId);
  } catch (err: any) {
    return (
      <div className="p-8 text-center bg-white border border-rose-200 rounded-xl space-y-3">
        <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Assessment Error</h2>
        <p className="text-xs text-slate-500">{err.message}</p>
        <Link
          href="/check"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          <span>Return to Compatibility Checker</span>
        </Link>
      </div>
    );
  }

  const { assessment, laptop, slot, part, relevantEvidence } = data;

  const isRam = slot.slotType === 'RAM';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <Link
          href="/check"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Configuration Selector</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/compare?laptopId=${laptop.id}&slotId=${slot.id}&partIds=${part.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>Compare Candidates</span>
          </Link>
          <Link
            href={`/print?laptopId=${laptop.id}&slotId=${slot.id}&partId=${part.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </Link>
          <Link
            href={`/technician?laptopId=${laptop.id}&partId=${part.id}&slotId=${slot.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-300" />
            <span>Submit Observation</span>
          </Link>
        </div>
      </div>

      {/* Primary Conclusion Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={assessment.status} size="lg" />
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Engine {assessment.ruleEngineVersion}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
              {assessment.shortExplanation}
            </h1>
          </div>

          <div className="text-right flex-shrink-0 text-xs text-slate-400 font-mono">
            <div>Computed: {new Date(assessment.computedAt).toLocaleDateString()}</div>
            <div className="text-[11px] text-amber-700 font-sans font-medium">
              Synthetic Demonstration
            </div>
          </div>
        </div>

        {/* Selected Pairing Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Identified Laptop
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{laptop.variantName}</div>
            <div className="font-mono text-slate-500 mt-0.5">Code: {laptop.modelCode}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Target Slot / Bay
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{slot.identifier}</div>
            <div className="font-mono text-slate-500 mt-0.5">
              {slot.formFactor} • {slot.currentOccupancy}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Candidate Component
            </div>
            <div className="font-bold text-slate-900 mt-0.5">{part.name}</div>
            <div className="font-mono text-slate-500 mt-0.5">P/N: {part.partNumber}</div>
          </div>
        </div>
      </div>

      {/* Prominent Unknowns / Next Action (Section 8 Honesty requirement) */}
      {assessment.unknownRequirements.length > 0 && (
        <section className="bg-slate-50 border border-slate-300 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <HelpCircle className="w-5 h-5 text-slate-600" />
            <span>Unknown Requirements — What Must Be Confirmed Before Purchase</span>
          </div>
          <p className="text-xs text-slate-600">
            FitProof refuses to provide false assurance. The following critical parameters could not be verified from available documentation:
          </p>
          <div className="space-y-2.5 pt-1">
            {assessment.unknownRequirements.map((u) => (
              <div
                key={u.id}
                className="p-3.5 bg-white border border-slate-300 rounded-lg space-y-1 text-xs"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{u.title}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Action Required
                  </span>
                </div>
                <p className="text-slate-600">{u.description}</p>
                <div className="font-medium text-sky-800 bg-sky-50 p-2 rounded border border-sky-200 mt-1">
                  <strong>Specific Next Action:</strong> {u.nextAction}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Conditions, Accessories & Performance Limitations */}
      {assessment.conditionsOrLimitations.length > 0 && (
        <section className="bg-amber-50/60 border border-amber-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Conditions & Documented Limitations</span>
          </div>
          <div className="space-y-2.5">
            {assessment.conditionsOrLimitations.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-white border border-amber-200 rounded-lg space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">{c.title}</span>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {c.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Decision-Driving Checks Breakdown (Passed & Failed) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-700" />
            <span>Deterministic Rule Engine Checks</span>
          </h2>
          <p className="text-xs text-slate-500">
            Physical fit, electrical protocols, platform ceilings, and installation constraints are evaluated independently.
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Failed Checks */}
          {assessment.failedChecks.map((check) => (
            <div
              key={check.id}
              className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 flex items-start gap-3 text-xs"
            >
              <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-900">{check.title}</span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded uppercase">
                    {check.category}
                  </span>
                  {check.blocking && (
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-200/70 px-1.5 py-0.5 rounded">
                      BLOCKING
                    </span>
                  )}
                </div>
                <p className="text-rose-800 leading-relaxed">{check.detail}</p>
              </div>
            </div>
          ))}

          {/* Passed Checks */}
          {assessment.passedChecks.map((check) => (
            <div
              key={check.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-start gap-3 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{check.title}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                    {check.category}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence Provenance Section (Section 6 & 8) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-700" />
              <span>Supporting Evidence & Inspection Archive</span>
            </h2>
            <p className="text-xs text-slate-500">
              Technical claims are presented alongside reviewed source excerpts, technician credentials, and test notes.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
            {relevantEvidence.length} Associated Records
          </span>
        </div>

        {relevantEvidence.length === 0 ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
            No specific empirical bench test or manual excerpt has been submitted for this exact pairing yet.
          </div>
        ) : (
          <div className="space-y-3">
            {relevantEvidence.map((ev) => {
              const isApproved = ev.reviewStatus === 'APPROVED';
              const isConflicting = assessment.conflictingEvidenceIds.includes(ev.id);

              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-lg border text-xs space-y-2 ${
                    isConflicting
                      ? 'border-purple-300 bg-purple-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{ev.sourceTitle}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ev.evidenceType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ev.reviewStatus}
                      </span>
                      {ev.isSynthetic && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                          SYNTHETIC
                        </span>
                      )}
                      <Link
                        href={`/evidence/${ev.id}`}
                        className="inline-flex items-center gap-0.5 text-sky-700 hover:text-sky-900 font-semibold"
                      >
                        <span>Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  <blockquote className="border-l-2 border-slate-300 pl-3 py-1 text-slate-700 italic bg-slate-50/70 rounded-r">
                    "{ev.excerpt}"
                  </blockquote>

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                    <span>
                      <strong>Exact Claim:</strong> {ev.exactClaim}
                    </span>
                    <span>
                      <strong>Submitter:</strong> {ev.submitterName} ({ev.submitterRole})
                    </span>
                    {ev.reviewedBy && (
                      <span>
                        <strong>Reviewed By:</strong> {ev.reviewedBy}
                      </span>
                    )}
                  </div>

                  {/* If test observation exists, show outcome */}
                  {ev.testObservations && ev.testObservations.length > 0 && (
                    <div className="p-2.5 bg-slate-100/70 rounded border border-slate-200 text-[11px] space-y-1">
                      <div className="font-semibold text-slate-800">
                        Bench Test Diagnostic Log:
                      </div>
                      <div>
                        Outcome:{' '}
                        <span
                          className={`font-mono font-bold ${
                            ev.testObservations[0].outcome === 'BOOT_STABLE'
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {ev.testObservations[0].outcome}
                        </span>{' '}
                        (BIOS: {ev.testObservations[0].biosVersion || 'N/A'})
                      </div>
                      <div className="text-slate-600">
                        Procedure: {ev.testObservations[0].testProcedure}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

