// HTML for each page, built from the budget data. Every value is escaped
// before it goes into the page. The calculator page is a static shell; main.js
// wires the inputs and re-renders the numbers live.

import { CATEGORIES, GROUPS, PRESETS, RULE_BANDS, SOURCES, TIPS_HEMAT, WAGES } from './data.js';

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const fmt = (n) => 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
export const pct = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',') + '%';

export function donut(segments) {
  // segments: [{value, color, label}] — a plain SVG ring, no library.
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total;
      const dash = `${Math.max(frac * c - 2, 0)} ${c}`;
      const el = `<circle cx="90" cy="90" r="${r}" fill="none" stroke="${s.color}" stroke-width="26" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}" />`;
      offset += frac * c;
      return el;
    })
    .join('');
  return `<svg viewBox="0 0 180 180" class="donut" role="img" aria-label="Grafik alokasi anggaran">${arcs}</svg>`;
}

export function calculator() {
  const presetButtons = PRESETS.map(
    (p) => `<button type="button" class="preset" data-preset="${p.id}">${escape(p.name)}<small>${escape(p.incomeNote)}</small></button>`,
  ).join('');
  const rows = CATEGORIES.map(
    (cat) => `<div class="cat-row" data-cat="${cat.id}">
      <label for="in-${cat.id}">${escape(cat.label)}<span class="hint">${escape(cat.hint)}</span></label>
      <div class="money"><span>Rp</span><input id="in-${cat.id}" data-cat="${cat.id}" type="number" min="0" step="1000" inputmode="numeric" value="0"></div>
      <div class="share" id="share-${cat.id}">0%</div>
    </div>`,
  ).join('');
  const legend = Object.entries(GROUPS)
    .map(([k, g]) => `<span class="legend-item"><i style="background:${g.color}"></i>${escape(g.label)}</span>`)
    .join('');
  return `<h1>Kalkulator anggaran rumah tangga</h1>
<p class="lede">Masukkan penghasilan bulanan dan tiap pos pengeluaran. Semua angka dihitung langsung di browser Anda — tidak ada data yang dikirim ke mana pun.</p>

<section class="panel">
  <h2>1 · Penghasilan</h2>
  <div class="income-row">
    <label for="in-income">Penghasilan bersih per bulan</label>
    <div class="money big"><span>Rp</span><input id="in-income" type="number" min="0" step="1000" inputmode="numeric" value="5729876"></div>
  </div>
  <p class="note">Atau pakai contoh siap pakai dari upah minimum resmi 2026:</p>
  <div class="presets">${presetButtons}</div>
</section>

<section class="panel">
  <h2>2 · Pos pengeluaran</h2>
  <div class="cats">${rows}</div>
  <label class="hemat"><input type="checkbox" id="in-hemat"> <strong>Mode hemat</strong> — makan −15%, hiburan −50%, transport −20%, listrik −10%; selisihnya pindah ke tabungan.</label>
</section>

<section class="panel result">
  <h2>3 · Hasilnya</h2>
  <div class="result-grid">
    <div class="donut-wrap">${donut([])}<div class="donut-center"><strong id="donut-total">Rp0</strong><span>total belanja</span></div></div>
    <div class="summary">
      <dl>
        <dt>Total pengeluaran</dt><dd id="sum-out">Rp0</dd>
        <dt>Sisa (penghasilan − belanja)</dt><dd id="sum-left">Rp0</dd>
        <dt>Kebutuhan</dt><dd id="sum-need">0%</dd>
        <dt>Keinginan</dt><dd id="sum-want">0%</dd>
        <dt>Tabungan</dt><dd id="sum-save">0%</dd>
      </dl>
      <div class="bars" id="bars"></div>
    </div>
  </div>
  <div id="verdict" class="verdict"></div>
  <div id="emergency" class="emergency"></div>
</section>

<section class="panel">
  <h2>Hitung tagihan listrikmu</h2>
  <p>Tarif PLN R-1 1.300 VA: <strong>Rp1.444,70/kWh</strong> (Q4 2026, ESDM). Rekening minimum 52 kWh/bulan.</p>
  <div class="power-row">
    <label for="in-kwh">Pemakaian per bulan (kWh)</label>
    <input id="in-kwh" type="number" min="0" step="1" value="150">
    <button type="button" id="btn-kwh">Hitung &amp; isi ke pos listrik</button>
  </div>
  <p id="kwh-out" class="note"></p>
</section>

<section class="panel">
  <h2>Upah minimum 2026 (jangkar penghasilan)</h2>
  <table class="wages"><thead><tr><th>Wilayah</th><th>Jenis</th><th>Per bulan</th><th>Sumber</th></tr></thead><tbody>
  ${WAGES.map((w) => `<tr><td>${escape(w.city)}</td><td>${escape(w.kind)}</td><td><strong>${fmt(w.amount)}</strong></td><td>${escape(w.source)}</td></tr>`).join('')}
  </tbody></table>
  <p class="note">Contoh anggaran di halaman <a href="#/contoh">Contoh</a> dibangun dari angka-angka ini.</p>
  <p class="legend">${legend}</p>
</section>`;
}

export function examples() {
  const cards = PRESETS.map((p) => {
    const total = Object.values(p.values).reduce((a, b) => a + b, 0);
    const need = ['sewa', 'makan', 'transport', 'listrik', 'sekolah', 'kesehatan'].reduce((a, k) => a + p.values[k], 0);
    const want = p.values.hiburan;
    const save = p.values.tabungan;
    const rows = CATEGORIES.map(
      (c) => `<tr><td>${escape(c.label)}</td><td>${fmt(p.values[c.id])}</td><td>${pct((p.values[c.id] / p.income) * 100)}</td></tr>`,
    ).join('');
    return `<article class="preset-card">
      <h3>${escape(p.name)}</h3>
      <p class="meta">${escape(p.household)} · ${escape(p.incomeNote)} — <strong>${fmt(p.income)}</strong></p>
      <div class="donut-wrap small">${donut([
        { value: need, color: GROUPS.butuh.color },
        { value: want, color: GROUPS.ingin.color },
        { value: save, color: GROUPS.tabung.color },
      ])}<div class="donut-center"><strong>${pct((need / p.income) * 100)}</strong><span>kebutuhan</span></div></div>
      <table class="mini"><tbody>${rows}</tbody>
      <tfoot><tr><td>Total</td><td>${fmt(total)}</td><td>${pct((total / p.income) * 100)}</td></tr></tfoot></table>
      <p class="verdict-line">Kebutuhan ${pct((need / p.income) * 100)} · Keinginan ${pct((want / p.income) * 100)} · Tabungan ${pct((save / p.income) * 100)}</p>
      <button type="button" class="preset-use" data-preset="${p.id}">Pakai contoh ini di kalkulator →</button>
    </article>`;
  }).join('');
  return `<h1>Contoh anggaran nyata</h1>
<p class="lede">Empat contoh alokasi yang dibangun dari upah minimum resmi 2026. Ini <strong>contoh alokasi</strong> dari angka jangkar tersebut — bukan hasil survei. Buka di kalkulator dan ubah sesukamu.</p>
<div class="cards">${cards}</div>
<section class="panel">
  <h2>Patokan nasional (BPS, Susenas)</h2>
  <ul class="facts">
    <li>Rata-rata pengeluaran per kapita <strong>Rp1,57 jt/bulan</strong> (Mar 2025): makanan Rp776 rb + bukan makanan Rp794 rb.</li>
    <li>Garis kemiskinan <strong>Rp609.160/kapita/bulan</strong> (Mar 2025).</li>
    <li>Pengeluaran per kapita tertinggi: Jakarta Selatan <strong>Rp3,64 jt/bulan</strong>; Kota Bekasi Rp2,83 jt (BPS 2025).</li>
  </ul>
  <p class="note">Sumber lengkap di halaman <a href="#/data">Data &amp; sumber</a>.</p>
</section>`;
}

export function rules() {
  const bands = RULE_BANDS.map(
    (b) => `<tr><td><strong>${escape(b.band)}</strong></td><td>${b.needs}%</td><td>${b.wants}%</td><td>${b.save}%</td><td>${escape(b.note)}</td></tr>`,
  ).join('');
  const tips = TIPS_HEMAT.map((t) => `<li><strong>${escape(t.title)}.</strong> ${escape(t.body)}</li>`).join('');
  return `<h1>Aturan 50/30/20 — versi yang disesuaikan</h1>
<p class="lede">Aturan klasik: 50% kebutuhan, 30% keinginan, 20% tabungan. Di gaji UMP kota besar, 50% untuk kebutuhan hampir tidak pernah muat — jadi aturannya digeser menurut tingkat penghasilan, bukan dipaksakan.</p>
<section class="panel">
  <h2>Geser targetnya menurut gaji</h2>
  <table class="wages"><thead><tr><th>Penghasilan</th><th>Kebutuhan</th><th>Keinginan</th><th>Tabungan</th><th>Catatan</th></tr></thead><tbody>${bands}</tbody></table>
</section>
<section class="panel">
  <h2>Dana darurat: targetnya berapa?</h2>
  <p>Hitung dari <strong>pengeluaran pokok per bulan</strong> (semua pos kebutuhan), bukan dari gaji:</p>
  <ul class="facts">
    <li><strong>3 bulan</strong> pengeluaran pokok — minimum untuk lajang tanpa tanggungan.</li>
    <li><strong>6 bulan</strong> — untuk keluarga dengan anak atau satu penghasilan.</li>
    <li><strong>12 bulan</strong> — untuk pekerja lepas / penghasilan tidak tetap.</li>
  </ul>
  <p>Kalkulator di halaman utama menghitung berapa bulan sampai dana daruratmu terkumpul dari tabunganmu sekarang.</p>
</section>
<section class="panel">
  <h2>6 jurus hemat yang paling terasa</h2>
  <ol class="tips">${tips}</ol>
</section>`;
}

export function sources() {
  const items = SOURCES.map((s) => `<li><strong>${escape(s.label)}.</strong> ${escape(s.detail)}</li>`).join('');
  return `<h1>Data &amp; sumber</h1>
<p class="lede">Setiap angka riil di situs ini berlabel sumber dan periode. Contoh anggaran di halaman Contoh adalah alokasi yang dihitung dari jangkar upah di bawah — bukan data survei.</p>
<section class="panel"><ol class="sources">${items}</ol></section>
<section class="panel">
  <h2>Yang situs ini tidak lakukan</h2>
  <ul class="facts">
    <li>Tidak mengambil data dari internet: semua angka ada di berkas situs ini sendiri.</li>
    <li>Tidak menyimpan apa pun: perhitungan jalan di browser Anda dan hilang saat tab ditutup.</li>
    <li>Bukan nasihat keuangan berlisensi — ini alat bantu hitung, bukan pengganti perencana keuangan.</li>
  </ul>
</section>`;
}

export function missing() {
  return `<h1>Tidak ditemukan</h1>
<p>Tidak ada halaman di alamat ini. <a href="#/">Kembali ke kalkulator</a>.</p>`;
}
