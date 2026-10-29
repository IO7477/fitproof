import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Search, Shield, Laptop, Cpu, CheckCircle2, ArrowRight, AlertTriangle, HelpCircle } from 'lucide-react';

export default async function HomePage() {
  const laptops = await prisma.laptop.findMany({
    include: { upgradeTargets: true },
    orderBy: { modelFamily: 'asc' },
  });

  const parts = await prisma.part.findMany({
    orderBy: { category: 'asc' },
  });

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Invitation Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Deterministic Hardware Decision Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Identify your laptop, then check a part.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            A matching connector, laptop family name, or seller listing claim is not proof of compatibility.
            FitProof uses documented engineering service manuals and verified bench tests to evaluate physical
            clearance, electrical signaling, capacity ceilings, and firmware restrictions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/check"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-sky-700 text-white font-semibold text-sm hover:bg-sky-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <Search className="w-4 h-4" />
              <span>Start Compatibility Check</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/laptops"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-slate-100 text-slate-800 font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              <Laptop className="w-4 h-4" />
              <span>Browse Synthetic Laptop Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Guided Demonstration Scenarios (Section 11 & 14) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Preset Demonstration Scenarios
            </h2>
            <p className="text-xs text-slate-500">
              Jump directly into pre-computed scenario evaluations demonstrating all deterministic statuses and edge cases.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded border border-slate-200">
            15 Seeded Scenarios Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Scenario 1: Supported RAM */}
          <Link
            href="/check/result?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ram-2&partId=part-pf-d4-16g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                SUPPORTED
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 1</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              Supported RAM Upgrade
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ApexBook 15 Gen 2 + ProForma 16GB DDR4 SO-DIMM in open Slot 2. Backed by OEM manual & bench test.
            </p>
          </Link>

          {/* Scenario 2: Generation Mismatch */}
          <Link
            href="/check/result?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ram-2&partId=part-pf-d5-16g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-rose-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                INCOMPATIBLE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 2</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
              RAM Generation Mismatch
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ApexBook 15 (DDR4 slot) with DDR5 module. Fails notch alignment, pin count, and 1.1V/1.2V signaling.
            </p>
          </Link>

          {/* Scenario 3: Soldered RAM */}
          <Link
            href="/check/result?laptopId=laptop-apex-pro-16&slotId=target-apex-pro-ram-soldered&partId=part-pf-d5-16g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-rose-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                INCOMPATIBLE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 3</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
              Fully Soldered Onboard RAM
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ApexBook Pro 16 with permanently soldered LPDDR5 BGA memory. Has 0 expansion slots.
            </p>
          </Link>

          {/* Scenario 4: Hybrid Soldered + Removable */}
          <Link
            href="/check/result?laptopId=laptop-terra-14&slotId=target-terra-ram-hybrid&partId=part-pf-d4-16g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                SUPPORTED (HYBRID)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 4</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              Hybrid Memory (Soldered + Removable)
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              TerraBook 14 has 8GB soldered + 1 open slot. 16GB module fits within platform 24GB ceiling.
            </p>
          </Link>

          {/* Scenario 5: Capacity Limit Exceeded */}
          <Link
            href="/check/result?laptopId=laptop-terra-14&slotId=target-terra-ram-hybrid&partId=part-pf-d4-32g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-rose-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                INCOMPATIBLE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 5</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
              System Capacity Limit Exceeded
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              TerraBook 14 with 32GB module. 8GB + 32GB = 40GB, exceeding maximum documented platform ceiling of 24GB.
            </p>
          </Link>

          {/* Scenario 7: M.2 SATA vs NVMe Protocol Mismatch */}
          <Link
            href="/check/result?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ssd-1&partId=part-zb-sata-m2-500g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-rose-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                INCOMPATIBLE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 7</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
              M.2 SATA in NVMe-Only Bay
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ApexBook 15 Bay 1 routes PCIe NVMe only. Installing SATA M.2 fails protocol detection.
            </p>
          </Link>

          {/* Scenario 8: SSD Physical Length Mismatch */}
          <Link
            href="/check/result?laptopId=laptop-chrono-13&slotId=target-chrono-ssd-short&partId=part-ht-nvme-g3-1t"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-rose-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                INCOMPATIBLE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 8</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-700 transition-colors">
              M.2 SSD Physical Length Mismatch
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ChronoBook 13 internal bay only has 2242/2230 standoffs. Standard 80mm M.2 2280 cannot be mounted.
            </p>
          </Link>

          {/* Scenario 9: Performance Limitation */}
          <Link
            href="/check/result?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ssd-1&partId=part-ht-nvme-g4-1t"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                SUPPORTED (LIMITATION)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 9</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
              PCIe 4.0 SSD in PCIe 3.0 Slot
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Fully compatible and safe operation, but sequential bandwidth is throttled to PCIe 3.0 ceiling (~3,500 MB/s).
            </p>
          </Link>

          {/* Scenario 11: Missing Mounting Hardware */}
          <Link
            href="/check/result?laptopId=laptop-apex-pro-16&slotId=target-apex-pro-ssd-2&partId=part-ht-nvme-g4-1t"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-amber-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                CONDITIONAL
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 11</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
              Accessory Hardware Required
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              ApexBook Pro 16 secondary M.2 bay requires OEM mounting bracket & screw kit P/N BRK-8820 before installation.
            </p>
          </Link>

          {/* Scenario 12: Unknown Slot Occupancy */}
          <Link
            href="/check/result?laptopId=laptop-edge-15&slotId=target-edge-ram-unknown&partId=part-pf-d4-16g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                INSUFFICIENT INFO
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 12</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-700 transition-colors">
              Slot Occupancy Unknown
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              EdgeBook 15 slot occupancy is unknown. Engine instructs buyer to inspect chassis or Task Manager before purchasing.
            </p>
          </Link>

          {/* Scenario 13: Conflicting Evidence */}
          <Link
            href="/check/result?laptopId=laptop-ws-17&slotId=target-ws17-ram-1&partId=part-pf-d5-64g"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-purple-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                CONFLICTING EVIDENCE
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 13</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
              Disputed 64GB DDR5 Compatibility
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              VanguardSys WS17 manual states 64GB module support, but bench test confirms NO_POST training loop on BIOS v1.04.
            </p>
          </Link>

          {/* Scenario 15: Unsubstantiated Seller Listing */}
          <Link
            href="/check/result?laptopId=laptop-apex-15-g2&slotId=target-apex-15-ram-2&partId=part-generic-seller-claim"
            className="group block p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                INSUFFICIENT INFO
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Scenario 15</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-700 transition-colors">
              Unsubstantiated Seller Claim
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Marketplace listing claims "guaranteed fit", but lacks OEM maintenance documentation or empirical bench test.
            </p>
          </Link>
        </div>
      </div>

      {/* Honest Decision Principles Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="w-8 h-8 rounded bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="font-bold text-sm text-slate-900">Zero Fabricated Proof</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            All records in this prototype are explicitly marked synthetic. No fake manufacturer URLs or invented credentials.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="w-8 h-8 rounded bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="font-bold text-sm text-slate-900">Actionable Missing Info</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            When specifications are unknown, FitProof provides exact steps (e.g., "Check whether bay supports SATA or NVMe") instead of generic advice.
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="w-8 h-8 rounded bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="font-bold text-sm text-slate-900">Traceable Provenance</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every judgment is linked to an inspectable source excerpt, submitter role, and formal review rationale.
          </p>
        </div>
      </div>
    </div>
  );
}

