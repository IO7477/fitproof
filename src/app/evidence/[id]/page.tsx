import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import {
  FileText,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export default async function EvidenceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ev = await prisma.evidence.findUnique({
    where: { id: params.id },
    include: {
      laptop: true,
      part: true,
      targetSlot: true,
      testObservations: true,
    },
  });

  if (!ev) return notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="border-b border-slate-200 pb-4">
        <Link
          href="/evidence"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Evidence Archive</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {ev.evidenceType.replace('_', ' ')}
          </span>
          {ev.isSynthetic && (
            <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
              SYNTHETIC DEMONSTRATION RECORD
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
          {ev.sourceTitle}
        </h1>
      </div>

      {/* Main Evidence Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-slate-400 font-mono text-[11px]">
              Record ID: {ev.id}
            </span>
            <div className="text-slate-600">
              Submitted: {new Date(ev.createdAt).toLocaleString()}
            </div>
          </div>

          <span
            className={`font-bold px-3 py-1 rounded text-xs ${
              ev.reviewStatus === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800'
                : ev.reviewStatus === 'PENDING'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {ev.reviewStatus}
          </span>
        </div>

        {/* Claim & Excerpt */}
        <div className="space-y-3">
          <div>
            <h3 className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              Exact Technical Claim Supported
            </h3>
            <p className="text-sm font-bold text-slate-900 mt-1 leading-snug">
              {ev.exactClaim}
            </p>
          </div>

          <div>
            <h3 className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              Document Excerpt / Bench Test Record
            </h3>
            <blockquote className="border-l-3 border-sky-400 bg-slate-50 p-4 rounded-r text-slate-800 text-xs italic leading-relaxed mt-1">
              "{ev.excerpt}"
            </blockquote>
          </div>

          {ev.sourceUrl && (
            <div className="pt-1">
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                External Reference (Unreviewed User Submission):
              </span>
              <div className="mt-1">
                <a
                  href={ev.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-700 hover:underline inline-flex items-center gap-1 font-mono text-xs"
                >
                  <span>{ev.sourceUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Test Observations */}
        {ev.testObservations && ev.testObservations.length > 0 && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-mono text-[11px]">
            <div className="font-bold font-sans text-xs text-slate-900">
              Empirical Hardware Test Diagnostic Log
            </div>
            <div>
              Outcome:{' '}
              <span
                className={`font-bold ${
                  ev.testObservations[0].outcome === 'BOOT_STABLE'
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {ev.testObservations[0].outcome}
              </span>
            </div>
            <div>BIOS Revision: {ev.testObservations[0].biosVersion || 'Unspecified'}</div>
            <div>Procedure: {ev.testObservations[0].testProcedure}</div>
            {ev.testObservations[0].observedLimitations && (
              <div>Observed Limitations: {ev.testObservations[0].observedLimitations}</div>
            )}
          </div>
        )}

        {/* Dispute Status */}
        {ev.isDisputed && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-1 text-purple-900">
            <div className="font-bold text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-purple-700" />
              <span>Contradiction / Dispute Flagged</span>
            </div>
            <p className="text-xs leading-relaxed">{ev.disputeNotes}</p>
          </div>
        )}

        {/* Provenance & Moderation Rationale */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
          <div className="space-y-1">
            <div className="font-bold text-slate-700">Submitter Identity</div>
            <div className="text-slate-600">
              {ev.submitterName} ({ev.submitterRole})
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-slate-700">Reviewer Evaluation</div>
            <div className="text-slate-600">
              {ev.reviewedBy ? `${ev.reviewedBy} on ${new Date(ev.reviewedAt!).toLocaleDateString()}` : 'Pending moderation'}
            </div>
            {ev.reviewRationale && (
              <div className="text-slate-500 italic mt-0.5">
                Rationale: "{ev.reviewRationale}"
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

