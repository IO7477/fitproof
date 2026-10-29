'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  History,
} from 'lucide-react';
import { reviewEvidenceAction, setDemoRoleAction } from '@/app/actions';
import { UserRoleSession } from '@/lib/types';

interface Props {
  currentUser: UserRoleSession;
  pendingSubmissions: any[];
  reviewedHistory: any[];
  auditLogs: any[];
}

export function ReviewerView({
  currentUser,
  pendingSubmissions,
  reviewedHistory,
  auditLogs,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'queue' | 'history' | 'audit'>('queue');
  const [isPending, startTransition] = useTransition();

  // Selected Submission for Review Action
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [rationale, setRationale] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoleQuickSwitch = (role: string) => {
    const fd = new FormData();
    fd.append('role', role);
    startTransition(async () => {
      await setDemoRoleAction(fd);
      router.refresh();
    });
  };

  const handleReviewAction = (
    evidenceId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CLARIFICATION'
  ) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!rationale.trim() || rationale.trim().length < 5) {
      setErrorMessage('A detailed review rationale (minimum 5 characters) is required to ensure moderation auditability.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await reviewEvidenceAction({
          evidenceId,
          action,
          rationale: rationale.trim(),
        });

        if (res.success) {
          setSuccessMessage(
            `Evidence submission was marked ${res.updatedStatus}. Published compatibility assessments have been recomputed.`
          );
          setReviewingId(null);
          setRationale('');
          router.refresh();
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to submit review action');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-sky-700" />
            <span>Review Queue & Specification Moderation</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate technician submissions and manufacturer manual excerpts before they affect published compatibility verdicts.
          </p>
        </div>

        {/* Role Check Warning */}
        {currentUser.role !== 'REVIEWER' && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex items-center gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Current role is {currentUser.role}. Must be Reviewer to moderate.</span>
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('REVIEWER')}
              className="ml-auto font-bold underline hover:text-amber-950"
            >
              Switch to Reviewer
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Queue ({pendingSubmissions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Moderation History ({reviewedHistory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: Pending Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3.5 text-xs text-sky-800">
            <strong>Honesty Invariant:</strong> Unapproved submissions remain quarantined and do not alter public compatibility calculations. Approving an observation triggers instant assessment recomputation.
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
              No submissions currently waiting in the review queue.
            </div>
          ) : (
            pendingSubmissions.map((sub) => {
              const isSelected = reviewingId === sub.id;

              return (
                <div
                  key={sub.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {sub.sourceTitle}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {sub.evidenceType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          PENDING MODERATION
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Submitted by: <strong>{sub.submitterName}</strong> ({sub.submitterRole}) on{' '}
                        {new Date(sub.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      Target: {sub.laptop?.modelCode || 'Unspecified'} • Part: {sub.part?.partNumber || 'Unspecified'}
                    </div>
                  </div>

                  {/* Claims and Excerpt */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-slate-500 font-semibold">Exact Technical Claim:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{sub.exactClaim}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold">Observation Excerpt / Procedure:</span>
                      <blockquote className="border-l-2 border-sky-300 pl-3 py-1 bg-slate-50 text-slate-800 italic mt-0.5 rounded-r">
                        "{sub.excerpt}"
                      </blockquote>
                    </div>

                    {sub.testObservations && sub.testObservations.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                        <div className="font-bold font-sans text-slate-800">
                          Hardware Test Parameters:
                        </div>
                        <div>
                          Reported Outcome:{' '}
                          <span
                            className={`font-bold ${
                              sub.testObservations[0].outcome === 'BOOT_STABLE'
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {sub.testObservations[0].outcome}
                          </span>
                        </div>
                        <div>BIOS Version: {sub.testObservations[0].biosVersion || 'N/A'}</div>
                        <div>Procedure: {sub.testObservations[0].testProcedure}</div>
                        {sub.testObservations[0].observedLimitations && (
                          <div>Limitations: {sub.testObservations[0].observedLimitations}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Review Action Form */}
                  {isSelected ? (
                    <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-3 pt-3">
                      <div className="font-bold text-slate-900">
                        Record Moderation Decision & Rationale
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Reviewer Rationale (Mandatory) *
                        </label>
                        <textarea
                          rows={2}
                          value={rationale}
                          onChange={(e) => setRationale(e.target.value)}
                          placeholder="State technical justification: e.g. 'Verified test log MemTest86 diagnostic output matches motherboard chipset specification.'"
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md text-slate-900"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleReviewAction(sub.id, 'APPROVE')}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-xs shadow-sm transition-colors"
                        >
                          Approve Evidence
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleReviewAction(sub.id, 'REJECT')}
                          className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-md font-bold text-xs shadow-sm transition-colors"
                        >
                          Reject Submission
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleReviewAction(sub.id, 'REQUEST_CLARIFICATION')}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs shadow-sm transition-colors"
                        >
                          Request Clarification
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewingId(null)}
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-semibold text-xs ml-auto"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingId(sub.id);
                          setRationale('');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 text-white font-semibold text-xs hover:bg-sky-800 transition-colors shadow-sm"
                      >
                        <span>Evaluate Submission</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: Moderation History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evaluated Evidence Archive
            </h2>
            <p className="text-slate-500">
              Audit record of reviewed specifications and bench tests. Reviewers cannot silently overwrite prior evidence.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {reviewedHistory.map((item) => (
              <div key={item.id} className="p-4 bg-white hover:bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.sourceTitle}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      item.reviewStatus === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.reviewStatus}
                  </span>
                </div>

                <div className="text-slate-600 italic">"{item.excerpt}"</div>

                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-1">
                  <div>
                    <strong>Review Rationale:</strong> {item.reviewRationale || 'Standard catalog verification.'}
                  </div>
                  <div className="text-slate-500">
                    Reviewed by <strong>{item.reviewedBy}</strong> on{' '}
                    {item.reviewedAt ? new Date(item.reviewedAt).toLocaleString() : 'System seed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Chronological Audit Trail
            </h2>
            <p className="text-slate-500">
              Every submission, evaluation, and moderation state change is permanently logged.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg font-mono text-[11px]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900">[{log.action}]</span>{' '}
                  <span className="text-slate-600">{log.details}</span>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Actor: {log.actorName} ({log.actorRole})
                  </div>
                </div>
                <div className="text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

