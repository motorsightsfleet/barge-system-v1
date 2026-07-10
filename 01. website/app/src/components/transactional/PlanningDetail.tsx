import { ArrowLeft, Save, FileText, Check, Plus, X, Clock, Anchor, MapPin, Target, Layers, Truck, UserCircle, Briefcase, Activity, Calendar, ShieldCheck, ChevronRight, ChevronDown, TrendingUp, Play, Upload, CheckCircle2, AlertTriangle, Flag, Wrench, RotateCcw, History, ArrowRightLeft, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { Fragment, useEffect, useRef, useState } from "react";
import ActionModal from "../common/ActionModal";
import {
  ACTIVE_STATUSES,
  AREAS_LOADING,
  CREATE_AREAS,
  CREATE_BARGES,
  MATERIAL_DENSITY,
  getAccumulatedTonnage,
  getRitaseCount,
  nextDocId,
  useBargingDocuments,
  type BargingDocument,
} from "../../lib/bargingStore";

const ALL_EXCAS = [
  { code: "EX-001", model: "Hitachi PC200", bucket: 1.6 },
  { code: "EX-002", model: "Komatsu PC400", bucket: 2.4 },
  { code: "EX-003", model: "Caterpillar 320", bucket: 1.2 },
  { code: "EX-004", model: "Hitachi PC300", bucket: 2.0 },
];

const ALL_DT = [
  { code: "DT-01", plate: "B 1234 ABC", capacity: 10 },
  { code: "DT-02", plate: "B 5678 DEF", capacity: 12 },
  { code: "DT-03", plate: "B 9012 GHI", capacity: 15 },
  { code: "DT-04", plate: "B 3456 JKL", capacity: 10 },
  { code: "DT-05", plate: "B 7890 MNO", capacity: 8 },
];

const ALL_AREAS = ["EFO A", "EFO B", "Stockpile A", "Jetty F", "Jetty G", "Jetty H", "PIT", "ETO"];

const TimelineItem = ({ title, status, date, icon: Icon, isLast = false, children }: any) => {
  return (
    <div className="relative pl-12 pb-10 last:pb-0">
      {/* Vertical connector line */}
      {!isLast && (
        <div className={`absolute left-[19px] top-8 bottom-[-10px] w-[2px] transition-colors duration-500 ${
          status === 'completed' ? 'bg-[#5B5FC7]' : 'bg-gray-200'
        }`} />
      )}

      {/* Node Icon */}
      <div className="absolute left-0 top-1">
        {status === 'completed' && (
          <div className="w-10 h-10 rounded-full bg-[#5B5FC7] flex items-center justify-center z-10 relative shadow-md shadow-indigo-500/20 ring-4 ring-white">
            <Check className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
        )}
        {status === 'current' && (
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center z-10 relative shadow-sm ring-4 ring-white border-2 border-[#5B5FC7]">
            <div className="absolute inset-0 rounded-full animate-ping border-2 border-[#5B5FC7] opacity-20"></div>
            {Icon ? <Icon className="w-4 h-4 text-[#5B5FC7]" /> : <div className="w-3 h-3 rounded-full bg-[#5B5FC7]" />}
          </div>
        )}
        {status === 'upcoming' && (
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center z-10 relative ring-4 ring-white border-2 border-gray-200">
            {Icon ? <Icon className="w-4 h-4 text-gray-400" /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-[16px] font-bold ${
            status === 'current' ? 'text-[#5B5FC7]' :
            status === 'completed' ? 'text-gray-900' :
            'text-gray-400'
          }`}>{title}</h4>
          {date && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 text-[12px] font-medium text-gray-500 border border-gray-100">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
          )}
        </div>
        {children && (
          <div className="mt-4 flex flex-col gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ label, checked, onChange, disabled = false }: any) => (
  <div
    onClick={() => !disabled && onChange(!checked)}
    className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
      disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' :
      checked ? 'bg-gradient-to-r from-[#5B5FC7]/10 to-indigo-50/30 border-[#5B5FC7]/40 shadow-[0_2px_12px_rgba(91,95,199,0.06)]' :
      'bg-white border-gray-200 hover:border-[#5B5FC7]/60 hover:shadow-md hover:-translate-y-[2px] hover:bg-gray-50/30'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${
        checked ? 'bg-[#5B5FC7] border-[#5B5FC7] scale-110 shadow-sm shadow-indigo-500/30' : 'bg-white border-gray-300 group-hover:border-[#5B5FC7]/70'
      }`}>
        {checked && <Check className="w-4 h-4 text-white stroke-[3]" />}
      </div>
      <span className={`text-[14px] font-semibold transition-colors ${
        checked ? 'text-[#5B5FC7]' : 'text-gray-700 group-hover:text-gray-900'
      }`}>
        {label}
      </span>
    </div>
  </div>
);

export default function PlanningDetail() {
  const { id } = useParams();
  const isCreate = id === "create";
  const navigate = useNavigate();
  const { documents, addDocument, updateDocument } = useBargingDocuments();
  const doc = !isCreate ? documents.find(d => d.id === id) : undefined;

  // Document not found (e.g. deleted, or bad URL) — bounce back to the list, matching
  // index.html's renderDetail(): if (!doc) { goPage('planning'); return; }
  useEffect(() => {
    if (!isCreate && documents.length > 0 && !doc) {
      navigate("/transactional/operation", { replace: true });
    }
  }, [isCreate, doc, documents.length, navigate]);

  // ─── CREATE MODE ────────────────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    area: CREATE_AREAS[0],
    barge: CREATE_BARGES[0].name,
    material: "Coal",
    materialDensity: String(MATERIAL_DENSITY["Coal"]),
    targetTonase: "4500",
    eta: "",
    surveyor: "PT. Sucofindo",
    spv: "Budi Santoso",
  });
  const [createError, setCreateError] = useState("");
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);

  function handleMaterialChange(material: string) {
    setCreateForm(f => ({ ...f, material, materialDensity: String(MATERIAL_DENSITY[material] ?? 1.2) }));
  }

  function handleCreateDocument() {
    const dup = documents.find(d => d.barge === createForm.barge && ACTIVE_STATUSES.includes(d.status));
    if (dup) {
      setCreateError(`Barge "${createForm.barge}" masih memiliki dokumen aktif (${dup.id} — Status: ${dup.status}). Selesaikan atau hapus dokumen tersebut sebelum membuat yang baru.`);
      return;
    }
    setCreateError("");
    setShowCreateConfirm(true);
  }

  function confirmCreateDocument() {
    const newId = nextDocId(documents);
    const newDoc: BargingDocument = {
      id: newId,
      createdDate: new Date().toLocaleDateString("id-ID"),
      area: createForm.area,
      barge: createForm.barge,
      material: createForm.material,
      materialDensity: parseFloat(createForm.materialDensity) || 1.2,
      targetTonase: parseInt(createForm.targetTonase, 10) || 4500,
      surveyor: createForm.surveyor,
      spv: createForm.spv,
      status: "Planned",
      eta: createForm.eta,
      ata: "",
      invalidReason: "",
      openChecklist: { notify: false, ramp: false, excaEnter: false },
      closeChecklist: { bargeInfo: false, closeBarge: false, finalDraft: false },
      finalTonnage: null,
      excavators: [],
      dumpTrucks: [],
      simulatedRitase: 0,
      simulatedTonnage: 0,
      shiftHistory: [],
      breakdownEvents: [],
    };
    addDocument(newDoc);
    setShowCreateConfirm(false);
    setCreatedDocId(newId);
  }

  // ─── DETAIL MODE ────────────────────────────────────────────────────────
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidJustification, setInvalidJustification] = useState("");

  const status = doc?.status ?? "Planned";
  const invalidReason = doc?.invalidReason ?? "";
  const generalInfo = {
    area: doc?.area ?? "",
    barge: doc?.barge ?? "",
    material: doc?.material ?? "",
    surveyor: doc?.surveyor ?? "",
    targetTonase: doc?.targetTonase ?? 0,
    materialDensity: doc?.materialDensity ?? 1.2,
  };
  const population = {
    excavators: doc?.excavators ?? [],
    dumpTrucks: doc?.dumpTrucks ?? [],
    spv: doc?.spv ?? "",
  };
  const breakdownEvents = doc?.breakdownEvents ?? [];
  const shiftHistory = doc?.shiftHistory ?? [];
  const openChecks = doc?.openChecklist ?? { notify: false, ramp: false, excaEnter: false };
  const closingChecks = doc?.closeChecklist ?? { bargeInfo: false, closeBarge: false, finalDraft: false };

  // Arrival form — local draft until "Confirm Arrival" commits it to the document.
  const [eta, setEta] = useState("");
  const [ata, setAta] = useState("");
  useEffect(() => {
    if (doc) { setEta(doc.eta); setAta(doc.ata); }
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [breakdownModal, setBreakdownModal] = useState(false);
  const [breakdownFrom, setBreakdownFrom] = useState("");
  const [breakdownTo, setBreakdownTo] = useState("");

  const loadedTrucks = population.dumpTrucks.filter(d => d.status === "loaded");
  const availableTrucksForTransfer = population.dumpTrucks.filter(d => d.status === "available");

  function openBreakdownModal(preselect?: string) {
    setBreakdownFrom(preselect || loadedTrucks[0]?.code || "");
    setBreakdownTo("");
    setBreakdownModal(true);
  }

  function simulateLoaded(code: string) {
    if (!id) return;
    const density = generalInfo.materialDensity || 1.2;
    updateDocument(id, d => ({
      dumpTrucks: d.dumpTrucks.map(dt => {
        if (dt.code !== code || dt.status !== "available") return dt;
        if (dt.route === "unscheduled") {
          const tonnage = Math.round(dt.capacity * density * 10) / 10;
          return { ...dt, status: "loaded" as const, payload: { bucketCount: "-" as const, tonnage } };
        }
        const exca = d.excavators.find(e => e.status !== "breakdown") || d.excavators[0];
        const bucketSize = exca?.bucket || 1.6;
        const bucketCount = Math.floor(Math.random() * 5) + 3; // 3-7
        const tonnage = Math.round(bucketCount * bucketSize * density * 10) / 10;
        return { ...dt, status: "loaded" as const, payload: { bucketCount, tonnage } };
      }),
    }));
  }

  function toggleExcaBreakdown(code: string) {
    if (!id) return;
    const exca = population.excavators.find(e => e.code === code);
    if (!exca) return;
    const wasBreakdown = exca.status === "breakdown";
    updateDocument(id, d => ({
      excavators: d.excavators.map(e => e.code === code ? { ...e, status: wasBreakdown ? "available" as const : "breakdown" as const } : e),
      breakdownEvents: [...d.breakdownEvents, {
        id: `EV-${Date.now()}`,
        type: wasBreakdown ? "exca_recover" as const : "exca_breakdown" as const,
        unit: code,
        timestamp: new Date().toLocaleString("id-ID"),
      }],
    }));
  }

  function recoverDT(code: string) {
    if (!id) return;
    const dt = population.dumpTrucks.find(d2 => d2.code === code);
    if (!dt || dt.status !== "breakdown") return;
    updateDocument(id, d => ({
      dumpTrucks: d.dumpTrucks.map(x => x.code === code ? { ...x, status: "available" as const, transferTo: undefined } : x),
      breakdownEvents: [...d.breakdownEvents, {
        id: `EV-${Date.now()}`,
        type: "dt_recovery" as const,
        unit: `${dt.code} (${dt.plate})`,
        timestamp: new Date().toLocaleString("id-ID"),
      }],
    }));
  }

  function computeBreakdownTonnage(fromCode: string, toCode: string) {
    const density = generalInfo.materialDensity || 1.2;
    const fromDT = population.dumpTrucks.find(d => d.code === fromCode);
    const toDT = population.dumpTrucks.find(d => d.code === toCode);
    if (!fromDT || !toDT) return null;
    const fromCap = fromDT.capacity;
    const toCap = toDT.capacity;
    if (fromDT.route === "unscheduled" || !fromDT.payload) {
      const effectiveCap = Math.min(fromCap, toCap);
      const tonnage = Math.round(effectiveCap * density * 10) / 10;
      const note = fromCap > toCap
        ? `min(${fromCap}, ${toCap})m³ × ${density} = ${tonnage} MT (dibatasi kapasitas unit penerima)`
        : `min(${fromCap}, ${toCap})m³ × ${density} = ${tonnage} MT`;
      return { tonnage, bucketCount: "-" as const, note };
    }
    const recordTonnage = fromDT.payload.tonnage || 0;
    const maxByToCap = Math.round(toCap * density * 10) / 10;
    const tonnage = Math.min(recordTonnage, maxByToCap);
    const note = recordTonnage > maxByToCap
      ? `Dipotong dari ${recordTonnage} MT ke ${tonnage} MT (kapasitas unit penerima lebih kecil)`
      : `Dari loading record: ${tonnage} MT`;
    return { tonnage, bucketCount: fromDT.payload.bucketCount, note };
  }

  const breakdownPreview = breakdownFrom && breakdownTo && breakdownFrom !== breakdownTo
    ? computeBreakdownTonnage(breakdownFrom, breakdownTo)
    : null;

  function confirmBreakdownTransfer() {
    if (!id || !breakdownFrom || !breakdownTo || breakdownFrom === breakdownTo) return;
    const result = computeBreakdownTonnage(breakdownFrom, breakdownTo);
    const fromDT = population.dumpTrucks.find(d2 => d2.code === breakdownFrom);
    const toDT = population.dumpTrucks.find(d2 => d2.code === breakdownTo);
    if (!result || !fromDT || !toDT) return;
    const ts = new Date().toLocaleString("id-ID");

    updateDocument(id, d => ({
      dumpTrucks: d.dumpTrucks.map(x => {
        if (x.code === breakdownFrom) return { ...x, status: "breakdown" as const, transferTo: `${toDT.code} (${toDT.plate})` };
        if (x.code === breakdownTo) return { ...x, status: "transfer" as const, payload: { bucketCount: result.bucketCount, tonnage: result.tonnage, fromTruck: `${fromDT.code} (${fromDT.plate})` } };
        return x;
      }),
      breakdownEvents: [...d.breakdownEvents, {
        id: `EV-${Date.now()}`,
        type: "dt_breakdown" as const,
        fromTruck: `${fromDT.code} (${fromDT.plate})`,
        toTruck: `${toDT.code} (${toDT.plate})`,
        bucketCount: result.bucketCount,
        tonnage: result.tonnage,
        timestamp: ts,
        note: result.note,
      }],
    }));
    setBreakdownModal(false);
  }

  const [addUnitModal, setAddUnitModal] = useState<null | "exca" | "dt">(null);
  const [addUnitSelection, setAddUnitSelection] = useState("");
  const [addUnitRoute, setAddUnitRoute] = useState<"scheduled" | "unscheduled">("scheduled");
  const [addUnitArea, setAddUnitArea] = useState(ALL_AREAS[0]);

  function openAddUnitModal(type: "exca" | "dt") {
    setAddUnitModal(type);
    setAddUnitSelection("");
    setAddUnitArea(ALL_AREAS[0]);
    setAddUnitRoute("scheduled");
  }

  function confirmAddUnit() {
    if (!id || !addUnitSelection) return;
    if (addUnitModal === "exca") {
      const master = ALL_EXCAS.find((e) => e.code === addUnitSelection);
      if (!master) return;
      updateDocument(id, d => ({ excavators: [...d.excavators, { ...master, assignedArea: addUnitArea, status: "available" as const }] }));
    } else if (addUnitModal === "dt") {
      const master = ALL_DT.find((d2) => d2.code === addUnitSelection);
      if (!master) return;
      updateDocument(id, d => ({
        dumpTrucks: [...d.dumpTrucks, { code: master.code, plate: master.plate, capacity: master.capacity, route: addUnitRoute, assignedArea: addUnitArea, status: "available" as const }],
      }));
    }
    setAddUnitModal(null);
  }

  function removeExca(code: string) {
    if (!id) return;
    updateDocument(id, d => ({ excavators: d.excavators.filter((e) => e.code !== code) }));
  }
  function removeDt(code: string) {
    if (!id) return;
    updateDocument(id, d => ({ dumpTrucks: d.dumpTrucks.filter((dt) => dt.code !== code) }));
  }

  const [achFilter, setAchFilter] = useState<"shift" | "exca">("shift");
  const [expandedShiftRows, setExpandedShiftRows] = useState<Set<number>>(new Set());
  function toggleShiftDetail(idx: number) {
    setExpandedShiftRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  const [loadingDuration, setLoadingDuration] = useState("");

  // Final closing data
  const [finalActualTonnage, setFinalActualTonnage] = useState("");
  useEffect(() => {
    if (doc) setFinalActualTonnage(doc.finalTonnage != null ? String(doc.finalTonnage) : "");
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [finalDraftFile, setFinalDraftFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpenAllChecked = Object.values(openChecks).every(Boolean);
  const isClosingAllChecked = Object.values(closingChecks).every(Boolean);

  const handleConfirmArrival = () => { if (id && eta && ata) updateDocument(id, { status: "Arrived", eta, ata }); };
  const handleSetOpen = () => { if (id && isOpenAllChecked) updateDocument(id, { status: "Open" }); };
  const handleStartOperation = () => {
    if (!id) return;
    // Auto-populate from "Operator App" the first time operation starts, matching the SPV POC's
    // simulateRitase() behavior — population is never assigned manually at Create.
    updateDocument(id, d => ({
      status: "On Progress",
      excavators: d.excavators.length
        ? d.excavators
        : [
            { code: "EX-001", model: "Hitachi PC200", bucket: 1.6, assignedArea: "EFO A", status: "available" as const },
            { code: "EX-003", model: "Caterpillar 320", bucket: 1.2, assignedArea: "EFO B", status: "available" as const },
          ],
      dumpTrucks: d.dumpTrucks.length
        ? d.dumpTrucks
        : [
            { code: "DT-01", plate: "B 1234 ABC", capacity: 10, route: "scheduled" as const, assignedArea: d.area, status: "available" as const },
            { code: "DT-02", plate: "B 5678 DEF", capacity: 12, route: "scheduled" as const, assignedArea: d.area, status: "available" as const },
            { code: "DT-03", plate: "B 9012 GHI", capacity: 15, route: "unscheduled" as const, assignedArea: d.area, status: "available" as const },
          ],
    }));
  };
  const handleCloseBarge = () => {
    if (id && isClosingAllChecked && ritaseCount >= 1) {
      updateDocument(id, { status: "Closed" });
    }
  };
  const handleConfirmDeparture = () => {
    if (id && finalActualTonnage) {
      updateDocument(id, { status: "Departed", finalTonnage: Number(finalActualTonnage) });
      setLoadingDuration("1 Day 14 Hours 30 Mins");
    }
  };
  const handleMarkInvalid = () => {
    const trimmed = invalidJustification.trim();
    if (!id || !trimmed) return;
    updateDocument(id, { status: "Invalid", invalidReason: trimmed });
    setShowInvalidModal(false);
    setInvalidJustification("");
  };

  // "Refresh" — simulates the Operator App syncing new ritase/tonnage, matching
  // simulateRitase() in index.html exactly: 60% chance of 1-2 new ritase at
  // 15-25 MT each, plus a 25% chance of an unrelated mobile-reported breakdown
  // log entry (decorative — it does not touch actual DT card status).
  function simulateRitase() {
    if (!id) return;
    if (Math.random() < 0.4) return;
    const newRitase = Math.random() < 0.6 ? 1 : 2;
    const perRitase = 15 + Math.random() * 10;
    const addedTonnage = Math.round(newRitase * perRitase * 10) / 10;
    updateDocument(id, d => {
      const patch: Partial<BargingDocument> = {
        simulatedRitase: (d.simulatedRitase || 0) + newRitase,
        simulatedTonnage: Math.round(((d.simulatedTonnage || 0) + addedTonnage) * 10) / 10,
      };
      if (Math.random() < 0.25 && d.breakdownEvents.length < 4) {
        const pairs: [string, string][] = [["DT-03", "DT-01"], ["DT-02", "DT-04"], ["DT-01", "DT-02"]];
        const [fromTruck, toTruck] = pairs[Math.floor(Math.random() * pairs.length)];
        const bkt = Math.floor(Math.random() * 3) + 1;
        patch.breakdownEvents = [...d.breakdownEvents, {
          id: `BD-${Date.now()}`,
          type: "dt_breakdown" as const,
          fromTruck, toTruck,
          bucketCount: bkt,
          tonnage: Math.round(bkt * (18 + Math.random() * 6) * 10) / 10,
          timestamp: new Date().toLocaleString("id-ID"),
          note: "Transfer via operator app (mobile)",
        }];
      }
      return patch;
    });
  }

  // Top-of-panel overview mirrors renderTabProgress(): target/accumulated/ritase come
  // ONLY from today's simulated sync (matches getAccumulatedTonnage()/getRitaseCount()),
  // not the historical shiftHistory below it.
  const ritaseCount = doc ? getRitaseCount(doc) : 0;
  const accumulatedTonase = doc ? getAccumulatedTonnage(doc) : 0;
  const progress = generalInfo.targetTonase > 0 ? Math.min(100, Math.round((accumulatedTonase / generalInfo.targetTonase) * 100)) : 0;
  const remainingTonase = Math.max(0, generalInfo.targetTonase - accumulatedTonase);

  // Shift Log (Achievement Tonnage) — mirrors renderShiftLogHtml(): history rows plus
  // a synthetic "current" row built from today's simulated ritase, split across the
  // excavators assigned to loading areas.
  const loadingExcas = population.excavators.filter(e => AREAS_LOADING.includes(e.assignedArea));
  const curRitase = doc?.simulatedRitase ?? 0;
  const curTonnage = Math.round((doc?.simulatedTonnage ?? 0) * 10) / 10;
  const curExcaSummary = loadingExcas.length > 0
    ? loadingExcas.map((e, i) => {
        const base = Math.floor(curRitase / loadingExcas.length);
        const extra = i < curRitase % loadingExcas.length ? 1 : 0;
        return { code: e.code, ritase: base + extra };
      })
    : [];
  const shiftRows = [
    ...shiftHistory,
    { shift: "Siang", date: doc?.createdDate ?? "-", ritase: curRitase, tonnage: curTonnage, excaSummary: curExcaSummary, isCurrent: true },
  ];
  const shiftTotalRitase = shiftRows.reduce((s, r) => s + r.ritase, 0);
  const shiftTotalTonnage = shiftRows.reduce((s, r) => s + r.tonnage, 0);
  const shiftOverallAch = generalInfo.targetTonase > 0 ? Math.min(100, Math.round(shiftTotalTonnage / generalInfo.targetTonase * 100)) : 0;
  const excaAggregate = new Map<string, number>();
  shiftRows.forEach(r => r.excaSummary.forEach(e => excaAggregate.set(e.code, (excaAggregate.get(e.code) ?? 0) + e.ritase)));
  const excaAggregateRows = Array.from(excaAggregate.entries()).map(([code, ritase]) => ({
    code, ritase,
    tonnage: shiftTotalRitase > 0 ? Math.round((ritase / shiftTotalRitase) * shiftTotalTonnage * 10) / 10 : 0,
  }));

  const statusOrder = ["Planned", "Arrived", "Open", "On Progress", "Closed", "Departed"];
  const currentIdx = statusOrder.indexOf(status);
  const isInvalid = status === "Invalid";

  const isPast = (st: string) => !isInvalid && statusOrder.indexOf(st) < currentIdx;
  const isCurrent = (st: string) => !isInvalid && statusOrder.indexOf(st) === currentIdx;

  if (!isCreate && !doc) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link to="/transactional/operation" className="p-2.5 text-gray-500 hover:text-[#5B5FC7] bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors border border-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {isCreate ? "Create Barging Process" : `Barging ID: ${id || 'BRG-90210'}`}
                </h1>
                {!isCreate && (
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase ${
                    status === 'Departed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    status === 'Closed' ? 'bg-sky-100 text-sky-800 border border-sky-200' :
                    status === 'On Progress' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    status === 'Invalid' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {status}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1.5 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                SOP Compliant Workflow
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {!isCreate && status === "Open" && (
              <button
                onClick={() => setShowInvalidModal(true)}
                className="px-5 py-2.5 border border-rose-200 bg-rose-50 rounded-xl text-sm font-semibold text-rose-700 hover:bg-rose-100 flex items-center gap-2 shadow-sm transition-all"
              >
                <AlertTriangle className="w-4 h-4" />
                Mark as Invalid
              </button>
            )}
            {!isCreate && (
              <button className="px-5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
                <FileText className="w-4 h-4" />
                Audit Trail
              </button>
            )}
            {isCreate && (
              <button onClick={handleCreateDocument} className="bg-gradient-to-r from-[#5B5FC7] to-indigo-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20">
                <Save className="w-4 h-4" />
                Save Document
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-8">
        <div className={`grid grid-cols-1 ${isCreate ? '' : 'xl:grid-cols-12'} gap-8`}>

          {/* Main Content Area */}
          <div className={`${isCreate ? '' : 'xl:col-span-8'} space-y-8`}>

            {!isCreate && isInvalid && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900">Dokumen ini telah ditandai sebagai Invalid</h3>
                  {invalidReason && (
                    <p className="text-sm text-rose-700 mt-1.5">
                      <span className="font-semibold">Alasan:</span> {invalidReason}
                    </p>
                  )}
                  <p className="text-xs text-rose-500 mt-2 font-medium">Tidak ada aksi operasional yang tersedia untuk dokumen ini.</p>
                </div>
              </div>
            )}

            {/* General Information Panel */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-[#5B5FC7] rounded-lg">
                  <Anchor className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">General Information</h3>
              </div>
              <div className="p-6">
                {isCreate ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area / Lokasi (Jetty)</label>
                      <select
                        value={createForm.area}
                        onChange={e => setCreateForm(f => ({ ...f, area: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      >
                        {CREATE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Barge (Tongkang)</label>
                      <select
                        value={createForm.barge}
                        onChange={e => setCreateForm(f => ({ ...f, barge: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-indigo-50 shadow-sm"
                      >
                        {CREATE_BARGES.map(b => <option key={b.name} value={b.name}>{b.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Tonase (MT)</label>
                      <input
                        type="number"
                        min="100"
                        value={createForm.targetTonase}
                        onChange={e => setCreateForm(f => ({ ...f, targetTonase: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Material</label>
                      <select
                        value={createForm.material}
                        onChange={e => handleMaterialChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      >
                        {Object.keys(MATERIAL_DENSITY).map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Densitas Material (MT/m³)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="3.0"
                        value={createForm.materialDensity}
                        onChange={e => setCreateForm(f => ({ ...f, materialDensity: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      />
                      <p className="text-[10px] text-gray-400 mt-1.5">Auto-fill dari jenis material. Bisa diubah.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ETA</label>
                      <input
                        type="datetime-local"
                        value={createForm.eta}
                        onChange={e => setCreateForm(f => ({ ...f, eta: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Surveyor</label>
                      <input
                        type="text"
                        value={createForm.surveyor}
                        onChange={e => setCreateForm(f => ({ ...f, surveyor: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SPV / Checker</label>
                      <input
                        type="text"
                        value={createForm.spv}
                        onChange={e => setCreateForm(f => ({ ...f, spv: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white shadow-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Area / Jetty</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{generalInfo.area}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Barge Name</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <Anchor className="w-4 h-4 text-[#5B5FC7]" />
                        <span className="text-sm font-semibold text-indigo-900">{generalInfo.barge}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Tonase</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{generalInfo.targetTonase} <span className="text-gray-500 font-normal">MT</span></span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Material Type</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{generalInfo.material}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Surveyor</label>
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">{generalInfo.surveyor}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Final Tonnage & Document Panel — muncul setelah Closed, sebelum Departed */}
            {!isCreate && (status === 'Closed' || status === 'Departed') && (
              <div className="bg-white rounded-2xl border border-[#5B5FC7]/20 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/40 flex items-center gap-3">
                  <div className="p-2 bg-[#5B5FC7]/10 text-[#5B5FC7] rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Final Data — Actual Tonnage & Document</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Input hasil akhir aktual setelah operasional selesai</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {/* Actual Final Tonnage */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#5B5FC7]" />
                      Actual Final Tonnage (MT)
                    </label>
                    <div className="relative max-w-xs">
                      <input
                        type="number"
                        min="1"
                        value={finalActualTonnage}
                        onChange={e => setFinalActualTonnage(e.target.value)}
                        placeholder="e.g. 4980"
                        className="w-full pl-10 pr-14 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] bg-white font-bold text-[#5B5FC7] shadow-sm placeholder:font-normal placeholder:text-gray-400"
                      />
                      <Layers className="w-4 h-4 text-[#5B5FC7] absolute left-3.5 top-3.5 pointer-events-none" />
                      <span className="absolute right-3.5 top-3.5 text-xs font-bold text-gray-400 pointer-events-none">MT</span>
                    </div>
                    {finalActualTonnage && (
                      <p className="mt-2 text-xs text-gray-500 font-medium">
                        Selisih vs accumulated: <span className={`font-bold ${Number(finalActualTonnage) >= accumulatedTonase ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {Number(finalActualTonnage) >= accumulatedTonase ? '+' : ''}{Number(finalActualTonnage) - accumulatedTonase} MT
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Upload Final Draft Survey */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                      Upload Final Draft Survey Document
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      className="hidden"
                      onChange={e => setFinalDraftFile(e.target.files?.[0] || null)}
                    />
                    {finalDraftFile ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 max-w-md">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-emerald-900 truncate">{finalDraftFile.name}</p>
                            <p className="text-[11px] text-emerald-600 font-medium">{(finalDraftFile.size / 1024).toFixed(1)} KB · Uploaded</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setFinalDraftFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="ml-4 p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 hover:border-[#5B5FC7] rounded-xl py-5 px-8 flex flex-col items-center gap-2 text-gray-500 hover:text-[#5B5FC7] transition-colors bg-white hover:bg-indigo-50/30 w-full max-w-md"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-[13px] font-semibold">Click to upload PDF / Image</span>
                        <span className="text-[11px] font-medium text-gray-400">PDF, JPG, PNG, DOC accepted</span>
                      </button>
                    )}
                  </div>

                  {status === 'Closed' && (
                    <button
                      onClick={handleConfirmDeparture}
                      disabled={!finalActualTonnage}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white text-[14px] font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2"
                    >
                      <Flag className="w-4 h-4" /> Konfirmasi Keberangkatan →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Assigned Population Panel — only from On Progress onward: population is never
                assigned at Create, it's auto-populated (simulating mobile sync) once operation
                starts, then manageable (add/remove) only while status is On Progress. */}
            {!isCreate && !isInvalid && ['On Progress', 'Closed', 'Departed'].includes(status) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Assigned Population</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Auto-populate dari Operator App{status === 'On Progress' ? ' — dapat diedit' : ' — view-only'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-700">Excavators</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">{population.excavators.length} Units</span>
                          {status === 'On Progress' && (
                            <button
                              onClick={() => openAddUnitModal('exca')}
                              className="text-xs font-bold text-[#5B5FC7] bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {population.excavators.map(ex => (
                          <span key={ex.code} className={`pl-3 pr-2 py-1.5 border text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 ${
                            ex.status === 'breakdown' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-gray-100 border-gray-200 text-gray-800'
                          }`}>
                            {ex.code}
                            <span className="text-gray-400 font-normal text-xs">{ex.assignedArea}</span>
                            {ex.status === 'breakdown' && (
                              <span className="text-[10px] font-bold uppercase text-rose-600">Breakdown</span>
                            )}
                            {status === 'On Progress' && (
                              <button
                                onClick={() => toggleExcaBreakdown(ex.code)}
                                title={ex.status === 'breakdown' ? 'Recovery' : 'Tandai Breakdown'}
                                className={ex.status === 'breakdown' ? 'text-emerald-500 hover:text-emerald-700 transition-colors' : 'text-gray-400 hover:text-amber-600 transition-colors'}
                              >
                                {ex.status === 'breakdown' ? <RotateCcw className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            {status === 'On Progress' && (
                              <button onClick={() => removeExca(ex.code)} className="text-gray-400 hover:text-rose-600 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </span>
                        ))}
                        {population.excavators.length === 0 && (
                          <span className="text-xs text-gray-400 italic">Belum ada excavator.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-700">Dump Trucks</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">{population.dumpTrucks.length} Units</span>
                          {status === 'On Progress' && loadedTrucks.length > 0 && (
                            <button
                              onClick={() => openBreakdownModal()}
                              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <AlertTriangle className="w-3 h-3" /> Tandai Breakdown
                            </button>
                          )}
                          {status === 'On Progress' && (
                            <button
                              onClick={() => openAddUnitModal('dt')}
                              className="text-xs font-bold text-[#5B5FC7] bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" /> Add
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {population.dumpTrucks.map(dt => (
                          <div key={dt.code} className={`rounded-xl border p-3 shadow-sm ${
                            dt.status === 'breakdown' ? 'bg-rose-50 border-rose-200' :
                            dt.status === 'transfer' ? 'bg-amber-50 border-amber-200' :
                            dt.status === 'loaded' ? 'bg-violet-50 border-violet-200' :
                            'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-900">{dt.code}</span>
                                  <span className={`text-[10px] font-bold uppercase ${dt.route === 'unscheduled' ? 'text-rose-500' : 'text-emerald-600'}`}>
                                    {dt.route === 'unscheduled' ? 'Unscheduled' : 'Scheduled'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{dt.plate} · {dt.capacity}m³ · {dt.assignedArea}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  dt.status === 'breakdown' ? 'bg-rose-100 text-rose-700' :
                                  dt.status === 'transfer' ? 'bg-amber-100 text-amber-700' :
                                  dt.status === 'loaded' ? 'bg-violet-100 text-violet-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {dt.status === 'breakdown' ? 'Breakdown' : dt.status === 'transfer' ? 'Transfer' : dt.status === 'loaded' ? 'Loaded' : 'Available'}
                                </span>
                                {status === 'On Progress' && dt.status === 'available' && (
                                  <button onClick={() => removeDt(dt.code)} className="text-gray-400 hover:text-rose-600 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {status === 'On Progress' && dt.status === 'available' && (
                              <button
                                onClick={() => simulateLoaded(dt.code)}
                                className="mt-2.5 w-full text-xs font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                {dt.route === 'unscheduled' ? '+ Simulasi Unscheduled Load' : '+ Simulasi Loading'}
                              </button>
                            )}

                            {dt.status === 'loaded' && dt.payload && (
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-violet-700">
                                  {dt.payload.bucketCount !== '-' ? `${dt.payload.bucketCount} bucket · ` : ''}{dt.payload.tonnage} MT
                                </span>
                                {status === 'On Progress' && (
                                  <button
                                    onClick={() => openBreakdownModal(dt.code)}
                                    className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                                  >
                                    Tandai Breakdown
                                  </button>
                                )}
                              </div>
                            )}

                            {dt.status === 'breakdown' && (
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-rose-600">Muatan → {dt.transferTo || '-'}</span>
                                {status === 'On Progress' && (
                                  <button
                                    onClick={() => recoverDT(dt.code)}
                                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Recovery
                                  </button>
                                )}
                              </div>
                            )}

                            {dt.status === 'transfer' && dt.payload && (
                              <div className="mt-2 text-[11px] font-semibold text-amber-700 flex items-center gap-1.5">
                                <ArrowRightLeft className="w-3 h-3" />
                                {dt.payload.bucketCount !== '-' ? `${dt.payload.bucketCount} bucket · ` : ''}{dt.payload.tonnage} MT dari {dt.payload.fromTruck}
                              </div>
                            )}
                          </div>
                        ))}
                        {population.dumpTrucks.length === 0 && (
                          <span className="text-xs text-gray-400 italic">Belum ada dump truck.</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
                    <UserCircle className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Supervisor / Checker</p>
                      <p className="text-sm font-bold text-gray-900">{population.spv}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event History (Riwayat) — DT breakdown/recovery & excavator breakdown/recovery log */}
            {!isCreate && !isInvalid && ['On Progress', 'Closed', 'Departed'].includes(status) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Event History</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Log breakdown & recovery unit selama operasional</p>
                  </div>
                </div>
                <div className="p-6">
                  {breakdownEvents.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">Belum ada event breakdown/recovery.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {[...breakdownEvents].reverse().map(ev => (
                        <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/60">
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            ev.type === 'dt_breakdown' || ev.type === 'exca_breakdown' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                          }`}>
                            {ev.type === 'dt_breakdown' || ev.type === 'exca_breakdown' ? <AlertTriangle className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {ev.type === 'dt_breakdown' && `DT Breakdown: ${ev.fromTruck} → ${ev.toTruck}`}
                              {ev.type === 'exca_breakdown' && `Excavator Breakdown: ${ev.unit}`}
                              {ev.type === 'exca_recover' && `Excavator Recovery: ${ev.unit}`}
                              {ev.type === 'dt_recovery' && `DT Recovery: ${ev.unit}`}
                            </p>
                            {ev.type === 'dt_breakdown' && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {ev.bucketCount !== '-' ? `${ev.bucketCount} bucket · ` : ''}{ev.tonnage} MT{ev.note ? ` — ${ev.note}` : ''}
                              </p>
                            )}
                            <p className="text-[11px] text-gray-400 mt-1">{ev.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Production Progress — mirrors renderTabProgress(): stats come only from
                today's Operator App sync (simulatedRitase/simulatedTonnage). */}
            {!isCreate && ['On Progress', 'Closed', 'Departed'].includes(status) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Production Progress</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Auto-update dari Operator App</p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> Target</div>
                      <div className="text-2xl font-black text-gray-900">{generalInfo.targetTonase} <span className="text-sm font-medium text-gray-500">MT</span></div>
                    </div>
                    <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-inner shadow-indigo-100/50">
                      <div className="text-xs font-bold text-[#5B5FC7] uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/> Acc. Tonase</div>
                      <div className="text-2xl font-black text-[#5B5FC7]">{accumulatedTonase.toFixed(1)} <span className="text-sm font-medium text-indigo-400">MT</span></div>
                    </div>
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5"/> Total Ritase</div>
                      <div className="text-2xl font-black text-blue-900">{ritaseCount} <span className="text-sm font-medium text-blue-500">Rit</span></div>
                    </div>
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                      <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5"/> Remaining</div>
                      <div className="text-2xl font-black text-amber-900">{remainingTonase.toFixed(1)} <span className="text-sm font-medium text-amber-500">MT</span></div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <span className="text-sm font-bold text-gray-900">Barging Completion</span>
                        <p className="text-xs text-gray-500 mt-0.5">{progress}% tercapai</p>
                      </div>
                      <span className="text-2xl font-black text-[#5B5FC7]">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden p-0.5">
                      <div className="bg-gradient-to-r from-indigo-500 to-[#5B5FC7] h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                        <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Integrasi Mobile / Refresh */}
                  {status === 'On Progress' ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
                      <p className="text-xs text-blue-800"><strong>Integrasi Mobile:</strong> Data ritase & tonnage di-sync otomatis dari Operator App setiap kali operator submit dumping di Jetty.</p>
                      <button
                        onClick={simulateRitase}
                        className="shrink-0 bg-[#5B5FC7] hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm whitespace-nowrap"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800">
                      <strong>Integrasi Mobile:</strong> Data ritase & tonnage di-sync otomatis dari Operator App.
                    </div>
                  )}

                  {/* Completion Duration Notice */}
                  {status === 'Departed' && (
                    <div className="mt-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center">
                          <Clock className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-emerald-950 font-bold text-lg tracking-tight">Operation Departed</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-emerald-700 text-sm font-medium">Total Loading Duration:</span>
                            <span className="text-emerald-900 text-sm font-bold bg-emerald-100/50 px-2.5 py-0.5 rounded-md border border-emerald-200/50">{loadingDuration || "1 Day 14 Hours 30 Mins"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right pl-6 border-l border-emerald-200/60 hidden sm:block">
                        <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Accumulated Tonase</div>
                        <div className="text-2xl font-black text-emerald-900">{accumulatedTonase.toFixed(1)} <span className="text-sm font-semibold text-emerald-700">MT</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievement Tonnage (Shift Log) — mirrors renderShiftLogHtml(): full history
                including yesterday's shifts, with a By Shift / By Exca toggle view. */}
            {!isCreate && ['On Progress', 'Closed', 'Departed'].includes(status) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-gray-900">Achievement Tonnage</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-medium">{shiftTotalRitase} rit | {shiftTotalTonnage.toFixed(1)} MT | <strong className="text-gray-700">{shiftOverallAch}%</strong></span>
                    <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setAchFilter('shift')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${achFilter === 'shift' ? 'bg-[#5B5FC7] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        By Shift
                      </button>
                      <button
                        onClick={() => setAchFilter('exca')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${achFilter === 'exca' ? 'bg-[#5B5FC7] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        By Exca
                      </button>
                    </div>
                  </div>
                </div>

                {achFilter === 'shift' ? (
                  <div className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Shift</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ritase</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tonnage (MT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {shiftRows.map((r, idx) => {
                          const hasDetail = r.excaSummary.length > 0;
                          const isOpen = expandedShiftRows.has(idx);
                          return (
                            <Fragment key={idx}>
                              <tr className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                                  <div className="flex items-center gap-1.5">
                                    {hasDetail ? (
                                      <button onClick={() => toggleShiftDetail(idx)} className="text-gray-400 hover:text-[#5B5FC7] transition-colors">
                                        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                      </button>
                                    ) : <span className="w-3.5" />}
                                    {r.shift}
                                    {'isCurrent' in r && r.isCurrent && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">Berjalan</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-sm text-gray-500">{r.date}</td>
                                <td className="px-5 py-3.5 text-sm font-bold text-gray-900 text-right">{r.ritase}</td>
                                <td className="px-5 py-3.5 text-sm font-bold text-[#5B5FC7] text-right">{r.tonnage.toFixed(1)}</td>
                              </tr>
                              {hasDetail && isOpen && (
                                <tr className="bg-gray-50/60">
                                  <td colSpan={4} className="px-5 py-3 pl-12">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs text-gray-500 mr-1">Exca:</span>
                                      {r.excaSummary.map(e => (
                                        <span key={e.code} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
                                          <strong className="text-gray-900">{e.code}</strong>
                                          <span className="text-gray-500">{e.ritase} rit</span>
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Excavator</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Ritase</th>
                          <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Tonnage (MT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {excaAggregateRows.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-5 py-8 text-center text-sm font-medium text-gray-400">Belum ada data exca.</td>
                          </tr>
                        ) : excaAggregateRows.map(e => (
                          <tr key={e.code} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-5 py-3.5 text-sm">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-[#5B5FC7]">{e.code}</span>
                            </td>
                            <td className="px-5 py-3.5 text-sm font-bold text-gray-900 text-right">{e.ritase}</td>
                            <td className="px-5 py-3.5 text-sm font-bold text-[#5B5FC7] text-right">{e.tonnage.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar / Timeline Area */}
          {!isCreate && (
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Barging Lifecycle</h3>
                    <p className="text-xs font-medium text-gray-500">Track standard operating procedures</p>
                  </div>
                </div>

                {isInvalid ? (
                  <div className="text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span>Dokumen ini telah ditandai Invalid dan tidak lagi mengikuti alur SOP normal.</span>
                  </div>
                ) : (
                <div className="mt-4">
                  {/* Planned */}
                  <TimelineItem
                    title="Planned"
                    date={doc?.createdDate}
                    status={!isCreate ? 'completed' : 'current'}
                    icon={FileText}
                  >
                    {isCreate && (
                      <div className="text-[13px] font-medium text-gray-500">Create Barging Document & Allocate Population</div>
                    )}
                  </TimelineItem>

                  {/* Arrived */}
                  <TimelineItem
                    title="Barge Arrived"
                    date={isPast('Arrived') && doc ? doc.ata.slice(0, 10) : undefined}
                    status={isPast('Arrived') ? 'completed' : isCurrent('Arrived') || isCurrent('Planned') ? 'current' : 'upcoming'}
                    icon={Anchor}
                  >
                    {isCurrent('Planned') && (
                      <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 font-bold text-gray-800 text-sm">
                          Arrival Update
                        </div>

                        <div className="relative">
                          <label className="block group hover:bg-indigo-50/50 transition-colors border-b border-gray-100 cursor-pointer">
                            <div className="px-4 py-3.5 flex items-center justify-between relative">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#5B5FC7] shadow-sm border border-indigo-200/50 shrink-0">
                                  <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-[13px] font-bold text-gray-500">Estimation Time Arrival (ETA)</h4>
                                  <div className="text-sm font-bold text-gray-900 mt-0.5">
                                    {eta ? new Date(eta).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Set Date & Time"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="datetime-local"
                                  value={eta}
                                  onChange={e => setEta(e.target.value)}
                                  className="w-[30px] opacity-0 cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 h-full z-20"
                                  onClick={(e) => {
                                    // Make sure modern browsers open the picker when clicked anywhere near it
                                    try {
                                      if ('showPicker' in HTMLInputElement.prototype) {
                                        (e.target as HTMLInputElement).showPicker();
                                      }
                                    } catch (err) {}
                                  }}
                                />
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#5B5FC7] transition-colors relative z-10 pointer-events-none" />
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="relative">
                          <label className="block group hover:bg-indigo-50/50 transition-colors cursor-pointer">
                            <div className="px-4 py-3.5 flex items-center justify-between relative">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200/50 shrink-0">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="text-[13px] font-bold text-gray-500">Actual Time Arrival (ATA)</h4>
                                  <div className="text-sm font-bold text-gray-900 mt-0.5">
                                    {ata ? new Date(ata).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Set Date & Time"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="datetime-local"
                                  value={ata}
                                  onChange={e => setAta(e.target.value)}
                                  className="w-[30px] opacity-0 cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 h-full z-20"
                                  onClick={(e) => {
                                    // Make sure modern browsers open the picker when clicked anywhere near it
                                    try {
                                      if ('showPicker' in HTMLInputElement.prototype) {
                                        (e.target as HTMLInputElement).showPicker();
                                      }
                                    } catch (err) {}
                                  }}
                                />
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-600 transition-colors relative z-10 pointer-events-none" />
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-100">
                          <button onClick={handleConfirmArrival} disabled={!eta || !ata} className="w-full bg-[#5B5FC7] hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[14px] font-bold py-2.5 rounded-lg transition-colors shadow-sm flex justify-center items-center gap-2">
                            Confirm Arrival
                          </button>
                        </div>
                      </div>
                    )}
                  </TimelineItem>

                  {/* Open (Pre-Operation Checklist) */}
                  <TimelineItem
                    title="Pre-Operation Checklist"
                    status={isPast('Open') ? 'completed' : isCurrent('Arrived') || isCurrent('Open') ? 'current' : 'upcoming'}
                    icon={ShieldCheck}
                  >
                    {isCurrent('Arrived') && (
                      <div className="space-y-3 mt-2">
                        <TaskCard
                          label="Notify SPV Production"
                          checked={openChecks.notify}
                          onChange={(val: any) => id && updateDocument(id, { openChecklist: { ...openChecks, notify: val } })}
                        />
                        <TaskCard
                          label="Set Ramp Door"
                          checked={openChecks.ramp}
                          onChange={(val: any) => id && updateDocument(id, { openChecklist: { ...openChecks, ramp: val } })}
                        />
                        <TaskCard
                          label="Excavator enters barge"
                          checked={openChecks.excaEnter}
                          onChange={(val: any) => id && updateDocument(id, { openChecklist: { ...openChecks, excaEnter: val } })}
                        />
                        <div className="pt-3">
                          <button onClick={handleSetOpen} disabled={!isOpenAllChecked} className="w-full bg-[#5B5FC7] hover:bg-indigo-700 disabled:bg-indigo-300 disabled:shadow-none text-white text-[14px] font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex justify-center items-center gap-2">
                            Set Status Open
                          </button>
                        </div>
                      </div>
                    )}
                  </TimelineItem>

                  {/* On Progress */}
                  <TimelineItem
                    title="On Progress"
                    status={isPast('On Progress') ? 'completed' : isCurrent('Open') || isCurrent('On Progress') ? 'current' : 'upcoming'}
                    icon={Activity}
                  >
                    {isCurrent('Open') && (
                      <button onClick={handleStartOperation} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-[14px] font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2 mt-2">
                        <Play className="w-4 h-4 fill-white" /> Mulai Operasi
                      </button>
                    )}
                    {isCurrent('On Progress') && (
                       <div className="text-[13px] font-semibold text-[#5B5FC7] bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 flex items-center gap-2">
                          <div className="w-2 h-2 bg-[#5B5FC7] rounded-full animate-ping" />
                          Operation is ongoing
                       </div>
                    )}
                  </TimelineItem>

                  {/* Closed */}
                  <TimelineItem
                    title="Closed"
                    status={isPast('Closed') ? 'completed' : isCurrent('On Progress') || isCurrent('Closed') ? 'current' : 'upcoming'}
                    icon={Anchor}
                  >
                    {isCurrent('On Progress') && (
                      <div className="space-y-3 mt-2">
                        <TaskCard
                          label="Receive barge full info"
                          checked={closingChecks.bargeInfo}
                          onChange={(val: any) => id && updateDocument(id, { closeChecklist: { ...closingChecks, bargeInfo: val } })}
                        />
                        <TaskCard
                          label="Close Barge"
                          checked={closingChecks.closeBarge}
                          onChange={(val: any) => id && updateDocument(id, { closeChecklist: { ...closingChecks, closeBarge: val } })}
                        />
                        <TaskCard
                          label="Confirm Final Draft"
                          checked={closingChecks.finalDraft}
                          onChange={(val: any) => id && updateDocument(id, { closeChecklist: { ...closingChecks, finalDraft: val } })}
                        />

                        <div className="pt-2">
                          {(!isClosingAllChecked || ritaseCount < 1) && (
                            <div className="text-[13px] font-medium text-amber-700 mb-3 bg-amber-50 p-3 rounded-xl border border-amber-200/60 flex gap-2 items-start">
                              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                              <span>Complete all checklist items & ensure minimal 1 ritase (via Refresh) to finish.</span>
                            </div>
                          )}
                          <button onClick={handleCloseBarge} disabled={!isClosingAllChecked || ritaseCount < 1} className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-black hover:to-black disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:shadow-none text-white text-[14px] font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-gray-900/20 flex justify-center items-center gap-2">
                            <Check className="w-5 h-5 stroke-[3]" /> Close Tongkang
                          </button>
                        </div>
                      </div>
                    )}
                  </TimelineItem>

                  {/* Departed */}
                  <TimelineItem
                    title="Departed"
                    status={status === 'Departed' ? 'completed' : isCurrent('Closed') ? 'current' : 'upcoming'}
                    icon={Flag}
                    isLast={true}
                  >
                    {isCurrent('Closed') && (
                      <div className="text-[13px] font-medium text-gray-500">Lengkapi Final Tonnage & dokumen di panel "Final Data" sebelum konfirmasi keberangkatan.</div>
                    )}
                    {status === 'Departed' && (
                      <div className="text-[13px] font-semibold text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Tongkang telah berangkat
                      </div>
                    )}
                  </TimelineItem>
                </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showInvalidModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Mark as Invalid</h3>
              </div>
              <button onClick={() => setShowInvalidModal(false)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Dokumen ini akan ditandai sebagai <span className="font-bold text-rose-600">Invalid</span> dan tidak dapat digunakan dalam proses operasional. Tindakan ini memerlukan justifikasi.</p>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Alasan Invalidasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={invalidJustification}
                  onChange={e => setInvalidJustification(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm font-medium text-gray-900 resize-none"
                  placeholder="Jelaskan alasan dokumen ini ditandai invalid..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvalidModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMarkInvalid}
                  disabled={!invalidJustification.trim()}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-200 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-rose-500/20"
                >
                  Mark as Invalid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addUnitModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{addUnitModal === "exca" ? "Tambah Excavator" : "Tambah Dump Truck"}</h3>
              </div>
              <button onClick={() => setAddUnitModal(null)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Pilih unit dari master yang belum terdaftar di dokumen ini.</p>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Unit <span className="text-red-500">*</span></label>
                <select
                  value={addUnitSelection}
                  onChange={e => setAddUnitSelection(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm bg-white font-medium text-gray-900"
                >
                  <option value="">Pilih unit...</option>
                  {addUnitModal === "exca"
                    ? ALL_EXCAS.filter(e => !population.excavators.some(pe => pe.code === e.code)).map(e => (
                        <option key={e.code} value={e.code}>{e.code} — {e.model} ({e.bucket}m³/bucket)</option>
                      ))
                    : ALL_DT.filter(d => !population.dumpTrucks.some(pd => pd.code === d.code)).map(d => (
                        <option key={d.code} value={d.code}>{d.code} — {d.plate} ({d.capacity}m³)</option>
                      ))}
                </select>
              </div>
              {addUnitModal === "dt" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Route</label>
                  <select
                    value={addUnitRoute}
                    onChange={e => setAddUnitRoute(e.target.value as "scheduled" | "unscheduled")}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm bg-white font-medium text-gray-900"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="unscheduled">Unscheduled</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Area</label>
                <select
                  value={addUnitArea}
                  onChange={e => setAddUnitArea(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] shadow-sm bg-white font-medium text-gray-900"
                >
                  {ALL_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAddUnitModal(null)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAddUnit}
                  disabled={!addUnitSelection}
                  className="bg-[#5B5FC7] hover:bg-indigo-700 disabled:bg-indigo-200 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {breakdownModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Tandai Breakdown</h3>
              </div>
              <button onClick={() => setBreakdownModal(false)} className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1.5 rounded-lg transition-colors border border-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {loadedTrucks.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada unit yang sedang loaded. Klik "Simulasi Loading" pada unit yang ingin disimulasi lebih dulu.</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Pilih unit yang breakdown dan unit penerima muatan hibah.</p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Unit Breakdown (From) <span className="text-red-500">*</span></label>
                    <select
                      value={breakdownFrom}
                      onChange={e => setBreakdownFrom(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm bg-white font-medium text-gray-900"
                    >
                      {loadedTrucks.map(dt => (
                        <option key={dt.code} value={dt.code}>{dt.code} — {dt.plate} | {dt.capacity}m³ [{dt.route === 'unscheduled' ? 'Unscheduled' : 'Scheduled'}]</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Unit Penerima (To) <span className="text-red-500">*</span></label>
                    <select
                      value={breakdownTo}
                      onChange={e => setBreakdownTo(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm bg-white font-medium text-gray-900"
                    >
                      <option value="">Pilih unit penerima...</option>
                      {availableTrucksForTransfer.filter(dt => dt.code !== breakdownFrom).map(dt => (
                        <option key={dt.code} value={dt.code}>{dt.code} — {dt.plate} | {dt.capacity}m³</option>
                      ))}
                    </select>
                  </div>
                  {breakdownPreview && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                      Tonnage yang ditransfer (trip pertama {breakdownTo}): <strong>{breakdownPreview.tonnage} MT</strong>
                      <br /><span className="opacity-80">{breakdownPreview.note}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBreakdownModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmBreakdownTransfer}
                  disabled={!breakdownFrom || !breakdownTo || breakdownFrom === breakdownTo}
                  className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-200 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-500/20"
                >
                  Confirm Breakdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreate && showCreateConfirm && (
        <ActionModal
          variant="confirm"
          title="Buat Dokumen Baru?"
          message={`Dokumen baru untuk barge "${createForm.barge}" di ${createForm.area} akan dibuat dengan status Planned.`}
          onConfirm={confirmCreateDocument}
          onCancel={() => setShowCreateConfirm(false)}
        />
      )}

      {isCreate && createError && !showCreateConfirm && (
        <ActionModal
          variant="failed"
          title="Tidak Dapat Membuat Dokumen"
          message={createError}
          onClose={() => setCreateError("")}
        />
      )}

      {isCreate && createdDocId && (
        <ActionModal
          variant="success"
          title="Dokumen Berhasil Dibuat"
          message={`Barge doc "${createdDocId}" successfully created.`}
          onClose={() => navigate("/transactional/operation")}
        />
      )}
    </div>
  );
}
