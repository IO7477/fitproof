'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Cpu, HardDrive, ArrowRight } from 'lucide-react';

interface Props {
  parts: any[];
}

export function PartsCatalogClient({ parts }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'RAM' | 'SSD'>('ALL');
  const [search, setSearch] = useState('');

  const filteredParts = useMemo(() => {
    return parts.filter((p) => {
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.partNumber.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parts, categoryFilter, search]);

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-sky-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Categories ({parts.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('RAM')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
              categoryFilter === 'RAM'
                ? 'bg-sky-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>RAM Modules ({parts.filter((p) => p.category === 'RAM').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('SSD')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
              categoryFilter === 'SSD'
                ? 'bg-sky-700 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Internal SSDs ({parts.filter((p) => p.category === 'SSD').length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search part number or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900"
          />
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParts.map((part) => {
          const isRam = part.category === 'RAM';

          return (
            <div
              key={part.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between text-xs space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${
                      isRam
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isRam ? <Cpu className="w-3 h-3" /> : <HardDrive className="w-3 h-3" />}
                    {part.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {part.partNumber}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{part.name}</h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Manufacturer: {part.manufacturer}
                  </div>
                </div>

                <div className="space-y-1 font-mono text-[11px] text-slate-600 border-t border-slate-100 pt-2">
                  <div>Capacity: <strong>{part.capacityGb}GB</strong></div>
                  <div>Form Factor: {part.formFactor}</div>
                  {isRam && (
                    <>
                      <div>Generation: {part.ddrGen} ({part.speedMt} MT/s)</div>
                      <div>Voltage / Pins: {part.voltage || '1.2V'} • {part.pinCount || '260'}-pin</div>
                    </>
                  )}
                  {!isRam && (
                    <>
                      <div>Protocol: {part.protocol}</div>
                      <div>Bus Lanes: {part.pcieGen || 'SATA 6Gbps'}</div>
                      <div>PCB Layout: {part.isDoubleSided ? 'Double-Sided' : 'Single-Sided'}</div>
                    </>
                  )}
                </div>

                {part.notes && (
                  <p className="text-slate-500 text-[11px] italic font-sans">
                    {part.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/parts/${part.id}`}
                  className="font-bold text-slate-700 hover:text-slate-900"
                >
                  Inspect Specs
                </Link>

                <Link
                  href={`/check`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2.5 py-1.5 rounded transition-colors"
                >
                  <span>Check Against Laptop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

