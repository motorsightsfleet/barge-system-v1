# Konteks Sistem: Barge System Web POC

## 1. Overview

Aplikasi ini adalah **sistem manajemen operasional barging (pengangkutan material via tongkang/barge)** di lingkungan pertambangan. Mencakup manajemen data master dan workflow transaksional dari perencanaan hingga selesai operasi.

**Tech Stack:**
- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui + Radix UI
- React Router v7 (client-side routing)
- Recharts (visualisasi data)
- Semua data masih **mock/statis** (belum terhubung backend/API)

---

## 2. Struktur Aplikasi

```
src/
├── main.tsx                        # Bootstrap React
├── app/
│   ├── App.tsx                     # Root component
│   ├── routes.tsx                  # Definisi routing
│   └── components/
│       ├── Layout.tsx              # Shell: sidebar + header
│       ├── Dashboard.tsx           # Halaman ringkasan
│       ├── master/
│       │   ├── MasterArea.tsx
│       │   ├── MasterBarge.tsx
│       │   ├── MasterShift.tsx
│       │   └── MasterPopulation.tsx
│       └── transactional/
│           ├── Planning.tsx        # List dokumen barging
│           └── PlanningDetail.tsx  # Detail + workflow per dokumen
```

---

## 3. Layout & Navigasi

`Layout.tsx` membungkus semua halaman dengan:
- **Sidebar kiri** (lebar 264px, dark `#2d3748`): navigasi hierarki — Dashboard → Master Data (Area, Barge, Shift, Population) → Transactional (Barging Process)
- **Top header**: breadcrumb halaman + notifikasi + profil user (hardcoded sebagai "Administrator / Super Admin")
- **Main content**: `<Outlet />` dari React Router

Sidebar mendukung expand/collapse per section (state lokal `masterExpanded`, `transactionalExpanded`).

---

## 4. Dashboard

**Route:** `/dashboard`

Halaman ringkasan operasional dengan:

| Komponen | Isi |
|---|---|
| 4 Metric Cards | Active Population (24 units), Tonnage Today (14.5k MT), Completed Ops (8 barges), Avg Loading Time (16.2 Hrs) |
| Area Chart | Weekly Tonnage Performance (Mon–Sun) |
| Donut/Pie Chart | Distribusi status operasi: Operation 45%, Completed 30%, Draft 15%, Ready 10% |
| Tabel Recent Operations | 4 baris mock: BRG-001 s/d BRG-004 dengan status, progress bar, dan link ke detail |

Data semua hardcoded. Tombol "Manage Operations" mengarah ke `/transactional/operation`.

---

## 5. Master Data

Keempat halaman master (Area, Barge, Shift, Population) memiliki pola UI yang identik: header + tombol "Add New ...", search input, tabel dengan kolom spesifik, pagination Previous/Next, dan tombol Edit & Delete per baris. Status implementasi masing-masing (handler, filter, dll.) — lihat [§9 Catatan Implementasi](#9-catatan-implementasi).

### 5.1 Master Area (`/master/area`)
Mengelola lokasi/area bongkar muat barge.

**Field:** Area Code, Area Name, Type, Remark, Status (Active/Inactive)

| Tipe Area | Contoh |
|---|---|
| Jetty | Jetty Timur, Jetty Barat |
| Anchorage | Anchorage Point 1 (area tunggu) |

---

### 5.2 Master Barge (`/master/barge`)
Registry armada tongkang.

**Field:** Barge Code, Barge Name, Capacity (MT), Remark, Status (Active/Inactive)

| Barge | Kapasitas | Status |
|---|---|---|
| BG-001 · SEA TITAN | 5.000 MT | Active |
| BG-002 · RIVER KING | 3.500 MT | Active |
| BG-003 · OCEAN BLUE | 4.000 MT | Inactive (maintenance) |

---

### 5.3 Master Shift (`/master/shift`)
Pengaturan jam kerja operasional.

**Field:** Shift ID, Nama Shift, Jam Mulai, Jam Selesai, Remark, Status (Active/Inactive)

| Shift | Waktu |
|---|---|
| Shift A (Day Shift) | 07:00–19:00 |
| Shift B (Night Shift) | 19:00–07:00 |

---

### 5.4 Master Population (`/master/population`)
Registry alat berat yang digunakan dalam operasi barging.

**Field:** Unit Code, Category, Unit Type, Fleet Number, Plate Number, Vendor, Op Status, Life Status (Active/Inactive)

| Kategori | Kode | Contoh Unit Type |
|---|---|---|
| Dump Truck | DT-xxx | HD785 |
| Excavator | EX-xxx | PC2000, PC1250 |

| Op Status | Arti |
|---|---|
| Available | Siap dipakai |
| Operating | Sedang beroperasi |
| Maintenance | Dalam perawatan terjadwal |
| Breakdown | Rusak / tidak bisa digunakan |

---

## 6. Transactional: Barging Process

### 6.1 List Dokumen (`/transactional/operation`)

`Planning.tsx` menampilkan semua dokumen barging dalam bentuk tabel dengan kolom:
- Document ID (format `BRG-xxx`)
- Start Date
- Location (Area)
- Vessels (Barge + Tugboat)
- Target Tonase
- Status
- Tombol "View Detail"

Tombol **"Create New Document"** mengarah ke `/transactional/operation/create`.

**Status yang muncul di list:** Draft, Arrived, Operation, Completed

---

### 6.2 Detail & Workflow Dokumen (`/transactional/operation/:id`)

`PlanningDetail.tsx` — halaman utama yang paling kompleks. Menggunakan React state lokal untuk mensimulasikan **workflow SOP berbasis status**.

#### Data yang dikelola per dokumen:

```
General Info:
  - Area / Jetty
  - Barge Name
  - Material Type  (contoh: Coal, Nickel)
  - Surveyor       (contoh: PT. Sucofindo)
  - Target Tonase  (MT)

Population:
  - Excavators     (list unit code, misal: EX-001, EX-002)
  - Dump Trucks    (list unit code, misal: DT-012, DT-015, ...)
  - SPV/Checker    (nama supervisor)

Arrival:
  - ETA (Estimation Time Arrival)
  - ATA (Actual Time Arrival)

Daily Achievements (per shift):
  - Date, Shift (DS/NS), Ritase (jumlah trip), Tonase (MT), Remark

Final Closing:
  - Actual Final Tonnage (MT)
  - File Draft Survey (upload dokumen)
```

---

### 6.3 Lifecycle / Status Workflow

Status berjalan **linear dan satu arah**: tidak bisa mundur ke status sebelumnya.

```
Draft → Arrived → Ready → Operation → Completed
```

Setiap transisi status memiliki **syarat yang harus dipenuhi** sebelum bisa lanjut:

#### STEP 1 — Draft
- Dokumen dibuat, General Info & Population diisi
- Tombol "Save Document" tersedia (belum ada handler simpan)
- Timeline sidebar menunjukkan tahap ini sebagai `current`

#### STEP 2 — Arrived
**Trigger:** Isi ETA + ATA → klik "Confirm Arrival"

**Syarat:** ETA dan ATA keduanya harus diisi (format datetime-local)

Setelah confirm: status berubah ke `Arrived`

#### STEP 3 — Ready
**Trigger:** Checklist pre-operation → klik "Set Status Ready"

**Checklist (semua harus ✓):**
1. Notify SPV Production
2. Set Ramp Door
3. Excavator enters barge

**Syarat:** Semua 3 item checklist harus tercentang

Setelah semua ✓: status berubah ke `Ready`

#### STEP 4 — Operation
**Trigger:** Klik "Start Operation"

**Syarat:** Status harus `Ready`

Setelah klik: status berubah ke `Operation`

Pada tahap ini panel **Production Progress** muncul di main content:
- Stats: Target Tonase, Accumulated Tonase, Accumulated Ritase, Remaining
- Progress bar (accumulated tonase / target × 100%)
- Tabel Achievement History (per shift)
- Tombol "Add Achievement" → membuka modal input

**Modal Add Achievement:** input Date, Shift (DS/NS), Ritase, Tonase (MT), Remark

#### STEP 5 — Completed
**Trigger:** Checklist closing → klik "Complete Barging"

**Checklist (semua harus ✓):**
1. Receive barge full info
2. Close Barge
3. Confirm Final Draft

**Syarat tambahan:** Minimal ada 1 achievement yang sudah diinput

Setelah complete:
- Status berubah ke `Completed`
- Loading Duration dicatat (hardcoded contoh: "1 Day 14 Hours 30 Mins")
- Panel **Final Data** muncul untuk input:
  - Actual Final Tonnage (MT) — dengan kalkulasi selisih vs accumulated
  - Upload dokumen Draft Survey (PDF/JPG/PNG/DOC)

---

## 7. Kalkulasi Otomatis (Production Progress)

```
accumulatedTonase = SUM(achievements[].tonase)
accumulatedRitase = SUM(achievements[].ritase)
progress          = MIN(100, ROUND(accumulatedTonase / targetTonase × 100))
remainingTonase   = MAX(0, targetTonase - accumulatedTonase)
```

Kalkulasi ini reaktif — langsung update setiap achievement baru ditambahkan.

---

## 8. Status Badge & Warna

| Status | Warna | Konteks |
|---|---|---|
| Draft | Amber/Kuning | Dokumen baru dibuat |
| Arrived | Amber/Kuning | Barge sudah tiba |
| Ready | Amber/Kuning | Siap mulai loading |
| Operation | Indigo/Ungu | Sedang loading aktif |
| Completed | Emerald/Hijau | Operasi selesai |

Warna brand utama: `#5B5FC7` (indigo)

---

## 9. Catatan Implementasi

| Aspek | Kondisi Saat Ini |
|---|---|
| Data | Semua mock/hardcoded, belum ada API |
| State Management | React `useState` lokal per halaman |
| Form submission | Belum ada handler POST/PUT ke backend |
| Search & Filter | UI ada, tapi belum ada logika filter |
| Pagination | UI ada, belum fungsional |
| Auth | Hardcoded "Administrator / Super Admin" |
| Audit Trail | Tombol ada di header detail, belum diimplementasi |
| File upload | Handler lokal (`useState<File>`), belum ada upload ke server |

---

## 10. Alur Bisnis Ringkas

```
1. Setup Master Data
   └─ Daftarkan: Area (jetty/anchorage), Barge, Shift, Population (alat berat)

2. Buat Dokumen Barging (Transactional)
   └─ Pilih: Area, Barge, Material, Surveyor, Target Tonase
   └─ Assign: Excavator + Dump Truck + SPV

3. Konfirmasi Kedatangan Barge
   └─ Input ETA & ATA → status: Arrived

4. Pre-Operation Checklist
   └─ Notif SPV + Ramp Door + Excavator masuk → status: Ready

5. Mulai Operasi Loading
   └─ Klik Start → status: Operation
   └─ Input achievement per shift (ritase + tonase)

6. Tutup Operasi
   └─ Closing checklist (barge full + close + final draft) → status: Completed
   └─ Input actual final tonnage + upload dokumen survey
```

---

---

# Vanilla JS POC — index.html (SPV Dashboard Aktif)

> **Versi ini yang aktif dikembangkan sebagai referensi TSD.** File: `03. PRD/04. poc/01. website/index.html`. Berbeda dari React app di atas — single-file vanilla JS, tanpa framework.

## A. Overview

Web dashboard SPV berbasis vanilla HTML + JS. Data di `localStorage`. Didesain untuk desktop dengan sidebar navigation.

**localStorage keys:**

| Key | Isi |
|---|---|
| `bargingSystem_v1_web` | Dokumen barging (array `docs` + `nextSeq`) |
| `bargingSystem_v1_shared` | `payloadTransfers` (integrasi ke mobile) |
| `operatorAppData_v2` | Data mobile — dibaca web untuk sinkronisasi ritase |

**Auth (hardcoded):** password semua `password123`; users: `spv1` (SPV Lapangan), `ops1` (Operator Senior), `admin` (Administrator)

## B. Halaman & Tab

3 halaman (via sidebar): **Dashboard** · **Dokumen Barging** (planning list) · **Detail Dokumen**

Detail dokumen menggunakan **4 tab**:

| Tab | Konten |
|---|---|
| Operasional | Kedatangan, open checklist, DT panel (simulate/breakdown), close checklist, final data |
| Progress | Progress bar, metrics, refresh ritase, log achievement per shift (expandable per-exca) |
| Populasi | Manajemen DT & Exca — add/remove/ubah route+area; hanya aktif saat On Progress |
| Riwayat | 12-field info dokumen + daftar breakdown events |

## C. Dokumen Barging — Schema

```javascript
{
    id, vesselName, barge, material, targetTonase, materialDensity,
    createdDate, createdBy, eta, ata,
    status,          // 'Planned'|'Arrived'|'Open'|'On Progress'|'Closed'|'Departed'
    excas: [{ code, model, bucket, assignedArea }],
    dumpTrucks: [{ code, plate, vessel_capacity_m3, route, assignedArea, status }],
    openChecklist: { notify, ramp, excaEnter },
    closeChecklist: { bargeInfo, closeBarge, finalDraft },
    simulatedRitase, simulatedTonnage,
    shiftHistory: [{ shift, date, ritase, tonnage, target,
                     excaSummary: [{ code, ritase }] }],
    breakdownEvents: [{ timestamp, fromTruck, toTruck, tonnage, bucketCount, notes }],
    finalTonnage, documentFile
}
```

## D. Konstanta

```javascript
ALL_DT          // 5 DT dengan vessel_capacity_m3 (10, 12, 15, 10, 8)
ALL_EXCAS       // 4 Exca: EX-001 bucket 1.6, EX-002 2.4, EX-003 1.2, EX-004 2.0
AREAS_LOADING   // ['EFO A', 'EFO B', 'Stockpile A']
AREAS_JETTY     // ['Jetty F', 'Jetty G', 'Jetty H']
AREAS_DIRECT    // ['PIT', 'ETO']
ALL_AREAS       // [...AREAS_LOADING, ...AREAS_JETTY, ...AREAS_DIRECT] — semua area tanpa filter
MATERIAL_DENSITY // { 'Coal': 1.2, 'Nickel': 1.6 }
```

> `AREAS_LOADING`, `AREAS_JETTY`, `AREAS_DIRECT` tetap ada untuk keperluan lain (shift log, simulasi), tapi **tidak lagi digunakan untuk filter dropdown DT**.

## E. DT Route & Kalkulasi Tonnage

| Route | Mobile? | Tonnage Formula |
|---|---|---|
| `normal` | ✅ | `bucketCount × bucket_m3 × materialDensity` |
| `direct` | ❌ | `vessel_capacity_m3 × materialDensity` |

**Area dropdown DT**: menampilkan `ALL_AREAS` (semua Master Area) tanpa filtering berdasarkan route. SPV memilih sendiri area yang sesuai — tidak ada guardrail berbasis tipe area. Route direcord untuk keperluan kalkulasi tonnage, bukan untuk membatasi pilihan area.

**Breakdown transfer (min rule):**
```
tonnage = min(fromDT.vessel_capacity_m3, toDT.vessel_capacity_m3) × materialDensity
```
Berlaku trip pertama DT penerima; trip selanjutnya normal.

## F. Population Management

- Aktif hanya saat status **On Progress**
- **Remove** hanya jika DT status = `available` (warning modal: "koordinasi via HT dulu")
- **Ganti route** → area tidak di-reset; dropdown tetap menampilkan `ALL_AREAS`
- **Add** dari master pool, exclude yang sudah ada di dokumen

## G. Shift Log (Tab Progress)

- Per-shift row dengan expand `▶` → tampilkan per-exca ritase summary
- `excaSummary: [{ code, ritase }]` tersimpan di `shiftHistory` per entry
- Current shift: distribusi `simulatedRitase` rata ke loading excas
- Kolom per shift: Shift, Tanggal, Ritase, Tonnage (MT) — tidak ada target per shift
- Progress keseluruhan dihitung dari akumulasi tonnage vs `targetTonase` dokumen

## H. Breakdown/Transfer Flow (Web ↔ Mobile)

1. SPV klik "Tandai Breakdown" → pilih DT penerima (available only)
2. Modal preview tonnage min() rule sebelum konfirmasi
3. Web tulis ke `bargingSystem_v1_shared.payloadTransfers` + void loading DT asal di mobile localStorage
4. Mobile: DT penerima muncul dengan label "Transfer Payload" di Record Dumping
5. Mobile: submit dumping → `markTransferComplete()` → shared entry `completed: true`

## I. Catatan untuk TSD

| Aspek | POC | Sistem Nyata |
|---|---|---|
| Ritase sync | Baca mobile localStorage langsung | Mobile POST ritase ke server → server aggregate |
| Direct DT tonnage | Tombol "Simulate Loaded" per DT | SPV konfirmasi trip; server hitung otomatis |
| Shift log | Seed data + current dari simulatedRitase | Auto-bucket aktivitas by timestamp vs master shift |
| Population management | localStorage in-memory | Server API + push notification ke operator |
| Breakdown | Cross-localStorage write | SPV POST → server push notification ke mobile |
| materialDensity | Auto-fill dari material (Coal → 1.2, Nickel → 1.6), editable override | Dari `M_material_types.default_density`; nilai POC: Coal 1.2, Nickel 1.6 |
