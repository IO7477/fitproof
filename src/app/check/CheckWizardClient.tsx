'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Laptop as LaptopIcon,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Cpu,
  HardDrive,
  Layers,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';

interface UpgradeTarget {
  id: string;
  laptopId: string;
  identifier: string;
  slotType: string;
  formFactor: string;
  supportedLengths?: string | null;
  protocolSupported?: string | null;
  pcieGenLanes?: string | null;
  ddrGeneration?: string | null;
  supportedSpeeds?: string | null;
  currentOccupancy: string;
  installedComponentSummary?: string | null;
  isSoldered: boolean;
  maxCapacityPerSlotGb?: number | null;
  maxTotalSystemCapacityGb?: number | null;
  requiresReplacement: boolean;
  hardwareNotes?: string | null;
  clearanceNotes?: string | null;
}

interface Laptop {
  id: string;
  manufacturer: string;
  modelFamily: string;
  modelCode: string;
  variantName: string;
  releaseYear?: number | null;
  configurationNotes: string;
  upgradeTargets: UpgradeTarget[];
}

interface Part {
  id: string;
  category: string;
  manufacturer: string;
  partNumber: string;
  name: string;
  formFactor: string;
  capacityGb: number;
  ddrGen?: string | null;
  speedMt?: number | null;
  protocol?: string | null;
  pcieGen?: string | null;
  moduleLengthMm?: number | null;
}

interface Props {
  laptops: Laptop[];
  parts: Part[];
}

export function CheckWizardClient({ laptops, parts }: Props) {
  const router = useRouter();

  // Wizard State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLaptopId, setSelectedLaptopId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [partSearch, setPartSearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  // Modals & Helpers
  const [showModelGuide, setShowModelGuide] = useState(false);
  const [showUnknownVariantModal, setShowUnknownVariantModal] = useState(false);

  // Filtered Laptops based on search
  const filteredLaptops = useMemo(() => {
    if (!searchQuery.trim()) return laptops;
    const q = searchQuery.toLowerCase();
    return laptops.filter(
      (l) =>
        l.manufacturer.toLowerCase().includes(q) ||
        l.modelFamily.toLowerCase().includes(q) ||
        l.modelCode.toLowerCase().includes(q) ||
        l.variantName.toLowerCase().includes(q)
    );
  }, [laptops, searchQuery]);

  const selectedLaptop = useMemo(() => {
    return laptops.find((l) => l.id === selectedLaptopId) || null;
  }, [laptops, selectedLaptopId]);

  const selectedSlot = useMemo(() => {
    if (!selectedLaptop) return null;
    return selectedLaptop.upgradeTargets.find((s) => s.id === selectedSlotId) || null;
  }, [selectedLaptop, selectedSlotId]);

  // Filter parts based on target slot type (RAM or SSD)
  const candidateParts = useMemo(() => {
    if (!selectedSlot) return [];
    let list = parts.filter((p) => p.category === selectedSlot.slotType);
    if (partSearch.trim()) {
      const q = partSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.partNumber.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [parts, selectedSlot, partSearch]);

  const toggleComparePart = (partId: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(partId)) {
        return prev.filter((id) => id !== partId);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 candidates simultaneously.');
        return prev;
      }
      return [...prev, partId];
    });
  };

  const handleRunSingleCheck = (partId: string) => {
    if (!selectedLaptop || !selectedSlot) return;
    router.push(
      `/check/result?laptopId=${selectedLaptop.id}&slotId=${selectedSlot.id}&partId=${partId}`
    );
  };

  const handleRunComparison = () => {
    if (!selectedLaptop || !selectedSlot || selectedForCompare.length === 0) return;
    router.push(
      `/compare?laptopId=${selectedLaptop.id}&slotId=${selectedSlot.id}&partIds=${selectedForCompare.join(
        ','
      )}`
    );
  };

  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div
          className={`p-3 rounded-lg border text-left transition-colors ${
            !selectedLaptop
              ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Step 1</span>
            {selectedLaptop && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
          </div>
          <div className="text-sm font-semibold truncate mt-0.5">
            {selectedLaptop ? selectedLaptop.modelCode : 'Identify Laptop'}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border text-left transition-colors ${
            selectedLaptop && !selectedSlot
              ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Step 2</span>
            {selectedSlot && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
          </div>
          <div className="text-sm font-semibold truncate mt-0.5">
            {selectedSlot ? selectedSlot.identifier : 'Choose Slot / Bay'}
          </div>
        </div>

        <div
          className={`p-3 rounded-lg border text-left transition-colors ${
            selectedSlot
              ? 'bg-sky-50 border-sky-300 text-sky-900 font-bold'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Step 3</span>
          </div>
          <div className="text-sm font-semibold truncate mt-0.5">
            Select Candidate Part
          </div>
        </div>
      </div>

      {/* STEP 1: Identify Laptop */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <LaptopIcon className="w-5 h-5 text-sky-700" />
              <span>Step 1: Identify Your Exact Laptop Variant</span>
            </h2>
            <p className="text-xs text-slate-500">
              Never guess or infer from similar model family names. Revisions within the same family frequently differ in DDR generation or storage wiring.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowModelGuide(!showModelGuide)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2.5 py-1.5 rounded transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Where to find my model?</span>
            </button>
            <button
              type="button"
              onClick={() => setShowUnknownVariantModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>I cannot identify my variant</span>
            </button>
          </div>
        </div>

        {/* Model Identifier Guide Dropdown */}
        {showModelGuide && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-3">
            <div className="font-bold text-slate-900">
              Where to locate your exact laptop model code:
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Bottom Chassis Laser Etching:</strong> Flip your laptop over. Look for small etched text next to the regulatory marks labeled <em>Model</em>, <em>Product ID</em>, or <em>M/N</em> (e.g. <code>AB15-G2-INTEL</code>).
              </li>
              <li>
                <strong>Windows System Information:</strong> Press <kbd className="px-1 py-0.5 bg-white border rounded">Win + R</kbd>, type <code>msinfo32</code>, and hit Enter. Inspect <strong>System Model</strong> and <strong>System SKU</strong>.
              </li>
              <li>
                <strong>Windows PowerShell:</strong> Run <code>Get-CimInstance Win32_ComputerSystemProduct | Select-Object Name, IdentifyingNumber</code>.
              </li>
              <li>
                <strong>Linux Terminal:</strong> Run <code>sudo dmidecode -s system-product-name</code>.
              </li>
            </ul>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by brand, family, or exact model code (e.g., ApexBook 15, AB15-G2, TB14)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
          />
        </div>

        {/* Laptop Variant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredLaptops.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-xs text-slate-500">
              No matching laptop variants found for "{searchQuery}".
            </div>
          ) : (
            filteredLaptops.map((laptop) => {
              const isSelected = laptop.id === selectedLaptopId;
              return (
                <div
                  key={laptop.id}
                  onClick={() => {
                    setSelectedLaptopId(laptop.id);
                    setSelectedSlotId(null);
                    setSelectedForCompare([]);
                  }}
                  className={`p-3.5 rounded-lg border cursor-pointer text-left transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-100/70 px-2 py-0.5 rounded">
                      {laptop.manufacturer}
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {laptop.modelCode}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-1.5">
                    {laptop.variantName}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {laptop.configurationNotes}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {laptop.upgradeTargets.length} bays/slots
                    </span>
                    {laptop.releaseYear && <span>Released: {laptop.releaseYear}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* STEP 2: Choose Slot / Bay */}
      {selectedLaptop && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-700" />
              <span>Step 2: Select Target RAM Slot or Storage Bay</span>
            </h2>
            <p className="text-xs text-slate-500">
              Selected Device: <strong className="text-slate-800">{selectedLaptop.variantName}</strong> ({selectedLaptop.modelCode})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedLaptop.upgradeTargets.map((slot) => {
              const isSelected = slot.id === selectedSlotId;
              const isRam = slot.slotType === 'RAM';

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    setSelectedForCompare([]);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer text-left transition-all ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                        isRam
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isRam ? <Cpu className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
                      {slot.slotType} Target
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        slot.isSoldered
                          ? 'bg-rose-100 text-rose-800'
                          : slot.currentOccupancy === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : slot.currentOccupancy === 'OCCUPIED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {slot.isSoldered
                        ? 'SOLDERED (NO SOCKET)'
                        : slot.currentOccupancy === 'AVAILABLE'
                        ? 'FREE / OPEN SLOT'
                        : slot.currentOccupancy === 'OCCUPIED'
                        ? 'CURRENTLY OCCUPIED'
                        : 'OCCUPANCY UNCONFIRMED'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{slot.identifier}</h3>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    {slot.formFactor} {slot.ddrGeneration ? `(${slot.ddrGeneration})` : ''}
                    {slot.protocolSupported ? `• ${slot.protocolSupported}` : ''}
                  </div>

                  {slot.installedComponentSummary && (
                    <div className="text-[11px] text-slate-500 mt-1.5 italic">
                      Current: {slot.installedComponentSummary}
                    </div>
                  )}

                  {slot.hardwareNotes && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded mt-2 border border-amber-200">
                      ⚠ Note: {slot.hardwareNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* STEP 3: Select Candidate Part */}
      {selectedSlot && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-sky-700" />
                <span>Step 3: Select Candidate {selectedSlot.slotType} Module</span>
              </h2>
              <p className="text-xs text-slate-500">
                Target Bay: <strong className="text-slate-800">{selectedSlot.identifier}</strong> ({selectedSlot.formFactor})
              </p>
            </div>

            {selectedForCompare.length > 0 && (
              <button
                type="button"
                onClick={handleRunComparison}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-700 text-white font-semibold text-xs hover:bg-sky-800 transition-colors shadow-sm"
              >
                <span>Compare Selected ({selectedForCompare.length}/3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Part Search Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={`Filter candidate ${selectedSlot.slotType} modules by part number or capacity...`}
              value={partSearch}
              onChange={(e) => setPartSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Candidate Parts List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {candidateParts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No candidate {selectedSlot.slotType} parts match your filter.
              </div>
            ) : (
              candidateParts.map((part) => {
                const isCompared = selectedForCompare.includes(part.id);

                return (
                  <div
                    key={part.id}
                    className="p-3.5 sm:p-4 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => toggleComparePart(part.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                        title="Select to compare up to 3 parts side-by-side"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {part.partNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {part.manufacturer}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 mt-0.5">
                          {part.name}
                        </h4>
                        <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                          <span>Capacity: {part.capacityGb}GB</span>
                          <span>•</span>
                          <span>Form Factor: {part.formFactor}</span>
                          {part.ddrGen && <span>• {part.ddrGen} ({part.speedMt} MT/s)</span>}
                          {part.protocol && <span>• {part.protocol}</span>}
                          {part.pcieGen && <span>• {part.pcieGen}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleRunSingleCheck(part.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-colors"
                      >
                        <span>Check Compatibility</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* Unknown Variant Honest Warning Modal */}
      {showUnknownVariantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-base">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>Honest Invariant: Do Not Guess Your Laptop Variant</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Laptops sharing identical marketing family names (for example, the <em>ApexBook 15 Gen 1</em> versus <em>Gen 2</em>) often contain completely different motherboards: Gen 1 uses DDR4-2666 with SATA, while Gen 2 uses DDR4-3200 with PCIe NVMe.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              FitProof will <strong>never silently pick the most popular variant</strong> or give false assurance without verified identity.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-800">Next Action:</div>
              <p className="text-slate-600">
                Inspect your machine with Windows Task Manager (Performance tab) or check the laser-etched model code on the underside of your laptop before proceeding.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnknownVariantModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
              >
                I Understand, Return to Finder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

