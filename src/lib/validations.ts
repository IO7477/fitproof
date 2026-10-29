import { z } from 'zod';

export const TechnicianSubmissionSchema = z.object({
  laptopId: z.string().min(1, 'Laptop selection is required'),
  targetSlotId: z.string().optional().nullable(),
  partId: z.string().min(1, 'Part selection is required'),
  submissionType: z.enum(['TEST_OBSERVATION', 'SPECIFICATION_CORRECTION']),
  sourceTitle: z.string().min(3, 'Source or test title must be at least 3 characters').max(200),
  sourceUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  exactClaim: z.string().min(5, 'Exact claim must be at least 5 characters').max(500),
  excerpt: z.string().min(10, 'Observation notes or excerpt must be at least 10 characters').max(2000),
  biosVersion: z.string().max(50).optional().nullable(),
  testOutcome: z
    .enum(['BOOT_STABLE', 'BOOT_UNSTABLE', 'NO_POST', 'NOT_RECOGNIZED', 'PHYSICAL_FIT_ISSUE'])
    .optional()
    .nullable(),
  testProcedure: z.string().max(1000).optional().nullable(),
  observedLimitations: z.string().max(1000).optional().nullable(),
  acknowledgment: z.literal(true, {
    errorMap: () => ({
      message: 'You must acknowledge that this observation applies only to the recorded configuration.',
    }),
  }),
  noPiiConfirmation: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm that no serial numbers, MAC addresses, or personal data are included.',
    }),
  }),
});

export const ReviewActionSchema = z.object({
  evidenceId: z.string().min(1, 'Evidence ID is required'),
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CLARIFICATION']),
  rationale: z.string().min(5, 'A review rationale of at least 5 characters is required').max(1000),
});

export const SetRoleSchema = z.object({
  role: z.enum(['BUYER', 'TECHNICIAN', 'REVIEWER']),
});

