# Konteks Sistem: Operator App Mobile POC

## 1. Overview

Aplikasi ini adalah **mobile app untuk Operator Excavator** dalam operasi barging di lokasi pertambangan. Operator menggunakannya secara real-time di lapangan — baik di area loading (EFO/Stockpile) maupun di area dumping (Jetty/Barge).

**Tech Stack:**
- Single-file HTML + Vanilla JavaScript (tidak ada framework)
- Tailwind CSS inline + custom styling
- Data disimpan di `localStorage` browser (semua mock/statis, belum terhubung backend)
- Dioptimalkan untuk layar mobile 375×740px (simulasi iPhone frame)

**Dibuat oleh:** Fatahillah (Product side)  
**Versi file:** `index.html` — Production v3

---

## 2. Screens & Navigation

Navigasi utama via **Bottom Tab Bar** (3 tab: Home, History, Profile). Beberapa screen tidak punya tab (navigasi via back button atau tombol aksi).

| Screen ID | Nama | Akses |
|---|---|---|
| `login-screen` | Login | Entry point |
| `home-screen` | Home | Tab: Home |
| `history-screen` | History | Tab: History |
| `profile-screen` | Profile | Tab: Profile |
| `plan-screen` | Setup Barging Plan | Dari Profile → "Setup Barging Plan" |
| `loading-screen` | Record Loading | Dari Home (jika area type = loading) |
| `dumping-screen` | Record Dumping | Dari Home (jika area type = dumping) |

---

## 3. Domain Konsep Utama

### Session
Setiap kali operator mulai kerja, ia **setup session** dengan memilih:
- **Area** (dropdown dari daftar area yang tersedia)
- **Excavator** (radio card; hanya excavator `available` yang bisa dipilih)

Session tersimpan di `localStorage` sebagai `currentSession`:
```json
{
  "area": "EFO A",
  "areaType": "loading",
  "exca": { "code": "Exca PC200-17", "model": "Hitachi PC200", "bucket": 1.6 },
  "startTime": "ISO timestamp"
}
```

### Tipe Area
Area terbagi dua berdasarkan `type`:
- **`loading`** — EFO A, EFO B, Stockpile A → operator di sini hanya bisa Record Loading
- **`dumping`** — Jetty F - Barge Ship 12, Jetty F - Barge Ship 14, Jetty G - Barge Ship 4 → operator di sini hanya bisa Record Dumping

Satu operator, satu area, satu excavator per session.

### Skenario Direct Barging
Dump Truck dengan route **`direct`** (dari PIT/ETO langsung ke Jetty) **tidak masuk ke flow mobile** — mobile tidak merekam loading/dumping untuk DT direct. Tonnage DT direct dihitung di web oleh SPV: `vessel_capacity_m3 × materialDensity` per trip, tanpa bucket count.

### Aktivitas: Loading
Field input operator:
- **Truck** (dropdown nomor plat)
- **Jumlah Bucket** (stepper ±; default 5, range 1–15)

Kalkulasi otomatis sistem:
```
Est. Tonnage = bucket_count × bucket_size_m3 × materialDensity
```
Contoh: 5 bucket × 1.6 m³ × 1.2 (Coal GAR) = 9.6 ton

`materialDensity` diambil dari dokumen barging aktif (`doc.materialDensity`), bukan hardcoded. Default fallback: 1.6 jika dokumen tidak ditemukan.

Data yang tersimpan: `{ id, timestamp, type: 'loading', truck, exca, area, bucketCount, tonnage, operator }`

### Aktivitas: Dumping
Field input operator:
- **Truck** (dropdown nomor plat)

Tidak ada kalkulasi tonnage di sisi dumping. Setiap submit dumping otomatis = **+1 ritase** (by barge).

Data tersimpan: `{ id, timestamp, type: 'dumping', truck, exca, area, operator }`

### Ritase
Ritase adalah **1 siklus penuh**: 1 truck Loading di EFO → Dumping di Barge.

Logika pairing di POC:
- Saat operator submit Dumping, sistem mencari loading activity terbaru untuk truck yang sama (yang belum punya `ritaseId`) → dipasangkan
- Ritase entity: `{ id, dumpingId, loadingId (nullable), truck, completed: true, timestamp }`
- Jika tidak ada loading yang cocok (e.g. shift sebelumnya sudah loading) → ritase tetap terbentuk dengan `loadingId: null`

---

## 4. Screens Detail

### 4.1 Login
- Input: username + password
- Auth: validasi vs `localStorage` (hardcoded `operator001` / `password123`)
- Forgot Password: kirim request reset ke Admin (simulasi, tanpa backend)
- Auto-login: jika sudah ada data operator di `localStorage`, langsung ke Home

### 4.2 Home
**Jika belum ada session:** warning card + stats disabled (semua 0)

**Jika sudah ada session:**
- Current Session info: Area, Excavator, Bucket size + tombol "Ganti" (→ plan-screen)
- Summary cards: Loading count, Dumping count, Ritase count
- Summary cards 2: Total Bucket, Est. Tonnage (ton)
- Action button: **Record Loading** (jika loading area) atau **Record Dumping** (jika dumping area)

### 4.3 Setup Barging Plan
1. Dropdown pilih Area
2. List excavator per area tampil (radio card per excavator)
   - Status: ✅ Available, 🔒 In Use, 🔧 Maintenance
   - Hanya Available yang bisa diklik
3. Tombol "Simpan & Mulai Kerja" → aktif setelah Area + Exca dipilih

### 4.4 Record Loading
- Pilih Truck (dropdown)
- Bucket count (stepper +/−; live update Est. Tonnage)
- Lokasi & Excavator: readonly (auto dari session)
- Submit → success modal

### 4.5 Record Dumping
- Pilih Truck (dropdown)
- Lokasi & Excavator: readonly (auto dari session)
- Info: setiap submit = +1 ritase
- Submit → success modal dengan celebration jika ritase terbentuk

### 4.6 History
- Summary stats: Loading count, Dumping count, Ritase count (hari ini)
- Daftar ritase (descending by time), grouped per ritase card
  - Setiap ritase card menampilkan: Loading activity + Dumping activity
  - Loading belum dumping: ditampilkan terpisah dengan label "⏳ Belum Dumping"
- Per activity: tombol Edit (truck + bucket untuk loading; truck untuk dumping) dan Hapus

### 4.7 Profile
- Header: nama, role, operator ID, stats
- Personal Info: Nama, Excavator ID, Current Location, Shift
- Jadwal Kerja Hari Ini: status session + tombol Setup/Ganti
- Performa Hari Ini: loading/dumping/ritase/bucket/tonnage (jika ada aktivitas)
- Keamanan: Ganti Password
- Settings: toggle Bahasa & Notifikasi
- Logout

---

## 5. Modals

| Modal ID | Trigger | Isi |
|---|---|---|
| `success-modal` | Submit loading/dumping | Konfirmasi sukses + detail aktivitas; tombol "Lanjut Input" / "OK" |
| `forgot-pw-modal` | Login screen → Reset | Form username; submit kirim request ke Admin |
| `edit-activity-modal` | History → Edit | Form edit truck (+ bucket jika loading) |
| `delete-confirm-modal` | History → Hapus | Warning text + konfirmasi hapus |
| `change-pw-modal` | Profile → Ganti Password | Form old/new/confirm password |

---

## 6. Data Storage (localStorage)

```json
{
  "operator": { "id": "OP-001", "name": "John Doe", "username": "operator001", "password": "password123" },
  "currentSession": null | { area, areaType, exca: { code, model, bucket }, startTime },
  "activities": [ { id, timestamp, type, truck, exca, area, bucketCount?, tonnage?, operator, ritaseId? } ],
  "ritases": [ { id, dumpingId, loadingId, truck, completed, timestamp } ]
}
```

Key: `operatorAppData_v2`

---

## 7. Mock Data (Hard-coded)

**Areas & Excavators (konstanta `AREAS`):**
| Area | Type | Excavators |
|---|---|---|
| EFO A | loading | PC200-17 (1.6m³), PC400-12 (2.4m³), CAT320-05 (1.2m³, in_use) |
| EFO B | loading | PC200-08 (1.6m³), PC400-11 (2.4m³, maintenance) |
| Stockpile A | loading | CAT320-19 (1.2m³) |
| Jetty F - Barge Ship 12 | dumping | PC200-14 (1.6m³), CAT320-22 (1.2m³) |
| Jetty F - Barge Ship 14 | dumping | PC400-18 (2.4m³) |
| Jetty G - Barge Ship 4 | dumping | PC200-09 (1.6m³), PC400-15 (2.4m³) |

**Trucks (konstanta `ALL_TRUCKS`):**
| Code | Plate |
|---|---|
| DT-01 | B 1234 ABC |
| DT-02 | B 5678 DEF |
| DT-03 | B 9012 GHI |
| DT-04 | B 3456 JKL |
| DT-05 | B 7890 MNO |

> **Catatan route**: Di web POC, setiap DT punya field `route: 'normal' | 'direct'`. DT dengan route `direct` (dari PIT/ETO) tidak merekam loading di mobile — hanya muncul di web SPV. Mobile hanya handle truck dengan route `normal`.

**Vessel capacity** tiap DT (digunakan untuk breakdown tonnage rule):
| Code | vessel_capacity_m3 |
|---|---|
| DT-01 | 10 |
| DT-02 | 12 |
| DT-03 | 15 |
| DT-04 | 10 |
| DT-05 | 8 |

---

## 7b. Fitur: Truck Filtering & Breakdown/Transfer (v4)

### Truck State Machine
Setiap truck punya state implisit berdasarkan aktivitas di localStorage:

| State | Kondisi | Muncul di EFO? | Muncul di Jetty? |
|---|---|---|---|
| Available | Tidak ada loading unresolved, tidak ada transfer | ✅ Ya | ❌ Tidak |
| Loaded (EFO) | Ada loading unresolved (`!ritaseId && !breakdown`) | ❌ Tidak | ✅ Ya |
| Transfer Payload | Ada entri di `payloadTransfers` untuk truck ini (sebagai `toTruck`) | ❌ Tidak | ✅ Ya (dengan label transfer) |
| Breakdown | Loading ditandai `breakdown: true` | ✅ Ya (sudah kosong) | ❌ Tidak |

### Shared localStorage (`bargingSystem_v1_shared`)
Kunci yang digunakan untuk integrasi dua arah antara Web POC dan Mobile POC:
```json
{
  "payloadTransfers": [
    {
      "id": "TRF-001",
      "fromTruck": "B 5678 DEF",
      "toTruck": "B 9012 GHI",
      "bucketCount": 5,
      "tonnage": 25.0,
      "timestamp": "26/06/2026, 14:30:00",
      "completed": false
    }
  ]
}
```

### Flow Breakdown/Transfer (melibatkan dua POC)
1. **Web (SPV)**: SPV lihat DT-02 statusnya "Loaded (EFO)" → klik "Tandai Breakdown" → pilih DT-03 sebagai penerima → klik Konfirmasi
2. **Web menulis ke shared localStorage**: entry `payloadTransfers` dengan `fromTruck: DT-02, toTruck: DT-03`
3. **Web juga void loading DT-02** di mobile localStorage: set `breakdown: true` pada activity loading DT-02
4. **Mobile (Operator di Jetty)**: Buka form Record Dumping → DT-03 muncul di dropdown dengan label "Transfer Payload | 5 bucket, 25 ton (hibah dari DT-02)"
5. **Mobile**: Operator pilih DT-03 → submit dumping → ritase +1 → `markTransferComplete('TRF-001')` dipanggil → `completed: true` di shared localStorage
6. **Mobile History**: DT-02's loading card tampil dengan badge "⚠️ Breakdown" + teks "Muatan dipindah ke unit lain (breakdown — ditandai SPV via web)"

### Catatan Desain
- **Breakdown action ada di Web** (SPV via web), bukan di Mobile (operator) — karena operator tidak selalu tahu bahwa truck breakdown; mobile hanya menampilkan badge read-only "⚠️ Breakdown" pada history card
- **Recipient (DT penerima) harus available**: Web memfilter dropdown penerima hanya dari truck yang bukan loaded, bukan breakdown, bukan dalam transfer aktif
- **Tonnage transfer rule (min)**: `min(fromDT.vessel_capacity_m3, toDT.vessel_capacity_m3) × materialDensity` — jika DT penerima lebih kecil, material yang muat hanya sebatas kapasitasnya (sisanya hilang/tumpah). Trip pertama DT penerima menggunakan tonnage dari aturan ini; trip selanjutnya normal.
- **Tonnage dari DT-02 inherited ke DT-03**: bucket count dan tonnage final (setelah min() rule) disimpan di transfer object dan ditampilkan ke Jetty operator sebagai informasi

---

## 8. Catatan untuk TSD

| Aspek | Kondisi POC | Implikasi untuk Sistem Nyata |
|---|---|---|
| Session / Plan | Operator pilih sendiri dari daftar area+exca | PRD-02: SPV buat plan dulu; operator pilih dari plan yang sudah tersedia |
| Truck filtering | Dinamis berdasarkan state dari localStorage | Harus dari Master Unit + status real-time dari backend |
| Breakdown handling | SPV via Web POC → shared localStorage → Mobile POC | Harus via server API; mobile receive push notification/update |
| Transfer payload | Bucket count + tonnage dari loading DT-02 di-inherit ke DT-03 | Tonnage calculation untuk ritase DT-03 menggunakan data loading DT-02 |
| Ritase tracking | Otomatis pairing by truck, fallback null jika tidak ada loading match | PRD-05: ritase by barge, 1 dump = 1 ritase |
| Ritase → Web sync | Web baca langsung dari mobile localStorage (POC shortcut) | Sistem nyata: mobile POST ritase ke server → server aggregate → web refresh |
| Tonnage formula | bucket × bucket_size × materialDensity | Density dari jenis material dokumen: Coal GAR→1.2, Ore→1.6; auto-fill saat buat dokumen, bisa di-override manual |
| Data scope | Single-device simulation (localStorage) | Sistem nyata: multi-device, multi-user, real-time sync via API |
| Validasi | Minimal | PRD-05: banyak validasi (status, duplikasi, range nilai, dll.) |
