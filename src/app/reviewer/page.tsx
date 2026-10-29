import React from 'react';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ReviewerView } from './ReviewerView';

export default async function ReviewerPage() {
  const currentUser = await getCurrentUser();

  const pendingSubmissions = await prisma.evidence.findMany({
    where: { reviewStatus: 'PENDING' },
    include: {
      laptop: true,
      part: true,
      targetSlot: true,
      testObservations: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const reviewedHistory = await prisma.evidence.findMany({
    where: { reviewStatus: { not: 'PENDING' } },
    include: {
      laptop: true,
      part: true,
      targetSlot: true,
      testObservations: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <ReviewerView
        currentUser={currentUser}
        pendingSubmissions={pendingSubmissions}
        reviewedHistory={reviewedHistory}
        auditLogs={auditLogs}
      />
    </div>
  );
}

