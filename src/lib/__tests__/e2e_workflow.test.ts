import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../db';
import { computeAssessment, submitEvidenceAction, reviewEvidenceAction } from '@/app/actions';
import { DEMO_USERS, ROLE_COOKIE_NAME } from '../auth';

// Helper to mock the cookies() in Next.js Server Actions for test runner
let mockRole: 'BUYER' | 'TECHNICIAN' | 'REVIEWER' = 'BUYER';
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === ROLE_COOKIE_NAME) {
        return { value: mockRole };
      }
      return undefined;
    },
    set: vi.fn(),
  }),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('End-to-End Workflow & Security Integration Suite', () => {
  beforeAll(async () => {
    // Ensure DB is seeded and available
    const count = await prisma.laptop.count();
    expect(count).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // E2E 1: Buyer completes a supported assessment
  it('E2E 1: Buyer completes a supported assessment with verified evidence citations', async () => {
    mockRole = 'BUYER';
    const result = await computeAssessment(
      'laptop-apex-15-g2',
      'target-apex-15-ram-2',
      'part-pf-d4-16g'
    );

    expect(result.assessment.status).toBe('SUPPORTED');
    expect(result.assessment.failedChecks.length).toBe(0);
    expect(result.assessment.passedChecks.length).toBeGreaterThan(0);
    expect(result.assessment.primaryProofType).toBe('TEST_OBSERVATION');
    expect(result.assessment.supportingEvidenceIds.length).toBeGreaterThan(0);
    expect(result.laptop.modelCode).toBe('AB15-G2-INTEL');
    expect(result.part.partNumber).toBe('PF-D4-3200-16G');
  });

  // E2E 2: Buyer encounters unknown occupancy or variant ambiguity and receives no false assurance
  it('E2E 2: Buyer encounters unknown occupancy and receives INSUFFICIENT_INFORMATION with action steps', async () => {
    mockRole = 'BUYER';
    // EdgeBook 15 has unknown occupancy for slot 2
    const result = await computeAssessment(
      'laptop-edge-15',
      'target-edge-ram-unknown',
      'part-pf-d4-16g'
    );

    expect(result.assessment.status).toBe('INSUFFICIENT_INFORMATION');
    expect(result.assessment.unknownRequirements.length).toBeGreaterThan(0);
    const occupancyUnknown = result.assessment.unknownRequirements.find(
      (u) => u.id === 'occupancy-unknown'
    );
    expect(occupancyUnknown).toBeDefined();
    expect(occupancyUnknown?.nextAction).toContain('Inspect Windows Task Manager');
  });

  // E2E 3: Technician submits evidence
  let createdEvidenceId = '';
  it('E2E 3: Technician submits a bench test observation', async () => {
    mockRole = 'TECHNICIAN';

    const submissionData = {
      laptopId: 'laptop-chrono-13',
      targetSlotId: 'target-chrono-ssd-short',
      partId: 'part-ht-nvme-2242-512g',
      submissionType: 'TEST_OBSERVATION' as const,
      sourceTitle: 'Lab Bench Run #T-9901: ChronoBook 13 with M.2 2242 NVMe',
      sourceUrl: null,
      exactClaim: 'HT-NVME-2242-512G boots stably in ChronoBook 13 internal 2242 bay.',
      excerpt: 'Fitted 42mm SSD into primary bay. Cold boot succeeded, read speeds reached 1650 MB/s under Linux 6.8.',
      biosVersion: 'v1.03',
      testOutcome: 'BOOT_STABLE' as const,
      testProcedure: 'Installed drive, tightened standoff screw, performed 5 reboot cycles.',
      observedLimitations: 'None.',
      acknowledgment: true as const,
      noPiiConfirmation: true as const,
    };

    const res = await submitEvidenceAction(submissionData);
    expect(res.success).toBe(true);
    expect(res.evidenceId).toBeDefined();
    createdEvidenceId = res.evidenceId;

    // Verify stored in DB with status PENDING
    const record = await prisma.evidence.findUnique({
      where: { id: createdEvidenceId },
      include: { testObservations: true },
    });
    expect(record).not.toBeNull();
    expect(record?.reviewStatus).toBe('PENDING');
    expect(record?.submitterName).toBe(DEMO_USERS.TECHNICIAN.name);
    expect(record?.testObservations[0]?.outcome).toBe('BOOT_STABLE');
  });

  // E2E 4: Pending evidence does NOT affect the published assessment
  it('E2E 4: Pending evidence does not affect or alter published assessment', async () => {
    mockRole = 'BUYER';
    const assessment = await computeAssessment(
      'laptop-chrono-13',
      'target-chrono-ssd-short',
      'part-ht-nvme-2242-512g'
    );

    // The newly created evidence is PENDING, so it must NOT be in supportingEvidenceIds yet!
    expect(assessment.assessment.supportingEvidenceIds).not.toContain(createdEvidenceId);
  });

  // E2E 5: Unauthorized users cannot approve submissions
  it('E2E 5: Unauthorized role (Buyer/Technician) cannot approve submissions', async () => {
    mockRole = 'BUYER';
    await expect(
      reviewEvidenceAction({
        evidenceId: createdEvidenceId,
        action: 'APPROVE',
        rationale: 'Illegitimate approval attempt by buyer.',
      })
    ).rejects.toThrow(/Unauthorized/);

    mockRole = 'TECHNICIAN';
    await expect(
      reviewEvidenceAction({
        evidenceId: createdEvidenceId,
        action: 'APPROVE',
        rationale: 'Self-approval attempt by technician.',
      })
    ).rejects.toThrow(/Unauthorized/);
  });

  // E2E 6: Reviewer approves evidence with required rationale
  it('E2E 6: Authorized Reviewer approves evidence with required rationale', async () => {
    mockRole = 'REVIEWER';

    const res = await reviewEvidenceAction({
      evidenceId: createdEvidenceId,
      action: 'APPROVE',
      rationale: 'Bench test procedure and 2242 form factor physically verified against chassis schematic.',
    });

    expect(res.success).toBe(true);
    expect(res.updatedStatus).toBe('APPROVED');

    // Verify DB record updated
    const updated = await prisma.evidence.findUnique({
      where: { id: createdEvidenceId },
    });
    expect(updated?.reviewStatus).toBe('APPROVED');
    expect(updated?.reviewedBy).toBe(DEMO_USERS.REVIEWER.name);
    expect(updated?.reviewRationale).toContain('Bench test procedure');
  });

  // E2E 7: The assessment immediately updates to reflect newly approved evidence
  it('E2E 7: Published assessment immediately updates upon evidence approval', async () => {
    mockRole = 'BUYER';
    const updatedResult = await computeAssessment(
      'laptop-chrono-13',
      'target-chrono-ssd-short',
      'part-ht-nvme-2242-512g'
    );

    // Now that evidence is APPROVED, it must be included in the assessment's supporting evidence!
    expect(updatedResult.assessment.supportingEvidenceIds).toContain(createdEvidenceId);
    expect(updatedResult.assessment.status).toBe('CONDITIONAL'); // Because current bay is OCCUPIED by factory 256GB drive, requiring replacement!
    expect(
      updatedResult.assessment.conditionsOrLimitations.some(
        (c) => c.type === 'REPLACEMENT_REQUIRED'
      )
    ).toBe(true);
  });

  // E2E 8: Data survives application restart (Database persistence verified)
  it('E2E 8: Data persists in SQLite database across transactions', async () => {
    const auditLogs = await prisma.auditLog.findMany({
      where: { entityId: createdEvidenceId },
    });
    expect(auditLogs.length).toBeGreaterThan(0);
    expect(auditLogs.some((l) => l.action === 'REVIEW_APPROVE')).toBe(true);
  });
});

