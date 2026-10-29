'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { assertRole, getCurrentUser, ROLE_COOKIE_NAME } from '@/lib/auth';
import {
  TechnicianSubmissionSchema,
  ReviewActionSchema,
  SetRoleSchema,
} from '@/lib/validations';
import { assessCompatibility } from '@/lib/engine/compatibility';
import {
  AssessmentResult,
  EvidenceDTO,
  LaptopDTO,
  PartDTO,
  UpgradeTargetDTO,
  UserRoleSession,
} from '@/lib/types';

/**
 * Switch demo role for local walkthrough.
 */
export async function setDemoRoleAction(formData: FormData) {
  const roleInput = formData.get('role');
  const { role } = SetRoleSchema.parse({ role: roleInput });

  const cookieStore = cookies();
  cookieStore.set(ROLE_COOKIE_NAME, role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
  return { success: true, role };
}

/**
 * Technician submits a test observation or specification correction.
 * Server validates caller role (must be TECHNICIAN or REVIEWER).
 */
export async function submitEvidenceAction(data: unknown) {
  const user = await assertRole(['TECHNICIAN', 'REVIEWER']);
  const validated = TechnicianSubmissionSchema.parse(data);

  // Check laptop and part exist
  const laptop = await prisma.laptop.findUnique({ where: { id: validated.laptopId } });
  if (!laptop) throw new Error('Selected laptop not found');

  const part = await prisma.part.findUnique({ where: { id: validated.partId } });
  if (!part) throw new Error('Selected part not found');

  // Create evidence record (starts as PENDING, marked synthetic for demo)
  const evidence = await prisma.evidence.create({
    data: {
      evidenceType:
        validated.submissionType === 'TEST_OBSERVATION'
          ? 'TEST_OBSERVATION'
          : 'COMMUNITY_BENCHMARK',
      sourceTitle: validated.sourceTitle,
      sourceUrl: validated.sourceUrl || null,
      excerpt: validated.excerpt,
      exactClaim: validated.exactClaim,
      applicableVariantId: validated.laptopId,
      applicablePartId: validated.partId,
      applicableTargetSlotId: validated.targetSlotId || null,
      submitterName: user.name,
      submitterRole: user.role,
      reviewStatus: 'PENDING',
      isSynthetic: true,
    },
  });

  // If a bench test was performed, attach the TestObservation
  if (validated.submissionType === 'TEST_OBSERVATION' && validated.testOutcome) {
    await prisma.testObservation.create({
      data: {
        laptopId: validated.laptopId,
        partId: validated.partId,
        targetSlotId: validated.targetSlotId || null,
        biosVersion: validated.biosVersion || 'Not recorded',
        outcome: validated.testOutcome,
        testProcedure: validated.testProcedure || 'Standard insertion and boot verification.',
        observedLimitations: validated.observedLimitations || null,
        evidenceId: evidence.id,
      },
    });
  }

  // Record audit log
  await prisma.auditLog.create({
    data: {
      action: 'SUBMIT_EVIDENCE',
      entityType: 'Evidence',
      entityId: evidence.id,
      actorName: user.name,
      actorRole: user.role,
      details: `Submitted ${validated.submissionType} for laptop ${laptop.modelCode} and part ${part.partNumber}.`,
    },
  });

  revalidatePath('/technician');
  revalidatePath('/reviewer');
  revalidatePath('/evidence');
  revalidatePath('/check');

  return { success: true, evidenceId: evidence.id };
}

/**
 * Reviewer evaluates pending evidence.
 * Server strictly validates that caller has REVIEWER role.
 */
export async function reviewEvidenceAction(data: unknown) {
  const user = await assertRole(['REVIEWER']);
  const validated = ReviewActionSchema.parse(data);

  const existing = await prisma.evidence.findUnique({
    where: { id: validated.evidenceId },
    include: { laptop: true, part: true },
  });
  if (!existing) throw new Error('Evidence record not found');

  const newStatus =
    validated.action === 'APPROVE'
      ? 'APPROVED'
      : validated.action === 'REJECT'
      ? 'REJECTED'
      : 'NEEDS_CLARIFICATION';

  const updated = await prisma.evidence.update({
    where: { id: validated.evidenceId },
    data: {
      reviewStatus: newStatus,
      reviewRationale: validated.rationale,
      reviewedBy: user.name,
      reviewedAt: new Date(),
    },
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      action: `REVIEW_${validated.action}`,
      entityType: 'Evidence',
      entityId: updated.id,
      actorName: user.name,
      actorRole: user.role,
      details: `${validated.action} evidence ${updated.id}: "${validated.rationale}"`,
    },
  });

  // Revalidate pages so the newly approved evidence takes effect immediately!
  revalidatePath('/technician');
  revalidatePath('/reviewer');
  revalidatePath('/evidence');
  revalidatePath('/check');
  revalidatePath(`/evidence/${updated.id}`);

  return { success: true, updatedStatus: newStatus };
}

/**
 * Computes compatibility assessment for a laptop, slot, and part.
 */
export async function computeAssessment(
  laptopId: string,
  slotId: string,
  partId: string
): Promise<{
  assessment: AssessmentResult;
  laptop: LaptopDTO;
  slot: UpgradeTargetDTO;
  part: PartDTO;
  relevantEvidence: EvidenceDTO[];
}> {
  const laptop = await prisma.laptop.findUnique({
    where: { id: laptopId },
    include: { upgradeTargets: true },
  });
  if (!laptop) throw new Error(`Laptop ${laptopId} not found`);

  const slot = laptop.upgradeTargets.find((s) => s.id === slotId);
  if (!slot) throw new Error(`Slot ${slotId} not found on laptop ${laptop.modelCode}`);

  const part = await prisma.part.findUnique({
    where: { id: partId },
  });
  if (!part) throw new Error(`Part ${partId} not found`);

  // Fetch all evidence records associated with this laptop, slot, or part
  const rawEvidence = await prisma.evidence.findMany({
    where: {
      OR: [
        { applicableVariantId: laptop.id },
        { applicablePartId: part.id },
        { applicableTargetSlotId: slot.id },
      ],
    },
    include: {
      testObservations: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to DTOs
  const evidenceList: EvidenceDTO[] = rawEvidence.map((e) => ({
    id: e.id,
    evidenceType: e.evidenceType as EvidenceDTO['evidenceType'],
    sourceTitle: e.sourceTitle,
    sourceUrl: e.sourceUrl,
    excerpt: e.excerpt,
    exactClaim: e.exactClaim,
    applicableVariantId: e.applicableVariantId,
    applicablePartId: e.applicablePartId,
    applicableTargetSlotId: e.applicableTargetSlotId,
    submitterName: e.submitterName,
    submitterRole: e.submitterRole as EvidenceDTO['submitterRole'],
    reviewStatus: e.reviewStatus as EvidenceDTO['reviewStatus'],
    reviewRationale: e.reviewRationale,
    reviewedBy: e.reviewedBy,
    reviewedAt: e.reviewedAt ? e.reviewedAt.toISOString() : null,
    isSynthetic: e.isSynthetic,
    isDisputed: e.isDisputed,
    disputeNotes: e.disputeNotes,
    supersededById: e.supersededById,
    createdAt: e.createdAt.toISOString(),
    testObservations: e.testObservations.map((o) => ({
      id: o.id,
      laptopId: o.laptopId,
      partId: o.partId,
      targetSlotId: o.targetSlotId,
      biosVersion: o.biosVersion,
      outcome: o.outcome as any,
      testProcedure: o.testProcedure,
      observedLimitations: o.observedLimitations,
      evidenceId: o.evidenceId,
    })),
  }));

  const laptopDTO: LaptopDTO = {
    id: laptop.id,
    manufacturer: laptop.manufacturer,
    modelFamily: laptop.modelFamily,
    modelCode: laptop.modelCode,
    variantName: laptop.variantName,
    releaseYear: laptop.releaseYear,
    regionRevision: laptop.regionRevision,
    configurationNotes: laptop.configurationNotes,
    knownSpecs: laptop.knownSpecs,
    unknownSpecs: laptop.unknownSpecs,
    isSynthetic: laptop.isSynthetic,
  };

  const slotDTO: UpgradeTargetDTO = {
    id: slot.id,
    laptopId: slot.laptopId,
    identifier: slot.identifier,
    slotType: slot.slotType as 'RAM' | 'SSD',
    formFactor: slot.formFactor,
    supportedLengths: slot.supportedLengths,
    protocolSupported: slot.protocolSupported,
    pcieGenLanes: slot.pcieGenLanes,
    ddrGeneration: slot.ddrGeneration,
    supportedSpeeds: slot.supportedSpeeds,
    currentOccupancy: slot.currentOccupancy as any,
    installedComponentSummary: slot.installedComponentSummary,
    isSoldered: slot.isSoldered,
    solderedCapacityGb: slot.solderedCapacityGb,
    maxCapacityPerSlotGb: slot.maxCapacityPerSlotGb,
    maxTotalSystemCapacityGb: slot.maxTotalSystemCapacityGb,
    requiresReplacement: slot.requiresReplacement,
    clearanceNotes: slot.clearanceNotes,
    hardwareNotes: slot.hardwareNotes,
    bootSupported: slot.bootSupported,
    firmwareRestrictions: slot.firmwareRestrictions,
    unknownRequirements: slot.unknownRequirements,
  };

  const partDTO: PartDTO = {
    id: part.id,
    category: part.category as 'RAM' | 'SSD',
    manufacturer: part.manufacturer,
    partNumber: part.partNumber,
    name: part.name,
    formFactor: part.formFactor,
    capacityGb: part.capacityGb,
    ddrGen: part.ddrGen,
    speedMt: part.speedMt,
    voltage: part.voltage,
    pinCount: part.pinCount,
    protocol: part.protocol,
    pcieGen: part.pcieGen,
    moduleLengthMm: part.moduleLengthMm,
    isDoubleSided: part.isDoubleSided,
    heatsinkIncluded: part.heatsinkIncluded,
    notes: part.notes,
    isSynthetic: part.isSynthetic,
  };

  const assessment = assessCompatibility(laptopDTO, slotDTO, partDTO, evidenceList);

  return {
    assessment,
    laptop: laptopDTO,
    slot: slotDTO,
    part: partDTO,
    relevantEvidence: evidenceList,
  };
}

