import { describe, it, expect } from 'vitest';
import { assessCompatibility, RULE_ENGINE_VERSION } from '../compatibility';
import { LaptopDTO, UpgradeTargetDTO, PartDTO, EvidenceDTO } from '../../types';

describe('Compatibility Engine - FitProof Deterministic Rules', () => {
  const baseLaptop: LaptopDTO = {
    id: 'laptop-apex-15',
    manufacturer: 'ApexVolt',
    modelFamily: 'ApexBook 15',
    modelCode: 'AB15-G2-2023',
    variantName: 'ApexBook 15 Gen 2 (Core i7, Iris Xe)',
    configurationNotes: 'Standard dual-channel DDR4 platform with single M.2 2280 NVMe bay.',
    knownSpecs: JSON.stringify({ ramType: 'DDR4-3200', maxRam: '32GB' }),
    unknownSpecs: JSON.stringify({}),
    isSynthetic: true,
  };

  const baseRamSlot: UpgradeTargetDTO = {
    id: 'slot-ram-1',
    laptopId: 'laptop-apex-15',
    identifier: 'RAM Slot 1 (Primary)',
    slotType: 'RAM',
    formFactor: 'DDR4 SO-DIMM',
    ddrGeneration: 'DDR4',
    supportedSpeeds: '3200 MT/s',
    currentOccupancy: 'AVAILABLE',
    isSoldered: false,
    maxCapacityPerSlotGb: 16,
    maxTotalSystemCapacityGb: 32,
    requiresReplacement: false,
    bootSupported: true,
  };

  const baseRamPart: PartDTO = {
    id: 'part-ram-16gb-ddr4',
    category: 'RAM',
    manufacturer: 'ProForma',
    partNumber: 'PF-D4-3200-16G',
    name: 'ProForma 16GB DDR4-3200 SO-DIMM',
    formFactor: 'SO-DIMM',
    capacityGb: 16,
    ddrGen: 'DDR4',
    speedMt: 3200,
    voltage: '1.2V',
    pinCount: 260,
    isDoubleSided: false,
    heatsinkIncluded: false,
    isSynthetic: true,
  };

  const baseManualEvidence: EvidenceDTO = {
    id: 'ev-manual-1',
    evidenceType: 'MANUFACTURER_SPEC',
    sourceTitle: 'ApexBook 15 Gen 2 Hardware Maintenance Manual (Sec 4.2)',
    excerpt: 'Supports up to 2x 16GB DDR4-3200 SO-DIMM modules for 32GB maximum total RAM.',
    exactClaim: 'DDR4-3200 SO-DIMM up to 16GB per slot supported.',
    applicableVariantId: 'laptop-apex-15',
    applicableTargetSlotId: 'slot-ram-1',
    submitterName: 'Lead Spec Engineer',
    submitterRole: 'REVIEWER',
    reviewStatus: 'APPROVED',
    isSynthetic: true,
    isDisputed: false,
    createdAt: '2023-01-15T00:00:00Z',
  };

  // Scenario 1: Supported RAM upgrade
  it('Scenario 1: Evaluates SUPPORTED for matched RAM upgrade with documented evidence', () => {
    const result = assessCompatibility(baseLaptop, baseRamSlot, baseRamPart, [baseManualEvidence]);
    expect(result.status).toBe('SUPPORTED');
    expect(result.ruleEngineVersion).toBe(RULE_ENGINE_VERSION);
    expect(result.passedChecks.length).toBeGreaterThan(0);
    expect(result.failedChecks.length).toBe(0);
    expect(result.primaryProofType).toBe('DOCUMENTED_SPEC');
    expect(result.shortExplanation).toContain('Supported');
  });

  // Scenario 2: RAM generation mismatch (DDR4 vs DDR5)
  it('Scenario 2: Evaluates INCOMPATIBLE for DDR generation mismatch (DDR5 in DDR4 slot)', () => {
    const ddr5Part: PartDTO = {
      ...baseRamPart,
      id: 'part-ram-16gb-ddr5',
      partNumber: 'PF-D5-4800-16G',
      name: 'ProForma 16GB DDR5-4800 SO-DIMM',
      ddrGen: 'DDR5',
      speedMt: 4800,
      pinCount: 262,
    };
    const result = assessCompatibility(baseLaptop, baseRamSlot, ddr5Part, [baseManualEvidence]);
    expect(result.status).toBe('INCOMPATIBLE');
    expect(result.failedChecks.some((c) => c.id === 'ram-ddr-mismatch')).toBe(true);
    expect(result.shortExplanation).toContain('DDR Generation Incompatible');
  });

  // Scenario 3: Fully soldered RAM with no upgrade slot
  it('Scenario 3: Evaluates INCOMPATIBLE when slot is permanently soldered', () => {
    const solderedSlot: UpgradeTargetDTO = {
      ...baseRamSlot,
      id: 'slot-soldered',
      identifier: 'Onboard Memory',
      isSoldered: true,
      solderedCapacityGb: 16,
      currentOccupancy: 'OCCUPIED',
    };
    const result = assessCompatibility(baseLaptop, solderedSlot, baseRamPart, [baseManualEvidence]);
    expect(result.status).toBe('INCOMPATIBLE');
    expect(result.failedChecks.some((c) => c.id === 'soldered-unsupported')).toBe(true);
    expect(result.shortExplanation).toContain('Permanently Soldered');
  });

  // Scenario 4: Soldered RAM plus a replaceable slot (Hybrid memory)
  it('Scenario 4: Evaluates SUPPORTED for soldered + open replaceable slot within total limit', () => {
    const hybridSlot: UpgradeTargetDTO = {
      ...baseRamSlot,
      identifier: 'SO-DIMM Slot 1 (Expansion)',
      isSoldered: false,
      solderedCapacityGb: 8, // 8GB onboard soldered
      maxCapacityPerSlotGb: 16,
      maxTotalSystemCapacityGb: 24, // 8 + 16 = 24GB max
      currentOccupancy: 'AVAILABLE',
    };
    const result = assessCompatibility(baseLaptop, hybridSlot, baseRamPart, [baseManualEvidence]);
    expect(result.status).toBe('SUPPORTED');
    expect(result.passedChecks.some((c) => c.id === 'ram-hybrid-total-ok')).toBe(true);
  });

  // Scenario 5: Capacity limit exceeded
  it('Scenario 5: Evaluates INCOMPATIBLE when per-slot or total system capacity is exceeded', () => {
    const oversizedPart: PartDTO = {
      ...baseRamPart,
      id: 'part-ram-32gb',
      capacityGb: 32,
      name: 'ProForma 32GB DDR4 SO-DIMM',
    };
    const result = assessCompatibility(baseLaptop, baseRamSlot, oversizedPart, [baseManualEvidence]);
    expect(result.status).toBe('INCOMPATIBLE');
    expect(result.failedChecks.some((c) => c.id === 'ram-capacity-per-slot-exceeded')).toBe(true);
  });

  // Scenario 6: Unknown critical capacity information
  it('Scenario 6: Evaluates INSUFFICIENT_INFORMATION when slot capacity limit is unconfirmed and critical', () => {
    const unknownCapacitySlot: UpgradeTargetDTO = {
      ...baseRamSlot,
      maxCapacityPerSlotGb: null,
      maxTotalSystemCapacityGb: null,
    };
    // If occupancy is also unknown or protocol unknown, or only seller listing
    const result = assessCompatibility(baseLaptop, unknownCapacitySlot, baseRamPart, []);
    expect(result.unknownRequirements.some((u) => u.id === 'ram-capacity-unknown')).toBe(true);
  });

  // Scenario 7: M.2 SATA/NVMe protocol mismatch
  it('Scenario 7: Evaluates INCOMPATIBLE for M.2 SATA drive inserted into NVMe-only bay', () => {
    const nvmeOnlyBay: UpgradeTargetDTO = {
      id: 'bay-ssd-nvme-only',
      laptopId: 'laptop-apex-15',
      identifier: 'M.2 Bay 1 (Primary)',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 4.0 x4',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      requiresReplacement: false,
      bootSupported: true,
    };

    const sataM2Part: PartDTO = {
      id: 'part-ssd-sata',
      category: 'SSD',
      manufacturer: 'ZenithByte',
      partNumber: 'ZB-SATA-1TB',
      name: 'ZenithByte 1TB M.2 SATA III SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'SATA III',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      isSynthetic: true,
    };

    const result = assessCompatibility(baseLaptop, nvmeOnlyBay, sataM2Part, []);
    expect(result.status).toBe('INCOMPATIBLE');
    expect(result.failedChecks.some((c) => c.id === 'ssd-proto-mismatch-nvme-only')).toBe(true);
    expect(result.shortExplanation).toContain('Protocol Mismatch');
  });

  // Scenario 8: SSD length mismatch (2280 into 2230/2242-only bay)
  it('Scenario 8: Evaluates INCOMPATIBLE for M.2 2280 drive in 2230/2242-only bay', () => {
    const shortBay: UpgradeTargetDTO = {
      id: 'bay-ssd-short',
      laptopId: 'laptop-apex-15',
      identifier: 'WWAN/M.2 Auxiliary Bay',
      slotType: 'SSD',
      formFactor: 'M.2 2242',
      supportedLengths: '2230,2242',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 3.0 x2',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      requiresReplacement: false,
      bootSupported: false,
    };

    const longPart: PartDTO = {
      id: 'part-ssd-2280',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-2280-1T',
      name: 'HyperionTech 1TB NVMe M.2 2280 SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 3.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      isSynthetic: true,
    };

    const result = assessCompatibility(baseLaptop, shortBay, longPart, []);
    expect(result.status).toBe('INCOMPATIBLE');
    expect(result.failedChecks.some((c) => c.id === 'm2-length-mismatch')).toBe(true);
  });

  // Scenario 9: Documented supported SSD with a performance limitation
  it('Scenario 9: Evaluates SUPPORTED with PERFORMANCE_LIMITATION when PCIe 4.0 drive is in PCIe 3.0 slot', () => {
    const gen3Bay: UpgradeTargetDTO = {
      id: 'bay-ssd-gen3',
      laptopId: 'laptop-apex-15',
      identifier: 'M.2 NVMe Slot 1',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 3.0 x4',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      requiresReplacement: false,
      bootSupported: true,
    };

    const gen4Part: PartDTO = {
      id: 'part-ssd-gen4',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-4X4-1T',
      name: 'HyperionTech 1TB PCIe 4.0 NVMe SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 4.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      isSynthetic: true,
    };

    const result = assessCompatibility(baseLaptop, gen3Bay, gen4Part, [baseManualEvidence]);
    expect(result.status).toBe('SUPPORTED');
    expect(result.conditionsOrLimitations.some((c) => c.id === 'pcie-bus-bottleneck')).toBe(true);
    expect(result.conditionsOrLimitations.find((c) => c.id === 'pcie-bus-bottleneck')?.type).toBe('PERFORMANCE_LIMITATION');
  });

  // Scenario 10: Compatible replacement requiring occupied drive to be removed
  it('Scenario 10: Evaluates CONDITIONAL when slot is currently OCCUPIED', () => {
    const occupiedBay: UpgradeTargetDTO = {
      id: 'bay-ssd-occupied',
      laptopId: 'laptop-apex-15',
      identifier: 'M.2 NVMe Slot 1',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 3.0 x4',
      currentOccupancy: 'OCCUPIED',
      installedComponentSummary: 'Factory 256GB OEM NVMe SSD',
      isSoldered: false,
      requiresReplacement: true,
      bootSupported: true,
    };

    const nvmePart: PartDTO = {
      id: 'part-ssd-gen3-1tb',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-3X4-1T',
      name: 'HyperionTech 1TB NVMe SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 3.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      isSynthetic: true,
    };

    const result = assessCompatibility(baseLaptop, occupiedBay, nvmePart, [baseManualEvidence]);
    expect(result.status).toBe('CONDITIONAL');
    expect(result.conditionsOrLimitations.some((c) => c.type === 'REPLACEMENT_REQUIRED')).toBe(true);
    expect(result.shortExplanation).toContain('Conditional support');
  });

  // Scenario 11: Missing mounting hardware (Bracket/Screw Kit needed)
  it('Scenario 11: Evaluates CONDITIONAL when auxiliary mounting hardware is required', () => {
    const bayWithHardwareNote: UpgradeTargetDTO = {
      id: 'bay-ssd-secondary',
      laptopId: 'laptop-apex-15',
      identifier: 'M.2 Bay 2 (Secondary Expansion)',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 3.0 x4',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      hardwareNotes: 'Requires auxiliary mounting bracket and screw kit P/N BRK-8820 (not factory installed)',
      bootSupported: true,
      requiresReplacement: false,
    };

    const nvmePart: PartDTO = {
      id: 'part-ssd-gen3-1tb',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-3X4-1T',
      name: 'HyperionTech 1TB NVMe SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 3.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      isSynthetic: true,
    };

    const result = assessCompatibility(baseLaptop, bayWithHardwareNote, nvmePart, [baseManualEvidence]);
    expect(result.status).toBe('CONDITIONAL');
    expect(result.conditionsOrLimitations.some((c) => c.type === 'ACCESSORY_REQUIRED')).toBe(true);
    expect(result.conditionsOrLimitations.find((c) => c.type === 'ACCESSORY_REQUIRED')?.detail).toContain('BRK-8820');
  });

  // Scenario 12: Unknown slot occupancy
  it('Scenario 12: Evaluates INSUFFICIENT_INFORMATION when slot occupancy is UNKNOWN', () => {
    const unknownOccupancySlot: UpgradeTargetDTO = {
      ...baseRamSlot,
      currentOccupancy: 'UNKNOWN',
    };

    const result = assessCompatibility(baseLaptop, unknownOccupancySlot, baseRamPart, [baseManualEvidence]);
    expect(result.status).toBe('INSUFFICIENT_INFORMATION');
    expect(result.unknownRequirements.some((u) => u.id === 'occupancy-unknown')).toBe(true);
    expect(result.shortExplanation).toContain('Slot Occupancy Unconfirmed');
  });

  // Scenario 13: Conflicting applicable evidence (Manual says supported, bench test failed NO_POST)
  it('Scenario 13: Evaluates CONFLICTING_EVIDENCE when approved bench test contradicts manual', () => {
    const failedTestEvidence: EvidenceDTO = {
      id: 'ev-test-fail-1',
      evidenceType: 'TEST_OBSERVATION',
      sourceTitle: 'Technician Bench Test Observation #T-882',
      excerpt: 'Tested 16GB DDR4 module PF-D4-3200-16G in Slot 1. Power LED pulsed 3 times, motherboard failed to POST / train memory.',
      exactClaim: 'Failed to boot with PF-D4-3200-16G on BIOS v1.04.',
      applicableVariantId: 'laptop-apex-15',
      applicablePartId: baseRamPart.id,
      applicableTargetSlotId: baseRamSlot.id,
      submitterName: 'Alex Chen',
      submitterRole: 'TECHNICIAN',
      reviewStatus: 'APPROVED',
      isSynthetic: true,
      isDisputed: true,
      createdAt: '2023-04-10T00:00:00Z',
      testObservations: [
        {
          id: 'obs-1',
          laptopId: 'laptop-apex-15',
          partId: baseRamPart.id,
          targetSlotId: baseRamSlot.id,
          biosVersion: 'v1.04',
          outcome: 'NO_POST',
          testProcedure: 'Inserted module into Slot 1, cleared CMOS, performed cold boot test.',
          observedLimitations: '3 blink POST code; memory training timeout.',
          evidenceId: 'ev-test-fail-1',
        },
      ],
    };

    const result = assessCompatibility(baseLaptop, baseRamSlot, baseRamPart, [baseManualEvidence, failedTestEvidence]);
    expect(result.status).toBe('CONFLICTING_EVIDENCE');
    expect(result.conflictingEvidenceIds).toContain('ev-test-fail-1');
    expect(result.shortExplanation).toContain('Conflicting evidence detected');
  });

  // Scenario 14: Similar laptop family names with different requirements
  it('Scenario 14: Distinguishes between similar model family variants with different generation requirements', () => {
    // 2022 ApexBook uses DDR4
    const res2022 = assessCompatibility(baseLaptop, baseRamSlot, baseRamPart, [baseManualEvidence]);
    expect(res2022.status).toBe('SUPPORTED');

    // 2023 ApexBook Pro uses soldered LPDDR5
    const laptop2023Pro: LaptopDTO = {
      ...baseLaptop,
      id: 'laptop-apex-pro-2023',
      modelCode: 'AB15-PRO-2023',
      variantName: 'ApexBook Pro 15 (2023)',
    };
    const solderedLpddr5Slot: UpgradeTargetDTO = {
      ...baseRamSlot,
      id: 'slot-pro-soldered',
      laptopId: 'laptop-apex-pro-2023',
      identifier: 'Onboard LPDDR5',
      isSoldered: true,
      ddrGeneration: 'LPDDR5',
    };

    const res2023 = assessCompatibility(laptop2023Pro, solderedLpddr5Slot, baseRamPart, []);
    expect(res2023.status).toBe('INCOMPATIBLE');
  });

  // Scenario 15: Seller compatibility claim without independent supporting evidence
  it('Scenario 15: Evaluates INSUFFICIENT_INFORMATION when ONLY a seller claim exists', () => {
    const sellerEvidenceOnly: EvidenceDTO = {
      id: 'ev-seller-listing',
      evidenceType: 'SELLER_LISTING',
      sourceTitle: 'Marketplace Seller Listing "Guaranteed Fit For All ApexBooks"',
      excerpt: 'Compatible with ApexBook 15 series laptops.',
      exactClaim: 'Seller asserts compatibility for all AB15 variants.',
      applicableVariantId: 'laptop-apex-15',
      applicablePartId: baseRamPart.id,
      submitterName: 'Web Scraper / Third Party',
      submitterRole: 'BUYER',
      reviewStatus: 'APPROVED',
      isSynthetic: true,
      isDisputed: false,
      createdAt: '2023-05-01T00:00:00Z',
    };

    const result = assessCompatibility(baseLaptop, baseRamSlot, baseRamPart, [sellerEvidenceOnly]);
    expect(result.status).toBe('INSUFFICIENT_INFORMATION');
    expect(result.unknownRequirements.some((u) => u.id === 'unsubstantiated-seller-claim')).toBe(true);
    expect(result.primaryProofType).toBe('SELLER_CLAIM_UNVERIFIED');
  });

  // Invariant 16: Pending evidence does NOT alter published verdict
  it('Invariant 16: Pending evidence is completely ignored and does not affect the assessment', () => {
    const pendingNegativeTest: EvidenceDTO = {
      id: 'ev-pending-test',
      evidenceType: 'TEST_OBSERVATION',
      sourceTitle: 'Pending Tech Submission',
      excerpt: 'Reported failure',
      exactClaim: 'Failed to boot',
      applicableVariantId: 'laptop-apex-15',
      applicablePartId: baseRamPart.id,
      applicableTargetSlotId: baseRamSlot.id,
      submitterName: 'Unverified Submitter',
      submitterRole: 'TECHNICIAN',
      reviewStatus: 'PENDING', // PENDING!
      isSynthetic: true,
      isDisputed: false,
      createdAt: '2023-06-01T00:00:00Z',
      testObservations: [
        {
          id: 'obs-pending',
          laptopId: 'laptop-apex-15',
          partId: baseRamPart.id,
          targetSlotId: baseRamSlot.id,
          outcome: 'NO_POST',
          testProcedure: 'Cold boot',
          evidenceId: 'ev-pending-test',
        },
      ],
    };

    const result = assessCompatibility(baseLaptop, baseRamSlot, baseRamPart, [baseManualEvidence, pendingNegativeTest]);
    expect(result.status).toBe('SUPPORTED'); // NOT conflicting or incompatible because test is pending review!
    expect(result.conflictingEvidenceIds).not.toContain('ev-pending-test');
  });

  // Invariant 17: Known blocking mismatch trumps unrelated unknown fields
  it('Invariant 17: Blocking mismatch causes INCOMPATIBLE even when other fields are unknown', () => {
    const bayWithUnknownProtocol: UpgradeTargetDTO = {
      id: 'bay-short-unknown-proto',
      laptopId: 'laptop-apex-15',
      identifier: 'Unknown Bay',
      slotType: 'SSD',
      formFactor: 'M.2 2242',
      supportedLengths: '2230,2242', // Only supports 42mm
      protocolSupported: null, // UNKNOWN protocol!
      currentOccupancy: 'UNKNOWN', // UNKNOWN occupancy!
      isSoldered: false,
      bootSupported: true,
      requiresReplacement: false,
    };

    const longPart: PartDTO = {
      id: 'part-ssd-2280',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-2280-1T',
      name: 'HyperionTech 1TB NVMe M.2 2280 SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      moduleLengthMm: 80, // 80mm physically will not fit!
      isDoubleSided: false,
      heatsinkIncluded: false,
      isSynthetic: true,
    };

    const result = assessCompatibility(baseLaptop, bayWithUnknownProtocol, longPart, []);
    // Because the length mismatch is physically blocking, it MUST return INCOMPATIBLE, not INSUFFICIENT_INFORMATION!
    expect(result.status).toBe('INCOMPATIBLE');
    expect(result.failedChecks.some((c) => c.id === 'm2-length-mismatch')).toBe(true);
  });
});

