'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  ShieldAlert,
  Send,
  Layers,
  Search,
} from 'lucide-react';
import { submitEvidenceAction, setDemoRoleAction } from '@/app/actions';
import { UserRoleSession } from '@/lib/types';

interface Props {
  currentUser: UserRoleSession;
  laptops: any[];
  parts: any[];
  submissions: any[];
  incompleteSlots: any[];
  initialLaptopId?: string;
  initialPartId?: string;
  initialSlotId?: string;
}

export function TechnicianView({
  currentUser,
  laptops,
  parts,
  submissions,
  incompleteSlots,
  initialLaptopId,
  initialPartId,
  initialSlotId,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'submit' | 'missing' | 'history'>('submit');
  const [isPending, startTransition] = useTransition();
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [laptopId, setLaptopId] = useState(initialLaptopId || (laptops[0]?.id ?? ''));
  const selectedLaptop = laptops.find((l) => l.id === laptopId);
  const [targetSlotId, setTargetSlotId] = useState(
    initialSlotId || (selectedLaptop?.upgradeTargets[0]?.id ?? '')
  );
  const [partId, setPartId] = useState(initialPartId || (parts[0]?.id ?? ''));
  const [submissionType, setSubmissionType] = useState<'TEST_OBSERVATION' | 'SPECIFICATION_CORRECTION'>(
    'TEST_OBSERVATION'
  );
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [exactClaim, setExactClaim] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [biosVersion, setBiosVersion] = useState('');
  const [testOutcome, setTestOutcome] = useState<string>('BOOT_STABLE');
  const [testProcedure, setTestProcedure] = useState('');
  const [observedLimitations, setObservedLimitations] = useState('');
  const [acknowledgment, setAcknowledgment] = useState(false);
  const [noPiiConfirmation, setNoPiiConfirmation] = useState(false);

  // Status Filter for Submissions History
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'DISPUTED') return s.isDisputed;
    return s.reviewStatus === statusFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmissionSuccess(null);

    if (!acknowledgment || !noPiiConfirmation) {
      setErrorMessage('You must confirm both the anti-PII check and configuration acknowledgment.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitEvidenceAction({
          laptopId,
          targetSlotId: targetSlotId || null,
          partId,
          submissionType,
          sourceTitle,
          sourceUrl: sourceUrl.trim() ? sourceUrl.trim() : null,
          exactClaim,
          excerpt,
          biosVersion: biosVersion || null,
          testOutcome: submissionType === 'TEST_OBSERVATION' ? testOutcome : null,
          testProcedure: testProcedure || null,
          observedLimitations: observedLimitations || null,
          acknowledgment: true,
          noPiiConfirmation: true,
        });

        if (res.success) {
          setSubmissionSuccess(`Submission created successfully with ID: ${res.evidenceId}! Awaiting reviewer moderation.`);
          // Reset fields
          setSourceTitle('');
          setExactClaim('');
          setExcerpt('');
          setTestProcedure('');
          setObservedLimitations('');
          setAcknowledgment(false);
          setNoPiiConfirmation(false);
          router.refresh();
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Submission failed');
      }
    });
  };

  const handleRoleQuickSwitch = (role: string) => {
    const fd = new FormData();
    fd.append('role', role);
    startTransition(async () => {
      await setDemoRoleAction(fd);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-sky-700" />
            <span>Technician Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit reproducible bench test observations, report platform limitations, and inspect entries missing verified data.
          </p>
        </div>

        {/* Role Check Warning */}
        {currentUser.role === 'BUYER' && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex items-center gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Active role is Buyer. Switch to Technician to submit.</span>
            <button
              type="button"
              onClick={() => handleRoleQuickSwitch('TECHNICIAN')}
              className="ml-auto font-bold underline hover:text-amber-950"
            >
              Switch to Technician
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'submit'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Observation or Spec</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missing')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'missing'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Verification Queue ({incompleteSlots.length})</span>
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
          <FileText className="w-3.5 h-3.5" />
          <span>Submissions Archive ({submissions.length})</span>
        </button>
      </div>

      {/* TAB 1: Submit Form */}
      {activeTab === 'submit' && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Submit Empirical Observation or Specification Correction
            </h2>
            <p className="text-xs text-slate-500">
              Observations remain in PENDING state until evaluated by a specification reviewer.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submissionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{submissionSuccess}</span>
            </div>
          )}

          {/* Device & Part Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Laptop Model *
              </label>
              <select
                value={laptopId}
                onChange={(e) => {
                  setLaptopId(e.target.value);
                  const l = laptops.find((item) => item.id === e.target.value);
                  if (l?.upgradeTargets[0]) setTargetSlotId(l.upgradeTargets[0].id);
                }}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
                required
              >
                {laptops.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.manufacturer} {l.modelFamily} ({l.modelCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Slot / Bay
              </label>
              <select
                value={targetSlotId}
                onChange={(e) => setTargetSlotId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
              >
                {selectedLaptop?.upgradeTargets.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.identifier} ({s.formFactor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tested Candidate Part *
              </label>
              <select
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
                required
              >
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.partNumber} ({p.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submission Type & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Submission Category *
              </label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
              >
                <option value="TEST_OBSERVATION">Exact Bench Test Observation (Lab / Field Test)</option>
                <option value="SPECIFICATION_CORRECTION">OEM Specification Correction (Manual Citation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Source Title or Test Identifier *
              </label>
              <input
                type="text"
                placeholder="e.g., Bench Test Run #T-2094 or Service Manual Sec 5.3"
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
                required
              />
            </div>
          </div>

          {/* Exact Claim */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Exact Technical Claim Supported *
            </label>
            <input
              type="text"
              placeholder="e.g., Boots cleanly at DDR4-3200 with 16GB module in Slot 2."
              value={exactClaim}
              onChange={(e) => setExactClaim(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
              required
            />
          </div>

          {/* Excerpt / Log Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Excerpt, Diagnostic Output or Test Notes *
            </label>
            <textarea
              rows={3}
              placeholder="Record exact test notes, MemTest86 pass count, UEFI BIOS diagnostic codes, or relevant manual quotation..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900"
              required
            />
          </div>

          {/* Test Specific Fields */}
          {submissionType === 'TEST_OBSERVATION' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="font-bold text-xs text-slate-800">
                Test Protocol & Firmware Parameters
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Observed Outcome *
                  </label>
                  <select
                    value={testOutcome}
                    onChange={(e) => setTestOutcome(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-900"
                  >
                    <option value="BOOT_STABLE">BOOT_STABLE (POST Pass, MemTest/OS Boot Confirmed)</option>
                    <option value="BOOT_UNSTABLE">BOOT_UNSTABLE (BSOD / Kernel Panic Under Load)</option>
                    <option value="NO_POST">NO_POST (Amber Blink / Memory Training Loop)</option>
                    <option value="NOT_RECOGNIZED">NOT_RECOGNIZED (Drive / Module Not Listed in BIOS)</option>
                    <option value="PHYSICAL_FIT_ISSUE">PHYSICAL_FIT_ISSUE (Mechanical Clearance Collision)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Motherboard BIOS / Firmware Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., v1.12 or BIOS 204"
                    value={biosVersion}
                    onChange={(e) => setBiosVersion(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Test Procedure
                </label>
                <input
                  type="text"
                  placeholder="e.g., Cold boot, CMOS reset, MemTest86 4 passes, 30 min Prime95 blend."
                  value={testProcedure}
                  onChange={(e) => setTestProcedure(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Observed Limitations
                </label>
                <input
                  type="text"
                  placeholder="e.g., Downclocked to 2933 MT/s; required secondary screw kit."
                  value={observedLimitations}
                  onChange={(e) => setObservedLimitations(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-md p-2 text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Privacy & Honesty Warning Box (Section 9 Requirement) */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Privacy & Evidence Invariant Check</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Do NOT include device serial numbers, service tags, motherboard MAC addresses, or personal identifying information. Evidence must refer strictly to generic hardware models and reproducible configurations.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <label className="flex items-start gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={noPiiConfirmation}
                  onChange={(e) => setNoPiiConfirmation(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  required
                />
                <span>
                  I confirm that <strong>no serial numbers or personal data</strong> are included in this submission.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={acknowledgment}
                  onChange={(e) => setAcknowledgment(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  required
                />
                <span>
                  I acknowledge that this observation applies <strong>only to the recorded configuration and firmware revision</strong>.
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-700 text-white font-semibold text-xs hover:bg-sky-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isPending ? 'Submitting Evidence...' : 'Submit Evidence for Moderation'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Missing Specs Verification Queue */}
      {activeTab === 'missing' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Verification Queue: Incomplete Catalog Entries
            </h2>
            <p className="text-xs text-slate-500">
              These catalog entries currently cause INSUFFICIENT INFORMATION assessments due to missing capacity ceilings, unconfirmed electrical protocols, or unknown occupancy.
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {incompleteSlots.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                All catalog slots have verified capacity and protocol specifications.
              </div>
            ) : (
              incompleteSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {slot.laptop.manufacturer} {slot.laptop.modelFamily} ({slot.laptop.modelCode})
                      </span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {slot.identifier}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Form Factor: {slot.formFactor} • Slot Type: {slot.slotType}
                    </div>
                    <div className="text-rose-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {slot.slotType === 'RAM' && slot.maxCapacityPerSlotGb === null && (
                        <span>Unknown maximum RAM module capacity ceiling</span>
                      )}
                      {slot.slotType === 'SSD' && slot.protocolSupported === null && (
                        <span>Unknown SSD electrical protocol (NVMe vs SATA)</span>
                      )}
                      {slot.currentOccupancy === 'UNKNOWN' && (
                        <span>Factory slot occupancy unconfirmed</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLaptopId(slot.laptop.id);
                      setTargetSlotId(slot.id);
                      setActiveTab('submit');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold border border-sky-200 transition-colors text-xs self-start sm:self-center"
                  >
                    <span>Submit Spec for This Slot</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Submissions History */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All Submissions & Test Evidence
              </h2>
              <p className="text-xs text-slate-500">
                Inspect pending submissions, verified test observations, and disputed claims.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DISPUTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    statusFilter === st
                      ? 'bg-sky-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No submissions found matching filter "{statusFilter}".
              </div>
            ) : (
              filteredSubmissions.map((s) => (
                <div key={s.id} className="p-4 bg-white hover:bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{s.sourceTitle}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {s.evidenceType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.reviewStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.reviewStatus === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.reviewStatus}
                      </span>
                      {s.isDisputed && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                          DISPUTED
                        </span>
                      )}
                      <Link
                        href={`/evidence/${s.id}`}
                        className="text-sky-700 hover:text-sky-900 font-semibold"
                      >
                        View Record →
                      </Link>
                    </div>
                  </div>

                  <p className="text-slate-600 italic">"{s.excerpt}"</p>

                  <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                    <span>
                      Laptop: <strong>{s.laptop?.modelCode || 'Any'}</strong>
                    </span>
                    <span>
                      Part: <strong>{s.part?.partNumber || 'Any'}</strong>
                    </span>
                    <span>
                      Submitter: {s.submitterName} ({s.submitterRole})
                    </span>
                    {s.reviewedBy && <span>Moderator: {s.reviewedBy}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

