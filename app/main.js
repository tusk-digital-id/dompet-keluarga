// DompetKeluarga: kalkulator anggaran rumah tangga Indonesia.
//
//   #/          kalkulator interaktif (penghasilan, 8 pos, mode hemat, grafik)
//   #/contoh    contoh anggaran dari upah minimum resmi 2026
//   #/aturan    aturan 50/30/20 yang disesuaikan + dana darurat + jurus hemat
//   #/data      sumber setiap angka riil di situs ini
//
// All maths runs in the browser; nothing is sent anywhere. window.__shotReady
// is false while a page renders and true once it is on screen, so a screenshot
// script knows when to capture.

import { CATEGORIES, GROUPS, PRESETS, TARIFF_KWH, TARIFF_MIN_KWH } from './data.js';
import { calculator, donut, examples, fmt, missing, pct, rules, sources } from './views.js';

const app = document.getElementById('app');
const state = { income: 5729876, values: {}, hemat: false };

function defaultValues() {
  const p = PRESETS[0];
  return { ...p.values };
}
state.values = defaultValues();

function readNumber(el, fallback) {
  const n = Number(el.value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function effectiveValues() {
  // Mode hemat: cut the flexible posts and move the freed money to savings.
  const v = { ...state.values };
  if (!state.hemat) return v;
  const cut = { makan: 0.15, hiburan: 0.5, transport: 0.2, listrik: 0.1 };
  let freed = 0;
  for (const [id, rate] of Object.entries(cut)) {
    const saving = Math.round(v[id] * rate);
    v[id] -= saving;
    freed += saving;
  }
  v.tabungan += freed;
  return v;
}

function verdict(needPct, wantPct, savePct, total, income) {
  if (income <= 0) return 'Masukkan penghasilan dulu — kalkulator butuh angka penghasilan untuk menilai.';
  if (total > income) {
    return `DEFISIT ${fmt(total - income)} per bulan: belanjamu di atas penghasilan. Potong dulu dari keinginan, lalu lihat pos makan dan transport.`;
  }
  const notes = [];
  if (needPct > 70) notes.push(`kebutuhan ${pct(needPct)} — di atas batas 70% untuk gaji UMP, ketat tapi wajar di kota besar`);
  else if (needPct <= 50) notes.push(`kebutuhan ${pct(needPct)} — sudah masuk aturan klasik 50/30/20`);
  else notes.push(`kebutuhan ${pct(needPct)} — masih di jalur yang disesuaikan`);
  if (savePct >= 20) notes.push(`tabungan ${pct(savePct)} — kuat, dana darurat cepat terkumpul`);
  else if (savePct >= 10) notes.push(`tabungan ${pct(savePct)} — sudah di atas target minimum 10%`);
  else notes.push(`tabungan ${pct(savePct)} — di bawah 10%: lindungi dulu pos ini sebelum menambah hiburan`);
  if (wantPct > 30) notes.push(`keinginan ${pct(wantPct)} — di atas 30%, cek langganan yang jarang dipakai`);
  return notes.join('. ') + '.';
}

function recalc() {
  const v = effectiveValues();
  const income = state.income;
  const total = Object.values(v).reduce((a, b) => a + b, 0);
  const left = income - total;
  const need = ['sewa', 'makan', 'transport', 'listrik', 'sekolah', 'kesehatan'].reduce((a, k) => a + v[k], 0);
  const want = v.hiburan;
  const save = v.tabungan;

  for (const c of CATEGORIES) {
    const share = document.getElementById(`share-${c.id}`);
    if (share) share.textContent = income > 0 ? pct((v[c.id] / income) * 100) : '0%';
  }
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  set('sum-out', fmt(total));
  set('sum-left', (left < 0 ? '−' : '') + fmt(Math.abs(left)));
  set('sum-need', pct(income > 0 ? (need / income) * 100 : 0));
  set('sum-want', pct(income > 0 ? (want / income) * 100 : 0));
  set('sum-save', pct(income > 0 ? (save / income) * 100 : 0));
  set('donut-total', fmt(total));

  const svg = document.querySelector('.donut-wrap svg');
  if (svg) {
    const tmp = document.createElement('div');
    tmp.innerHTML = donut([
      { value: need, color: GROUPS.butuh.color },
      { value: want, color: GROUPS.ingin.color },
      { value: save, color: GROUPS.tabung.color },
    ]);
    svg.replaceWith(tmp.firstChild);
  }

  const bar = (label, value, color, target) =>
    `<div class="bar-row"><span>${label}</span><div class="bar"><i style="width:${Math.min(value, 100)}%;background:${color}"></i><b style="left:${target}%"></b></div><span>${pct(value)}</span></div>`;
  const bars = document.getElementById('bars');
  if (bars) {
    const np = income > 0 ? (need / income) * 100 : 0;
    const wp = income > 0 ? (want / income) * 100 : 0;
    const sp = income > 0 ? (save / income) * 100 : 0;
    const targetNeed = income >= 11459752 ? 50 : income >= 5729876 ? 70 : 80;
    bars.innerHTML =
      bar('Kebutuhan', np, GROUPS.butuh.color, targetNeed) +
      bar('Keinginan', wp, GROUPS.ingin.color, 20) +
      bar('Tabungan', sp, GROUPS.tabung.color, 10);
  }

  const verdictEl = document.getElementById('verdict');
  if (verdictEl) verdictEl.textContent = verdict(income > 0 ? (need / income) * 100 : 0, income > 0 ? (want / income) * 100 : 0, income > 0 ? (save / income) * 100 : 0, total, income);

  const em = document.getElementById('emergency');
  if (em) {
    if (need > 0 && save > 0) {
      const months3 = Math.ceil((need * 3) / save);
      const months6 = Math.ceil((need * 6) / save);
      em.textContent = `Dana darurat 3 bulan pengeluaran pokok (${fmt(need * 3)}) terkumpul dalam ±${months3} bulan menabung sebesar ini; 6 bulan dalam ±${months6} bulan.`;
    } else {
      em.textContent = '';
    }
  }
}

function applyPreset(id) {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) return;
  state.income = p.income;
  state.values = { ...p.values };
  state.hemat = false;
  const hemat = document.getElementById('in-hemat');
  if (hemat) hemat.checked = false;
  syncInputs();
}

function syncInputs() {
  const income = document.getElementById('in-income');
  if (income) income.value = state.income;
  for (const c of CATEGORIES) {
    const el = document.getElementById(`in-${c.id}`);
    if (el) el.value = state.values[c.id];
  }
  recalc();
}

function wireCalculator() {
  const income = document.getElementById('in-income');
  if (income) {
    income.addEventListener('input', () => {
      state.income = readNumber(income, state.income);
      recalc();
    });
  }
  for (const c of CATEGORIES) {
    const el = document.getElementById(`in-${c.id}`);
    if (el) {
      el.addEventListener('input', () => {
        state.values[c.id] = readNumber(el, state.values[c.id]);
        recalc();
      });
    }
  }
  const hemat = document.getElementById('in-hemat');
  if (hemat) {
    hemat.addEventListener('change', () => {
      state.hemat = hemat.checked;
      recalc();
    });
  }
  const kwh = document.getElementById('in-kwh');
  const btn = document.getElementById('btn-kwh');
  const out = document.getElementById('kwh-out');
  if (btn && kwh && out) {
    btn.addEventListener('click', () => {
      const use = Math.max(readNumber(kwh, 0), TARIFF_MIN_KWH);
      const bill = Math.round(use * TARIFF_KWH);
      state.values.listrik = bill;
      const el = document.getElementById('in-listrik');
      if (el) el.value = bill;
      out.textContent = `${use} kWh × Rp1.444,70 = ${fmt(bill)} per bulan (rekening minimum 52 kWh sudah termasuk bila pemakaianmu di bawah itu). Pos listrik di atas sudah diisi.`;
      recalc();
    });
  }
  document.querySelectorAll('[data-preset]').forEach((b) => {
    b.addEventListener('click', () => applyPreset(b.dataset.preset));
  });
  syncInputs();
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  if (hash.startsWith('#/contoh')) {
    document.title = 'Contoh anggaran | DompetKeluarga';
    app.innerHTML = examples();
    document.querySelectorAll('[data-preset]').forEach((b) => {
      b.addEventListener('click', () => {
        applyPreset(b.dataset.preset);
        location.hash = '#/';
      });
    });
  } else if (hash.startsWith('#/aturan')) {
    document.title = 'Aturan 50/30/20 | DompetKeluarga';
    app.innerHTML = rules();
  } else if (hash.startsWith('#/data')) {
    document.title = 'Data & sumber | DompetKeluarga';
    app.innerHTML = sources();
  } else {
    document.title = 'DompetKeluarga — Perencana Anggaran Rumah Tangga';
    app.innerHTML = calculator();
    wireCalculator();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
