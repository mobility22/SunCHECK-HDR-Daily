// ==UserScript==
// @name         SunCHECK HDR Daily
// @namespace    https://github.com/mobility22/SunCHECK-HDR-Daily
// @version      1.15
// @description  Fill SunCHECK HDR Bravos daily QC (Save only, never Approve)
// @match        http://cnrrtrocperfx.rrt.ca.kp.org/*
// @match        https://cnrrtrocperfx.rrt.ca.kp.org/*
// @updateURL    https://raw.githubusercontent.com/mobility22/SunCHECK-HDR-Daily/refs/heads/main/suncheck-hdr-daily.user.js
// @downloadURL  https://raw.githubusercontent.com/mobility22/SunCHECK-HDR-Daily/refs/heads/main/suncheck-hdr-daily.user.js
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';
  const TAG = '[SunCHECK]';
  const log = (...a) => console.log(TAG, ...a);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const DATA_URL = 'https://raw.githubusercontent.com/mobility22/SunCHECK-HDR-Daily/main/daily-data.json';

  // GammaMed HDR Ir-192 decay table (assay 13.36 Ci on 2026-09-22; 10 Ci on 2026-10-02). Activity in Ci.
  const DECAY = {
    '2026-09-22': 10.984,
    '2026-09-23': 10.881,
    '2026-09-24': 10.780,
    '2026-09-25': 10.679,
    '2026-09-26': 10.579,
    '2026-09-27': 10.481,
    '2026-09-28': 10.383,
    '2026-09-29': 10.286,
    '2026-09-30': 10.190,
    '2026-10-01': 10.094,
    '2026-10-02': 10.000,
    '2026-10-03': 9.907,
    '2026-10-04': 9.814,
    '2026-10-05': 9.722,
    '2026-10-06': 9.632,
    '2026-10-07': 9.542,
    '2026-10-08': 9.452,
    '2026-10-09': 9.364,
    '2026-10-10': 9.277,
    '2026-10-11': 9.190,
    '2026-10-12': 9.104,
    '2026-10-13': 9.019,
    '2026-10-14': 8.935,
    '2026-10-15': 8.851,
    '2026-10-16': 8.769,
    '2026-10-17': 8.687,
    '2026-10-18': 8.606,
    '2026-10-19': 8.525,
    '2026-10-20': 8.445,
    '2026-10-21': 8.367,
    '2026-10-22': 8.288,
    '2026-10-23': 8.211,
    '2026-10-24': 8.134,
    '2026-10-25': 8.058,
    '2026-10-26': 7.983,
    '2026-10-27': 7.908,
    '2026-10-28': 7.835,
    '2026-10-29': 7.761,
    '2026-10-30': 7.689,
    '2026-10-31': 7.617,
    '2026-11-01': 7.546,
    '2026-11-02': 7.475,
    '2026-11-03': 7.405,
    '2026-11-04': 7.336,
    '2026-11-05': 7.268,
    '2026-11-06': 7.200,
    '2026-11-07': 7.133,
    '2026-11-08': 7.066,
    '2026-11-09': 7.000,
    '2026-11-10': 6.935,
    '2026-11-11': 6.870,
    '2026-11-12': 6.806,
    '2026-11-13': 6.742,
    '2026-11-14': 6.679,
    '2026-11-15': 6.617,
    '2026-11-16': 6.555,
    '2026-11-17': 6.494,
    '2026-11-18': 6.433,
    '2026-11-19': 6.373,
    '2026-11-20': 6.313,
    '2026-11-21': 6.254,
    '2026-11-22': 6.196,
    '2026-11-23': 6.138,
    '2026-11-24': 6.081,
    '2026-11-25': 6.024,
    '2026-11-26': 5.968,
    '2026-11-27': 5.912,
    '2026-11-28': 5.857,
    '2026-11-29': 5.802,
    '2026-11-30': 5.748,
    '2026-12-01': 5.694,
    '2026-12-02': 5.641,
    '2026-12-03': 5.588,
    '2026-12-04': 5.536,
    '2026-12-05': 5.484,
    '2026-12-06': 5.433,
    '2026-12-07': 5.382,
    '2026-12-08': 5.332,
    '2026-12-09': 5.282,
    '2026-12-10': 5.233,
    '2026-12-11': 5.184,
    '2026-12-12': 5.135,
    '2026-12-13': 5.087,
    '2026-12-14': 5.040,
    '2026-12-15': 4.993,
    '2026-12-16': 4.946,
    '2026-12-17': 4.900,
    '2026-12-18': 4.854,
    '2026-12-19': 4.809,
    '2026-12-20': 4.764,
    '2026-12-21': 4.719,
    '2026-12-22': 4.675,
    '2026-12-23': 4.632,
    '2026-12-24': 4.588,
    '2026-12-25': 4.545,
    '2026-12-26': 4.503,
    '2026-12-27': 4.461,
    '2026-12-28': 4.419,
    '2026-12-29': 4.378,
    '2026-12-30': 4.337,
    '2026-12-31': 4.297,
    '2027-01-01': 4.256,
    '2027-01-02': 4.217,
    '2027-01-03': 4.177,
    '2027-01-04': 4.138,
    '2027-01-05': 4.100,
    '2027-01-06': 4.061,
    '2027-01-07': 4.023,
    '2027-01-08': 3.986,
    '2027-01-09': 3.948,
    '2027-01-10': 3.912,
    '2027-01-11': 3.875,
    '2027-01-12': 3.839,
    '2027-01-13': 3.803,
    '2027-01-14': 3.767,
    '2027-01-15': 3.732,
    '2027-01-16': 3.697,
    '2027-01-17': 3.663,
    '2027-01-18': 3.629,
    '2027-01-19': 3.595,
    '2027-01-20': 3.561,
    '2027-01-21': 3.528,
    '2027-01-22': 3.495,
    '2027-01-23': 3.462,
    '2027-01-24': 3.430,
    '2027-01-25': 3.398,
    '2027-01-26': 3.366,
    '2027-01-27': 3.335,
    '2027-01-28': 3.304,
    '2027-01-29': 3.273
  };

  const isExec = () => location.hash.includes('#/Routine/Execution');
  const vis = el => el && el.offsetParent !== null;
  const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const FORBIDDEN = /approve|delete/i;

  function setVal(input, v) {
    const proto = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, String(v));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  function safeClick(el, what) {
    const t = (el.innerText || el.value || '').trim();
    if (FORBIDDEN.test(t)) { log('REFUSED to click', t); return false; }
    el.click(); log('clicked', what || t); return true;
  }

  // Find the main-panel section whose header contains `name`.
  function section(name) {
    const re = new RegExp(name, 'i');
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,div,span,a')]
      .filter(e => vis(e) && e.children.length <= 3 && re.test(e.textContent) && e.textContent.trim().length < 90 &&
        !e.closest('nav,aside,[class*="tree"],[class*="sidebar"],[class*="menu"]'));
    for (const h of heads) {
      let n = h;
      for (let i = 0; i < 8 && n; i++, n = n.parentElement) {
        if (n.querySelector('input,button,textarea')) {
          const others = [...n.querySelectorAll('*')].filter(e => /^\s*HDR\s*-/.test(e.textContent) && e.children.length <= 3 && !re.test(e.textContent));
          if (!others.length) return n;
          break;
        }
      }
    }
    return null;
  }
  const textInputs = s => [...s.querySelectorAll('input[type="text"],input[type="number"],input:not([type]),textarea')].filter(vis);

  async function fillInputs(name, values, overwrite) {
    const s = section(name);
    if (!s) { log('section not found:', name); return; }
    const ins = textInputs(s);
    if (!ins.length) { log('no inputs in', name); return; }
    for (let i = 0; i < values.length && i < ins.length; i++) {
      if (values[i] == null) continue;
      if (!overwrite && ins[i].value.trim() !== '') { log(name, '#' + (i + 1), 'already filled:', ins[i].value); continue; }
      ins[i].focus(); setVal(ins[i], values[i]); log(name, '#' + (i + 1), '=', values[i]);
      await sleep(250);
    }
    if (ins.length !== values.length) log(name, ': found', ins.length, 'inputs, expected', values.length);
  }

  async function passSection(name) {
    const s = section(name);
    if (!s) { log('section not found:', name); return; }
    const radios = [...s.querySelectorAll('input[type="radio"]')];
    const passRadios = radios.filter(r => /pass/i.test((r.closest('label') || r.parentElement || {}).textContent || r.value || ''));
    const groups = new Set(radios.map(r => r.name));
    const anyUnset = [...groups].some(g => !radios.some(r => r.name === g && r.checked));
    if (radios.length && !anyUnset) { log(name, ': already selected, skip'); return; }
    const btn = [...s.querySelectorAll('button,a,input[type="button"]')].find(b => /^\s*pass\s*all\s*$/i.test(b.innerText || b.value || ''));
    if (btn) { safeClick(btn, name + ' Pass All'); await sleep(400); return; }
    for (const r of passRadios) {
      if (!radios.some(x => x.name === r.name && x.checked)) { r.click(); log(name, ': Pass'); await sleep(200); }
    }
  }

  function fetchDaily() {
    return new Promise(res => {
      GM_xmlhttpRequest({
        method: 'GET', url: DATA_URL + '?t=' + Date.now(), timeout: 10000,
        onload: r => { try { res(r.status === 200 ? JSON.parse(r.responseText) : null); } catch (e) { res(null); } },
        onerror: () => res(null), ontimeout: () => res(null)
      });
    });
  }
  // daily-data.json: [{"date":"2026-09-30","sourceStrength":10.165,"fake90":899.8,"fake120":1199.8,"fake150":1499.7,"real90":900.0,"real120":1200.0,"real150":1499.9 (mm)}, ...]
  function pickDay(data, date) {
    if (!data) return null;
    const arr = Array.isArray(data) ? data : (data.days || Object.entries(data).map(([k, v]) => ({ date: k, ...v })));
    return arr.find(e => e.date === date) || null;
  }

  async function run() {
    if (!isExec()) { log('not an Execution page'); return; }
    const d = today();
    log('start', d);

    await passSection('Safety Checks');
    await sleep(400);

    await fillInputs('Timer Accuracy', [20]);
    await sleep(400);

    const day = pickDay(await fetchDaily(), d);
    const ss = day ? (day.sourceStrength ?? day.strength ?? day.sourceTrends) : null;
    const dk = DECAY[d] != null ? DECAY[d].toFixed(3) : null;
    log('decay table', dk, '| current source strength (daily-data.json)', ss);
    if (dk == null) log('no decay table value for', d);
    if (ss == null) log('no sourceStrength in daily-data.json for', d);
    await fillInputs('Decay', [dk, ss != null ? Number(ss).toFixed(3) : null]);
    await sleep(400);

    const pos = day ? (day.fake && day.real ? [...day.fake, ...day.real]
      : [day.fake90, day.fake120, day.fake150, day.real90, day.real120, day.real150]) : null;
    if (pos && pos.every(v => v != null)) {
      log('source strength', day.sourceStrength ?? day.strength);
      await fillInputs('Source Position', pos.map(v => Number(v).toFixed(1)), true);
    } else log('no source position data for', d, '- skipped');
    await sleep(400);

    await passSection('Survey Meter');
    await sleep(400);

    await fillInputs('Exposure Measurement', ['2.0', '10.0', '200']);
    await sleep(600);

    const save = [...document.querySelectorAll('button,a,input[type="button"]')].find(b => vis(b) && /^\s*save\s*$/i.test(b.innerText || b.value || ''));
    if (save) safeClick(save, 'Save'); else log('Save button not found');
    log('done (Approve NOT clicked)');
  }

  function addButton() {
    if (document.getElementById('suncheck-hdr-btn')) return;
    const b = document.createElement('button');
    b.id = 'suncheck-hdr-btn'; const ver = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '1.15';
    b.innerHTML = 'HDR Daily Fill  v' + ver + '<div style="font-size:12px;font-weight:normal;margin-top:2px">' + today() + '</div><div class="sc-str" style="font-size:12px;font-weight:normal">Source strength: loading…</div>';
    fetchDaily().then(data => { const d = pickDay(data, today()); const v = d && (d.sourceTrends ?? d.sourceStrength ?? d.strength); const el = b.querySelector('.sc-str'); if (el) el.textContent = 'Source strength: ' + (v != null ? v + ' Ci' : 'MISSING for today'); if (v == null) b.style.background = '#c62828'; }); b.title = 'SunCHECK HDR Daily v' + ver;
    b.style.cssText = 'position:fixed;bottom:12px;left:12px;z-index:99999;padding:14px 28px;font-size:20px;font-weight:bold;background:#2e7d32;color:#fff;border:2px solid #fff;border-radius:8px;box-shadow:0 3px 10px rgba(0,0,0,.4);cursor:pointer';
    b.onclick = () => run();
    document.body.appendChild(b);
  }
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'H') { e.preventDefault(); run(); } });
  setInterval(() => { const b = document.getElementById('suncheck-hdr-btn'); if (isExec()) addButton(); else if (b) b.remove(); }, 1000);
})();
