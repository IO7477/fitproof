import {
  AssessmentResult,
  CheckItem,
  ConditionItem,
  EvidenceDTO,
  LaptopDTO,
  PartDTO,
  UnknownItem,
  UpgradeTargetDTO,
} from '../types';

export const RULE_ENGINE_VERSION = '1.0.0-deterministic';

export interface AssessOptions {
  intentToReplace?: boolean;
}

export function assessCompatibility(
  laptop: LaptopDTO,
  slot: UpgradeTargetDTO,
  part: PartDTO,
  evidenceList: EvidenceDTO[] = [],
  options: AssessOptions = {}
): AssessmentResult {
  const passedChecks: CheckItem[] = [];
  const failedChecks: CheckItem[] = [];
  const unknownRequirements: UnknownItem[] = [];
  const conditionsOrLimitations: ConditionItem[] = [];
  const supportingEvidenceIds: string[] = [];
  const conflictingEvidenceIds: string[] = [];

  // Filter approved evidence relevant to this laptop, slot, or part
  // Unapproved (PENDING, REJECTED, NEEDS_CLARIFICATION) evidence must NOT affect published status
  const approvedEvidence = evidenceList.filter((e) => e.reviewStatus === 'APPROVED');
  const relevantApproved = approvedEvidence.filter(
    (e) =>
      (!e.applicableVariantId || e.applicableVariantId === laptop.id) &&
      (!e.applicablePartId || e.applicablePartId === part.id) &&
      (!e.applicableTargetSlotId || e.applicableTargetSlotId === slot.id)
  );

  // 1. Evidence Conflict & Failure Detection
  let hasNegativeTestObservation = false;
  let hasPositiveEvidence = false;
  let negativeObservationNotes = '';
  let positiveProofNotes = '';

  for (const ev of relevantApproved) {
    if (ev.testObservations && ev.testObservations.length > 0) {
      for (const obs of ev.testObservations) {
        if (obs.outcome === 'BOOT_STABLE') {
          hasPositiveEvidence = true;
          positiveProofNotes = `Empirical test on BIOS ${obs.biosVersion || 'standard'} confirmed stable boot.`;
          if (!supportingEvidenceIds.includes(ev.id)) supportingEvidenceIds.push(ev.id);
        } else if (
          obs.outcome === 'NO_POST' ||
          obs.outcome === 'PHYSICAL_FIT_ISSUE' ||
          obs.outcome === 'BOOT_UNSTABLE' ||
          obs.outcome === 'NOT_RECOGNIZED'
        ) {
          hasNegativeTestObservation = true;
          negativeObservationNotes = `Empirical test outcome: ${obs.outcome} (${obs.observedLimitations || 'system failed to initialize'}).`;
          if (!conflictingEvidenceIds.includes(ev.id)) conflictingEvidenceIds.push(ev.id);
        }
      }
    } else if (ev.evidenceType === 'MANUFACTURER_SPEC' || ev.evidenceType === 'SERVICE_MANUAL') {
      hasPositiveEvidence = true;
      positiveProofNotes = `Documented in official ${ev.sourceTitle}.`;
      if (!supportingEvidenceIds.includes(ev.id)) supportingEvidenceIds.push(ev.id);
    }
  }

  // 2. Category Match Check
  if (
    (slot.slotType === 'RAM' && part.category !== 'RAM') ||
    (slot.slotType === 'SSD' && part.category !== 'SSD')
  ) {
    failedChecks.push({
      id: 'cat-mismatch',
      category: 'PHYSICAL',
      title: 'Component Category Mismatch',
      detail: `Target slot is for ${slot.slotType}, but candidate part is a ${part.category}.`,
      passed: false,
      blocking: true,
    });
  } else {
    passedChecks.push({
      id: 'cat-match',
      category: 'PHYSICAL',
      title: 'Component Category Match',
      detail: `Target slot and candidate part are both ${slot.slotType}.`,
      passed: true,
    });
  }

  // 3. Soldered Memory / Storage Check
  if (slot.isSoldered) {
    failedChecks.push({
      id: 'soldered-unsupported',
      category: 'PHYSICAL',
      title: 'Permanently Soldered Mainboard Component',
      detail: `This memory/storage is permanently soldered (BGA/surface-mount) to the motherboard. It lacks an expansion socket and cannot be upgraded or replaced.`,
      passed: false,
      blocking: true,
    });
  }

  // 4. Physical Form Factor & Dimension Checks
  if (slot.slotType === 'RAM') {
    // RAM Form Factor
    const isSodimmSlot = slot.formFactor.toLowerCase().includes('so-dimm');
    const isSodimmPart = part.formFactor.toLowerCase().includes('so-dimm');

    if (isSodimmSlot && !isSodimmPart) {
      failedChecks.push({
        id: 'ram-ff-mismatch',
        category: 'PHYSICAL',
        title: 'RAM Form Factor Mismatch',
        detail: `Slot requires laptop ${slot.formFactor}, but candidate part is ${part.formFactor} (desktop standard or unsupported layout).`,
        passed: false,
        blocking: true,
      });
    } else {
      passedChecks.push({
        id: 'ram-ff-match',
        category: 'PHYSICAL',
        title: 'RAM Module Form Factor Match',
        detail: `Both slot and candidate module adhere to standard ${slot.formFactor}.`,
        passed: true,
      });
    }
  } else if (slot.slotType === 'SSD') {
    // SSD Form Factor (M.2 vs 2.5" SATA)
    const isM2Slot = slot.formFactor.toLowerCase().includes('m.2');
    const isM2Part = part.formFactor.toLowerCase().includes('m.2');

    if (isM2Slot !== isM2Part) {
      failedChecks.push({
        id: 'ssd-ff-mismatch',
        category: 'PHYSICAL',
        title: 'Storage Bay Form Factor Mismatch',
        detail: `Bay accommodates ${slot.formFactor}, but candidate drive is ${part.formFactor}.`,
        passed: false,
        blocking: true,
      });
    } else if (isM2Slot && isM2Part) {
      // Length check
      if (slot.supportedLengths && part.moduleLengthMm) {
        const supported = slot.supportedLengths
          .split(',')
          .map((s) => s.trim().replace('22', ''));
        const partLength = String(part.moduleLengthMm);

        if (!supported.includes(partLength)) {
          failedChecks.push({
            id: 'm2-length-mismatch',
            category: 'PHYSICAL',
            title: 'M.2 Module Physical Length Mismatch',
            detail: `Drive is M.2 22${partLength} (${partLength}mm length), but this bay only has mounting standoffs for lengths: ${slot.supportedLengths}. A ${partLength}mm drive cannot be physically fastened.`,
            passed: false,
            blocking: true,
          });
        } else {
          passedChecks.push({
            id: 'm2-length-match',
            category: 'PHYSICAL',
            title: 'M.2 Module Length Standoff Match',
            detail: `Module length 22${partLength} is supported by bay standoff positions (${slot.supportedLengths}).`,
            passed: true,
          });
        }
      }

      // Single-sided clearance check
      if (slot.clearanceNotes && slot.clearanceNotes.toLowerCase().includes('single-sided')) {
        if (part.isDoubleSided) {
          failedChecks.push({
            id: 'clearance-double-sided',
            category: 'PHYSICAL',
            title: 'Physical Clearance Incompatibility (Double-Sided PCB)',
            detail: `Bay documentation restricts installations to single-sided M.2 modules. Candidate drive has NAND packages on both sides of the PCB, which will collide with mainboard circuitry or cause mechanical warping.`,
            passed: false,
            blocking: true,
          });
        } else {
          passedChecks.push({
            id: 'clearance-single-sided',
            category: 'PHYSICAL',
            title: 'Physical Underside Clearance Verified',
            detail: `Candidate drive is single-sided, complying with the bay's tight mechanical clearance profile.`,
            passed: true,
          });
        }
      }

      // Heatsink check
      if (part.heatsinkIncluded) {
        conditionsOrLimitations.push({
          id: 'preinstalled-heatsink-clearance',
          type: 'CONFIGURATION_CONSTRAINT',
          title: 'Pre-installed Heatsink Physical Clearance',
          detail: `Candidate drive ships with a factory-attached heatsink. Standard laptop chassis internal clearances (~2-3mm) typically do not fit bulky desktop heatsinks unless removable.`,
        });
      }
    }
  }

  // 5. Electrical & Protocol Checks
  if (slot.slotType === 'RAM') {
    // DDR generation check
    if (slot.ddrGeneration && part.ddrGen) {
      if (slot.ddrGeneration.toUpperCase() !== part.ddrGen.toUpperCase()) {
        failedChecks.push({
          id: 'ram-ddr-mismatch',
          category: 'ELECTRICAL',
          title: 'DDR Generation Incompatible',
          detail: `Motherboard slot requires ${slot.ddrGeneration}, but candidate module is ${part.ddrGen}. Pin counts, keying notches, and operating voltages (${part.voltage || 'unspecified'}) are electrically and physically incompatible.`,
          passed: false,
          blocking: true,
        });
      } else {
        passedChecks.push({
          id: 'ram-ddr-match',
          category: 'ELECTRICAL',
          title: 'DDR Generation and Pinout Compatible',
          detail: `Both motherboard slot and candidate module utilize ${slot.ddrGeneration} standard signaling and pin layout.`,
          passed: true,
        });
      }
    } else if (!slot.ddrGeneration) {
      unknownRequirements.push({
        id: 'ram-ddr-unknown',
        title: 'Motherboard DDR Generation Unconfirmed',
        description: 'The exact DDR generation (DDR4 vs DDR5) for this laptop variant is not documented in the verified dataset.',
        nextAction: 'Check CPU-Z or HWInfo on the laptop to verify whether current RAM runs DDR4 or DDR5.',
      });
    }
  } else if (slot.slotType === 'SSD') {
    // SSD protocol check
    if (slot.protocolSupported && part.protocol) {
      const slotProto = slot.protocolSupported.toLowerCase();
      const partProto = part.protocol.toLowerCase();

      const isPartNVMe = partProto.includes('nvme') || partProto.includes('pcie');
      const isPartSATA = partProto.includes('sata');

      const isSlotNVMe = slotProto.includes('nvme') || slotProto.includes('pcie');
      const isSlotSATA = slotProto.includes('sata');
      const isSlotDual = isSlotNVMe && isSlotSATA;

      if (!isSlotDual) {
        if (isSlotNVMe && !isPartNVMe) {
          failedChecks.push({
            id: 'ssd-proto-mismatch-nvme-only',
            category: 'ELECTRICAL',
            title: 'Protocol Mismatch (NVMe Only Slot)',
            detail: `Bay routes PCIe NVMe bus lanes only and does not contain SATA controller traces. SATA M.2 drives will not be recognized by BIOS or OS.`,
            passed: false,
            blocking: true,
          });
        } else if (isSlotSATA && !isPartSATA) {
          failedChecks.push({
            id: 'ssd-proto-mismatch-sata-only',
            category: 'ELECTRICAL',
            title: 'Protocol Mismatch (SATA Only Slot)',
            detail: `Bay routes SATA AHCI controller bus lines only. PCIe NVMe drives cannot establish a PCIe link and will not power up or detect.`,
            passed: false,
            blocking: true,
          });
        } else {
          passedChecks.push({
            id: 'ssd-proto-match',
            category: 'ELECTRICAL',
            title: 'Storage Protocol Interface Match',
            detail: `Drive protocol (${part.protocol}) matches bay interface (${slot.protocolSupported}).`,
            passed: true,
          });
        }
      } else {
        passedChecks.push({
          id: 'ssd-proto-dual',
          category: 'ELECTRICAL',
          title: 'Dual-Mode Storage Bay Interface Match',
          detail: `Bay supports dual-mode PCIe NVMe and SATA M.2 drives. Candidate drive (${part.protocol}) is electrically supported.`,
          passed: true,
        });
      }
    } else if (!slot.protocolSupported) {
      unknownRequirements.push({
        id: 'ssd-proto-unknown',
        title: 'M.2 Bay Electrical Protocol Unconfirmed',
        description: 'Documentation does not specify whether this slot routes PCIe NVMe, SATA, or both.',
        nextAction: 'Check whether this bay supports SATA or NVMe in the OEM maintenance manual or BIOS storage configuration menu before purchasing.',
      });
    }
  }

  // 6. Platform Limits and Capacity Rules
  if (slot.slotType === 'RAM') {
    // Per slot capacity limit
    if (slot.maxCapacityPerSlotGb !== null && slot.maxCapacityPerSlotGb !== undefined) {
      if (part.capacityGb > slot.maxCapacityPerSlotGb) {
        failedChecks.push({
          id: 'ram-capacity-per-slot-exceeded',
          category: 'PLATFORM',
          title: 'Per-Slot Capacity Limit Exceeded',
          detail: `Motherboard chipset and firmware limit this slot to a maximum of ${slot.maxCapacityPerSlotGb}GB per module. Candidate module is ${part.capacityGb}GB, which exceeds the memory controller register allocation.`,
          passed: false,
          blocking: true,
        });
      } else {
        passedChecks.push({
          id: 'ram-capacity-per-slot-ok',
          category: 'PLATFORM',
          title: 'Per-Slot Capacity Within Limits',
          detail: `Candidate capacity (${part.capacityGb}GB) is within the slot documented ceiling (${slot.maxCapacityPerSlotGb}GB).`,
          passed: true,
        });
      }
    } else {
      unknownRequirements.push({
        id: 'ram-capacity-unknown',
        title: 'Maximum Per-Slot Capacity Not Documented',
        description: 'Manufacturer documentation does not state the maximum module density supported per slot.',
        nextAction: 'Check community forum test observations or CPU memory controller specifications to verify if high-density modules boot.',
      });
    }

    // Total System Capacity Check (Soldered + Removable)
    if (slot.maxTotalSystemCapacityGb) {
      const soldered = slot.solderedCapacityGb || 0;
      const projectedTotal = soldered + part.capacityGb;
      if (projectedTotal > slot.maxTotalSystemCapacityGb) {
        failedChecks.push({
          id: 'ram-total-system-exceeded',
          category: 'PLATFORM',
          title: 'Total Platform Memory Ceiling Exceeded',
          detail: `Laptop platform has a documented hardware ceiling of ${slot.maxTotalSystemCapacityGb}GB total RAM. With ${soldered}GB soldered memory, adding this ${part.capacityGb}GB module totals ${projectedTotal}GB.`,
          passed: false,
          blocking: true,
        });
      } else if (soldered > 0) {
        passedChecks.push({
          id: 'ram-hybrid-total-ok',
          category: 'PLATFORM',
          title: 'Hybrid Soldered + Removable Memory Ceiling Checked',
          detail: `System has ${soldered}GB soldered RAM. Adding ${part.capacityGb}GB results in ${projectedTotal}GB total, within the platform limit of ${slot.maxTotalSystemCapacityGb}GB.`,
          passed: true,
        });
      }
    }

    // Speed / Downclocking Check
    if (slot.supportedSpeeds && part.speedMt) {
      const maxSpeedMatch = slot.supportedSpeeds.match(/(\d+)/g);
      const maxPlatformSpeed = maxSpeedMatch
        ? Math.max(...maxSpeedMatch.map(Number))
        : null;

      if (maxPlatformSpeed && part.speedMt > maxPlatformSpeed) {
        conditionsOrLimitations.push({
          id: 'ram-downclocking-limitation',
          type: 'PERFORMANCE_LIMITATION',
          title: 'Memory Frequency Downclocking Limitation',
          detail: `Module is rated at ${part.speedMt} MT/s, but platform memory controller operates at a maximum of ${maxPlatformSpeed} MT/s. The module will downclock to JEDEC ${maxPlatformSpeed} MT/s default profile; higher XMP/EXPO profiles are not supported.`,
        });
      } else {
        passedChecks.push({
          id: 'ram-speed-full',
          category: 'PLATFORM',
          title: 'Operating Speed Fully Supported',
          detail: `Candidate module speed (${part.speedMt} MT/s) runs at full rated frequency within supported platform speeds (${slot.supportedSpeeds}).`,
          passed: true,
        });
      }
    }
  } else if (slot.slotType === 'SSD') {
    // PCIe Generation Bottleneck (Performance limitation, not incompatible)
    if (slot.pcieGenLanes && part.pcieGen) {
      const isSlotGen3 = slot.pcieGenLanes.includes('3.0');
      const isPartGen4 = part.pcieGen.includes('4.0') || part.pcieGen.includes('5.0');

      if (isSlotGen3 && isPartGen4) {
        conditionsOrLimitations.push({
          id: 'pcie-bus-bottleneck',
          type: 'PERFORMANCE_LIMITATION',
          title: 'PCIe Generation Bandwidth Ceiling (Safe Downward Compatibility)',
          detail: `Candidate drive is ${part.pcieGen}, but this bay routes ${slot.pcieGenLanes}. The drive will operate reliably and safely, but sequential read/write performance will be throttled to PCIe 3.0 ceiling (~3,500 MB/s).`,
        });
      } else {
        passedChecks.push({
          id: 'pcie-gen-match',
          category: 'PLATFORM',
          title: 'PCIe Generation Matching',
          detail: `Drive ${part.pcieGen} matches bay capability ${slot.pcieGenLanes}.`,
          passed: true,
        });
      }
    }

    // Boot Support Check
    if (!slot.bootSupported) {
      conditionsOrLimitations.push({
        id: 'no-boot-support',
        type: 'CONFIGURATION_CONSTRAINT',
        title: 'Secondary Storage Only (No OS Boot Support)',
        detail: `This secondary bay lacks UEFI NVMe/SATA boot ROM support in the laptop BIOS. This drive can only be mounted for game/file storage, not as the primary operating system boot drive.`,
      });
    }
  }

  // 7. Installation & Accessory Requirements
  if (slot.hardwareNotes && slot.hardwareNotes.trim().length > 0) {
    conditionsOrLimitations.push({
      id: 'accessory-hardware-required',
      type: 'ACCESSORY_REQUIRED',
      title: 'Mounting Hardware / Bracket Kit Required',
      detail: slot.hardwareNotes,
    });
  }

  // 8. Slot Occupancy & Replacement Check
  if (slot.currentOccupancy === 'UNKNOWN') {
    unknownRequirements.push({
      id: 'occupancy-unknown',
      title: 'Slot Occupancy Unconfirmed',
      description: 'The physical occupancy of this slot is unknown. It cannot be confirmed whether this slot is currently empty or already populated by a factory-installed module.',
      nextAction: 'Inspect Windows Task Manager (Performance tab) or open the chassis service panel to verify if this slot is empty before purchasing.',
    });
  } else if (slot.currentOccupancy === 'OCCUPIED') {
    conditionsOrLimitations.push({
      id: 'replacement-required',
      type: 'REPLACEMENT_REQUIRED',
      title: 'Component Replacement Required',
      detail: `This bay is currently occupied by ${slot.installedComponentSummary || 'an existing component'}. Installing this candidate requires removing and replacing the current component.`,
    });
  }

  // 9. Seller Claim Alone Check (Honesty rule)
  const hasSellerListingOnly =
    relevantApproved.length > 0 &&
    relevantApproved.every((e) => e.evidenceType === 'SELLER_LISTING');

  if (hasSellerListingOnly && passedChecks.length > 0 && failedChecks.length === 0) {
    unknownRequirements.push({
      id: 'unsubstantiated-seller-claim',
      title: 'Unsubstantiated Seller Claim',
      description: 'The only recorded evidence is a retailer/seller compatibility claim. No official engineering maintenance manual, OEM specification sheet, or verified bench test exists.',
      nextAction: 'Do not rely on marketplace listing titles alone. Obtain service manual confirmation or submit a verified test observation.',
    });
  }

  // 10. Status Synthesis
  let status: AssessmentResult['status'] = 'SUPPORTED';
  let shortExplanation = '';
  let primaryProofType: AssessmentResult['primaryProofType'] = 'NONE';

  // Condition A: Conflicting Evidence detected
  if (hasNegativeTestObservation && hasPositiveEvidence) {
    status = 'CONFLICTING_EVIDENCE';
    shortExplanation = `Conflicting evidence detected. Documentation indicates theoretical support, but an approved technician bench test observed failure (${negativeObservationNotes}). Further review required.`;
    primaryProofType = 'TEST_OBSERVATION';
  }
  // Condition B: Known Blocking Mismatch -> INCOMPATIBLE (Trumps unknown fields!)
  else if (failedChecks.some((c) => c.blocking)) {
    status = 'INCOMPATIBLE';
    const primaryFail = failedChecks.find((c) => c.blocking)!;
    shortExplanation = `Incompatible: ${primaryFail.title}. ${primaryFail.detail}`;
    primaryProofType = hasNegativeTestObservation
      ? 'TEST_OBSERVATION'
      : hasPositiveEvidence
      ? 'DOCUMENTED_SPEC'
      : 'NONE';
  }
  // Condition C: Negative test observation without conflict
  else if (hasNegativeTestObservation) {
    status = 'INCOMPATIBLE';
    shortExplanation = `Incompatible based on verified bench test: ${negativeObservationNotes}`;
    primaryProofType = 'TEST_OBSERVATION';
  }
  // Condition D: Critical Unknown Requirements present
  else if (
    unknownRequirements.some(
      (u) =>
        u.id === 'ssd-proto-unknown' ||
        u.id === 'occupancy-unknown' ||
        u.id === 'ram-ddr-unknown' ||
        u.id === 'unsubstantiated-seller-claim'
    )
  ) {
    status = 'INSUFFICIENT_INFORMATION';
    const firstUnknown = unknownRequirements[0];
    shortExplanation = `Insufficient information to confirm compatibility: ${firstUnknown.title}. ${firstUnknown.nextAction}`;
    primaryProofType = hasSellerListingOnly ? 'SELLER_CLAIM_UNVERIFIED' : 'NONE';
  }
  // Condition E: Conditional Support (Replacement required, accessory required, or configuration constraint)
  else if (
    conditionsOrLimitations.some(
      (c) =>
        c.type === 'REPLACEMENT_REQUIRED' ||
        c.type === 'ACCESSORY_REQUIRED' ||
        c.type === 'CONFIGURATION_CONSTRAINT'
    )
  ) {
    status = 'CONDITIONAL';
    const primaryCond = conditionsOrLimitations[0];
    shortExplanation = `Conditional support: ${primaryCond.title}. ${primaryCond.detail}`;
    primaryProofType = hasPositiveEvidence ? 'DOCUMENTED_SPEC' : 'NONE';
  }
  // Condition F: Fully Supported with verified evidence
  else {
    status = 'SUPPORTED';
    if (hasPositiveEvidence) {
      if (relevantApproved.some((e) => e.evidenceType === 'TEST_OBSERVATION')) {
        shortExplanation = `Supported: Verified by an exact empirical bench test observation confirming stable boot and hardware detection.`;
        primaryProofType = 'TEST_OBSERVATION';
      } else {
        shortExplanation = `Supported: Verified against official hardware maintenance specifications and component tolerances.`;
        primaryProofType = 'DOCUMENTED_SPEC';
      }
    } else {
      shortExplanation = `Supported based on standard interface alignment. Note: No specific bench test has been recorded for this exact pairing.`;
      primaryProofType = 'DOCUMENTED_SPEC';
    }
  }

  return {
    status,
    shortExplanation,
    passedChecks,
    failedChecks,
    unknownRequirements,
    conditionsOrLimitations,
    supportingEvidenceIds,
    conflictingEvidenceIds,
    ruleEngineVersion: RULE_ENGINE_VERSION,
    computedAt: new Date().toISOString(),
    primaryProofType,
  };
}

