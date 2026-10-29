import Link from 'next/link';
import { prisma } from '@/lib/db';
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

export default async function EvidenceArchivePage() {
  const evidenceList = await prisma.evidence.findMany({
    include: {
      laptop: true,
      part: true,
      targetSlot: true,
      testObservations: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-sky-700" />
          <span>Evidence Provenance Archive</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete transparent register of engineering manuals, bench test logs, and third-party submissions.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 text-xs">
          {evidenceList.map((ev) => {
            const isApproved = ev.reviewStatus === 'APPROVED';

            return (
              <div key={ev.id} className="p-5 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{ev.sourceTitle}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ev.evidenceType.replace('_', ' ')}
                    </span>
                    {ev.isSynthetic && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                        SYNTHETIC DEMO
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.reviewStatus === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ev.reviewStatus}
                    </span>
                    {ev.isDisputed && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                        DISPUTED CONFLICT
                      </span>
                    )}
                    <Link
                      href={`/evidence/${ev.id}`}
                      className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold ml-2"
                    >
                      <span>Full Provenance</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <blockquote className="border-l-2 border-slate-300 pl-3 py-1 text-slate-700 italic bg-slate-50 rounded-r">
                  "{ev.excerpt}"
                </blockquote>

                <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                  <span>Exact Claim: <strong>{ev.exactClaim}</strong></span>
                  {ev.laptop && <span>Laptop: {ev.laptop.modelCode}</span>}
                  {ev.part && <span>Part: {ev.part.partNumber}</span>}
                  <span>Submitter: {ev.submitterName} ({ev.submitterRole})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

