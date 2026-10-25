/* ==========================================================================
   appkit.js · widgets for application shells
   --------------------------------------------------------------------------
   The renderer (render.js) gives every page sections, charts and icons. An app
   shell needs a different vocabulary: avatars, kanban columns, a month grid,
   density heat, a route track, a diff block, modals, pagers and CSV export.

   Everything here is a pure string function plus one small modal helper, so an
   app file stays declarative and a scaffold stays copy-pasteable. Nothing in
   here reaches the network, and nothing stores a number it could derive.

   Loaded after render.js, before data.js:
     <script src="../_design-system/appkit.js"></script>
   ========================================================================== */

(() => {
  const esc = SD.esc;

  /* ---- numbers, dates, names ------------------------------------------- */
  const nf = (dp) => (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  };

  const fmt = {
    n: nf(0),
    dec: nf(2),
    money(v, cur = '$', dp = 0) {
      const n = Number(v);
      const sign = n < 0 ? '−' : '';
      return `${sign}${cur}${nf(dp)(Math.abs(n))}`;
    },
    pct(v, dp = 1) {
      const n = Number(v);
      return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(dp)}%`;
    },
    date(iso, opts = { day: '2-digit', month: 'short' }) {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', opts);
    },
    time(iso) {
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    },
    /** 495 → 8h 15m */
    hours(mins) {
      const m = Math.max(0, Math.round(Number(mins) || 0));
      return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
    },
    rel(iso) {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '—';
      const min = Math.round((Date.now() - d.getTime()) / 60000);
      const abs = Math.abs(min);
      if (abs < 60) return min <= 0 ? 'now' : `${min}m ago`;
      if (abs < 1440) return `${Math.round(abs / 60)}h ${min < 0 ? 'from now' : 'ago'}`;
      return `${Math.round(abs / 1440)}d ${min < 0 ? 'from now' : 'ago'}`;
    },
    initials(name = '') {
      return String(name).split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
    },
  };

  const hashIndex = (s) => {
    let h = 0;
    for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 997;
    return h % 6;
  };

  /* ---- people ------------------------------------------------------------ */
  /** Initials avatar with a deterministic tone so the same person never changes. */
  function avatar(name, { size = 26, ring = false } = {}) {
    return `<span class="avatar${ring ? ' avatar--ring' : ''}" data-tone="${hashIndex(name)}"
      style="--av:${size}px" title="${esc(name)}">${esc(fmt.initials(name))}</span>`;
  }

  function avatars(names = [], max = 4) {
    const shown = names.slice(0, max);
    const rest = names.length - shown.length;
    return `<span class="avatars avatars--sm">${shown.map((n) => avatar(n, { size: 24 })).join('')}${
      rest > 0 ? `<span class="avatars__more">+${rest}</span>` : ''}</span>`;
  }

  /* ---- small data graphics ------------------------------------------------ */
  /** Inline trend line. `tone` colours it without a wrapper class. */
  function spark(values = [], { w = 64, h = 18, tone = '' } = {}) {
    const nums = values.map(Number).filter(Number.isFinite);
    if (nums.length < 2) return '';
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = max - min || 1;
    const step = w / (nums.length - 1);
    const pts = nums.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / span) * (h - 2) - 1).toFixed(1)}`);
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"
      ${tone ? `style="color:var(--${tone})"` : ''}><path d="M${pts.join(' L')}" /></svg>`;
  }

  /** One number against a limit. Uses the system ring styles. */
  function ring(value, { size = 92, label, sub = '', tone = '', caption = '' } = {}) {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    const r = 40;
    const c = 2 * Math.PI * r;
    return `<div class="ring" style="--size:${size}px">
      <svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
        <circle class="ring__track" cx="50" cy="50" r="${r}" />
        <circle class="ring__value" cx="50" cy="50" r="${r}" stroke-dasharray="${c.toFixed(1)}"
          stroke-dashoffset="${(c * (1 - pct / 100)).toFixed(1)}" ${tone ? `style="stroke:var(--${tone})"` : ''} />
      </svg>
      <span class="ring__label">${esc(label ?? `${Math.round(pct)}%`)}</span>
      ${sub ? `<span class="ring__sub">${esc(sub)}</span>` : ''}
      ${caption ? `<span class="ring__cap">${esc(caption)}</span>` : ''}
    </div>`;
  }

  function meter(label, pct, { right, tone = '' } = {}) {
    const v = Math.max(0, Math.min(100, Number(pct) || 0));
    return `<div class="meter">
      <div class="meter__row"><span>${esc(label)}</span><span class="num">${esc(right ?? `${Math.round(v)}%`)}</span></div>
      <div class="meter__track"><div class="meter__fill" style="--v:${v.toFixed(1)}%${tone ? `;background:var(--${tone})` : ''}"></div></div>
    </div>`;
  }

  /** Badge with a tone inferred from the status word. Unknown words stay neutral. */
  const TONE = {
    done: 'positive', active: 'positive', paid: 'positive', pass: 'positive', passed: 'positive',
    online: 'positive', approved: 'positive', shipped: 'positive', merged: 'positive', live: 'positive',
    overdue: 'negative', failed: 'negative', blocked: 'negative', rejected: 'negative', critical: 'negative',
    high: 'negative', declined: 'negative', expired: 'negative', exception: 'negative',
    review: 'warning', pending: 'warning', medium: 'warning', waiting: 'warning', due: 'warning',
    draft: '', low: '', idle: '', todo: '', paused: '', new: '',
  };

  function badge(text, kind = text, extra = '') {
    const t = TONE[String(kind).toLowerCase()];
    return `<span class="badge${t ? ` badge--${t}` : ''}${extra ? ` ${extra}` : ''}">${esc(text)}</span>`;
  }

  function status(text, kind = text) {
    const map = {
      positive: 'running', active: 'running', done: 'running', online: 'running', pass: 'running',
      negative: 'failed', failed: 'failed', blocked: 'failed', overdue: 'failed',
      warning: 'warn', warn: 'warn', pending: 'warn', due: 'warn',
    };
    const cls = map[String(kind).toLowerCase()] || 'idle';
    return `<span class="status status--${cls}">${esc(text)}</span>`;
  }

  /* ---- collections -------------------------------------------------------- */
  function sortRows(rows, key, dir = 'asc') {
    const val = (r) => {
      const v = typeof key === 'function' ? key(r) : r[key];
      return typeof v === 'string' ? v.toLowerCase() : v;
    };
    return [...rows].sort((a, b) => (val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0) * (dir === 'asc' ? 1 : -1));
  }

  function searchRows(rows, q, keys) {
    const needle = String(q || '').trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) => keys.some((k) => String(r[k] ?? '').toLowerCase().includes(needle)));
  }

  function groupBy(rows, key) {
    const out = new Map();
    for (const r of rows) {
      const k = typeof key === 'function' ? key(r) : r[key];
      if (!out.has(k)) out.set(k, []);
      out.get(k).push(r);
    }
    return out;
  }

  /* ---- layout widgets ----------------------------------------------------- */
  /** Kanban board. `cols = [{ id, title, items, note }]`, `render(item)` → card HTML. */
  function kanban(cols, render, { id = 'kanban' } = {}) {
    return `<div class="kanban" id="${esc(id)}">${cols.map((c) => `
      <section class="kanban__col" data-col="${esc(c.id)}">
        <header class="kanban__head">
          <span class="kanban__title">${esc(c.title)}</span>
          <span class="kanban__count">${c.items.length}</span>
        </header>
        <div class="kanban__body">
          ${c.items.length ? c.items.map(render).join('') : '<p class="kanban__empty">Nothing here yet</p>'}
        </div>
        ${c.note ? `<footer class="kanban__foot">${esc(c.note)}</footer>` : ''}
      </section>`).join('')}</div>`;
  }

  /** A month grid, Monday-first. `valueOf(day)` returns a short label. */
  function calendar({ year, month, valueOf = () => '', subOf = () => '', selected = null, today = null, toneOf = () => '' }) {
    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const prev = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = lead - 1; i >= 0; i -= 1) cells.push({ n: prev - i, muted: true });
    for (let d = 1; d <= days; d += 1) cells.push({ n: d, muted: false });
    while (cells.length % 7) cells.push({ n: cells.length - days - lead + 1, muted: true });

    const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return `<div class="cal">
      ${dow.map((d) => `<span class="cal__dow">${d}</span>`).join('')}
      ${cells.map((c) => {
        const val = c.muted ? '' : valueOf(c.n);
        const sub = c.muted ? '' : subOf(c.n);
        const tone = c.muted ? '' : toneOf(c.n);
        const cls = ['cal__day', c.muted ? 'is-muted' : '', c.n === selected && !c.muted ? 'is-selected' : '', c.n === today && !c.muted ? 'is-today' : ''].filter(Boolean).join(' ');
        if (c.muted) return `<span class="${cls}"><span class="cal__n">${c.n}</span></span>`;
        return `<button class="${cls}" type="button" data-day="${c.n}">
          <span class="cal__n">${c.n}</span>
          ${val !== '' ? `<span class="cal__v"${tone ? ` style="color:var(--${tone})"` : ''}>${esc(val)}</span>` : ''}
          ${sub ? `<span class="cal__sub">${esc(sub)}</span>` : ''}
        </button>`;
      }).join('')}
    </div>`;
  }

  /** Density grid — columns of seven, five steps from empty to saturated. */
  function heat(values = [], { label = '', cols = 12 } = {}) {
    const max = Math.max(...values, 1);
    return `<div class="heat-wrap">
      <div class="heat" style="grid-template-columns:repeat(${cols}, 13px)" aria-label="${esc(label)}">
        ${values.map((v) => {
          const level = v <= 0 ? 0 : Math.min(4, Math.ceil((v / max) * 4));
          return `<span class="heat__c" data-v="${level}" title="${esc(String(v))}"></span>`;
        }).join('')}
      </div>
      <div class="heat__key"><span>less</span>${[0, 1, 2, 3, 4].map((l) => `<span class="heat__c" data-v="${l}"></span>`).join('')}<span>more</span></div>
    </div>`;
  }

  /** A horizontal delivery track: done / current / todo nodes. */
  function route(nodes = []) {
    return `<ol class="route">${nodes.map((n) => `
      <li class="route__n route__n--${esc(n.state || 'todo')}">
        <span class="route__dot"></span>
        <span class="route__label">${esc(n.label)}</span>
        <span class="route__meta">${esc(n.meta || '')}</span>
      </li>`).join('')}</ol>`;
  }

  /** Unified-diff block. `lines = [{ n, t: ' '|'+'|'-', code }]`. */
  function diff(lines = [], { file = '' } = {}) {
    return `<div class="diff">${file ? `<div class="diff__file">${esc(file)}</div>` : ''}${lines.map((l) => `
      <div class="diff__ln${l.t === '+' ? ' is-add' : l.t === '-' ? ' is-del' : ''}">
        <span class="diff__n">${esc(String(l.n ?? ''))}</span>
        <code>${esc(l.code)}</code>
      </div>`).join('')}</div>`;
  }

  function kv(label, value, { tone = '' } = {}) {
    return `<div class="kv"><span class="kv__l">${esc(label)}</span><span class="kv__v"${tone ? ` style="color:var(--${tone})"` : ''}>${value}</span></div>`;
  }

  /* ---- modal -------------------------------------------------------------- */
  function closeModal() {
    const d = document.getElementById('app-modal');
    if (!d) return;
    try { if (d.open) d.close(); } catch { /* already closed */ }
    d.remove();
  }

  /**
   * Opens a native <dialog>. Actions are `{ label, ghost, action(dialog) }`;
   * return `true` from `action` to keep the dialog open (validation).
   */
  function modal({ title, body = '', actions = [], wide = false }) {
    closeModal();
    const d = document.createElement('dialog');
    d.id = 'app-modal';
    d.className = `modal${wide ? ' modal--wide' : ''}`;
    d.innerHTML = `
      <div class="modal__head">
        <h3 class="modal__title">${esc(title)}</h3>
        <button class="modal__x" type="button" data-close aria-label="Close">✕</button>
      </div>
      <div class="modal__body">${body}</div>
      ${actions.length ? `<div class="modal__actions">${actions.map((a, i) => `
        <button class="btn${a.ghost ? ' btn--ghost' : ''}" type="button" data-modal-action="${i}">${esc(a.label)}</button>`).join('')}
      </div>` : ''}`;
    document.body.appendChild(d);
    d.showModal();
    d.addEventListener('click', (e) => { if (e.target === d) closeModal(); });
    d.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });
    d.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeModal(); }
    });
    d.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    actions.forEach((a, i) => {
      d.querySelector(`[data-modal-action="${i}"]`)?.addEventListener('click', () => {
        const keep = a.action?.(d) === true;
        // Close *this* dialog only. An action may have opened another modal,
        // in which case closeModal() would have removed the new one instead.
        if (!keep) {
          try { if (d.open) d.close(); } catch { /* already closed */ }
          d.remove();
        }
      });
    });
    return d;
  }

  /* ---- export & clipboard -------------------------------------------------- */
  function csv(filename, headers, rows) {
    const quote = (c) => `"${String(c ?? '').replace(/"/g, '""')}"`;
    const text = [headers, ...rows].map((r) => r.map(quote).join(',')).join('\n');
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return rows.length;
  }

  function copy(text, message = 'Copied') {
    const done = () => SD.toast(message, 'positive');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
    else done();
  }

  let seq = 0;
  const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(seq += 1)}`;

  /* ---- pager --------------------------------------------------------------- */
  /** Markup only; the app listens for `[data-page]`. */
  function pager(total, per, page) {
    const pages = Math.max(1, Math.ceil(total / per));
    const from = total === 0 ? 0 : (page - 1) * per + 1;
    const to = Math.min(total, page * per);
    const nums = [];
    for (let i = 1; i <= pages; i += 1) {
      if (pages > 7 && i > 2 && i < pages - 1 && Math.abs(i - page) > 1) {
        if (nums[nums.length - 1] !== '…') nums.push('…');
      } else nums.push(i);
    }
    return `<div class="pagerrow">
      <span>${from}–${to} of ${total}</span>
      <div class="pager">
        <button type="button" class="pager__b" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Previous">←</button>
        ${nums.map((n) => n === '…'
          ? '<span class="pager__gap">…</span>'
          : `<button type="button" class="pager__b${n === page ? ' is-current' : ''}" data-page="${n}" ${n === page ? 'aria-current="page"' : ''}>${n}</button>`).join('')}
        <button type="button" class="pager__b" data-page="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Next">→</button>
      </div>
    </div>`;
  }

  SD.kit = {
    fmt, avatar, avatars, spark, ring, meter, badge, status,
    sortRows, searchRows, groupBy, kanban, calendar, heat, route, diff, kv,
    modal, closeModal, csv, copy, uid, pager, esc,
  };
})();
