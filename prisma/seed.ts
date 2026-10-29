import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FitProof synthetic demonstration database...');

  // Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.testObservation.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.upgradeTarget.deleteMany();
  await prisma.part.deleteMany();
  await prisma.laptop.deleteMany();

  // 1. Seed Laptops
  const laptopApex15G2 = await prisma.laptop.create({
    data: {
      id: 'laptop-apex-15-g2',
      manufacturer: 'ApexVolt',
      modelFamily: 'ApexBook 15',
      modelCode: 'AB15-G2-INTEL',
      variantName: 'ApexBook 15 Gen 2 (Core i7-1255U)',
      releaseYear: 2022,
      regionRevision: 'Global / Rev 2.1',
      configurationNotes: 'Standard 15.6" office laptop. 2x SO-DIMM DDR4 slots (1 occupied, 1 free). Single M.2 2280 PCIe 3.0 x4 storage bay.',
      knownSpecs: JSON.stringify({
        cpu: 'Intel Core i7-1255U',
        ramType: 'DDR4-3200 SO-DIMM',
        maxRamTotal: '32GB',
        maxRamPerSlot: '16GB',
        ssdInterface: 'M.2 2280 PCIe 3.0 x4 NVMe',
      }),
      unknownSpecs: JSON.stringify({}),
      isSynthetic: true,
    },
  });

  const laptopApexPro16 = await prisma.laptop.create({
    data: {
      id: 'laptop-apex-pro-16',
      manufacturer: 'ApexVolt',
      modelFamily: 'ApexBook Pro 16',
      modelCode: 'AB16-PRO-2023',
      variantName: 'ApexBook Pro 16 (Ultra 7, RTX 4060)',
      releaseYear: 2023,
      regionRevision: 'US / Rev 1.0',
      configurationNotes: 'Thin-and-light creator workstation. RAM is completely soldered LPDDR5. Storage features 2x M.2 2280 PCIe 4.0 x4 bays (Bay 2 empty, requires bracket BRK-8820).',
      knownSpecs: JSON.stringify({
        cpu: 'Intel Core Ultra 7 155H',
        ramType: 'LPDDR5-6400 (Soldered)',
        maxRamTotal: '32GB (Factory Fixed)',
        ssdInterface: 'Dual M.2 2280 PCIe 4.0 x4',
      }),
      unknownSpecs: JSON.stringify({}),
      isSynthetic: true,
    },
  });

  const laptopTerra14Hybrid = await prisma.laptop.create({
    data: {
      id: 'laptop-terra-14',
      manufacturer: 'Nexura',
      modelFamily: 'TerraBook 14',
      modelCode: 'TB14-HYBRID-A',
      variantName: 'TerraBook 14 (Ryzen 5 5625U Hybrid)',
      releaseYear: 2022,
      regionRevision: 'Global / Rev A',
      configurationNotes: 'Features 8GB soldered DDR4 memory on the motherboard, plus exactly 1x DDR4 SO-DIMM expansion slot. Maximum system platform RAM is 24GB.',
      knownSpecs: JSON.stringify({
        cpu: 'AMD Ryzen 5 5625U',
        solderedRam: '8GB DDR4-3200',
        expansionSlots: '1x DDR4 SO-DIMM',
        maxSystemRam: '24GB (8GB soldered + 16GB module)',
      }),
      unknownSpecs: JSON.stringify({}),
      isSynthetic: true,
    },
  });

  const laptopChrono13 = await prisma.laptop.create({
    data: {
      id: 'laptop-chrono-13',
      manufacturer: 'Nexura',
      modelFamily: 'ChronoBook 13',
      modelCode: 'CB13-ULTRALIGHT',
      variantName: 'ChronoBook 13 Ultralight (Core i5)',
      releaseYear: 2023,
      regionRevision: 'Global / Rev 1.2',
      configurationNotes: 'Sub-1kg ultrabook. 16GB LPDDR5 soldered memory. Storage bay is restricted to short M.2 2242/2230 format due to oversized 65Wh battery.',
      knownSpecs: JSON.stringify({
        ram: '16GB LPDDR5 Soldered',
        storageBay: 'M.2 PCIe NVMe (Lengths 2230, 2242 only)',
      }),
      unknownSpecs: JSON.stringify({}),
      isSynthetic: true,
    },
  });

  const laptopWorkStation17 = await prisma.laptop.create({
    data: {
      id: 'laptop-ws-17',
      manufacturer: 'VanguardSys',
      modelFamily: 'WorkStation 17',
      modelCode: 'WS17-G1-XEON',
      variantName: 'VanguardSys WorkStation 17 (Xeon / RTX 5000)',
      releaseYear: 2023,
      regionRevision: 'Enterprise / Rev 3.0',
      configurationNotes: 'Heavy mobile workstation. 4x DDR5 SO-DIMM slots. Manual claims 64GB per slot, but field tests on BIOS v1.04 fail with 64GB modules.',
      knownSpecs: JSON.stringify({
        ramSlots: '4x DDR5 SO-DIMM',
        manualMaxRam: '128GB (or 256GB claimed in preliminary spec)',
      }),
      unknownSpecs: JSON.stringify({
        biosMaxRamStatus: 'Disputed 64GB module stability on early firmware',
      }),
      isSynthetic: true,
    },
  });

  const laptopAeroLite14Legacy = await prisma.laptop.create({
    data: {
      id: 'laptop-aerolite-14',
      manufacturer: 'VanguardSys',
      modelFamily: 'AeroLite 14',
      modelCode: 'AL14-LEGACY-SATA',
      variantName: 'AeroLite 14 Classic (Core i5 8th Gen)',
      releaseYear: 2019,
      regionRevision: 'Rev B',
      configurationNotes: 'M.2 storage bay is wired exclusively to SATA AHCI controller traces. PCIe NVMe signaling is not supported.',
      knownSpecs: JSON.stringify({
        storageProtocol: 'M.2 SATA III (B+M Key only)',
        ramSlots: '1x DDR4 SO-DIMM',
      }),
      unknownSpecs: JSON.stringify({}),
      isSynthetic: true,
    },
  });

  const laptopEdge15Unknown = await prisma.laptop.create({
    data: {
      id: 'laptop-edge-15',
      manufacturer: 'ZenithByte',
      modelFamily: 'EdgeBook 15',
      modelCode: 'EB15-UNKNOWN-OCC',
      variantName: 'EdgeBook 15 (Unknown Configuration Variant)',
      releaseYear: 2022,
      regionRevision: 'Regional Batch X',
      configurationNotes: 'Budget laptop model with unverified factory spec sheets. Slot 2 occupancy is unconfirmed; maximum supported RAM capacity is unknown.',
      knownSpecs: JSON.stringify({
        ramType: 'DDR4 SO-DIMM',
      }),
      unknownSpecs: JSON.stringify({
        slot2Occupancy: 'Unknown whether factory shipped with 1x 8GB or 2x 4GB',
        maxRamLimit: 'Unpublished in OEM quickstart guide',
      }),
      isSynthetic: true,
    },
  });

  const laptopApex15G1 = await prisma.laptop.create({
    data: {
      id: 'laptop-apex-15-g1',
      manufacturer: 'ApexVolt',
      modelFamily: 'ApexBook 15',
      modelCode: 'AB15-G1-2021',
      variantName: 'ApexBook 15 Gen 1 (Core i5-10210U Legacy)',
      releaseYear: 2021,
      regionRevision: 'Rev 1.0',
      configurationNotes: 'First generation of ApexBook 15. Uses older DDR4-2666 and SATA 2.5-inch bay. Often confused by buyers with Gen 2.',
      knownSpecs: JSON.stringify({
        ram: '2x DDR4-2666 SO-DIMM',
        storage: '2.5-inch 7mm SATA III bay',
      }),
      unknownSpecs: JSON.stringify({}),
      isSynthetic: true,
    },
  });

  // 2. Seed Upgrade Targets (Slots / Bays)
  const slotApex15G2Ram1 = await prisma.upgradeTarget.create({
    data: {
      id: 'target-apex-15-ram-1',
      laptopId: laptopApex15G2.id,
      identifier: 'RAM Slot 1 (Primary - Factory Occupied)',
      slotType: 'RAM',
      formFactor: 'DDR4 SO-DIMM',
      ddrGeneration: 'DDR4',
      supportedSpeeds: '3200 MT/s',
      currentOccupancy: 'OCCUPIED',
      installedComponentSummary: '8GB DDR4-3200 SO-DIMM (Factory OEM)',
      isSoldered: false,
      maxCapacityPerSlotGb: 16,
      maxTotalSystemCapacityGb: 32,
      requiresReplacement: true,
      bootSupported: true,
    },
  });

  const slotApex15G2Ram2 = await prisma.upgradeTarget.create({
    data: {
      id: 'target-apex-15-ram-2',
      laptopId: laptopApex15G2.id,
      identifier: 'RAM Slot 2 (Secondary - Free Expansion)',
      slotType: 'RAM',
      formFactor: 'DDR4 SO-DIMM',
      ddrGeneration: 'DDR4',
      supportedSpeeds: '3200 MT/s',
      currentOccupancy: 'AVAILABLE',
      installedComponentSummary: null,
      isSoldered: false,
      maxCapacityPerSlotGb: 16,
      maxTotalSystemCapacityGb: 32,
      requiresReplacement: false,
      bootSupported: true,
    },
  });

  const bayApex15G2Ssd1 = await prisma.upgradeTarget.create({
    data: {
      id: 'target-apex-15-ssd-1',
      laptopId: laptopApex15G2.id,
      identifier: 'M.2 Bay 1 (Primary OS Drive)',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 3.0 x4',
      currentOccupancy: 'OCCUPIED',
      installedComponentSummary: '256GB PCIe 3.0 NVMe SSD',
      isSoldered: false,
      requiresReplacement: true,
      clearanceNotes: 'Single-sided M.2 modules only. Clearance to bottom chassis is 1.8mm.',
      bootSupported: true,
    },
  });

  // Apex Pro 16 Targets
  const slotApexProSoldered = await prisma.upgradeTarget.create({
    data: {
      id: 'target-apex-pro-ram-soldered',
      laptopId: laptopApexPro16.id,
      identifier: 'Onboard LPDDR5 Memory (Soldered)',
      slotType: 'RAM',
      formFactor: 'LPDDR5 Soldered',
      ddrGeneration: 'LPDDR5',
      supportedSpeeds: '6400 MT/s',
      currentOccupancy: 'OCCUPIED',
      installedComponentSummary: '32GB LPDDR5-6400 BGA Package',
      isSoldered: true,
      solderedCapacityGb: 32,
      requiresReplacement: false,
      bootSupported: true,
    },
  });

  const bayApexProSsd2 = await prisma.upgradeTarget.create({
    data: {
      id: 'target-apex-pro-ssd-2',
      laptopId: laptopApexPro16.id,
      identifier: 'M.2 Bay 2 (Secondary Storage Slot)',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 4.0 x4',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      requiresReplacement: false,
      hardwareNotes: 'Requires auxiliary mounting bracket and screw kit P/N BRK-8820 (not factory installed)',
      clearanceNotes: 'Single-sided modules only. Maximum underside clearance 1.5mm.',
      bootSupported: true,
    },
  });

  // TerraBook 14 Hybrid
  const slotTerraHybrid = await prisma.upgradeTarget.create({
    data: {
      id: 'target-terra-ram-hybrid',
      laptopId: laptopTerra14Hybrid.id,
      identifier: 'SO-DIMM Slot 1 (Expansion Slot)',
      slotType: 'RAM',
      formFactor: 'DDR4 SO-DIMM',
      ddrGeneration: 'DDR4',
      supportedSpeeds: '3200 MT/s',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      solderedCapacityGb: 8,
      maxCapacityPerSlotGb: 16,
      maxTotalSystemCapacityGb: 24, // 8GB soldered + 16GB max = 24GB
      requiresReplacement: false,
      bootSupported: true,
    },
  });

  // ChronoBook 13 Short Bay
  const bayChronoShort = await prisma.upgradeTarget.create({
    data: {
      id: 'target-chrono-ssd-short',
      laptopId: laptopChrono13.id,
      identifier: 'M.2 Bay 1 (Internal WWAN/SSD Standoff)',
      slotType: 'SSD',
      formFactor: 'M.2 2242',
      supportedLengths: '2230,2242',
      protocolSupported: 'PCIe NVMe',
      pcieGenLanes: 'PCIe 3.0 x2',
      currentOccupancy: 'OCCUPIED',
      installedComponentSummary: '256GB M.2 2242 NVMe SSD',
      isSoldered: false,
      requiresReplacement: true,
      bootSupported: true,
    },
  });

  // WorkStation 17 Targets
  const slotWs17Ram1 = await prisma.upgradeTarget.create({
    data: {
      id: 'target-ws17-ram-1',
      laptopId: laptopWorkStation17.id,
      identifier: 'DDR5 SO-DIMM Slot 1 (Channel A)',
      slotType: 'RAM',
      formFactor: 'DDR5 SO-DIMM',
      ddrGeneration: 'DDR5',
      supportedSpeeds: '4800 MT/s, 5600 MT/s',
      currentOccupancy: 'AVAILABLE',
      isSoldered: false,
      maxCapacityPerSlotGb: 32, // Verified safe limit, though manual claims 64GB
      maxTotalSystemCapacityGb: 128,
      requiresReplacement: false,
      bootSupported: true,
    },
  });

  // AeroLite 14 SATA Target
  const bayAeroLiteSata = await prisma.upgradeTarget.create({
    data: {
      id: 'target-aerolite-sata',
      laptopId: laptopAeroLite14Legacy.id,
      identifier: 'M.2 Bay 1 (SATA III Only)',
      slotType: 'SSD',
      formFactor: 'M.2 2280',
      supportedLengths: '2280',
      protocolSupported: 'SATA III',
      currentOccupancy: 'OCCUPIED',
      installedComponentSummary: '128GB M.2 SATA III SSD',
      isSoldered: false,
      requiresReplacement: true,
      bootSupported: true,
    },
  });

  // EdgeBook 15 Unknown Occupancy Target
  const slotEdgeUnknown = await prisma.upgradeTarget.create({
    data: {
      id: 'target-edge-ram-unknown',
      laptopId: laptopEdge15Unknown.id,
      identifier: 'RAM Slot 2 (Unverified Occupancy)',
      slotType: 'RAM',
      formFactor: 'DDR4 SO-DIMM',
      ddrGeneration: 'DDR4',
      supportedSpeeds: '3200 MT/s',
      currentOccupancy: 'UNKNOWN',
      isSoldered: false,
      maxCapacityPerSlotGb: null, // Unknown
      maxTotalSystemCapacityGb: null, // Unknown
      requiresReplacement: false,
      bootSupported: true,
    },
  });

  // 3. Seed Parts
  const parts = [
    {
      id: 'part-pf-d4-8g',
      category: 'RAM',
      manufacturer: 'ProForma',
      partNumber: 'PF-D4-3200-8G',
      name: 'ProForma 8GB DDR4-3200 SO-DIMM',
      formFactor: 'SO-DIMM',
      capacityGb: 8,
      ddrGen: 'DDR4',
      speedMt: 3200,
      voltage: '1.2V',
      pinCount: 260,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'Standard JEDEC non-ECC unbuffered laptop module.',
      isSynthetic: true,
    },
    {
      id: 'part-pf-d4-16g',
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
      notes: 'Standard 1Rx8 high-density JEDEC DDR4 module.',
      isSynthetic: true,
    },
    {
      id: 'part-pf-d4-32g',
      category: 'RAM',
      manufacturer: 'ProForma',
      partNumber: 'PF-D4-3200-32G',
      name: 'ProForma 32GB DDR4-3200 SO-DIMM',
      formFactor: 'SO-DIMM',
      capacityGb: 32,
      ddrGen: 'DDR4',
      speedMt: 3200,
      voltage: '1.2V',
      pinCount: 260,
      isDoubleSided: true,
      heatsinkIncluded: false,
      notes: 'High-density 2Rx8 32GB module. Requires dual-rank memory controller support.',
      isSynthetic: true,
    },
    {
      id: 'part-pf-d5-16g',
      category: 'RAM',
      manufacturer: 'ProForma',
      partNumber: 'PF-D5-4800-16G',
      name: 'ProForma 16GB DDR5-4800 SO-DIMM',
      formFactor: 'SO-DIMM',
      capacityGb: 16,
      ddrGen: 'DDR5',
      speedMt: 4800,
      voltage: '1.1V',
      pinCount: 262,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'Standard DDR5 SO-DIMM with integrated on-die ECC and PMIC.',
      isSynthetic: true,
    },
    {
      id: 'part-pf-d5-32g',
      category: 'RAM',
      manufacturer: 'ProForma',
      partNumber: 'PF-D5-5600-32G',
      name: 'ProForma 32GB DDR5-5600 SO-DIMM',
      formFactor: 'SO-DIMM',
      capacityGb: 32,
      ddrGen: 'DDR5',
      speedMt: 5600,
      voltage: '1.1V',
      pinCount: 262,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'High-speed 5600 MT/s DDR5 module.',
      isSynthetic: true,
    },
    {
      id: 'part-pf-d5-64g',
      category: 'RAM',
      manufacturer: 'ProForma',
      partNumber: 'PF-D5-5600-64G',
      name: 'ProForma 64GB DDR5-5600 SO-DIMM',
      formFactor: 'SO-DIMM',
      capacityGb: 64,
      ddrGen: 'DDR5',
      speedMt: 5600,
      voltage: '1.1V',
      pinCount: 262,
      isDoubleSided: true,
      heatsinkIncluded: false,
      notes: 'Ultra-density 64GB single SO-DIMM module. Subject to firmware training timeouts on early BIOS revisions.',
      isSynthetic: true,
    },
    {
      id: 'part-ht-nvme-g3-1t',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-G3-1T',
      name: 'HyperionTech Horizon 1TB PCIe 3.0 NVMe SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 3.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'Standard single-sided M.2 2280 PCIe 3.0 drive. Speeds up to 3400 MB/s.',
      isSynthetic: true,
    },
    {
      id: 'part-ht-nvme-g4-1t',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-G4-1T',
      name: 'HyperionTech Apex 1TB PCIe 4.0 NVMe SSD',
      formFactor: 'M.2 2280',
      capacityGb: 1000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 4.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'PCIe 4.0 x4 ultra-fast SSD (7,100 MB/s). Backwards compatible with PCIe 3.0 slots at reduced speed.',
      isSynthetic: true,
    },
    {
      id: 'part-ht-nvme-g4-2t-ds',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-G4-2T-DS',
      name: 'HyperionTech Apex 2TB PCIe 4.0 NVMe SSD (Double-Sided)',
      formFactor: 'M.2 2280',
      capacityGb: 2000,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 4.0 x4',
      moduleLengthMm: 80,
      isDoubleSided: true,
      heatsinkIncluded: false,
      notes: 'Double-sided PCB with NAND chips soldered on both sides. Requires 2.5mm underside clearance.',
      isSynthetic: true,
    },
    {
      id: 'part-ht-nvme-2242-512g',
      category: 'SSD',
      manufacturer: 'HyperionTech',
      partNumber: 'HT-NVME-2242-512G',
      name: 'HyperionTech Nano 512GB M.2 2242 NVMe SSD',
      formFactor: 'M.2 2242',
      capacityGb: 512,
      protocol: 'PCIe NVMe',
      pcieGen: 'PCIe 3.0 x2',
      moduleLengthMm: 42,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'Compact 42mm M.2 form factor designed for ultra-compact laptops and WWAN slots.',
      isSynthetic: true,
    },
    {
      id: 'part-zb-sata-m2-500g',
      category: 'SSD',
      manufacturer: 'ZenithByte',
      partNumber: 'ZB-SATA-M2-500G',
      name: 'ZenithByte Classic 500GB M.2 SATA III SSD',
      formFactor: 'M.2 2280',
      capacityGb: 500,
      protocol: 'SATA III',
      moduleLengthMm: 80,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'M.2 SATA III (B+M key). Does NOT function in PCIe NVMe-only slots.',
      isSynthetic: true,
    },
    {
      id: 'part-zb-sata-25-1t',
      category: 'SSD',
      manufacturer: 'ZenithByte',
      partNumber: 'ZB-SATA-25-1T',
      name: 'ZenithByte 1TB 2.5" 7mm SATA III Internal SSD',
      formFactor: '2.5-inch SATA',
      capacityGb: 1000,
      protocol: 'SATA III',
      moduleLengthMm: null,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'Standard 2.5-inch 7mm SATA III drive for traditional laptop drive bays.',
      isSynthetic: true,
    },
    {
      id: 'part-generic-seller-claim',
      category: 'RAM',
      manufacturer: 'MarketFit Unbranded',
      partNumber: 'MF-UNIVERSAL-16G',
      name: 'MarketFit Universal 16GB Notebook Memory (Seller Listing)',
      formFactor: 'SO-DIMM',
      capacityGb: 16,
      ddrGen: 'DDR4',
      speedMt: 3200,
      voltage: '1.2V',
      pinCount: 260,
      isDoubleSided: false,
      heatsinkIncluded: false,
      notes: 'Third party marketplace listing. Seller claims universal fit for all ApexVolt and Nexura laptops without citations.',
      isSynthetic: true,
    },
  ];

  for (const p of parts) {
    await prisma.part.create({ data: p });
  }

  // 4. Seed Evidence Records
  const ev1 = await prisma.evidence.create({
    data: {
      id: 'ev-apex15-manual-ram',
      evidenceType: 'SERVICE_MANUAL',
      sourceTitle: 'ApexBook 15 Gen 2 Hardware Maintenance Manual (Section 4.1)',
      excerpt: 'The system board features two DDR4 SO-DIMM sockets supporting DDR4-3200 non-ECC unbuffered modules up to 16GB per socket, for a maximum system total of 32GB.',
      exactClaim: 'ApexBook 15 Gen 2 supports up to 16GB DDR4-3200 per SO-DIMM slot.',
      applicableVariantId: laptopApex15G2.id,
      applicableTargetSlotId: slotApex15G2Ram2.id,
      submitterName: 'Lead Specification Engineer',
      submitterRole: 'REVIEWER',
      reviewStatus: 'APPROVED',
      reviewRationale: 'Direct citation from OEM engineering maintenance manual v2.1.',
      reviewedBy: 'Jordan Vance (Spec Reviewer)',
      reviewedAt: new Date('2023-01-20'),
      isSynthetic: true,
    },
  });

  const ev2 = await prisma.evidence.create({
    data: {
      id: 'ev-apex15-test-ram16g',
      evidenceType: 'TEST_OBSERVATION',
      sourceTitle: 'Hardware Lab Empirical Bench Test #T-1049',
      excerpt: 'Installed ProForma 16GB DDR4-3200 module (PF-D4-3200-16G) into empty secondary slot. Cold boot passed POST; MemTest86 executed 4 full passes with 0 errors. Total system memory reported: 24GB (8GB factory + 16GB expansion) at 3200 MT/s.',
      exactClaim: 'PF-D4-3200-16G successfully tested and boots stably in Slot 2 of ApexBook 15 Gen 2.',
      applicableVariantId: laptopApex15G2.id,
      applicablePartId: 'part-pf-d4-16g',
      applicableTargetSlotId: slotApex15G2Ram2.id,
      submitterName: 'Alex Chen (Senior Hardware Technician)',
      submitterRole: 'TECHNICIAN',
      reviewStatus: 'APPROVED',
      reviewRationale: 'Lab bench test with diagnostic serial output and MemTest86 log attached.',
      reviewedBy: 'Jordan Vance (Spec Reviewer)',
      reviewedAt: new Date('2023-02-14'),
      isSynthetic: true,
    },
  });

  // Attach Test Observation to ev2
  await prisma.testObservation.create({
    data: {
      id: 'obs-apex15-ram16g',
      laptopId: laptopApex15G2.id,
      partId: 'part-pf-d4-16g',
      targetSlotId: slotApex15G2Ram2.id,
      biosVersion: 'v1.12',
      outcome: 'BOOT_STABLE',
      testProcedure: 'Inserted module into Slot 2. Executed cold boot, entered UEFI setup, verified SPD timings, completed 4-pass MemTest86.',
      observedLimitations: 'None. Memory trained immediately at 3200 MT/s CL22.',
      evidenceId: ev2.id,
    },
  });

  // Conflicting evidence scenario on VanguardSys WS17
  const evWs17Manual = await prisma.evidence.create({
    data: {
      id: 'ev-ws17-manual-spec',
      evidenceType: 'MANUFACTURER_SPEC',
      sourceTitle: 'VanguardSys WS17 Preliminary Product Specification (Doc #WS17-SPEC-R1)',
      excerpt: 'Four DDR5 SO-DIMM slots support high-density 64GB DDR5-5600 modules for a theoretical ceiling of 256GB RAM.',
      exactClaim: 'Platform supports 64GB DDR5-5600 modules per slot.',
      applicableVariantId: laptopWorkStation17.id,
      applicableTargetSlotId: slotWs17Ram1.id,
      submitterName: 'VanguardSys Marketing / Spec Sheet',
      submitterRole: 'BUYER',
      reviewStatus: 'APPROVED',
      reviewRationale: 'Approved based on preliminary published manufacturer spec sheet.',
      reviewedBy: 'Jordan Vance (Spec Reviewer)',
      reviewedAt: new Date('2023-03-01'),
      isSynthetic: true,
    },
  });

  const evWs17BenchFail = await prisma.evidence.create({
    data: {
      id: 'ev-ws17-bench-fail',
      evidenceType: 'TEST_OBSERVATION',
      sourceTitle: 'Field Service Verification Test #WS17-FAIL-08',
      excerpt: 'Installed ProForma 64GB DDR5-5600 module (PF-D5-5600-64G) in Slot 1. System power LED blinked amber 5 times (POST memory training failure). Unit failed to enter BIOS. Tested across 3 motherboard samples with firmware v1.04.',
      exactClaim: 'PF-D5-5600-64G fails to POST on VanguardSys WS17 running BIOS v1.04.',
      applicableVariantId: laptopWorkStation17.id,
      applicablePartId: 'part-pf-d5-64g',
      applicableTargetSlotId: slotWs17Ram1.id,
      submitterName: 'Alex Chen (Senior Hardware Technician)',
      submitterRole: 'TECHNICIAN',
      reviewStatus: 'APPROVED',
      reviewRationale: 'Reproducible hardware failure log verified. Conflict flag raised against preliminary OEM claim.',
      reviewedBy: 'Jordan Vance (Spec Reviewer)',
      reviewedAt: new Date('2023-03-15'),
      isSynthetic: true,
      isDisputed: true,
      disputeNotes: 'Direct conflict between OEM preliminary specification (claiming 64GB module support) and technician bench tests showing NO_POST on BIOS v1.04.',
    },
  });

  await prisma.testObservation.create({
    data: {
      id: 'obs-ws17-64g-fail',
      laptopId: laptopWorkStation17.id,
      partId: 'part-pf-d5-64g',
      targetSlotId: slotWs17Ram1.id,
      biosVersion: 'v1.04',
      outcome: 'NO_POST',
      testProcedure: 'Installed single 64GB DDR5 module in Channel A Slot 1. Disconnected battery and AC, performed 30-minute CMOS drain, powered on.',
      observedLimitations: '5 amber blinks error code; memory training timeout after 180 seconds.',
      evidenceId: evWs17BenchFail.id,
    },
  });

  // Seller Listing Evidence alone (Scenario 15)
  const evSellerClaim = await prisma.evidence.create({
    data: {
      id: 'ev-seller-listing-apex15',
      evidenceType: 'SELLER_LISTING',
      sourceTitle: 'Online Marketplace Seller Listing: "100% Guaranteed Fit For ApexBook Series"',
      sourceUrl: 'https://demo.fitproof.internal/marketplace-seller-listing-9842',
      excerpt: 'Guaranteed compatible with all ApexBook and Nexura laptops. Just plug and play!',
      exactClaim: 'Seller claims part MF-UNIVERSAL-16G fits all ApexBook models.',
      applicableVariantId: laptopApex15G2.id,
      applicablePartId: 'part-generic-seller-claim',
      applicableTargetSlotId: slotApex15G2Ram2.id,
      submitterName: 'Web Scraper / Third Party',
      submitterRole: 'BUYER',
      reviewStatus: 'APPROVED',
      reviewRationale: 'Recorded as unverified seller assertion for demonstration.',
      reviewedBy: 'Jordan Vance (Spec Reviewer)',
      reviewedAt: new Date('2023-04-01'),
      isSynthetic: true,
    },
  });

  // Pending Evidence (Technician submission waiting for review)
  const evPending = await prisma.evidence.create({
    data: {
      id: 'ev-pending-terrabook-test',
      evidenceType: 'TEST_OBSERVATION',
      sourceTitle: 'Community Lab Test: TerraBook 14 with 16GB Module',
      sourceUrl: null,
      excerpt: 'Tested 16GB module in TerraBook 14 expansion slot. Boots clean in Linux 6.8 kernel.',
      exactClaim: 'PF-D4-3200-16G works in Nexura TerraBook 14 expansion slot for 24GB total.',
      applicableVariantId: laptopTerra14Hybrid.id,
      applicablePartId: 'part-pf-d4-16g',
      applicableTargetSlotId: slotTerraHybrid.id,
      submitterName: 'Alex Chen (Senior Hardware Technician)',
      submitterRole: 'TECHNICIAN',
      reviewStatus: 'PENDING',
      isSynthetic: true,
    },
  });

  // 5. Seed Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      entityType: 'System',
      entityId: 'seed-initial',
      actorName: 'System Seeder',
      actorRole: 'SYSTEM_SYNTHETIC',
      details: 'Initialized 8 synthetic laptop models, 13 parts, and 5 baseline evidence records.',
    },
  });

  console.log('FitProof synthetic demonstration database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

