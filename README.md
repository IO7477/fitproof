# FitProof — Evidence-Backed Laptop RAM & SSD Compatibility Checker

> **Prototype Notice:** All initial catalog records use fictional brands (*ApexVolt*, *Nexura*, *VanguardSys*, *ZenithByte*, *ProForma*, *HyperionTech*) and clearly synthetic data. FitProof strictly adheres to non-fabrication invariants: no real manufacturer service manuals or credentials are simulated, and absence of failure is never equated with compatibility.

---

## 1. Overview & Core Philosophy

People buying laptop RAM or SSD upgrades frequently encounter product listings that appear compatible but lack critical hardware details. A laptop family name, matching physical connector, or seller claim is not proof of compatibility.

FitProof answers the fundamental question:
> **"Does this exact part fit this exact laptop configuration, what evidence supports that conclusion, and what remains unknown?"**

### Deterministic Compatibility Engine
FitProof implements a pure, deterministic rules engine (`src/lib/engine/compatibility.ts`) that separates:
1. **Physical Compatibility**: Form factors (SO-DIMM vs desktop DIMM; M.2 2280 vs 2242/2230 standoffs), single-sided vs double-sided PCB clearance, heatsink height.
2. **Electrical & Interface Compatibility**: DDR generation signaling (DDR4 1.2V vs DDR5 1.1V; pinouts 260 vs 262), storage bus protocols (PCIe NVMe vs SATA III AHCI wiring).
3. **Documented Platform Support**: Per-slot module density limits, system-wide chipset ceilings, soldered + removable hybrid memory arithmetic, PCIe generation downclocking/bottlenecks.
4. **Installation Requirements**: Mandatory component replacement (occupied slots), auxiliary mounting brackets/screws (e.g. bracket BRK-8820).
5. **Traceable Evidence & Conflict Resolution**: Conflicting evidence detection (e.g. manual claims support, but verified test records `NO_POST`), rejection of unverified marketplace seller claims.

---

## 2. Five Deterministic Verdict Statuses

| Status | Icon / Color | Meaning | Example Scenario |
| :--- | :--- | :--- | :--- |
| **`SUPPORTED`** | Green (CheckCircle) | Available reviewed evidence supports the upgrade with no unresolved conflicts. Backed by documented OEM maintenance specs or exact empirical bench tests. | ApexBook 15 Gen 2 + ProForma 16GB DDR4 SO-DIMM in open Slot 2. |
| **`CONDITIONAL`** | Amber (AlertTriangle) | Support is verified but subject to an explicit, stated condition (e.g., replacing an occupied component, procuring a mounting bracket, or operating at downclocked speed). | ApexBook Pro 16 + HyperionTech PCIe 4.0 SSD in Bay 2 (requires bracket kit BRK-8820). |
| **`INCOMPATIBLE`** | Red (XCircle) | Reliable technical evidence establishes a blocking physical, electrical, or platform mismatch. Trumps unrelated unknown fields. | DDR5 module in DDR4 slot, M.2 SATA SSD in NVMe-only bay, or M.2 2280 drive in 2242-only bay. |
| **`INSUFFICIENT INFORMATION`** | Slate (HelpCircle) | A critical parameter or exact device identity remains unconfirmed. Provides an actionable next step rather than guessing. | ZenithByte EdgeBook 15 where slot occupancy or max RAM density is unconfirmed in OEM docs. |
| **`CONFLICTING EVIDENCE`** | Purple (AlertOctagon) | Verified evidence records contradict each other and require engineering escalation before approval. | VanguardSys WS17 spec sheet claims 64GB DDR5 support, but empirical bench test logs `NO_POST`. |

---

## 3. Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Dynamic Routes)
- **Language**: TypeScript 5 (Strict type checking enabled)
- **Styling**: Tailwind CSS (Accessible semantic colors, status pills with dual icon + text)
- **Database & ORM**: SQLite (`dev.db`) with Prisma ORM 5.22
- **Validation**: Zod schema validation on all inputs and server actions
- **Testing**: Vitest (Rule engine & End-to-End server workflow tests) & Playwright (Browser E2E)
- **Zero External Dependencies**: Runs 100% offline without live AI APIs, paid cloud services, or external database servers.

---

## 4. Local Setup & Quickstart Instructions

### Prerequisites
- Node.js `v18.18+` or `v20+` / `v22+`
- npm `v9+` or `v10+`

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database & Seed Synthetic Data
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 3. Run Automated Tests
```bash
# Run the 25 automated unit and end-to-end integration tests:
npm test
```

### 4. Build & Start the Application
```bash
# Start in development mode:
npm run dev

# Or build for production and launch:
npm run build
npm run start
```
Visit **`http://localhost:3000`** in your browser.

---

## 5. Five-Minute Presentation Walkthrough Script

### Step 1: Supported RAM Upgrade (`SUPPORTED`)
1. On the home page, click **"Start Compatibility Check"** (or click Preset Scenario 1).
2. **Step 1 (Identify Laptop):** Select **ApexVolt ApexBook 15 Gen 2** (`AB15-G2-INTEL`).
3. **Step 2 (Select Slot):** Select **RAM Slot 2 (Secondary - Free Expansion)**.
4. **Step 3 (Select Part):** Select **ProForma 16GB DDR4-3200 SO-DIMM** (`PF-D4-3200-16G`).
5. **View Assessment:**
   - Status: **`SUPPORTED`**
   - Verified Proof: Documented in official Hardware Maintenance Manual (Sec 4.1) and verified by Hardware Lab Bench Test #T-1049 (MemTest86 4 passes, 0 errors).
   - Shows all 4 passed checks: Physical form factor, DDR generation, operating speed, and per-slot capacity ceiling.

### Step 2: Plausible-Looking but Incompatible Part (`INCOMPATIBLE`)
1. Return to the checker or click Preset Scenario 2 on the home page.
2. Select **ApexBook 15 Gen 2**, **RAM Slot 2**, and candidate **ProForma 16GB DDR5-4800 SO-DIMM** (`PF-D5-4800-16G`).
3. **View Assessment:**
   - Status: **`INCOMPATIBLE`**
   - Plain-Language Explanation: *"DDR Generation Incompatible: Motherboard slot requires DDR4, but candidate module is DDR5. Pin counts (260 vs 262), keying notches, and operating voltages (1.2V vs 1.1V) are electrically and physically incompatible."*
   - Also note Scenario 7 (M.2 SATA drive inserted into NVMe-only bay) or Scenario 8 (80mm 2280 SSD inserted into 42mm-only bay).

### Step 3: Insufficient Information Result (`INSUFFICIENT INFORMATION`)
1. Select **ZenithByte EdgeBook 15** (`EB15-UNKNOWN-OCC`), slot **RAM Slot 2 (Unverified Occupancy)**, and part **PF-D4-3200-16G**.
2. **View Assessment:**
   - Status: **`INSUFFICIENT INFORMATION`**
   - Notice the prominent **Unknown Requirements Card**:
     - *Title:* Slot Occupancy Unconfirmed
     - *Specific Next Action:* *"Inspect Windows Task Manager (Performance tab) or open the chassis service panel to verify if this slot is empty before purchasing."*
   - FitProof refuses to assume the slot is empty or turn green without proof.

### Step 4: Technician Submission & Reviewer Moderation Flow
1. Use the **Demo Identity Switcher** in the top navigation bar to switch role from *Buyer* to **Technician (Alex Chen)**.
2. Navigate to **"Technician Desk"** (`/technician`).
3. Click **"Verification Queue"** to view catalog entries missing verified specs (e.g. EdgeBook 15).
4. On the submission form:
   - Select laptop **ChronoBook 13**, slot **M.2 Bay 1**, part **HT-NVME-2242-512G**.
   - Fill in bench test notes, select outcome **BOOT_STABLE**, confirm no serial numbers are included, check configuration acknowledgment, and click **"Submit Evidence"**.
5. Switch role to **Reviewer (Jordan Vance)** in the top navigation bar.
6. Navigate to **"Review Queue"** (`/reviewer`).
7. Inspect the technician's pending submission. Enter a required rationale: *"Bench test procedure and 2242 form factor physically verified against chassis schematic."*
8. Click **"Approve Evidence"**.
9. The evidence is immediately moved to the approved ledger, and any compatibility check using this pairing updates in real time!

---

## 6. Architecture Explanation

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   • Buyer Flow: Identify -> Slot Picker -> Part Picker      │
│   • Assessment View: Verdict, Checks, Unknowns, Citations   │
│   • Comparison Grid (Up to 3 candidates side-by-side)       │
│   • Printable High-Contrast Report                          │
│   • Technician Desk & Reviewer Moderation Queue             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Server Actions & Auth Layer                 │
│   • assertRole(['TECHNICIAN', 'REVIEWER'])                  │
│   • Zod Schema Validation (TechnicianSubmissionSchema)      │
│   • Revalidation Trigger (revalidatePath)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Deterministic Compatibility Engine (Pure TS)       │
│   • Function: assessCompatibility(laptop, slot, part, ev)   │
│   • Category & Soldered Check (Immediate INCOMPATIBLE)      │
│   • Physical Dimensions & Lengths (2230/2242/2280)          │
│   • Electrical & Protocol (DDR4 vs DDR5; NVMe vs SATA)      │
│   • Capacity & Ceilings (Per-slot and Hybrid System max)    │
│   • Conditions (Occupied replacement, Bracket kit needed)   │
│   • Evidence Conflict & Provenance Resolution               │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Persistence Layer (SQLite + Prisma)          │
│   • Laptop, UpgradeTarget, Part, Evidence, TestObservation  │
│   • AuditLog (Permanent moderation history)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Prototype Functionality vs. Production Requirements

| Area | FitProof Prototype Implementation | Production Requirement |
| :--- | :--- | :--- |
| **Authentication & Identity** | Client-accessible Demo Identity Switcher stored in cookie (`fitproof_demo_role`) with Buyer, Technician, and Reviewer accounts. | OIDC / OAuth 2.0 with Hardware Token 2FA (WebAuthn), RBAC permissions, and verified technician organization credentials. |
| **Data Provenance** | Synthetic fictional brands (*ApexVolt*, *Nexura*, etc.) and internal synthetic evidence pages (`/evidence/[id]`). | Verified OEM service manual ingestion pipeline, digital signature validation, and GS1 GTIN catalog synchronization. |
| **Privacy & PII Protection** | Strict form warnings and mandatory confirmation checkboxes forbidding serial numbers and MAC addresses. | Automated server-side regex and NER filtering to scrub serial numbers, IP/MAC addresses, and personal identifiable telemetry prior to persistence. |
| **Hardware Verification** | Manual bench test logging with BIOS version and MemTest pass count. | Integration with signed diagnostic agent reports (e.g., automated USB boot diagnostic output with cryptographic attestation). |
| **Persistence** | Local file-based SQLite database (`dev.db`). | High-availability PostgreSQL cluster with write-ahead replication and cryptographic audit ledger. |

---

## 8. Test Execution Evidence

All 25 tests pass with exit code 0:

```
 RUN  v2.1.9 C:/Users/zodia/Documents/VSCODE/Fitproof F

 ✓ src/lib/engine/__tests__/compatibility.test.ts (17 tests) 51ms
    ✓ Scenario 1: Supported RAM upgrade with documented evidence
    ✓ Scenario 2: DDR generation mismatch (DDR5 in DDR4 slot)
    ✓ Scenario 3: Permanently soldered memory without expansion sockets
    ✓ Scenario 4: Hybrid soldered + removable memory within platform limit
    ✓ Scenario 5: Per-slot or total system capacity limit exceeded
    ✓ Scenario 6: Unknown critical capacity information
    ✓ Scenario 7: M.2 SATA drive inserted into NVMe-only bay
    ✓ Scenario 8: M.2 2280 drive in 2230/2242-only bay
    ✓ Scenario 9: Supported SSD with PCIe generation performance limitation
    ✓ Scenario 10: Compatible replacement requiring occupied drive removal
    ✓ Scenario 11: Missing auxiliary mounting hardware (Bracket BRK-8820)
    ✓ Scenario 12: Unknown slot occupancy returning INSUFFICIENT_INFORMATION
    ✓ Scenario 13: Conflicting applicable evidence (Manual vs Bench Test failure)
    ✓ Scenario 14: Similar laptop family names with different requirements
    ✓ Scenario 15: Unsubstantiated seller listing returning INSUFFICIENT_INFO
    ✓ Invariant 16: Pending evidence ignored in published calculations
    ✓ Invariant 17: Known blocking mismatch trumps unrelated unknown fields

 ✓ src/lib/__tests__/e2e_workflow.test.ts (8 tests) 276ms
    ✓ E2E 1: Buyer completes a supported assessment
    ✓ E2E 2: Buyer encounters unknown occupancy and receives action steps
    ✓ E2E 3: Technician submits a bench test observation
    ✓ E2E 4: Pending evidence does not affect published assessment
    ✓ E2E 5: Unauthorized role cannot approve submissions
    ✓ E2E 6: Authorized Reviewer approves evidence with required rationale
    ✓ E2E 7: Published assessment immediately updates upon approval
    ✓ E2E 8: Data persists in SQLite database across transactions

 Test Files  2 passed (2)
      Tests  25 passed (25)
   Duration  3.47s
```

