import { prisma } from '@/lib/db';
import { CheckWizardClient } from './CheckWizardClient';

export default async function CheckPage() {
  const laptops = await prisma.laptop.findMany({
    include: {
      upgradeTargets: true,
    },
    orderBy: { modelFamily: 'asc' },
  });

  const parts = await prisma.part.findMany({
    orderBy: { partNumber: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hardware Compatibility Checker
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Follow the 3-step verification flow: identify your exact laptop, select the target slot, and choose a candidate part.
        </p>
      </div>

      <CheckWizardClient laptops={laptops} parts={parts} />
    </div>
  );
}

