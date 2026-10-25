/* ==========================================================================
   pagekit.js · shared building blocks for the page templates
   --------------------------------------------------------------------------
   Twenty templates should not mean twenty copies of the same article
   renderer. This is the common vocabulary: a masthead, a content-block
   renderer, a footer and two small validators. Shape-specific markup stays in
   the template's own render.js.

   window.PK:
     masthead({ brand, strapline, meta, nav, current, home })
     blocks([...])      p · lead · h2 · h3 · list · quote · callout · code ·
                        table · stats · cards · faq · facts · tags
     footer(footer, brand)
     validEmail(value)
   ========================================================================== */

(() => {
  const esc = SD.esc;

  const renderers = {
    lead: (b) => `<p class="pk-lead">${esc(b.text)}</p>`,
    p: (b) => `<p>${esc(b.text)}</p>`,
    h2: (b) => `<h2 class="pk-h2">${esc(b.text)}</h2>`,
    h3: (b) => `<h3 class="pk-h3">${esc(b.text)}</h3>`,
    list: (b) => `<ul class="pk-list">${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`,
    quote: (b) => `<figure class="pullquote">
      <blockquote>“${esc(b.text)}”</blockquote>
      ${b.cite ? `<figcaption>${esc(b.cite)}</figcaption>` : ''}
    </figure>`,
    callout: (b) => `<div class="callout${b.tone === 'warning' ? ' callout--warning' : ''}">
      <span class="callout__title">${esc(b.title)}</span><p>${esc(b.text)}</p></div>`,
    code: (b) => `<pre class="code">${esc(b.text)}</pre>`,
    table: (b) => `<div class="table-wrap"><table class="table table--compact">
      <thead><tr>${b.columns.map((c) => `<th${c.num ? ' class="col-num"' : ''}>${esc(c.label)}</th>`).join('')}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((cell, i) => `<td${b.columns[i].num ? ' class="col-num"' : ''}>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`,
    stats: (b) => `<div class="stats" style="--cols:${b.items.length}">
      ${b.items.map((s) => `<div class="stat"><span class="stat__value">${esc(s.value)}</span>
        <span class="stat__label">${esc(s.label)}</span>${s.note ? `<span class="stat__note">${esc(s.note)}</span>` : ''}</div>`).join('')}
    </div>`,
    cards: (b) => `<div class="grid grid--${b.columns || 3}">
      ${b.items.map((c) => `<article class="card"><div class="card__body">
        ${c.meta ? `<div class="card__meta"><span>${esc(c.meta)}</span></div>` : ''}
        <h3 class="card__title">${esc(c.title)}</h3>
        <p class="card__text">${esc(c.text)}</p>
        ${c.foot ? `<div class="card__foot">${esc(c.foot)}</div>` : ''}
      </div></article>`).join('')}
    </div>`,
    faq: (b) => `<div class="accordion">
      ${b.items.map((f, i) => `<details${i === 0 ? ' open' : ''}>
        <summary>${esc(f.q)}</summary>
        <div class="accordion__body"><p>${esc(f.a)}</p></div>
      </details>`).join('')}
    </div>`,
    facts: (b) => `<dl class="pk-facts">
      ${b.items.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
    </dl>`,
    tags: (b) => `<div class="chips">${b.items.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`,
  };

  function blocks(list = []) {
    return list.map((b) => (renderers[b.type] || (() => ''))(b)).join('');
  }

  /** A publication-style masthead. Not a sticky application bar. */
  function masthead({ brand = '', strapline = '', meta = [], nav = [], current = '', home = 'index.html' } = {}) {
    return `<header class="masthead">
      <div class="wrap">
        <div class="masthead__row">
          <a class="masthead__mark" href="${esc(home)}">${esc(brand)}</a>
          ${nav.length ? `<nav style="display:flex;gap:var(--s-4);flex-wrap:wrap;font-size:var(--fs--1)" aria-label="Site">
            ${nav.map((n) => `<a href="${esc(n.href)}" style="color:inherit;text-decoration:none"${n.id === current ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('')}
          </nav>` : ''}
        </div>
        ${(strapline || meta.length) ? `<div class="masthead__rule">
          <span>${esc(strapline)}</span>
          <span style="display:flex;gap:var(--s-4);flex-wrap:wrap">${meta.map((m) => `<span>${esc(m)}</span>`).join('')}</span>
        </div>` : ''}
      </div>
    </header>`;
  }

  const footer = (f, brand) => SD.renderFooter(f || { title: brand }, brand);

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

  window.PK = { blocks, masthead, footer, validEmail, esc };
})();
