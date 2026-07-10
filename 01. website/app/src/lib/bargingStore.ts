import { useCallback, useState } from "react";

// Client-only, localStorage-backed data layer for the Barging Process module —
// mirrors index.html's getWebData()/saveWebData() pattern (no backend for this
// module, matching the reference POC) so Create/List/Detail all share one
// source of truth instead of isolated per-page mock state.

export type DocStatus = "Planned" | "Arrived" | "Open" | "On Progress" | "Closed" | "Departed" | "Invalid";

export interface ExcaEntry {
  code: string;
  model: string;
  bucket: number;
  assignedArea: string;
  status: "available" | "breakdown";
}

export interface DtPayload {
  bucketCount: number | "-";
  tonnage: number;
  fromTruck?: string;
}

export interface DtEntry {
  code: string;
  plate: string;
  capacity: number;
  route: "scheduled" | "unscheduled";
  assignedArea: string;
  status: "available" | "loaded" | "breakdown" | "transfer";
  payload?: DtPayload;
  transferTo?: string;
}

export interface BreakdownEvent {
  id: string;
  type: "dt_breakdown" | "exca_breakdown" | "exca_recover" | "dt_recovery";
  timestamp: string;
  unit?: string;
  fromTruck?: string;
  toTruck?: string;
  bucketCount?: number | "-";
  tonnage?: number;
  note?: string;
}

export interface ExcaSummaryEntry {
  code: string;
  ritase: number;
}

export interface ShiftRecord {
  shift: string;
  date: string;
  ritase: number;
  tonnage: number;
  excaSummary: ExcaSummaryEntry[];
}

export interface BargingDocument {
  id: string;
  createdDate: string;
  area: string;
  barge: string;
  material: string;
  materialDensity: number;
  targetTonase: number;
  surveyor: string;
  spv: string;
  status: DocStatus;
  eta: string;
  ata: string;
  invalidReason: string;
  openChecklist: { notify: boolean; ramp: boolean; excaEnter: boolean };
  closeChecklist: { bargeInfo: boolean; closeBarge: boolean; finalDraft: boolean };
  finalTonnage: number | null;
  excavators: ExcaEntry[];
  dumpTrucks: DtEntry[];
  // Ritase/tonnage synced from the Operator App — populated only via the "Refresh"
  // action (simulateRitase() in index.html), never entered manually.
  simulatedRitase: number;
  simulatedTonnage: number;
  shiftHistory: ShiftRecord[];
  breakdownEvents: BreakdownEvent[];
}

// Statuses that block creating a new document for the same barge — matches
// createDocument()'s ACTIVE list in index.html.
export const ACTIVE_STATUSES: DocStatus[] = ["Planned", "Arrived", "Open", "On Progress", "Closed"];

// Create-form option lists, matching index.html's #page-create <select> options exactly.
export const CREATE_AREAS = ["Jetty F", "Jetty G", "Jetty H"];
export const CREATE_BARGES = [
  { name: "SEA TITAN", label: "SEA TITAN (5.000 MT)" },
  { name: "RIVER KING", label: "RIVER KING (3.500 MT)" },
  { name: "OCEAN BLUE", label: "OCEAN BLUE (4.000 MT)" },
];
export const MATERIAL_DENSITY: Record<string, number> = { Coal: 1.2, Nickel: 1.6 };

// Excavators assigned to these areas count toward the live shift's ritase breakdown —
// matches AREAS_LOADING in index.html.
export const AREAS_LOADING = ["EFO A", "EFO B", "Stockpile A"];

export function getRitaseCount(doc: BargingDocument): number {
  return doc.simulatedRitase || 0;
}

export function getAccumulatedTonnage(doc: BargingDocument): number {
  return doc.simulatedTonnage || 0;
}

const STORAGE_KEY = "bargingSystem_react_v1";

function seedDocuments(): BargingDocument[] {
  const closedOpenChecklist = { notify: true, ramp: true, excaEnter: true };
  const emptyCloseChecklist = { bargeInfo: false, closeBarge: false, finalDraft: false };
  const doneCloseChecklist = { bargeInfo: true, closeBarge: true, finalDraft: true };
  const samplePopulation = (area: string) => ({
    excavators: [
      { code: "EX-001", model: "Hitachi PC200", bucket: 1.6, assignedArea: "EFO A", status: "available" as const },
      { code: "EX-003", model: "Caterpillar 320", bucket: 1.2, assignedArea: "EFO B", status: "available" as const },
    ],
    dumpTrucks: [
      { code: "DT-01", plate: "B 1234 ABC", capacity: 10, route: "scheduled" as const, assignedArea: area, status: "available" as const },
      { code: "DT-02", plate: "B 5678 DEF", capacity: 12, route: "scheduled" as const, assignedArea: area, status: "available" as const },
      { code: "DT-03", plate: "B 9012 GHI", capacity: 15, route: "unscheduled" as const, assignedArea: area, status: "available" as const },
    ],
  });
  const sampleShiftHistory = (date: string, ritaseScale: number): ShiftRecord[] => [
    { shift: "Pagi", date, ritase: Math.round(28 * ritaseScale), tonnage: Math.round(526.4 * ritaseScale * 10) / 10,
      excaSummary: [{ code: "EX-001", ritase: Math.round(16 * ritaseScale) }, { code: "EX-003", ritase: Math.round(12 * ritaseScale) }] },
    { shift: "Malam", date, ritase: Math.round(22 * ritaseScale), tonnage: Math.round(413.6 * ritaseScale * 10) / 10,
      excaSummary: [{ code: "EX-001", ritase: Math.round(13 * ritaseScale) }, { code: "EX-003", ritase: Math.round(9 * ritaseScale) }] },
  ];

  return [
    {
      id: "BRG-001", createdDate: "2026-05-28", area: "Jetty Timur", barge: "SEA TITAN",
      material: "Coal (GAR 4200)", materialDensity: 1.2, targetTonase: 5000,
      surveyor: "PT. Sucofindo", spv: "Budi Santoso", status: "Planned",
      eta: "", ata: "", invalidReason: "",
      openChecklist: { notify: false, ramp: false, excaEnter: false }, closeChecklist: emptyCloseChecklist,
      finalTonnage: null, excavators: [], dumpTrucks: [],
      simulatedRitase: 0, simulatedTonnage: 0, shiftHistory: [], breakdownEvents: [],
    },
    {
      id: "BRG-002", createdDate: "2026-05-28", area: "Jetty Barat", barge: "RIVER KING",
      material: "Coal (GAR 4200)", materialDensity: 1.3, targetTonase: 3500,
      surveyor: "PT. Sucofindo", spv: "Budi Santoso", status: "Arrived",
      eta: "2026-05-28T08:00", ata: "2026-05-28T09:30", invalidReason: "",
      openChecklist: { notify: false, ramp: false, excaEnter: false }, closeChecklist: emptyCloseChecklist,
      finalTonnage: null, excavators: [], dumpTrucks: [],
      simulatedRitase: 0, simulatedTonnage: 0, shiftHistory: [], breakdownEvents: [],
    },
    {
      id: "BRG-003", createdDate: "2026-05-29", area: "Jetty Timur", barge: "OCEAN BLUE",
      material: "Coal (GAR 4200)", materialDensity: 1.2, targetTonase: 4000,
      surveyor: "PT. Sucofindo", spv: "Budi Santoso", status: "Open",
      eta: "2026-05-29T08:00", ata: "2026-05-29T09:15", invalidReason: "",
      openChecklist: closedOpenChecklist, closeChecklist: emptyCloseChecklist,
      finalTonnage: null, excavators: [], dumpTrucks: [],
      simulatedRitase: 0, simulatedTonnage: 0, shiftHistory: [], breakdownEvents: [],
    },
    {
      id: "BRG-004", createdDate: "2026-05-30", area: "Jetty Timur", barge: "PACIFIC STAR",
      material: "Coal (GAR 4200)", materialDensity: 1.4, targetTonase: 4500,
      surveyor: "PT. Sucofindo", spv: "Budi Santoso", status: "On Progress",
      eta: "2026-05-30T08:00", ata: "2026-05-30T09:20", invalidReason: "",
      openChecklist: closedOpenChecklist, closeChecklist: emptyCloseChecklist,
      finalTonnage: null, ...samplePopulation("Jetty Timur"),
      simulatedRitase: 0, simulatedTonnage: 0, shiftHistory: sampleShiftHistory("29/05/2026", 1),
      breakdownEvents: [],
    },
    {
      id: "BRG-005", createdDate: "2026-05-24", area: "Jetty Barat", barge: "IRON DUKE",
      material: "Coal (GAR 4200)", materialDensity: 1.2, targetTonase: 3800,
      surveyor: "PT. Sucofindo", spv: "Budi Santoso", status: "Closed",
      eta: "2026-05-24T08:00", ata: "2026-05-24T09:10", invalidReason: "",
      openChecklist: closedOpenChecklist, closeChecklist: doneCloseChecklist,
      finalTonnage: null, ...samplePopulation("Jetty Barat"),
      simulatedRitase: 6, simulatedTonnage: 112.5, shiftHistory: sampleShiftHistory("23/05/2026", 0.85),
      breakdownEvents: [],
    },
    {
      id: "BRG-006", createdDate: "2026-05-20", area: "Jetty Timur", barge: "GOLDEN BAY",
      material: "Coal (GAR 4200)", materialDensity: 1.3, targetTonase: 5200,
      surveyor: "PT. Sucofindo", spv: "Budi Santoso", status: "Departed",
      eta: "2026-05-20T08:00", ata: "2026-05-20T09:05", invalidReason: "",
      openChecklist: closedOpenChecklist, closeChecklist: doneCloseChecklist,
      finalTonnage: 1890, ...samplePopulation("Jetty Timur"),
      simulatedRitase: 8, simulatedTonnage: 148.0, shiftHistory: sampleShiftHistory("19/05/2026", 1.05),
      breakdownEvents: [],
    },
  ];
}

function readStore(): BargingDocument[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BargingDocument[];
  } catch {
    // corrupt storage — fall through to reseed
  }
  const seeded = seedDocuments();
  writeStore(seeded);
  return seeded;
}

function writeStore(docs: BargingDocument[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function nextDocId(docs: BargingDocument[]): string {
  const maxSeq = docs.reduce((max, d) => {
    const match = /^BRG-(\d+)$/.exec(d.id);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `BRG-${String(maxSeq + 1).padStart(3, "0")}`;
}

export function useBargingDocuments() {
  const [documents, setDocuments] = useState<BargingDocument[]>(() => readStore());

  const addDocument = useCallback((doc: BargingDocument) => {
    setDocuments(prev => {
      const next = [...prev, doc];
      writeStore(next);
      return next;
    });
  }, []);

  const updateDocument = useCallback((id: string, patch: Partial<BargingDocument> | ((doc: BargingDocument) => Partial<BargingDocument>)) => {
    setDocuments(prev => {
      const next = prev.map(d => (d.id === id ? { ...d, ...(typeof patch === "function" ? patch(d) : patch) } : d));
      writeStore(next);
      return next;
    });
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const next = prev.filter(d => d.id !== id);
      writeStore(next);
      return next;
    });
  }, []);

  return { documents, addDocument, updateDocument, removeDocument };
}
