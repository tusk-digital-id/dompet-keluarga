// DompetKeluarga — data perencana anggaran rumah tangga Indonesia.
//
// Every rupiah figure that claims to be real is labelled with its source and
// period in SOURCES below, and the site shows those labels next to the number.
// The example budgets are allocations built from those anchors (they say so on
// the page); they are not survey results.

export const TARIFF_KWH = 1444.7; // PLN R-1/TR 1.300 VA, Rp/kWh, Q4 2026
export const TARIFF_MIN_KWH = 52; // rekening minimum 40 jam x 1,3 kVA

export const CATEGORIES = [
  { id: 'sewa', label: 'Sewa / kos', group: 'butuh', hint: 'Kontrak, kos, atau cicilan rumah' },
  { id: 'makan', label: 'Makan & dapur', group: 'butuh', hint: 'Belanja bahan, masak, makan di luar' },
  { id: 'transport', label: 'Transport', group: 'butuh', hint: 'Bensin, tol, parkir, TransJakarta/KRL' },
  { id: 'listrik', label: 'Listrik & air', group: 'butuh', hint: 'Token/listrik pascabayar + air (PDAM/galon)' },
  { id: 'sekolah', label: 'Sekolah & pendidikan', group: 'butuh', hint: 'SPP, les, buku, seragam' },
  { id: 'kesehatan', label: 'Kesehatan', group: 'butuh', hint: 'BPJS, obat, berobat' },
  { id: 'hiburan', label: 'Hiburan & gaya hidup', group: 'ingin', hint: 'Nongkrong, streaming, jajan, baju' },
  { id: 'tabungan', label: 'Tabungan & dana darurat', group: 'tabung', hint: 'Tabungan, investasi, dana darurat' },
];

export const GROUPS = {
  butuh: { label: 'Kebutuhan', color: '#166534' },
  ingin: { label: 'Keinginan', color: '#b45309' },
  tabung: { label: 'Tabungan', color: '#1d4ed8' },
};

// Upah minimum resmi 2026 (berlaku 1 Jan 2026) — the income anchors.
export const WAGES = [
  {
    id: 'jakarta',
    city: 'DKI Jakarta',
    kind: 'UMP 2026',
    amount: 5729876,
    source: 'Keputusan Gubernur DKI Jakarta No. 1142/2025; naik 6,17% dari Rp5.396.761 (UMP 2025)',
  },
  {
    id: 'kotabekasi',
    city: 'Kota Bekasi',
    kind: 'UMK 2026',
    amount: 5999443,
    source: 'Keputusan Gubernur Jawa Barat No. 561.7/Kep.862-Kesra/2025; tertinggi di Jawa Barat',
  },
  {
    id: 'kabbekasi',
    city: 'Kabupaten Bekasi',
    kind: 'UMK 2026',
    amount: 5938885,
    source: 'Keputusan Gubernur Jawa Barat No. 561.7/Kep.862-Kesra/2025; naik 6,8% dari Rp5.558.515 (UMK 2025)',
  },
];

// Example budgets: allocations derived from the wage anchors above, using the
// adapted 50/30/20 rule. Labelled "contoh alokasi" on the page, not BPS data.
export const PRESETS = [
  {
    id: 'lajang-jakarta',
    name: 'Lajang · Jakarta',
    income: 5729876,
    incomeNote: 'UMP DKI Jakarta 2026',
    household: '1 orang, kos di Jakarta',
    values: { sewa: 1500000, makan: 1400000, transport: 600000, listrik: 350000, sekolah: 0, kesehatan: 200000, hiburan: 450000, tabungan: 1229876 },
  },
  {
    id: 'keluarga-kotabekasi',
    name: 'Keluarga 4 · Kota Bekasi',
    income: 5999443,
    incomeNote: 'UMK Kota Bekasi 2026 (satu penghasilan)',
    household: '2 dewasa + 2 anak, rumah pinggiran',
    values: { sewa: 1200000, makan: 2000000, transport: 700000, listrik: 450000, sekolah: 800000, kesehatan: 300000, hiburan: 350000, tabungan: 199443 },
  },
  {
    id: 'lajang-kabbekasi',
    name: 'Lajang · Kab. Bekasi',
    income: 5938885,
    incomeNote: 'UMK Kab. Bekasi 2026',
    household: '1 orang, kos dekat kawasan industri',
    values: { sewa: 900000, makan: 1500000, transport: 600000, listrik: 300000, sekolah: 0, kesehatan: 250000, hiburan: 500000, tabungan: 1888885 },
  },
  {
    id: 'keluarga-jakarta',
    name: 'Keluarga 4 · Jakarta',
    income: 11459752,
    incomeNote: '2 × UMP DKI Jakarta 2026 (dua penghasilan)',
    household: '2 dewasa + 2 anak, sewa rumah di Jakarta',
    values: { sewa: 3000000, makan: 3000000, transport: 1200000, listrik: 600000, sekolah: 1500000, kesehatan: 500000, hiburan: 800000, tabungan: 859752 },
  },
];

// The adapted rule: 50/30/20 only fits once income clears about twice the
// minimum wage. Near the minimum wage, needs eat most of the pay — the honest
// target there is 70/20/10, with savings protected first.
export const RULE_BANDS = [
  { band: 'Di bawah UMP', needs: 80, wants: 10, save: 10, note: 'Bertahan dulu: kebutuhan 80%, keinginan ditekan, tabungan 10% tetap jalan walau kecil.' },
  { band: 'Sekitar UMP', needs: 70, wants: 20, save: 10, note: 'Target realistis untuk satu UMP di kota besar. Kebutuhan di atas 70% = lampu kuning.' },
  { band: 'UMP – 2× UMP', needs: 60, wants: 25, save: 15, note: 'Mulai longgar: tabungan naik ke 15%, dana darurat bisa dikejar 3 bulan pengeluaran.' },
  { band: 'Di atas 2× UMP', needs: 50, wants: 30, save: 20, note: 'Aturan klasik 50/30/20 akhirnya muat. Tabungan 20% = dana darurat 6 bulan dalam 2,5 tahun.' },
];

export const SOURCES = [
  { label: 'UMP DKI Jakarta 2026 — Rp5.729.876', detail: 'Keputusan Gubernur DKI Jakarta No. 1142 Tahun 2025; diumumkan 24 Des 2025, berlaku 1 Jan 2026. Naik Rp333.115 (6,17%) dari UMP 2025 Rp5.396.761. KHL Jakarta versi Kemenaker Rp5,89 jt.' },
  { label: 'UMK Kota Bekasi 2026 — Rp5.999.443 · Kab. Bekasi — Rp5.938.885', detail: 'Keputusan Gubernur Jawa Barat No. 561.7/Kep.862-Kesra/2025, ditetapkan 24 Des 2025, berlaku 1 Jan 2026. Kota Bekasi tertinggi di Jawa Barat.' },
  { label: 'Pengeluaran rata-rata per kapita — Rp1,57 jt/bulan (Mar 2025)', detail: 'BPS, Susenas Maret 2025: makanan Rp776 rb + bukan makanan Rp794 rb per kapita per bulan. September 2025: Rp1.584.473.' },
  { label: 'Garis kemiskinan — Rp609.160/kapita/bulan (Mar 2025)', detail: 'BPS, Susenas Maret 2025: makanan Rp454.299 + bukan makanan Rp154.861.' },
  { label: 'Pengeluaran per kapita Jakarta Selatan — Rp3,64 jt/bulan (2025)', detail: 'BPS 2025, via GoodStats: tertinggi di Indonesia; Kota Bekasi Rp2,83 jt.' },
  { label: 'Tarif listrik PLN R-1 1.300 VA — Rp1.444,70/kWh (Q4 2026)', detail: 'Kementerian ESDM, tarif triwulan IV-2026 (tidak naik s.d. Des 2026). Rekening minimum 40 jam × daya = 52 kWh/bulan untuk 1.300 VA. PBJT DKI Jakarta 2,4%.' },
];

export const TIPS_HEMAT = [
  { title: 'Masak 5 hari seminggu', body: 'Makan di luar Rp25–35 rb sekali; masak sendiri Rp10–15 rb per porsi. Selisihnya bisa Rp400 rb/bulan untuk satu orang.' },
  { title: 'Transport umum untuk rute tetap', body: 'TransJakarta Rp3.500 sekali jalan vs bensin + parkir motor ±Rp20 rb/hari. Rute kantor yang tetap = kartu langganan.' },
  { title: 'AC 26°C + kipas', body: 'Tiap 1°C lebih dingin ≈ 6% listrik AC lebih boros. 26°C dengan kipas sudah nyaman di malam hari.' },
  { title: 'Tabungan di awal gajian', body: 'Pindahkan tabungan begitu gaji masuk (auto-debet tanggal 1), bukan dari sisa akhir bulan — sisa hampir selalu nol.' },
  { title: 'Dana darurat dulu, investasi kemudian', body: 'Kumpulkan 3 bulan pengeluaran pokok sebelum investasi. Dana darurat = tabungan yang tidak boleh dipegang untuk apa pun.' },
  { title: 'Audit langganan tiap 3 bulan', body: 'Streaming, gym, dan aplikasi yang tidak dibuka 2 minggu berturut-turut: berhenti. Rata-rata 2 langganan lupa = ±Rp150 rb/bulan.' },
];
