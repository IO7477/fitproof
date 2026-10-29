export type CompatibilityStatus =
  | 'SUPPORTED'
  | 'CONDITIONAL'
  | 'INCOMPATIBLE'
  | 'INSUFFICIENT_INFORMATION'
  | 'CONFLICTING_EVIDENCE';

export type CheckCategory = 'PHYSICAL' | 'ELECTRICAL' | 'PLATFORM' | 'INSTALLATION';

export interface CheckItem {
  id: string;
  category: CheckCategory;
  title: string;
  detail: string;
  passed: boolean;
  blocking?: boolean;
  evidenceId?: string;
}

export interface UnknownItem {
  id: string;
  title: string;
  description: string;
  nextAction: string;
}

export interface ConditionItem {
  id: string;
  type: 'REPLACEMENT_REQUIRED' | 'ACCESSORY_REQUIRED' | 'PERFORMANCE_LIMITATION' | 'CONFIGURATION_CONSTRAINT';
  title: string;
  detail: string;
}

export interface AssessmentResult {
  status: CompatibilityStatus;
  shortExplanation: string;
  passedChecks: CheckItem[];
  failedChecks: CheckItem[];
  unknownRequirements: UnknownItem[];
  conditionsOrLimitations: ConditionItem[];
  supportingEvidenceIds: string[];
  conflictingEvidenceIds: string[];
  ruleEngineVersion: string;
  computedAt: string;
  primaryProofType: 'DOCUMENTED_SPEC' | 'TEST_OBSERVATION' | 'SELLER_CLAIM_UNVERIFIED' | 'NONE';
}

export interface LaptopDTO {
  id: string;
  manufacturer: string;
  modelFamily: string;
  modelCode: string;
  variantName: string;
  releaseYear?: number | null;
  regionRevision?: string | null;
  configurationNotes: string;
  knownSpecs: string; // JSON
  unknownSpecs: string; // JSON
  isSynthetic: boolean;
  upgradeTargets?: UpgradeTargetDTO[];
  evidence?: EvidenceDTO[];
}

export interface UpgradeTargetDTO {
  id: string;
  laptopId: string;
  identifier: string;
  slotType: 'RAM' | 'SSD';
  formFactor: string;
  supportedLengths?: string | null; // e.g. "2230,2242,2280"
  protocolSupported?: string | null; // "PCIe NVMe" | "SATA III" | "Dual-mode NVMe/SATA"
  pcieGenLanes?: string | null;
  ddrGeneration?: string | null; // "DDR4" | "DDR5" | "LPDDR5"
  supportedSpeeds?: string | null;
  currentOccupancy: 'OCCUPIED' | 'AVAILABLE' | 'UNKNOWN';
  installedComponentSummary?: string | null;
  isSoldered: boolean;
  solderedCapacityGb?: number | null;
  maxCapacityPerSlotGb?: number | null;
  maxTotalSystemCapacityGb?: number | null;
  requiresReplacement: boolean;
  clearanceNotes?: string | null;
  hardwareNotes?: string | null;
  bootSupported: boolean;
  firmwareRestrictions?: string | null;
  unknownRequirements?: string | null; // JSON array
}

export interface PartDTO {
  id: string;
  category: 'RAM' | 'SSD';
  manufacturer: string;
  partNumber: string;
  name: string;
  formFactor: string;
  capacityGb: number;
  ddrGen?: string | null;
  speedMt?: number | null;
  voltage?: string | null;
  pinCount?: number | null;
  protocol?: string | null;
  pcieGen?: string | null;
  moduleLengthMm?: number | null;
  isDoubleSided: boolean;
  heatsinkIncluded: boolean;
  notes?: string | null;
  isSynthetic: boolean;
}

export interface EvidenceDTO {
  id: string;
  evidenceType: 'MANUFACTURER_SPEC' | 'SERVICE_MANUAL' | 'TEST_OBSERVATION' | 'COMMUNITY_BENCHMARK' | 'SELLER_LISTING';
  sourceTitle: string;
  sourceUrl?: string | null;
  excerpt: string;
  exactClaim: string;
  applicableVariantId?: string | null;
  applicablePartId?: string | null;
  applicableTargetSlotId?: string | null;
  submitterName: string;
  submitterRole: 'BUYER' | 'TECHNICIAN' | 'REVIEWER' | 'SYSTEM_SYNTHETIC';
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_CLARIFICATION';
  reviewRationale?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  isSynthetic: boolean;
  isDisputed: boolean;
  disputeNotes?: string | null;
  supersededById?: string | null;
  createdAt: string;
  testObservations?: TestObservationDTO[];
}

export interface TestObservationDTO {
  id: string;
  laptopId: string;
  partId: string;
  targetSlotId?: string | null;
  biosVersion?: string | null;
  outcome: 'BOOT_STABLE' | 'BOOT_UNSTABLE' | 'NO_POST' | 'NOT_RECOGNIZED' | 'PHYSICAL_FIT_ISSUE';
  testProcedure: string;
  observedLimitations?: string | null;
  evidenceId?: string | null;
}

export interface UserRoleSession {
  role: 'BUYER' | 'TECHNICIAN' | 'REVIEWER';
  name: string;
  title: string;
}

