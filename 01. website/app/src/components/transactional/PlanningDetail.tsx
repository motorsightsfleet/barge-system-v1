import {
  ArrowLeft, Save, Check, X, MapPin, Target, Truck, ChevronRight,
  ChevronDown, ChevronUp, TrendingUp, Play, AlertTriangle, Flag,
  History, RefreshCw, Search, MoreHorizontal, BarChart3, Settings,
} from "lucide-react";
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

const STATUS_ORDER = ["Planned", "Arrived", "Open", "On Progress", "Closed", "Departed"];

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
      status === 'Departed' ? 'bg-emerald-100 text-emerald-800' :
      status === 'Closed' ? 'bg-sky-100 text-sky-800' :
      status === 'On Progress' ? 'bg-indigo-100 text-indigo-800' :
      status === 'Invalid' ? 'bg-rose-100 text-rose-800' :
      'bg-amber-100 text-amber-800'
    }`}>
      {status}
    </span>
  );
}

// Horizontal lifecycle stepper — mirrors index.html's #detail-status-flow: numbered dots,
// checkmark once past, current step highlighted, past steps clickable for a snapshot.
function StatusStepper({ statusOrder, currentIdx, onStepClick }: { statusOrder: string[]; currentIdx: number; onStepClick: (s: string) => void }) {
  return (
    <div className="flex items-center overflow-x-auto pb-1">
      {statusOrder.map((s, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const clickable = done;
        return (
          <Fragment key={s}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick(s)}
              className={`flex flex-col items-center gap-1.5 shrink-0 px-1 ${clickable ? 'cursor-pointer group' : 'cursor-default'}`}
              title={clickable ? `Lihat snapshot status ${s}` : undefined}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done ? 'bg-[#5B5FC7] border-[#5B5FC7] text-white group-hover:bg-indigo-700' :
                current ? 'bg-white border-[#5B5FC7] text-[#5B5FC7]' :
                'bg-white border-gray-200 text-gray-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${current ? 'text-[#5B5FC7]' : done ? 'text-gray-700' : 'text-gray-400'}`}>{s}</span>
            </button>
            {i < statusOrder.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[20px] mx-1 mb-5 ${i < currentIdx ? 'bg-[#5B5FC7]' : 'bg-gray-200'}`} />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function SectionCard({ title, badge, children }: { title: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function InfoBox({ tone, children }: { tone: "blue" | "green" | "orange"; children: React.ReactNode }) {
  const cls = tone === "green" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
    tone === "orange" ? "bg-amber-50 border-amber-200 text-amber-800" :
    "bg-blue-50 border-blue-200 text-blue-800";
  return <div className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}

const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5B5FC7] focus:border-[#5B5FC7] disabled:bg-gray-50 disabled:text-gray-400";

export default function PlanningDetail() {
  const { id } = useParams();
  const isCreate = id === "create";
  const navigate = useNavigate();
  const { documents, addDocument, updateDocument } = useBargingDocuments();
  const doc = !isCreate ? documents.find(d => d.id === id) : undefined;

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
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"progress" | "operasional" | "riwayat">("operasional");
  const [viewingHistoricalStatus, setViewingHistoricalStatus] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab("operasional");
    setInfoExpanded(false);
    setViewingHistoricalStatus(null);
  }, [id]);

  const status = doc?.status ?? "Planned";
  const invalidReason = doc?.invalidReason ?? "";
  const isInvalid = status === "Invalid";
  const currentIdx = STATUS_ORDER.indexOf(status);

  const isHistoricalView = viewingHistoricalStatus !== null;
  const readonly = isHistoricalView;
  const effectiveStatus = viewingHistoricalStatus ?? status;
  const effectiveIdx = STATUS_ORDER.indexOf(effectiveStatus);
  const showAllTabs = effectiveIdx >= 3;

  useEffect(() => {
    if (!showAllTabs && activeTab !== "operasional") setActiveTab("operasional");
  }, [showAllTabs]); // eslint-disable-line react-hooks/exhaustive-deps

  const population = {
    excavators: doc?.excavators ?? [],
    dumpTrucks: doc?.dumpTrucks ?? [],
    spv: doc?.spv ?? "",
  };
  const breakdownEvents = doc?.breakdownEvents ?? [];
  const shiftHistory = doc?.shiftHistory ?? [];
  const openChecks = doc?.openChecklist ?? { notify: false, ramp: false, excaEnter: false };
  const closingChecks = doc?.closeChecklist ?? { bargeInfo: false, closeBarge: false, finalDraft: false };

  const [eta, setEta] = useState("");
  const [ata, setAta] = useState("");
  useEffect(() => {
    if (doc) { setEta(doc.eta); setAta(doc.ata); }
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [finalActualTonnage, setFinalActualTonnage] = useState("");
  useEffect(() => {
    if (doc) setFinalActualTonnage(doc.finalTonnage != null ? String(doc.finalTonnage) : "");
  }, [doc?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [finalDraftFile, setFinalDraftFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpenAllChecked = Object.values(openChecks).every(Boolean);
  const isClosingAllChecked = Object.values(closingChecks).every(Boolean);
  const ritaseCount = doc ? getRitaseCount(doc) : 0;

  const handleConfirmArrival = () => { if (id && eta && ata) updateDocument(id, { status: "Arrived", eta, ata }); };
  const handleSetOpen = () => { if (id && isOpenAllChecked) updateDocument(id, { status: "Open" }); };
  const handleStartOperation = () => {
    if (!id) return;
    updateDocument(id, d => ({
      status: "On Progress",
      excavators: d.excavators.length ? d.excavators : [
        { code: "EX-001", model: "Hitachi PC200", bucket: 1.6, assignedArea: "EFO A", status: "available" as const },
        { code: "EX-003", model: "Caterpillar 320", bucket: 1.2, assignedArea: "EFO B", status: "available" as const },
      ],
      dumpTrucks: d.dumpTrucks.length ? d.dumpTrucks : [
        { code: "DT-01", plate: "B 1234 ABC", capacity: 10, route: "scheduled" as const, assignedArea: d.area, status: "available" as const },
        { code: "DT-02", plate: "B 5678 DEF", capacity: 12, route: "scheduled" as const, assignedArea: d.area, status: "available" as const },
        { code: "DT-03", plate: "B 9012 GHI", capacity: 15, route: "unscheduled" as const, assignedArea: d.area, status: "available" as const },
      ],
    }));
  };
  const handleCloseBarge = () => {
    if (id && isClosingAllChecked && ritaseCount >= 1) updateDocument(id, { status: "Closed" });
  };
  const handleConfirmDeparture = () => {
    if (id && finalActualTonnage) updateDocument(id, { status: "Departed", finalTonnage: Number(finalActualTonnage) });
  };
  const handleMarkInvalid = () => {
    const trimmed = invalidJustification.trim();
    if (!id || !trimmed) return;
    updateDocument(id, { status: "Invalid", invalidReason: trimmed });
    setShowInvalidModal(false);
    setInvalidJustification("");
  };

  // ─── Population table actions — Sim + Remove only, matching renderPopManagementHtml()'s
  // "..." menu (openAddUnitModal()/markExcaBreakdown()/recoverDT()/openBreakdownModal() are
  // all dead code in index.html, never wired to a button). ───────────────────────────────
  const [dtSearch, setDtSearch] = useState("");
  const [excaSearch, setExcaSearch] = useState("");
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ type: "dt" | "exca"; code: string } | null>(null);

  function simulateLoaded(code: string) {
    if (!id) return;
    const density = doc?.materialDensity || 1.2;
    updateDocument(id, d => ({
      dumpTrucks: d.dumpTrucks.map(dt => {
        if (dt.code !== code || dt.status !== "available") return dt;
        if (dt.route === "unscheduled") {
          const tonnage = Math.round(dt.capacity * density * 10) / 10;
          return { ...dt, status: "loaded" as const, payload: { bucketCount: "-" as const, tonnage } };
        }
        const exca = d.excavators[0];
        const bucketSize = exca?.bucket || 1.6;
        const bucketCount = Math.floor(Math.random() * 5) + 3;
        const tonnage = Math.round(bucketCount * bucketSize * density * 10) / 10;
        return { ...dt, status: "loaded" as const, payload: { bucketCount, tonnage } };
      }),
    }));
  }

  function confirmRemoveUnit() {
    if (!id || !removeTarget) return;
    if (removeTarget.type === "dt") {
      updateDocument(id, d => ({ dumpTrucks: d.dumpTrucks.filter(dt => dt.code !== removeTarget.code) }));
    } else {
      updateDocument(id, d => ({ excavators: d.excavators.filter(e => e.code !== removeTarget.code) }));
    }
    setRemoveTarget(null);
  }

  // ─── Shift Log (Achievement Tonnage) — mirrors renderShiftLogHtml(). ──────────────────
  const [achFilter, setAchFilter] = useState<"shift" | "exca">("shift");
  const [expandedShiftRows, setExpandedShiftRows] = useState<Set<number>>(new Set());
  function toggleShiftDetail(idx: number) {
    setExpandedShiftRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

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

  const accumulatedTonase = doc ? getAccumulatedTonnage(doc) : 0;
  const progressTarget = doc?.targetTonase ?? 0;
  const progress = progressTarget > 0 ? Math.min(100, Math.round((accumulatedTonase / progressTarget) * 100)) : 0;
  const remainingTonase = Math.max(0, progressTarget - accumulatedTonase);

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
  const shiftOverallAch = progressTarget > 0 ? Math.min(100, Math.round(shiftTotalTonnage / progressTarget * 100)) : 0;
  const excaAggregate = new Map<string, number>();
  shiftRows.forEach(r => r.excaSummary.forEach(e => excaAggregate.set(e.code, (excaAggregate.get(e.code) ?? 0) + e.ritase)));
  const excaAggregateRows = Array.from(excaAggregate.entries()).map(([code, ritase]) => ({
    code, ritase,
    tonnage: shiftTotalRitase > 0 ? Math.round((ritase / shiftTotalRitase) * shiftTotalTonnage * 10) / 10 : 0,
  }));

  if (!isCreate && !doc) return null;

  const filteredDt = population.dumpTrucks.filter(dt => dt.code.toLowerCase().includes(dtSearch.trim().toLowerCase()));
  const filteredExca = population.excavators.filter(e => e.code.toLowerCase().includes(excaSearch.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-5xl mx-auto px-8 pt-8 space-y-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link to="/transactional/operation" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Link>
          <span className="text-xs text-gray-500 truncate">
            {isCreate ? "Transactional → Barging Process → Create Barge Document" : doc ? `${doc.id} — ${doc.barge} — ${doc.area}` : ""}
          </span>
        </div>

        {isCreate ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Area / Lokasi (Jetty)">
                <select value={createForm.area} onChange={e => setCreateForm(f => ({ ...f, area: e.target.value }))} className={inputCls}>
                  {CREATE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </FormField>
              <FormField label="Barge (Tongkang)">
                <select value={createForm.barge} onChange={e => setCreateForm(f => ({ ...f, barge: e.target.value }))} className={inputCls}>
                  {CREATE_BARGES.map(b => <option key={b.name} value={b.name}>{b.label}</option>)}
                </select>
              </FormField>
              <FormField label="Material">
                <select value={createForm.material} onChange={e => handleMaterialChange(e.target.value)} className={inputCls}>
                  {Object.keys(MATERIAL_DENSITY).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </FormField>
              <div>
                <FormField label="Densitas Material (MT/m³)">
                  <input type="number" step="0.1" min="0.5" max="3.0" value={createForm.materialDensity} onChange={e => setCreateForm(f => ({ ...f, materialDensity: e.target.value }))} className={inputCls} />
                </FormField>
                <p className="text-[10px] text-gray-400 mt-1.5">Auto-fill dari jenis material. Bisa diubah.</p>
              </div>
              <FormField label="Target Tonase (MT)">
                <input type="number" min="100" value={createForm.targetTonase} onChange={e => setCreateForm(f => ({ ...f, targetTonase: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="ETA">
                <input type="datetime-local" value={createForm.eta} onChange={e => setCreateForm(f => ({ ...f, eta: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="Surveyor">
                <input type="text" value={createForm.surveyor} onChange={e => setCreateForm(f => ({ ...f, surveyor: e.target.value }))} className={inputCls} />
              </FormField>
              <FormField label="SPV / Checker">
                <input type="text" value={createForm.spv} onChange={e => setCreateForm(f => ({ ...f, spv: e.target.value }))} className={inputCls} />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <Link to="/transactional/operation" className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors">
                Batal
              </Link>
              <button onClick={handleCreateDocument} className="bg-[#5B5FC7] hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-indigo-500/20">
                <Save className="w-4 h-4" /> Create Document
              </button>
            </div>
          </div>
        ) : doc && (
          <>
            {/* Doc Info Strip */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm font-bold text-gray-900">{doc.id}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{doc.area}</span>
                  <StatusBadge status={status} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setInfoExpanded(v => !v)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50"
                  >
                    {infoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} Info
                  </button>
                  {!isInvalid && status === "Open" && (
                    <button
                      onClick={() => setShowInvalidModal(true)}
                      className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-100"
                    >
                      Mark as Invalid
                    </button>
                  )}
                </div>
              </div>

              {infoExpanded && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  {[
                    ["Doc ID", doc.id],
                    ["Area / Jetty", doc.area],
                    ["Barge", doc.barge],
                    ["Material", doc.material],
                    ["Target Tonnage", doc.targetTonase ? `${doc.targetTonase.toLocaleString()} MT` : "—"],
                    ["Densitas", doc.materialDensity ? `${doc.materialDensity} MT/m³` : "—"],
                    ["ETA", doc.eta || "—"],
                    ["ATA", doc.ata || "—"],
                    ["Surveyor", doc.surveyor || "—"],
                    ["SPV / Checker", doc.spv || "—"],
                    ["Created Date", doc.createdDate],
                    ["Final Tonnage", doc.finalTonnage ? `${doc.finalTonnage} MT` : "—"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{label}</span>
                      <span className="text-xs text-gray-800 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {isInvalid && invalidReason && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Alasan Invalidasi</span>
                    <p className="text-xs text-rose-900 font-semibold mt-0.5">{invalidReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Flow */}
            {isInvalid ? (
              <div className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                ⚠️ Dokumen ini telah ditandai sebagai <strong>Invalid</strong> dan tidak dapat digunakan dalam proses operasional.
              </div>
            ) : (
              <StatusStepper statusOrder={STATUS_ORDER} currentIdx={currentIdx} onStepClick={setViewingHistoricalStatus} />
            )}

            {/* Historical snapshot banner */}
            {isHistoricalView && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
                <span className="text-xs text-amber-900">📌 <strong>Read-Only</strong> — Tampilan status <strong>{viewingHistoricalStatus}</strong></span>
                <button
                  onClick={() => setViewingHistoricalStatus(null)}
                  className="shrink-0 text-[11px] font-bold text-amber-800 border border-amber-400 bg-white hover:bg-amber-100 px-2.5 py-1 rounded-lg"
                >
                  ← Kembali ke status saat ini
                </button>
              </div>
            )}

            {/* Tabs */}
            <div>
              <div className="flex gap-1 border-b border-gray-200">
                {showAllTabs && (
                  <button
                    onClick={() => setActiveTab("progress")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === "progress" ? "border-[#5B5FC7] text-[#5B5FC7]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <BarChart3 className="w-4 h-4" /> Progress
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("operasional")}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === "operasional" ? "border-[#5B5FC7] text-[#5B5FC7]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  <Settings className="w-4 h-4" /> Operasional
                </button>
                {showAllTabs && (
                  <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${activeTab === "riwayat" ? "border-[#5B5FC7] text-[#5B5FC7]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                  >
                    <History className="w-4 h-4" /> History
                  </button>
                )}
              </div>

              <div className="pt-4 space-y-4">
                {activeTab === "operasional" && (
                  <>
                    {isInvalid ? (
                      <InfoBox tone="orange">
                        <div className="font-bold mb-1.5">Dokumen telah ditandai sebagai Invalid</div>
                        {invalidReason && <div className="text-xs mt-1"><span className="opacity-70">Alasan:</span> <strong>{invalidReason}</strong></div>}
                        <div className="text-[11px] mt-1.5 opacity-70">Tidak ada aksi operasional yang tersedia.</div>
                      </InfoBox>
                    ) : (
                      <>
                        {effectiveIdx <= 1 && (
                          <SectionCard title="Kedatangan Tongkang">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <FormField label="ETA (Estimasi Kedatangan)">
                                <input type="datetime-local" value={eta} onChange={e => setEta(e.target.value)} disabled={readonly || effectiveStatus !== "Planned"} className={inputCls} />
                              </FormField>
                              <FormField label="ATA (Aktual Kedatangan)">
                                <input type="datetime-local" value={ata} onChange={e => setAta(e.target.value)} disabled={readonly || effectiveStatus !== "Planned"} className={inputCls} />
                              </FormField>
                            </div>
                            {!readonly && effectiveStatus === "Planned" ? (
                              <button onClick={handleConfirmArrival} disabled={!eta || !ata} className="bg-[#5B5FC7] hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                                Konfirmasi Kedatangan →
                              </button>
                            ) : ata ? (
                              <InfoBox tone="green">Kedatangan dikonfirmasi. ETA: {eta || "-"} | ATA: {ata || "-"}</InfoBox>
                            ) : null}
                          </SectionCard>
                        )}

                        {effectiveStatus === "Arrived" && (
                          <SectionCard title="Pre-Operasi Checklist" badge={isOpenAllChecked ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">Semua ✓</span> : undefined}>
                            <div className="space-y-2.5">
                              {[
                                { key: "notify" as const, label: "Notifikasi SPV Production" },
                                { key: "ramp" as const, label: "Set Ramp Door" },
                                { key: "excaEnter" as const, label: "Excavator masuk barge" },
                              ].map(item => (
                                <div
                                  key={item.key}
                                  onClick={() => !readonly && id && updateDocument(id, { openChecklist: { ...openChecks, [item.key]: !openChecks[item.key] } })}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${readonly ? "opacity-60" : "cursor-pointer hover:border-[#5B5FC7]/50"} ${openChecks[item.key] ? "bg-indigo-50/60 border-[#5B5FC7]/40" : "bg-white border-gray-200"}`}
                                >
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 ${openChecks[item.key] ? "bg-[#5B5FC7] border-[#5B5FC7]" : "bg-white border-gray-300"}`}>
                                    {openChecks[item.key] && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                                </div>
                              ))}
                            </div>
                            {!readonly && (
                              <button onClick={handleSetOpen} disabled={!isOpenAllChecked} className="mt-4 bg-[#5B5FC7] hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                                Set Status Open →
                              </button>
                            )}
                          </SectionCard>
                        )}

                        {effectiveStatus === "Open" && (
                          <SectionCard title="Mulai Operasi Loading">
                            <InfoBox tone="blue">Semua persiapan selesai. Klik tombol di bawah untuk memulai proses barging.</InfoBox>
                            {!readonly && (
                              <button onClick={handleStartOperation} className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
                                <Play className="w-4 h-4 fill-white" /> Mulai Operasi →
                              </button>
                            )}
                          </SectionCard>
                        )}

                        {effectiveStatus === "On Progress" && (
                          <SectionCard title="Penutupan Tongkang">
                            <div className="space-y-2.5">
                              {[
                                { key: "bargeInfo" as const, label: "Terima informasi barge penuh" },
                                { key: "closeBarge" as const, label: "Close Barge" },
                                { key: "finalDraft" as const, label: "Konfirmasi Final Draft Survey" },
                              ].map(item => (
                                <div
                                  key={item.key}
                                  onClick={() => !readonly && id && updateDocument(id, { closeChecklist: { ...closingChecks, [item.key]: !closingChecks[item.key] } })}
                                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${readonly ? "opacity-60" : "cursor-pointer hover:border-[#5B5FC7]/50"} ${closingChecks[item.key] ? "bg-indigo-50/60 border-[#5B5FC7]/40" : "bg-white border-gray-200"}`}
                                >
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 ${closingChecks[item.key] ? "bg-[#5B5FC7] border-[#5B5FC7]" : "bg-white border-gray-300"}`}>
                                    {closingChecks[item.key] && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                                </div>
                              ))}
                            </div>
                            {!readonly && (
                              <>
                                <button onClick={handleCloseBarge} disabled={!isClosingAllChecked || ritaseCount < 1} className="mt-4 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                                  Close Tongkang
                                </button>
                                {ritaseCount < 1 && <p className="text-[11px] text-rose-600 mt-1.5">Minimal 1 ritase diperlukan sebelum bisa close.</p>}
                              </>
                            )}
                          </SectionCard>
                        )}

                        {effectiveStatus === "Closed" && (
                          <SectionCard title="Data Final & Keberangkatan">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <FormField label="Final Tonnage Aktual (MT)">
                                <input
                                  type="number"
                                  placeholder="Masukkan tonase final"
                                  value={finalActualTonnage}
                                  onChange={e => setFinalActualTonnage(e.target.value)}
                                  disabled={readonly}
                                  className={inputCls}
                                />
                              </FormField>
                              <FormField label="Upload Dokumen Draft Survey">
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  onChange={e => setFinalDraftFile(e.target.files?.[0] || null)}
                                  disabled={readonly}
                                  className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-bold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 disabled:opacity-50"
                                />
                                {finalDraftFile && <p className="text-[11px] text-emerald-600 font-medium mt-1">{finalDraftFile.name}</p>}
                              </FormField>
                            </div>
                            {!readonly && (
                              <button onClick={handleConfirmDeparture} disabled={!finalActualTonnage} className="bg-[#5B5FC7] hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                                <Flag className="w-4 h-4" /> Konfirmasi Keberangkatan →
                              </button>
                            )}
                          </SectionCard>
                        )}

                        {effectiveStatus === "Departed" && (
                          <SectionCard title="Operasi Selesai" badge={<span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">Departed ✓</span>}>
                            <InfoBox tone="green">
                              Tongkang <strong>{doc.barge}</strong> telah berangkat. Final Tonnage: <strong>{doc.finalTonnage || "-"} MT</strong>. Total Ritase: <strong>{ritaseCount}</strong>. Operasi berhasil diselesaikan.
                            </InfoBox>
                          </SectionCard>
                        )}

                        {/* Populasi & Assignment — auto-populate dari Operator App, view-only aside from Sim + Remove */}
                        {effectiveIdx >= 3 && (
                          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                              <h3 className="text-sm font-bold text-gray-900">Populasi & Assignment</h3>
                              <span className="text-[11px] text-gray-400">Auto-populate dari Operator App</span>
                            </div>

                            <div className="px-5 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700">Dump Truck ({population.dumpTrucks.length})</span>
                            </div>
                            <div className="px-5 py-2 border-b border-gray-100">
                              <div className="relative max-w-xs">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input value={dtSearch} onChange={e => setDtSearch(e.target.value)} placeholder="Search by No Unit..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
                              </div>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                              <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                  <tr>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Code</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Unit</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Route</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Area</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {filteredDt.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-4 text-xs text-gray-400 text-center">Belum ada Dump Truck (auto-populate dari Operator App).</td></tr>
                                  ) : filteredDt.map(dt => {
                                    const menuKey = `dt-${dt.code}`;
                                    return (
                                      <tr key={dt.code}>
                                        <td className="px-4 py-2.5"><span className="text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded">{dt.code}</span></td>
                                        <td className="px-4 py-2.5 text-xs text-gray-600">{dt.plate}<br /><span className="text-[10px] text-gray-400">{dt.capacity}m³</span></td>
                                        <td className="px-4 py-2.5">
                                          <span className={`text-[11px] font-bold ${dt.route === "unscheduled" ? "text-rose-600" : "text-emerald-600"}`}>
                                            {dt.route === "unscheduled" ? "Unscheduled" : "Scheduled"}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500">{dt.assignedArea || "—"}</td>
                                        <td className="px-4 py-2.5 relative">
                                          {readonly ? (
                                            <span className="text-[11px] text-gray-300">—</span>
                                          ) : (
                                            <>
                                              <button onClick={() => setOpenMenuKey(k => k === menuKey ? null : menuKey)} className="p-1 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50">
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                              </button>
                                              {openMenuKey === menuKey && (
                                                <>
                                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuKey(null)} />
                                                  <div className="absolute right-4 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[130px] overflow-hidden">
                                                    {dt.status === "available" && (
                                                      <button onClick={() => { simulateLoaded(dt.code); setOpenMenuKey(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100">▶ Sim</button>
                                                    )}
                                                    {dt.status === "available" && (
                                                      <button onClick={() => { setRemoveTarget({ type: "dt", code: dt.code }); setOpenMenuKey(null); }} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50">Remove</button>
                                                    )}
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="px-5 py-2.5 bg-gray-50/50 border-y border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-700">Excavator ({population.excavators.length})</span>
                            </div>
                            <div className="px-5 py-2 border-b border-gray-100">
                              <div className="relative max-w-xs">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input value={excaSearch} onChange={e => setExcaSearch(e.target.value)} placeholder="Search by No Unit..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
                              </div>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                              <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                  <tr>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Code</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Model</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Bucket</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Area</th>
                                    <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Aksi</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {filteredExca.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-4 text-xs text-gray-400 text-center">Belum ada Excavator (auto-populate dari Operator App).</td></tr>
                                  ) : filteredExca.map(ex => {
                                    const menuKey = `exca-${ex.code}`;
                                    return (
                                      <tr key={ex.code}>
                                        <td className="px-4 py-2.5"><span className="text-xs font-bold bg-indigo-100 text-[#5B5FC7] px-1.5 py-0.5 rounded">{ex.code}</span></td>
                                        <td className="px-4 py-2.5 text-xs text-gray-600">{ex.model}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500">{ex.bucket}m³/bkt</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500">{ex.assignedArea || "—"}</td>
                                        <td className="px-4 py-2.5 relative">
                                          {readonly ? (
                                            <span className="text-[11px] text-gray-300">—</span>
                                          ) : (
                                            <>
                                              <button onClick={() => setOpenMenuKey(k => k === menuKey ? null : menuKey)} className="p-1 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50">
                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                              </button>
                                              {openMenuKey === menuKey && (
                                                <>
                                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuKey(null)} />
                                                  <div className="absolute right-4 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[130px] overflow-hidden">
                                                    <button onClick={() => { setRemoveTarget({ type: "exca", code: ex.code }); setOpenMenuKey(null); }} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50">Remove</button>
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {activeTab === "progress" && (
                  effectiveIdx < 3 ? (
                    <div className="text-center py-16 text-gray-400">
                      <div className="text-3xl mb-2">📊</div>
                      <p className="text-sm font-medium">Data progress tersedia setelah operasi dimulai.</p>
                    </div>
                  ) : (
                    <>
                      <SectionCard title="Progress Produksi" badge={<span className="text-[11px] text-gray-400">Auto-update dari Operator App</span>}>
                        <div className="grid grid-cols-3 gap-4 mb-5">
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Target className="w-3 h-3" /> Target</div>
                            <div className="text-xl font-black text-gray-900">{progressTarget.toLocaleString()} <span className="text-xs font-medium text-gray-500">MT</span></div>
                          </div>
                          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <div className="text-[10px] font-bold text-[#5B5FC7] uppercase tracking-wider mb-1.5 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Akumulasi</div>
                            <div className="text-xl font-black text-[#5B5FC7]">{accumulatedTonase.toFixed(1)} <span className="text-xs font-medium text-indigo-400">MT</span></div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 flex items-center gap-1"><Truck className="w-3 h-3" /> Total Ritase</div>
                            <div className="text-xl font-black text-blue-900">{ritaseCount} <span className="text-xs font-medium text-blue-500">Rit</span></div>
                          </div>
                        </div>
                        <div className="mb-5">
                          <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                            <span>{progress}% tercapai</span>
                            <span>Sisa: {remainingTonase.toFixed(1)} MT</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-[#5B5FC7] h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        {effectiveStatus === "On Progress" && !readonly && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between gap-4">
                            <span className="text-xs text-blue-800"><strong>Integrasi Mobile:</strong> Data ritase & tonnage di-sync otomatis dari Operator App setiap kali operator submit dumping di Jetty.</span>
                            <button onClick={simulateRitase} className="shrink-0 bg-[#5B5FC7] hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                              <RefreshCw className="w-3.5 h-3.5" /> Refresh
                            </button>
                          </div>
                        )}
                        {effectiveStatus === "On Progress" && readonly && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800">
                            <strong>Integrasi Mobile:</strong> Data ritase & tonnage di-sync otomatis dari Operator App.
                          </div>
                        )}
                      </SectionCard>

                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                          <h3 className="text-sm font-bold text-gray-900">Achievement Tonnage</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-gray-500">{shiftTotalRitase} rit | {shiftTotalTonnage.toFixed(1)} MT | <strong className="text-gray-700">{shiftOverallAch}%</strong></span>
                            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                              <button onClick={() => setAchFilter("shift")} className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${achFilter === "shift" ? "bg-[#5B5FC7] text-white" : "text-gray-600"}`}>By Shift</button>
                              <button onClick={() => setAchFilter("exca")} className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${achFilter === "exca" ? "bg-[#5B5FC7] text-white" : "text-gray-600"}`}>By Exca</button>
                            </div>
                          </div>
                        </div>

                        {achFilter === "shift" ? (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Shift</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Tanggal</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500 text-right">Ritase</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500 text-right">Tonnage (MT)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {shiftRows.map((r, idx) => {
                                const hasDetail = r.excaSummary.length > 0;
                                const isOpen = expandedShiftRows.has(idx);
                                return (
                                  <Fragment key={idx}>
                                    <tr>
                                      <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">
                                        <div className="flex items-center gap-1.5">
                                          {hasDetail ? (
                                            <button onClick={() => toggleShiftDetail(idx)} className="text-gray-400 hover:text-[#5B5FC7]">
                                              {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                          ) : <span className="w-3" />}
                                          {r.shift}
                                          {"isCurrent" in r && r.isCurrent && <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Berjalan</span>}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2.5 text-xs text-gray-500">{r.date}</td>
                                      <td className="px-4 py-2.5 text-xs font-bold text-gray-900 text-right">{r.ritase}</td>
                                      <td className="px-4 py-2.5 text-xs font-bold text-[#5B5FC7] text-right">{r.tonnage.toFixed(1)}</td>
                                    </tr>
                                    {hasDetail && isOpen && (
                                      <tr className="bg-gray-50/60">
                                        <td colSpan={4} className="px-4 py-2 pl-10">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[11px] text-gray-500 mr-1">Exca:</span>
                                            {r.excaSummary.map(e => (
                                              <span key={e.code} className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-0.5 text-[11px]">
                                                <strong className="text-gray-900">{e.code}</strong><span className="text-gray-500">{e.ritase} rit</span>
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
                        ) : (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500">Excavator</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500 text-right">Ritase</th>
                                <th className="px-4 py-2 text-[11px] font-bold text-gray-500 text-right">Tonnage (MT)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {excaAggregateRows.length === 0 ? (
                                <tr><td colSpan={3} className="px-4 py-6 text-xs text-gray-400 text-center">Belum ada data exca.</td></tr>
                              ) : excaAggregateRows.map(e => (
                                <tr key={e.code}>
                                  <td className="px-4 py-2.5"><span className="text-xs font-bold bg-indigo-100 text-[#5B5FC7] px-1.5 py-0.5 rounded">{e.code}</span></td>
                                  <td className="px-4 py-2.5 text-xs font-bold text-gray-900 text-right">{e.ritase}</td>
                                  <td className="px-4 py-2.5 text-xs font-bold text-[#5B5FC7] text-right">{e.tonnage.toFixed(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )
                )}

                {activeTab === "riwayat" && (
                  <SectionCard title="Riwayat Breakdown & Transfer" badge={<span className="text-[11px] text-gray-400">{breakdownEvents.length} kejadian</span>}>
                    {breakdownEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-2xl mb-1.5">✅</div>
                        <p className="text-xs font-medium">Tidak ada kejadian breakdown.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5">
                        {[...breakdownEvents].reverse().map(ev => {
                          const tone = ev.type === "dt_breakdown" ? "rose" : ev.type === "exca_breakdown" ? "amber" : "emerald";
                          const toneCls = tone === "rose" ? "border-rose-200" : tone === "amber" ? "border-amber-200" : "border-emerald-200";
                          const badgeCls = tone === "rose" ? "bg-rose-100 text-rose-700" : tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
                          return (
                            <div key={ev.id} className={`bg-white border rounded-xl p-3.5 ${toneCls}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeCls}`}>
                                  {ev.type === "dt_breakdown" && "⚠️ DT Breakdown & Transfer"}
                                  {ev.type === "dt_recovery" && "✅ DT Recovery"}
                                  {ev.type === "exca_breakdown" && "⚠️ Exca Breakdown"}
                                  {ev.type === "exca_recover" && "✅ Exca Recovery"}
                                </span>
                                <span className="text-[10px] text-gray-400">{ev.timestamp}</span>
                              </div>
                              {ev.type === "dt_breakdown" && (
                                <>
                                  <div className="text-xs font-bold text-rose-700">{ev.fromTruck} <span className="text-gray-400 font-normal mx-1">→</span> {ev.toTruck}</div>
                                  <div className="text-[11px] text-gray-500 mt-1">{ev.bucketCount !== "-" ? `${ev.bucketCount} bucket | ` : ""}{ev.tonnage} MT ditransfer</div>
                                  {ev.note && <div className="text-[10px] text-gray-400 mt-1">{ev.note}</div>}
                                </>
                              )}
                              {ev.type === "dt_recovery" && (
                                <>
                                  <div className="text-xs font-bold text-emerald-700">{ev.unit}</div>
                                  <div className="text-[11px] text-gray-500 mt-1">Unit kembali ke status Available</div>
                                </>
                              )}
                              {ev.type === "exca_breakdown" && (
                                <>
                                  <div className="text-xs font-bold text-amber-700">{ev.unit}</div>
                                  <div className="text-[11px] text-gray-500 mt-1">Excavator ditandai Breakdown oleh SPV</div>
                                </>
                              )}
                              {ev.type === "exca_recover" && (
                                <>
                                  <div className="text-xs font-bold text-emerald-700">{ev.unit}</div>
                                  <div className="text-[11px] text-gray-500 mt-1">Excavator kembali ke status Available</div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-3">
                      <InfoBox tone="blue">
                        <span className="text-[11px]"><strong>Catatan:</strong> Recovery unit (DT/Exca) oleh SPV berdasarkan konfirmasi dari workshop via HT. Perubahan commissioning status unit (RFU / Not RFU) di Master Populasi belum terintegrasi — dependency ke modul Master Unit.</span>
                      </InfoBox>
                    </div>
                  </SectionCard>
                )}
              </div>
            </div>
          </>
        )}
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

      {removeTarget && (
        <ActionModal
          variant="confirm"
          title="Keluarkan Unit?"
          message={
            removeTarget.type === "dt"
              ? `Dump Truck ${removeTarget.code} akan dikeluarkan dari operasi barging ini.`
              : `Excavator ${removeTarget.code} akan dikeluarkan dari operasi barging ini.`
          }
          onConfirm={confirmRemoveUnit}
          onCancel={() => setRemoveTarget(null)}
        />
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
