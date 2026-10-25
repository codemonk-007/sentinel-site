/* ==========================================================================
   SENTINEL DESIGN SYSTEM · render.js  (runtime, ~4 KB)
   --------------------------------------------------------------------------
   The section engine. Shared by every archetype so a new section type is added
   once, not per template. Nothing here styles anything: it maps data to the
   component classes in components.css.

   window.SD = { esc, escMultiline, slug, renderNav, hero, renderSections,
                 renderFooter, scrollspy, mount }
   ========================================================================== */

window.SD = (() => {
  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

  const escMultiline = (v) => esc(v).replace(/\n/g, '<br />');
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pad2 = (n) => String(n).padStart(2, '0');

  /* ---- chrome ------------------------------------------------------------ */
  function renderNav({ mark = '', links = [], actions = [], markHref = '#top', variant = '' } = {}) {
    if (!links.length) return '';
    const items = links.map((l) => `
        <li><a href="${esc(l.href)}"${l.current ? ' aria-current="true"' : ''}>${esc(l.label)}</a></li>`).join('');
    const drawer = links.map((l) => `
        <a href="${esc(l.href)}"${l.current ? ' aria-current="true"' : ''}>${esc(l.label)}</a>`).join('');
    return `
    <nav class="nav${variant ? ` nav--${variant}` : ''}">
      <a class="nav__mark" href="${esc(markHref)}">${esc(mark)}</a>
      <ul class="nav__links">${items}</ul>
      ${actions.length ? `<div class="nav__actions">${actions.map((a) => `
        <a class="btn${a.ghost ? ' btn--ghost' : ''}" href="${esc(a.href || '#')}">${esc(a.label)}</a>`).join('')}</div>` : ''}
      <button class="nav__burger" type="button" aria-expanded="false" aria-controls="nav-drawer" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
    <div class="nav-drawer" id="nav-drawer" hidden>${drawer}</div>`;
  }

  function renderFooter(f = {}, fallbackTitle = '') {
    return `
    <footer class="footer">
      <div class="wrap">
        <div class="footer__grid">
          <div>
            <p class="footer__title">${f.logo ? `<img class="footer__mark" src="${esc(f.logo)}" alt="" />` : ''}${esc(f.title || fallbackTitle)}</p>
            ${f.note ? `<p style="margin-top:8px;max-width:42ch">${esc(f.note)}</p>` : ''}
          </div>
          ${(f.columns || []).map((c) => `
          <div>
            <p class="caps">${esc(c.title || '')}</p>
            <ul class="footer__list" style="margin-top:10px">${(c.items || [])
              .map((i) => {
                const o = typeof i === 'string' ? { label: i } : i;
                if (o.tile === undefined && !o.href) return `<li>${esc(o.label)}</li>`;
                const tile = o.tile === undefined ? '' : ` data-open-tile="${esc(o.tile)}"`;
                const href = o.href ? ` href="${esc(o.href)}"` : '';
                return `<li><a${href}${tile}>${esc(o.label)}</a></li>`;
              })
              .join('')}</ul>
          </div>`).join('')}
        </div>
        <div class="footer__base">
          <span>${esc((f.base || [])[0] || '')}</span>
          <span>${esc((f.base || [])[1] || '')}</span>
        </div>
      </div>
    </footer>`;
  }

  /* ---- hero -------------------------------------------------------------- */
  function hero(h = {}) {
    const variant = h.variant || 'full';
    const media = h.media
      ? `<img class="hero__media" src="${esc(h.media)}" alt="${esc(h.mediaAlt || '')}" />`
      : '';
    const meta = (h.meta || []).length
      ? `<div class="hero__meta">${h.meta.map((m) => `<span>${esc(m)}</span>`).join('')}</div>`
      : '';
    const actions = (h.actions || []).length
      ? `<div class="hero__actions">${h.actions.map((a) => `
          <a class="btn${a.ghost ? ' btn--ghost' : ''}" href="${esc(a.href || '#')}">${esc(a.label)}</a>`).join('')}</div>`
      : '';
    return `
      <header class="hero hero--${esc(variant)}" id="top">
        ${variant === 'full' || variant === 'split' ? media : ''}
        <div class="wrap">
          <div class="hero__body">
            ${h.kicker ? `<p class="hero__kicker">${esc(h.kicker)}</p>` : ''}
            <h1 class="hero__title">${h.titleHtml || escMultiline(h.title || '')}</h1>
            ${h.lede ? `<p class="hero__lede">${esc(h.lede)}</p>` : ''}
            ${actions}
            ${meta}
          </div>
        </div>
      </header>`;
  }

  /* ---- section frame ----------------------------------------------------- */
  function frame(s = {}, body = '', index = 0) {
    const id = `s-${slug(s.id || s.title || index)}`;
    const num = s.numbered === false ? '' : pad2(index + 1);
    return `
      <section class="section${s.sunken ? ' section--sunken' : ''}${s.raised ? ' section--raised' : ''}" id="${id}">
        <div class="wrap${s.narrow ? ' wrap--narrow' : ''}">${s.title || s.eyebrow ? `
          <div class="section-head">
            <div>
              ${(num || s.eyebrow) ? `<p class="eyebrow">${num}${s.eyebrow ? `${num ? ' · ' : ''}${esc(s.eyebrow)}` : ''}</p>` : ''}
              ${s.title ? `<h2 class="section-head__title">${esc(s.title)}</h2>` : ''}
            </div>
            ${s.note ? `<p class="section-head__note">${esc(s.note)}</p>` : ''}
          </div>` : ''}
          ${body}
        </div>
      </section>`;
  }

  /* ---- charts ------------------------------------------------------------ */
  /**
   * Charts as inline SVG. Three shapes cover most data pages: bars for
   * comparison, a line for a trend, a ring for one number against a limit.
   */
  function chartSvg(kind = 'bars', items = [], s = {}) {
    const W = 640;
    const H = Number(s.height) || 220;
    const pad = { t: 14, r: 10, b: 28, l: 10 };
    const values = items.map((i) => i.value);
    const max = Math.max(...values, 1);
    const base = H - pad.b;

    if (kind === 'donut') {
      const first = items[0] || { label: '', value: 0 };
      const maxV = Number(s.max) || 100;
      const r = 54;
      const circ = 2 * Math.PI * r;
      const pct = Math.min(1, Math.max(0, first.value / (maxV || 1)));
      return `
        <svg viewBox="0 0 160 160" role="img" aria-label="${esc(s.a11y || `${first.value} of ${maxV}`)}">
          <circle class="donut-track" cx="80" cy="80" r="${r}" />
          <circle class="donut-value" cx="80" cy="80" r="${r}" transform="rotate(-90 80 80)"
                  stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${(circ * (1 - pct)).toFixed(1)}" />
          <text class="donut-label" x="80" y="84">${esc(first.label || String(first.value))}</text>
          <text class="donut-sub" x="80" y="104">${esc(s.sub || '')}</text>
        </svg>`;
    }

    if (kind === 'line') {
      const span = base - pad.t;
      const step = items.length > 1 ? (W - pad.l - pad.r) / (items.length - 1) : 0;
      const pts = items.map((it, i) => [
        pad.l + i * step,
        base - (it.value / max) * span,
      ]);
      const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
      const area = `M${pad.l},${base} L${line.replace(/ /g, ' L')} L${(pad.l + (items.length - 1) * step).toFixed(1)},${base} Z`;
      return `
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(s.a11y || 'trend')}">
          <line class="grid-line" x1="${pad.l}" y1="${base}" x2="${W - pad.r}" y2="${base}" />
          <path class="line-area" d="${area}" />
          <polyline class="line-path" points="${line}" />
          ${pts.map(([x, y], i) => `<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3">
            <title>${esc(items[i].label)}: ${esc(String(items[i].value))}</title></circle>`).join('')}
          ${items.map((it, i) => `<text class="axis-label" x="${(pad.l + i * step).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(it.label)}</text>`).join('')}
        </svg>`;
    }

    // bars
    const n = Math.max(items.length, 1);
    const gap = 14;
    const bw = (W - pad.l - pad.r - gap * (n - 1)) / n;
    return `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.a11y || 'comparison')}">
        <line class="grid-line" x1="${pad.l}" y1="${base}" x2="${W - pad.r}" y2="${base}" />
        ${items.map((it, i) => {
          const h = Math.max(1, (it.value / max) * (base - pad.t));
          const x = pad.l + i * (bw + gap);
          const cls = s.highlightIndex === i ? 'bar' : 'bar bar--muted';
          return `<rect class="${cls}" x="${x.toFixed(1)}" y="${(base - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2">
              <title>${esc(it.label)}: ${esc(String(it.value))}</title>
            </rect>
            <text class="axis-label" x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle">${esc(it.label)}</text>`;
        }).join('')}
      </svg>`;
  }

  /* ---- icons ------------------------------------------------------------- */
  /**
   * A dozen line icons, drawn on a 24px grid with `currentColor` and no fill,
   * so they inherit type size and colour from whatever they sit in. Deliberately
   * hand-drawn: no icon font, no external request, no licence to carry.
   */
  const ICON_PATHS = {
    check: '<path d="M4 12.5 9.5 18 20 6"/>',
    cross: '<path d="M6 6 18 18M18 6 6 18"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    up: '<path d="M12 20V5M6 11l6-6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    phone: '<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"/>',
    star: '<path d="m12 3 2.6 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.3 2.8 1.1-6.1L3.3 9.4l6.1-.8Z"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M5 21h14"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    play: '<path d="M7 4 19 12 7 20Z"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-1.8-4.1"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    invoice: '<path d="M6 3h9l4 4v14H6Z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    branch: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7M18 10.5c0 3-3 3.5-6 4.5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  };

  function icon(name, { size = 16, cls = '' } = {}) {
    const path = ICON_PATHS[name];
    if (!path) return '';
    return `<svg class="icon${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" width="${size}" height="${size}"
      fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
  }

  /** A tiny trend line for a stat. Not a chart — no axes, no labels. */
  function sparkline(values = [], { w = 60, h = 16 } = {}) {
    const nums = values.map(Number).filter((n) => Number.isFinite(n));
    if (nums.length < 2) return '';
    const max = Math.max(...nums);
    const min = Math.min(...nums);
    const span = max - min || 1;
    const step = w / (nums.length - 1);
    const pts = nums.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / span) * (h - 2) - 1).toFixed(1)}`);
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">
      <path d="M${pts.join(' L')}" /></svg>`;
  }

  /* ---- section types ----------------------------------------------------- */
  const TYPES = {
    stats: (s) => `
      <div class="stats">${(s.items || []).map((i) => `
        <div class="stat">
          <span class="stat__value num">${esc(i.value)}</span>
          <span class="stat__label">${esc(i.label || '')}</span>
          ${i.delta ? `<span class="stat__trend stat__trend--${i.delta < 0 ? 'down' : 'up'}">
            ${icon(i.delta < 0 ? 'arrow' : 'up', { size: 12 })}${esc(i.deltaText || `${i.delta > 0 ? '+' : ''}${i.delta}%`)}
            ${i.spark ? sparkline(i.spark) : ''}</span>` : ''}
          ${i.note ? `<span class="stat__note">${esc(i.note)}</span>` : ''}
        </div>`).join('')}
      </div>`,

    cards: (s) => `
      <div class="grid grid--${s.columns || 3}">${(s.items || []).map((c) => `
        <article class="card${c.flat ? ' card--flat' : ''}">
          ${c.media ? `<img class="card__media" src="${esc(c.media)}" alt="${esc(c.mediaAlt || '')}" loading="lazy" />` : ''}
          <div class="card__body">
            ${(c.metaLeft || c.metaRight) ? `
              <div class="card__meta"><span>${esc(c.metaLeft || '')}</span><span class="num">${esc(c.metaRight || '')}</span></div>` : ''}
            <h3 class="card__title">${esc(c.title || '')}</h3>
            ${c.text ? `<p class="card__text">${esc(c.text)}</p>` : ''}
            ${(c.footLeft || c.footRight || c.badge) ? `
              <div class="card__foot">
                <span class="muted">${esc(c.footLeft || '')}</span>
                ${c.badge
                  ? `<span class="badge${c.badgeTone ? ` badge--${esc(c.badgeTone)}` : ''}">${esc(c.badge)}</span>`
                  : `<span>${esc(c.footRight || '')}</span>`}
              </div>` : ''}
          </div>
        </article>`).join('')}
      </div>`,

    table: (s) => {
      const cols = s.columns || [];
      return `
        <div class="table-wrap">
          <table class="table${s.compact ? ' table--compact' : ''}"${s.sortable ? ' data-sortable' : ''}>
            ${s.caption ? `<caption>${esc(s.caption)}</caption>` : ''}
            <thead><tr>${cols.map((c) => `<th class="${c.numeric ? 'col-num' : ''}"${s.sortable ? ` data-key="${esc(c.key)}"` : ''}>${esc(c.label)}</th>`).join('')}</tr></thead>
            <tbody>${(s.rows || []).map((row) => `
              <tr>${cols.map((c, i) => `
                <td class="${c.numeric ? 'col-num' : i === 0 ? 'col-strong' : ''}">${esc(row[c.key] ?? '')}</td>`).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    },

    kpis: (s) => `
      <div class="kpis">${(s.items || []).map((i) => `
        <div class="kpi">
          <span class="kpi__label">${esc(i.label || '')}</span>
          <span class="kpi__value num">${esc(i.value)}</span>
          <span class="kpi__foot">
            ${i.delta != null
              ? `<span class="stat__trend stat__trend--${i.delta < 0 ? 'down' : 'up'}">${icon(i.delta < 0 ? 'arrow' : 'up', { size: 11 })} ${esc(i.deltaText || `${i.delta > 0 ? '+' : ''}${i.delta}%`)}</span>`
              : '<span></span>'}
            ${i.spark ? sparkline(i.spark, { w: 56, h: 14 }) : ''}
          </span>
        </div>`).join('')}
      </div>`,

    ring: (s) => {
      const pct = Math.max(0, Math.min(100, (Number(s.value) || 0) / (Number(s.max) || 100) * 100));
      const size = Number(s.size) || 96;
      const r = 44;
      const c = 2 * Math.PI * r;
      return `
        <div class="ring" style="--size:${size}px" role="img" aria-label="${Math.round(pct)} percent">
          <svg viewBox="0 0 100 100" width="${size}" height="${size}">
            <circle class="ring__track" cx="50" cy="50" r="${r}" />
            <circle class="ring__value" cx="50" cy="50" r="${r}"
              stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - pct / 100)).toFixed(1)}" />
          </svg>
          <span class="ring__label">${esc(s.label || `${Math.round(pct)}%`)}</span>
        </div>`;
    },

    feed: (s) => `
      <div class="feed">${(s.items || []).map((i) => `
        <div class="feed__item">
          <span class="feed__dot${i.tone ? ` feed__dot--${esc(i.tone)}` : ''}"></span>
          <span class="feed__text">${i.actor ? `<strong>${esc(i.actor)}</strong> ` : ''}${esc(i.text || '')}</span>
          <time>${esc(i.time || '')}</time>
        </div>`).join('')}
      </div>`,

    timeline: (s) => `
      <ul class="timeline">${(s.items || []).map((i) => `
        <li>
          ${i.day ? `<p class="timeline__day">${esc(i.day)}</p>` : ''}
          <h3 class="timeline__title">${esc(i.title || '')}</h3>
          ${i.text ? `<p class="timeline__text">${esc(i.text)}</p>` : ''}
        </li>`).join('')}
      </ul>`,

    prose: (s) => `
      <div class="stack" style="max-width:${s.width === 'wide' ? '100%' : '68ch'}">
        ${(s.paragraphs || []).map((p) => `<p${p.lede ? ' class="lede"' : ''}>${esc(p.text ?? p)}</p>`).join('')}
      </div>`,

    quote: (s) => `
      <figure class="quote">
        <blockquote>${esc(s.text || '')}</blockquote>
        ${s.cite ? `<figcaption>${esc(s.cite)}</figcaption>` : ''}
      </figure>`,

    /* `label` is the callout's own kicker. The section frame already owns the
       heading — using `title` here printed it twice on every page. */
    callout: (s) => `
      <div class="callout${s.tone ? ` callout--${esc(s.tone)}` : ''}">
        ${s.label ? `<p class="callout__title">${esc(s.label)}</p>` : ''}
        <p>${esc(s.text || '')}</p>
      </div>`,

    gallery: (s) => `
      <div class="grid grid--${s.columns || 2}">${(s.items || []).map((g) => {
        const cap = (g.cap || g.credit)
          ? `<span class="figure__cap"><span>${esc(g.cap || '')}</span><cite>${esc(g.credit || '')}</cite></span>`
          : '';
        const img = `<img src="${esc(g.src)}" alt="${esc(g.alt || '')}" loading="lazy" />`;
        // Zoomable unless the caller opts out — a lightbox is the default for
        // photography, and clicking a picture should never do nothing.
        if (s.zoom === false) return `<figure class="figure">${img}${cap}</figure>`;
        return `<button class="figure figure--zoom" type="button"
          data-preview="${esc(g.src)}"
          data-preview-cap="${esc(g.cap || '')}"
          data-preview-credit="${esc(g.credit || '')}">${img}${cap}</button>`;
      }).join('')}
      </div>`,

    accordion: (s) => `
      <div class="accordion">${(s.items || []).map((i) => `
        <details${i.open ? ' open' : ''}${i.group ? ` name="${esc(i.group)}"` : ''}>
          <summary>${esc(i.title || '')}</summary>
          <div class="accordion__body">
            ${(i.paragraphs || []).map((p) => `<p>${esc(p.text ?? p)}</p>`).join('')}
            ${(i.bullets || []).length ? `<ul class="chips">${i.bullets.map((b) => `<li class="chip">${esc(b)}</li>`).join('')}</ul>` : ''}
          </div>
        </details>`).join('')}
      </div>`,

    ticker: (s) => {
      // The track is duplicated so the loop joins seamlessly at -50%.
      const items = (s.items || []).map((i) => `<span>${esc(i.name ?? i)}</span>`).join('');
      return `<div class="ticker"><div class="ticker__track">${items}${items}</div></div>`;
    },

    carousel: (s) => {
      const items = s.items || [];
      const slides = items.map((c) => `
        <article class="card carousel__item">
          ${c.media ? `<img class="card__media" src="${esc(c.media)}" alt="${esc(c.mediaAlt || '')}" loading="lazy" />` : ''}
          <div class="card__body">
            ${(c.metaLeft || c.metaRight) ? `<div class="card__meta"><span>${esc(c.metaLeft || '')}</span><span class="num">${esc(c.metaRight || '')}</span></div>` : ''}
            <h3 class="card__title">${esc(c.title || '')}</h3>
            ${c.text ? `<p class="card__text">${esc(c.text)}</p>` : ''}
          </div>
        </article>`).join('');
      if (items.length < 2) return `<div class="carousel"><div class="carousel__track">${slides}</div></div>`;
      return `
        <div class="carousel" data-carousel>
          <div class="carousel__track">${slides}</div>
          <button class="carousel__nav carousel__nav--prev" type="button" aria-label="Previous">←</button>
          <button class="carousel__nav carousel__nav--next" type="button" aria-label="Next">→</button>
          <div class="carousel__dots">${items.map((_, i) => `<button type="button" aria-label="Go to slide ${i + 1}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
        </div>`;
    },

    team: (s) => `
      <div class="team" style="--cols:${s.columns || 4}">${(s.items || []).map((p) => `
        <div class="person">
          ${p.avatar ? `<img src="${esc(p.avatar)}" alt="${esc(p.name || '')}" loading="lazy" />` : ''}
          <p class="person__name">${esc(p.name || '')}</p>
          <p class="person__role">${esc(p.role || '')}</p>
          ${p.note ? `<p class="person__note">${esc(p.note)}</p>` : ''}
        </div>`).join('')}
      </div>`,

    articles: (s) => `
      <div class="articles">${(s.items || []).map((a) => `
        <a href="${esc(a.href || '#')}">
          <time${a.datetime ? ` datetime="${esc(a.datetime)}"` : ''}>${esc(a.date || '')}</time>
          <div>
            <h3>${esc(a.title || '')}</h3>
            ${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ''}
          </div>
          <span class="caps">${esc(a.tag || '')}</span>
        </a>`).join('')}
      </div>`,

    countdown: (s) => `
      <div class="stack stack--tight">
        <div class="countdown" data-countdown data-to="${esc(s.to || '')}">
          ${['days', 'hours', 'minutes', 'seconds'].map((u) => `
            <div class="countdown__unit">
              <span class="countdown__n" data-unit="${u}">--</span>
              <span class="countdown__l">${u}</span>
            </div>`).join('')}
        </div>
        ${s.text ? `<p class="field__hint">${esc(s.text)}</p>` : ''}
      </div>`,

    comparison: (s) => {
      const cols = s.columns || [];
      return `
        <div class="table-wrap">
          <table class="table table--compare">
            <thead><tr><th>${esc(s.rowHeader || '')}</th>
              ${cols.map((c) => `<th style="text-align:center">${esc(c.label)}</th>`).join('')}
            </tr></thead>
            <tbody>${(s.rows || []).map((r) => `
              <tr><td class="col-strong">${esc(r.label)}</td>
                ${cols.map((c) => {
                  const v = r[c.key];
                  const cell = v === true
                    ? `<span class="yes">${icon('check', { size: 14 })}</span>`
                    : v === false
                      ? `<span class="no">${icon('cross', { size: 14 })}</span>`
                      : esc(v ?? '');
                  return `<td>${cell}</td>`;
                }).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    },

    chips: (s) => `
      <ul class="chips">${(s.items || []).map((c) => `<li class="chip${c.accent ? ' chip--accent' : ''}">${esc(c.label ?? c)}</li>`).join('')}</ul>`,

    /* Two-up: copy beside a figure. The most-requested section that the first
       version of the library lacked. */
    split: (s) => {
      const media = s.media
        ? `<img class="hero__media" style="border-radius:var(--r-md);aspect-ratio:${s.ratio || '4 / 3'};object-fit:cover" src="${esc(s.media)}" alt="${esc(s.mediaAlt || '')}" loading="lazy" />`
        : '';
      const right = s.flip ? 'grid--flip' : '';
      return `
        <div class="grid grid--2 split ${right}">
          <div class="stack stack--tight">
            ${s.eyebrowInner ? `<p class="caps">${esc(s.eyebrowInner)}</p>` : ''}
            ${s.heading ? `<h3 class="card__title" style="font-size:var(--fs-3)">${esc(s.heading)}</h3>` : ''}
            ${(s.paragraphs || []).map((p) => `<p class="${p.lede ? 'lede' : ''}">${esc(p.text ?? p)}</p>`).join('')}
            ${(s.bullets || []).length ? `<ul class="chips" style="margin-top:8px">${s.bullets.map((b) => `<li class="chip">${esc(b)}</li>`).join('')}</ul>` : ''}
          </div>
          ${media}
        </div>`;
    },

    steps: (s) => `
      <ol class="steps">${(s.items || []).map((i, n) => `
        <li>
          <span class="steps__n num">${pad2(n + 1)}</span>
          <div>
            <h3 class="timeline__title">${esc(i.title || '')}</h3>
            ${i.text ? `<p class="timeline__text">${esc(i.text)}</p>` : ''}
          </div>
        </li>`).join('')}
      </ol>`,

    logos: (s) => `
      <ul class="logos">${(s.items || []).map((i) => `<li>${esc(i.name ?? i)}</li>`).join('')}</ul>`,

    pricing: (s) => `
      <div class="grid grid--${(s.items || []).length || 3}">${(s.items || []).map((p) => `
        <article class="card${p.featured ? ' card--featured' : ''}">
          <div class="card__body">
            <div class="card__meta"><span>${esc(p.name || '')}</span><span class="num">${esc(p.price || '')}</span></div>
            ${p.note ? `<p class="card__text">${esc(p.note)}</p>` : ''}
            <ul class="footer__list">
              ${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}
            </ul>
            ${p.cta ? `<a class="btn" style="margin-top:auto" href="${esc(p.ctaHref || '#')}">${esc(p.cta)}</a>` : ''}
          </div>
        </article>`).join('')}
      </div>`,

    faq: (s) => `
      <div class="faq">${(s.items || []).map((i) => `
        <details>
          <summary>${esc(i.q || '')}</summary>
          <p>${esc(i.a || '')}</p>
        </details>`).join('')}
      </div>`,

    /* A full-width closing band. Separate from `callout` because it is a
       layout decision, not a note. */
    cta: (s) => `
      <section class="cta-band">
        <div class="wrap cta-band__inner">
          <div>
            <h2 class="cta-band__title">${escMultiline(s.title || '')}</h2>
            ${s.text ? `<p class="cta-band__text">${esc(s.text)}</p>` : ''}
          </div>
          <div class="cta-band__actions">${(s.actions || []).map((a) => `
            <a class="btn${a.ghost ? ' btn--ghost' : ''}" href="${esc(a.href || '#')}">${esc(a.label)}</a>`).join('')}</div>
        </div>
      </section>`,

    /* Charts are drawn as inline SVG from the same `items` shape as stats, so a
       data file never carries markup. */
    chart: (s) => {
      const items = (s.items || []).map((i) => ({ label: i.label || '', value: Number(i.value) || 0 }));
      const unit = s.unit ? esc(s.unit) : '';
      const cap = `
        <div class="chart__cap">
          <span>${esc(s.caption || '')}</span>
          <span>${unit}</span>
        </div>`;
      return `<div class="chart">${chartSvg(s.kind || 'bars', items, s)}${cap}</div>`;
    },

    /* Plain feature list: no card chrome, an icon per row. Better than cards
       when the items are short and numerous. */
    features: (s) => `
      <div class="grid grid--${s.columns || 3}">${(s.items || []).map((f) => `
        <div style="display:grid;gap:8px">
          <span style="color:var(--accent)">${icon(f.icon || 'check', { size: 20 })}</span>
          <h3 class="card__title" style="font-size:var(--fs-1)">${esc(f.title || '')}</h3>
          <p class="card__text">${esc(f.text || '')}</p>
        </div>`).join('')}
      </div>`,

    /* A form with no backend: the markup is real and accessible, the submit is
       a no-op the caller wires. Static pages still need to look finished. */
    form: (s) => {
      const fields = (s.fields || []).map((f) => {
        const id = `f-${slug(f.name || f.label)}`;
        const label = `<label class="field__label" for="${id}">${esc(f.label || '')}${f.required ? ' *' : ''}</label>`;
        const hint = f.hint ? `<span class="field__hint">${esc(f.hint)}</span>` : '';
        if (f.type === 'textarea') {
          return `<div class="field">${label}<textarea class="textarea" id="${id}" name="${id}" placeholder="${esc(f.placeholder || '')}"></textarea>${hint}</div>`;
        }
        if (f.type === 'select') {
          return `<div class="field">${label}<select class="select" id="${id}" name="${id}">${(f.options || []).map((o) => `<option>${esc(o)}</option>`).join('')}</select>${hint}</div>`;
        }
        if (f.type === 'check') {
          return `<label class="check"><input type="checkbox" name="${id}" /> <span>${esc(f.label || '')}</span></label>`;
        }
        return `<div class="field">${label}<input class="input" id="${id}" name="${id}" type="${esc(f.type || 'text')}" placeholder="${esc(f.placeholder || '')}" ${f.required ? 'required' : ''} />${hint}</div>`;
      }).join('');
      return `
        <form class="form${s.inline ? ' form--row' : ''}" onsubmit="event.preventDefault();SD.toast('${esc(s.thanks || 'Received — thank you.')}','positive')">
          ${fields}
          <div><button class="btn" type="submit">${esc(s.submit || 'Send')} ${icon('arrow', { size: 14 })}</button></div>
        </form>`;
    },

    tabs: (s) => `
      <div class="tabs" data-tabs>
        <div class="tabs__list" role="tablist">
          ${(s.items || []).map((t, i) => `
            <button type="button" role="tab" id="tab-${slug(t.label)}-${i}"
              aria-selected="${i === 0}" aria-controls="panel-${slug(t.label)}-${i}"
              tabindex="${i === 0 ? 0 : -1}">${esc(t.label || '')}</button>`).join('')}
        </div>
        ${(s.items || []).map((t, i) => `
          <div class="tabs__panel" role="tabpanel" id="panel-${slug(t.label)}-${i}"
            aria-labelledby="tab-${slug(t.label)}-${i}" ${i === 0 ? '' : 'hidden'}>
            ${(t.paragraphs || []).map((p) => `<p style="max-width:62ch;color:var(--ink-muted)">${esc(p.text ?? p)}</p>`).join('')}
            ${(t.bullets || []).length ? `<ul class="chips" style="margin-top:12px">${t.bullets.map((b) => `<li class="chip">${esc(b)}</li>`).join('')}</ul>` : ''}
          </div>`).join('')}
      </div>`,

    meters: (s) => `
      <div class="grid grid--${s.columns || 2}">${(s.items || []).map((m) => {
        const max = Number(m.max) || 100;
        const pct = Math.max(0, Math.min(100, (Number(m.value) || 0) / max * 100));
        return `
        <div class="meter">
          <div class="meter__row"><span>${esc(m.label || '')}</span><span class="num">${esc(m.display || `${Math.round(pct)}%`)}</span></div>
          <div class="meter__track"><div class="meter__fill" style="--v:${pct.toFixed(1)}%"></div></div>
          ${m.note ? `<span class="field__hint">${esc(m.note)}</span>` : ''}
        </div>`;
      }).join('')}
      </div>`,

    rating: (s) => {
      const value = Math.round(Number(s.value) || 0);
      const stars = Array.from({ length: 5 }, (_, i) =>
        `<span class="${i < value ? '' : 'is-empty'}">${icon('star', { size: 14 })}</span>`).join('');
      return `<div style="display:flex;gap:12px;align-items:center">
        <span class="rating" role="img" aria-label="${value} out of 5">${stars}</span>
        <span style="font-size:var(--fs--1);color:var(--ink-subtle)">${esc(s.caption || '')}</span>
      </div>`;
    },

    testimonials: (s) => `
      <div class="grid grid--${s.columns || 2}">${(s.items || []).map((t) => `
        <figure class="card" style="padding:var(--card-pad);gap:var(--s-3);display:grid">
          <blockquote style="margin:0;font-family:var(--font-display);font-size:var(--fs-1);line-height:var(--lh-snug)">${esc(t.quote || '')}</blockquote>
          <figcaption style="display:flex;gap:10px;align-items:center;font-size:var(--fs--1)">
            ${t.avatar
              ? `<img src="${esc(t.avatar)}" alt="" width="32" height="32" style="border-radius:50%;object-fit:cover" />`
              : `<span style="width:32px;height:32px;border-radius:50%;background:var(--accent-soft);display:inline-block"></span>`}
            <span><strong style="font-weight:var(--weight-medium)">${esc(t.name || '')}</strong>
            <span style="color:var(--ink-faint)"> · ${esc(t.role || '')}</span></span>
          </figcaption>
        </figure>`).join('')}
      </div>`,

    code: (s) => `
      <pre class="code">${esc(s.text || '')}</pre>`,

    raw: (s) => `<div class="wrap">${s.html || ''}</div>`,
  };

  /** Render a page's section list. Unknown types are skipped, never thrown. */
  function renderSections(sections = []) {
    return sections.map((s, i) => {
      if (!s || !s.type) return '';
      if (s.type === 'hero') return hero(s);
      const render = TYPES[s.type];
      if (!render) {
        console.warn('[SD] unknown section type:', s.type);
        return '';
      }
      return frame(s, render(s), i);
    }).join('');
  }

  /* ---- scrollspy --------------------------------------------------------- */
  function scrollspy() {
    const links = [...document.querySelectorAll('.nav__links a, .toc a, .rail a')]
      .filter((a) => (a.getAttribute('href') || '').startsWith('#'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) seen.add(e.target.id);
        else seen.delete(e.target.id);
      }
      const first = [...document.querySelectorAll('section[id]')].find((el) => seen.has(el.id));
      for (const a of links) a.removeAttribute('aria-current');
      if (first && byId.get(first.id)) byId.get(first.id).setAttribute('aria-current', 'true');
    }, { rootMargin: '-88px 0px -60% 0px' });
    document.querySelectorAll('section[id]').forEach((el) => io.observe(el));
  }

  function mount(html) {
    const app = document.getElementById('app');
    if (app) app.innerHTML = html;
  }

  /* ---- behaviour --------------------------------------------------------- */

  const reduceMotion = () =>
    !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /** Sections, cards, charts and figures fade up once, as they are reached. */
  function initReveals() {
    const targets = document.querySelectorAll('.section, .card, .chart, .figure, .stat, .steps > li, .quote');
    if (!targets.length) return;
    if (reduceMotion() || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('reveal', 'is-in'));
      return;
    }
    let revealed = 0;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        revealed += 1;
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => {
      el.classList.add('reveal');
      io.observe(el);
    });

    // Safety net: an embedded or unusual viewport can leave the observer with
    // nothing intersecting, and hidden content is worse than missing motion.
    //
    // It must only fire when the observer is actually broken. A tall hero means
    // EVERY section starts below the fold, so "nothing revealed yet" is the
    // normal state at load — blanket-revealing there would kill the effect for
    // the whole page and make every later section appear pre-revealed.
    const looksBroken = () => {
      if (revealed > 0) return false;
      const h = window.innerHeight || 0;
      return [...targets].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < h && r.bottom > 0;
      });
    };

    const rescue = () => {
      if (!looksBroken()) return;
      targets.forEach((el) => el.classList.add('is-in'));
    };

    window.setTimeout(rescue, 1200);
    window.addEventListener('scroll', rescue, { passive: true, once: true });
  }

  /** The nav condenses past the hero; a burger opens its own drawer. */
  function initNav() {
    const navs = [...document.querySelectorAll('.nav')];
    if (!navs.length) return;

    // Only sticky bars condense — a static demo bar must not jump.
    const sticky = navs.filter((n) => {
      try { return getComputedStyle(n).position === 'sticky'; } catch { return false; }
    });
    if (sticky.length) {
      const onScroll = () => {
        const y = window.scrollY || document.documentElement.scrollTop;
        sticky.forEach((n) => n.classList.toggle('is-condensed', y > 64));
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Every burger owns the drawer named in aria-controls. The previous version
    // bound only the first nav on the page, so a second bar (a demo, a footer
    // nav) rendered a button that did nothing.
    document.querySelectorAll('.nav__burger').forEach((burger) => {
      const target = burger.getAttribute('aria-controls');
      const drawer = target ? document.getElementById(target) : null;
      if (!drawer) return;

      const close = () => {
        burger.setAttribute('aria-expanded', 'false');
        drawer.classList.remove('is-open');
        window.setTimeout(() => { drawer.hidden = true; }, reduceMotion() ? 0 : 260);
      };

      burger.addEventListener('click', () => {
        const open = burger.getAttribute('aria-expanded') !== 'true';
        burger.setAttribute('aria-expanded', String(open));
        if (open) {
          // No requestAnimationFrame: a background tab suspends it, which left
          // the drawer half-open — visible in the DOM, invisible on screen.
          drawer.hidden = false;
          void drawer.offsetWidth; // commit the closed frame, then transition
          drawer.classList.add('is-open');
        } else {
          close();
        }
      });

      drawer.addEventListener('click', (e) => {
        if (e.target.closest('a')) close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
          burger.focus();
          close();
        }
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 860 && burger.getAttribute('aria-expanded') === 'true') close();
      }, { passive: true });
    });
  }

  /** A 2px accent line showing how far through the document the reader is. */
  function initProgress() {
    if (!document.querySelector('.nav')) return;
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || 0) / max)) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  /** Give line charts a real path length so they can draw themselves. */
  function initCharts() {
    document.querySelectorAll('.chart .line-path').forEach((path) => {
      if (path.getTotalLength) path.style.setProperty('--len', Math.ceil(path.getTotalLength()));
    });
  }

  /** Tabs: click and arrow keys, roving tabindex, one panel visible. */
  function initTabs() {
    document.querySelectorAll('.tabs[data-tabs]').forEach((root) => {
      const tabs = [...root.querySelectorAll('[role="tab"]')];
      if (!tabs.length) return;
      const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
      const select = (i) => {
        tabs.forEach((t, n) => {
          const on = n === i;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          if (panels[n]) panels[n].hidden = !on;
        });
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(i));
        t.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          select(next);
          tabs[next].focus();
        });
      });
    });
  }

  /** Back to top — appears only once there is something to scroll back from. */
  function initToTop() {
    if (document.querySelector('.to-top')) return;
    const btn = document.createElement('button');
    btn.className = 'to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = icon('up', { size: 18 });
    document.body.appendChild(btn);
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
    const onScroll = () => btn.classList.toggle('is-visible', (window.scrollY || 0) > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /** Transient confirmation: SD.toast('Saved', 'positive'). */
  function toast(message, tone = '') {
    let stack = document.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.appendChild(stack);
    }
    const el = document.createElement('div');
    el.className = `toast${tone ? ` toast--${tone}` : ''}`;
    el.innerHTML = `${icon(tone === 'negative' ? 'cross' : 'check', { size: 14 })}<span>${esc(message)}</span>`;
    stack.appendChild(el);
    window.setTimeout(() => {
      el.classList.add('is-leaving');
      window.setTimeout(() => el.remove(), 260);
    }, 2800);
  }

  /** Any figure marked [data-preview] opens a single shared lightbox. */
  function initLightbox() {
    const triggers = [...document.querySelectorAll('[data-preview]')];
    if (!triggers.length) return;

    let dlg = null;
    let img = null;
    let cap = null;
    let index = 0;

    const show = (i) => {
      index = (i + triggers.length) % triggers.length;
      const t = triggers[index];
      img.src = t.getAttribute('data-preview');
      img.alt = t.querySelector('img')?.alt || '';
      cap.innerHTML = `<span>${esc(t.getAttribute('data-preview-cap') || '')}</span>
        <cite>${esc(t.getAttribute('data-preview-credit') || '')}</cite>`;
    };

    const ensure = () => {
      if (dlg) return;
      dlg = document.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Image viewer');
      dlg.innerHTML = `
        <figure><img alt="" /><figcaption></figcaption></figure>
        <button class="lightbox__x" type="button" aria-label="Close">✕</button>
        <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous image">←</button>
        <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next image">→</button>`;
      document.body.appendChild(dlg);
      img = dlg.querySelector('img');
      cap = dlg.querySelector('figcaption');
      dlg.querySelector('.lightbox__x').addEventListener('click', () => dlg.close());
      dlg.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(index - 1));
      dlg.querySelector('.lightbox__nav--next').addEventListener('click', () => show(index + 1));
      dlg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') show(index - 1);
        if (e.key === 'ArrowRight') show(index + 1);
      });
      // Clicking the backdrop closes, like every photo viewer ever.
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    };

    triggers.forEach((t, i) => {
      t.addEventListener('click', () => {
        ensure();
        show(i);
        dlg.showModal();
      });
    });
  }

  /** Segmented controls emit a `segment` event; filtering is the caller's job. */
  function initSegmented() {
    document.querySelectorAll('.segmented').forEach((group) => {
      const buttons = [...group.querySelectorAll('button')];
      buttons.forEach((b) => b.addEventListener('click', () => {
        buttons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
        group.dispatchEvent(new CustomEvent('segment', {
          bubbles: true,
          detail: { value: b.dataset.value || b.textContent.trim() },
        }));
      }));
    });
  }

  /** Announcement bars are dismissible; they are chrome, not content. */
  function initAnnounce() {
    document.querySelectorAll('.announce').forEach((bar) => {
      const x = bar.querySelector('.announce__x');
      if (x) x.addEventListener('click', () => bar.remove());
    });
  }

  /** Carousels: arrows scroll one slide, dots jump, both track scroll position. */
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach((root) => {
      const track = root.querySelector('.carousel__track');
      const prev = root.querySelector('.carousel__nav--prev');
      const next = root.querySelector('.carousel__nav--next');
      const dots = [...root.querySelectorAll('.carousel__dots button')];
      if (!track) return;

      const slides = [...track.children];
      const step = () => (slides[0]?.getBoundingClientRect().width || 320) + 16;

      const sync = () => {
        const atStart = track.scrollLeft < 8;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
        if (prev) prev.disabled = atStart;
        if (next) next.disabled = atEnd;
        if (dots.length) {
          const active = Math.round(track.scrollLeft / step());
          dots.forEach((d, i) => {
            if (i === active) d.setAttribute('aria-current', 'true');
            else d.removeAttribute('aria-current');
          });
        }
      };

      prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduceMotion() ? 'auto' : 'smooth' }));
      next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduceMotion() ? 'auto' : 'smooth' }));
      dots.forEach((d, i) => d.addEventListener('click', () => {
        track.scrollTo({ left: i * step(), behavior: reduceMotion() ? 'auto' : 'smooth' });
      }));

      track.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync, { passive: true });
      sync();
    });
  }

  /** Countdown to a real timestamp; stops at zero rather than going negative. */
  function initCountdowns() {
    document.querySelectorAll('[data-countdown]').forEach((root) => {
      const target = Date.parse(root.getAttribute('data-to') || '');
      if (Number.isNaN(target)) return;
      const units = {
        days: root.querySelector('[data-unit="days"]'),
        hours: root.querySelector('[data-unit="hours"]'),
        minutes: root.querySelector('[data-unit="minutes"]'),
        seconds: root.querySelector('[data-unit="seconds"]'),
      };
      const pad = (n) => String(n).padStart(2, '0');
      const tick = () => {
        const left = Math.max(0, target - Date.now());
        const s = Math.floor(left / 1000);
        if (units.days) units.days.textContent = String(Math.floor(s / 86400));
        if (units.hours) units.hours.textContent = pad(Math.floor((s % 86400) / 3600));
        if (units.minutes) units.minutes.textContent = pad(Math.floor((s % 3600) / 60));
        if (units.seconds) units.seconds.textContent = pad(s % 60);
        if (left <= 0) clearInterval(timer);
      };
      tick();
      const timer = window.setInterval(tick, 1000);
    });
  }

  /** App shells: collapse the rail, remember the choice. */
  function initSidebar() {
    const shell = document.querySelector('.app-shell');
    const toggle = document.querySelector('.app-side__toggle');
    if (!shell || !toggle) return;
    // Versioned key: an earlier key was set by a test run and left new visitors
    // staring at a collapsed rail they never chose.
    const KEY = 'sd.sidebar.collapsed.v2';
    try { if (localStorage.getItem(KEY) === '1') shell.classList.add('is-collapsed'); } catch { /* private mode */ }
    const sync = () => toggle.setAttribute('aria-expanded', String(!shell.classList.contains('is-collapsed')));
    sync();
    toggle.addEventListener('click', () => {
      const collapsed = shell.classList.toggle('is-collapsed');
      sync();
      try { localStorage.setItem(KEY, collapsed ? '1' : '0'); } catch { /* private mode */ }
    });
  }

  /** Click a header to sort. Numeric columns sort as numbers, not strings. */
  function initTables() {
    document.querySelectorAll('table[data-sortable]').forEach((table) => {
      const ths = [...table.querySelectorAll('thead th')];
      const body = table.tBodies[0];
      if (!body) return;
      ths.forEach((th, idx) => {
        th.tabIndex = 0;
        const sort = () => {
          const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
          ths.forEach((o) => o.removeAttribute('aria-sort'));
          th.setAttribute('aria-sort', dir);
          const numeric = th.classList.contains('col-num');
          const value = (row) => {
            const cell = row.cells[idx];
            const raw = (cell?.dataset.value ?? cell?.textContent ?? '').trim();
            return numeric ? (parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0) : raw.toLowerCase();
          };
          [...body.rows]
            .sort((a, b) => {
              const x = value(a);
              const y = value(b);
              return (x < y ? -1 : x > y ? 1 : 0) * (dir === 'ascending' ? 1 : -1);
            })
            .forEach((row) => body.appendChild(row));
        };
        th.addEventListener('click', sort);
        th.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sort(); }
        });
      });
    });
  }

  /**
   * Style picker for any page that can wear more than one skin.
   *
   * Pages are static files, so switching sets `?style=` and reloads — which
   * keeps the shell identical while only the token file changes. Returns the
   * active style name.
   */
  function styleSelect({ mount, base = '../_styles', linkId = 'style-link', styles = [], fallback = '' } = {}) {
    const params = new URLSearchParams(location.search);
    const current = params.get('style') || fallback || styles[0] || '';
    const link = document.getElementById(linkId);
    if (link && current) link.href = `${base}/${current}.css`;
    if (!mount || !styles.length) return current;

    const select = document.createElement('select');
    select.className = 'style-select';
    select.setAttribute('aria-label', 'Preview style');
    for (const s of styles) {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      o.selected = s === current;
      select.appendChild(o);
    }
    select.addEventListener('change', () => {
      const u = new URL(location.href);
      u.searchParams.set('style', select.value);
      location.href = u.toString();
    });
    mount.appendChild(select);
    return current;
  }

  /**
   * Minimal hash router for app shells.
   *
   * `#/holdings` renders the holdings view into one mount point; nav links are
   * ordinary anchors, so back/forward, deep links and reloads all work without
   * a build step. Views are functions returning HTML; `after` runs once the
   * view is in the DOM so a page can wire delegated listeners.
   */
  function spa({ mount, nav = [], views = {}, fallback = '', after = {} } = {}) {
    const root = typeof mount === 'string' ? document.querySelector(mount) : mount;
    if (!root) return null;

    const ids = Object.keys(views);
    const first = fallback || ids[0] || '';
    // `after` may be a map of view → hook (the original shape) or a single
    // function that receives the view id. Both are reasonable; accept both.
    const runAfter = typeof after === 'function' ? after : (id) => after[id]?.();
    const current = () => {
      const id = (location.hash || '').replace(/^#\/?/, '');
      return ids.includes(id) ? id : first;
    };

    const render = () => {
      const id = current();
      root.innerHTML = views[id]();
      // A link that points at the current view is the current page.
      document.querySelectorAll('[data-view]').forEach((a) => {
        if (a.getAttribute('data-view') === id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      document.title = document.title.replace(/^[^—]*— /, '');
      runAfter(id);
      return id;
    };

    window.addEventListener('hashchange', render);
    render();

    return {
      render,
      go(id) {
        if (id === current()) render();
        else location.hash = `#/${id}`;
      },
      get current() { return current(); },
    };
  }

  function init({ reveal = true, nav = true, progress = true } = {}) {
    // Enables the reveal styles. Without this class the CSS leaves everything
    // visible, so a page with a broken engine is plain, not empty.
    document.documentElement.classList.add('js');
    if (reveal) initReveals();
    if (nav) initNav();
    if (progress) initProgress();
    initCharts();
    initTabs();
    initToTop();
    initLightbox();
    initSegmented();
    initAnnounce();
    initCarousels();
    initCountdowns();
    initSidebar();
    initTables();
  }

  return {
    esc, escMultiline, slug, renderNav, hero, renderSections, renderFooter,
    scrollspy, mount, chartSvg, icon, toast, styleSelect, spa, init, TYPES,
    // Re-exposed so an app shell can wire markup it rendered after load.
    initTabs, initCharts,
  };
})();
