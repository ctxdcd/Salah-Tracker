(() => {
  'use strict';

  const PRAYERS = [
    { id: 'subuh',  name: 'Subuh',  time: '04.02' },
    { id: 'zuhur',  name: 'Zuhur',  time: '11.37' },
    { id: 'asar',   name: 'Asar',   time: '15.00' },
    { id: 'magrib', name: 'Magrib', time: '17.50' },
    { id: 'isya',   name: 'Isya',   time: '19.04' }
  ];
  const PREFIX = 'salah:';

  const $ = (id) => document.getElementById(id);
  const list = $('list');

  // Local-date helpers (avoid UTC shifts)
  const pad = (n) => String(n).padStart(2, '0');
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const startOfToday = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
  let current = startOfToday();

  // Storage
  function load(key) {
    try {
      const v = JSON.parse(localStorage.getItem(PREFIX + key));
      return v && typeof v === 'object' ? v : {};
    } catch { return {}; }
  }
  function save(key, data) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(data)); } catch {}
  }

  // Build list once
  PRAYERS.forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML =
      `<button class="item" type="button" role="checkbox" aria-checked="false" data-id="${p.id}">
        <span><span class="name">${p.name}</span><span class="time">${p.time}</span></span>
        <span class="box"><svg viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7"/></svg></span>
      </button>`;
    list.appendChild(li);
  });

  function render() {
    const key = keyOf(current);
    const data = load(key);
    let n = 0;
    list.querySelectorAll('.item').forEach((el) => {
      const on = !!data[el.dataset.id];
      el.setAttribute('aria-checked', on);
      if (on) n++;
    });
    $('date').textContent = current.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    $('date').dateTime = key;
    $('count').textContent = `${n}/5 completed`;
    $('fill').style.width = `${n * 20}%`;
    document.querySelector('.bar').setAttribute('aria-valuenow', n);
    $('done').hidden = n !== 5;
    $('today').style.visibility = key === keyOf(new Date()) ? 'hidden' : 'visible';
  }

  list.addEventListener('click', (e) => {
    const el = e.target.closest('.item');
    if (!el) return;
    const key = keyOf(current);
    const data = load(key);
    data[el.dataset.id] = !data[el.dataset.id];
    if (!data[el.dataset.id]) delete data[el.dataset.id];
    save(key, data);
    render();
  });

  const shift = (days) => { current.setDate(current.getDate() + days); render(); };
  $('prev').addEventListener('click', () => shift(-1));
  $('next').addEventListener('click', () => shift(1));
  $('today').addEventListener('click', () => { current = startOfToday(); render(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') shift(-1);
    if (e.key === 'ArrowRight') shift(1);
  });
  // Update if the app stays open past midnight / is resumed on a new day
  document.addEventListener('visibilitychange', render);

  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
  }
})();
