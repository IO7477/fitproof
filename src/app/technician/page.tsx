import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TechnicianView } from './TechnicianView';

export default async function TechnicianPage({
  searchParams,
}: {
  searchParams: { laptopId?: string; partId?: string; slotId?: string };
}) {
  const currentUser = await getCurrentUser();

  const laptops = await prisma.laptop.findMany({
    include: { upgradeTargets: true },
    orderBy: { modelFamily: 'asc' },
  });

  const parts = await prisma.part.findMany({
    orderBy: { partNumber: 'asc' },
  });

  const submissions = await prisma.evidence.findMany({
    include: {
      laptop: true,
      part: true,
      targetSlot: true,
      testObservations: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate items with missing critical specifications
  const incompleteSlots = await prisma.upgradeTarget.findMany({
    where: {
      OR: [
        { maxCapacityPerSlotGb: null, slotType: 'RAM' },
        { protocolSupported: null, slotType: 'SSD' },
        { currentOccupancy: 'UNKNOWN' },
      ],
    },
    include: { laptop: true },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <TechnicianView
        currentUser={currentUser}
        laptops={laptops}
        parts={parts}
        submissions={submissions}
        incompleteSlots={incompleteSlots}
        initialLaptopId={searchParams.laptopId}
        initialPartId={searchParams.partId}
        initialSlotId={searchParams.slotId}
      />
    </div>
  );
}

