// DompetKeluarga — hand-in program for the best-household-budget-site bounty
// (Node 22, standard library only). The site is this directory's app/ folder:
// plain static files a browser opens at app/index.html (ES modules, CSS, no
// build step), its content held in its own files — nothing it runs, styles or
// shows loads over the network, so the dossier gate's "references" row passes.
//
// What the site is: an Indonesian household budget planner. The calculator page
// takes monthly take-home pay and eight spending posts (rent, food, transport,
// power/water, school, health, fun, savings), draws a live SVG allocation ring
// and 50/30/20 bars, judges the split against the income-adapted rule, and
// counts down the months to a 3- and 6-month emergency fund. Example budgets on
// #/contoh are allocations built from the official 2026 minimum wages (UMP DKI
// Jakarta Rp5.729.876; UMK Kota Bekasi Rp5.999.443; UMK Kab. Bekasi
// Rp5.938.885) and BPS Susenas spending figures — each labelled with source
// and period on #/data. A "mode hemat" toggle and a PLN tariff helper
// (R-1 1.300 VA, Rp1.444,70/kWh, Q4 2026) make every control do something.
//
// Hand-in: copy app/ and screenshots/ from beside this file to /output and
// write /output/dossier.json, the summary the judge reads (screenshots, the
// first load's files and bytes, and the source), with the vendored make.fun
// library. Leave vendor/makefun-frontend.ts as it is: the scorer requires
// dossier.json to be byte for byte what its own copy writes.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Hand-in summary, printed so the build log shows what went in: the four
// screenshots (3 desktop + 1 phone, each under the 256 KiB cap) and the app
// files the dossier covers. The caps below mirror the scorer's own
// (reference/gate.json): only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 16 MiB of app
// files: app/ counts beside /output's own 1000-entry cap, its screenshots/
// and dossier.json).
console.log('DompetKeluarga hand-in: app/ + 4 screenshots (cover 1-home.jpg) -> ' + out);
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
