/* ==========================================================================
   panel-hero · render.js
   --------------------------------------------------------------------------
   The landing page that is NOT a centred hero followed by stacked cards:
   a full-height colour panel with the brand inside it, then alternating
   full-bleed bands and 50/50 arguments, then one ask.
   ========================================================================== */

(() => {
  const D = window.DOC || {};
  const esc = SD.esc;
  const M = D.meta || {};

  document.title = M.title || 'Launch';

  // Six small diagrams, one per capability. Each is drawn rather than written,
  // because "accessibility-level identification" is a picture, not a row in a
  // table. Same stroke weight and opacity rhythm throughout so the set reads as
  // one family.
  const specGlyph = (kind) => {
    const cls = 'stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
    const dim = 'stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".38"';
    const glow = 'stroke="var(--highlight)" fill="none" stroke-width="1.7" stroke-linecap="round"';
    const glyphs = {
      // plain English on the left, a plan on the right
      compile: `<g ${dim}><path d="M12 34h62M12 50h80M12 66h44"/></g>
        <g ${cls} opacity=".55"><path d="M104 50h24"/><path d="M122 46l6 4-6 4"/></g>
        <g ${cls}><circle cx="150" cy="50" r="7"/><circle cx="200" cy="24" r="7"/><circle cx="200" cy="76" r="7"/>
        <path d="M156 47l38-19M156 53l38 19"/></g>`,
      // an accessibility tree, one node addressed by name
      axis: `<g ${cls} opacity=".55"><rect x="96" y="8" width="52" height="18" rx="4"/><path d="M122 26v12M122 38H52v12M122 38v12M122 38h70v12"/>
        <rect x="30" y="50" width="44" height="18" rx="4"/><rect x="156" y="50" width="56" height="18" rx="4"/></g>
        <g ${glow}><rect x="98" y="50" width="48" height="18" rx="4"/></g>
        <g ${cls} opacity=".9"><path d="M171 72l-6 12 4-1 3 6"/></g>
        <g ${dim}><path d="M30 82h44M156 82h56"/></g>`,
      // a lead agent and its workers
      axisUnused: '',
      hive: `<g ${cls}><circle cx="122" cy="26" r="10"/></g>
        <g ${cls} opacity=".55"><path d="M122 36v20M122 56H58v14M122 56v14M122 56h64v14"/></g>
        <g ${cls}><circle cx="58" cy="80" r="8"/><circle cx="186" cy="80" r="8"/></g>
        <g ${glow}><circle cx="122" cy="80" r="8"/></g>`,
      // desktop and handheld, both directions
      bifrost: `<g ${cls} opacity=".7"><rect x="62" y="20" width="86" height="56" rx="5"/><path d="M50 88h110"/></g>
        <g ${glow}><rect x="176" y="42" width="34" height="58" rx="6"/><path d="M188 92h10"/></g>
        <g ${cls} opacity=".6"><path d="M156 66h-0"/><path d="M152 62l-6 4 6 4M162 62l6 4-6 4"/></g>`,
      // the ledger: time down the side, entries across
      ledger: `<g ${cls} opacity=".4"><path d="M30 16v92"/></g>
        <g ${glow}><circle cx="30" cy="28" r="3.5"/></g>
        <g ${cls} opacity=".55"><circle cx="30" cy="56" r="3.5"/><circle cx="30" cy="84" r="3.5"/><circle cx="30" cy="108" r="3.5"/></g>
        <g ${dim}><path d="M46 28h74M46 56h110M46 84h88M46 108h120"/></g>
        <g ${cls} opacity=".8"><path d="M196 24l5 5 9-12"/></g>`,
      // the artefacts that come out
      artifacts: `<g ${cls} opacity=".35"><rect x="58" y="22" width="58" height="74" rx="4"/></g>
        <g ${cls} opacity=".55"><rect x="78" y="30" width="58" height="74" rx="4"/></g>
        <g ${cls}><rect x="98" y="38" width="62" height="74" rx="4"/>
        <path d="M110 58h38M110 70h26" opacity=".7"/>
        <path d="M110 96v-12h8v12M122 96v-20h8v20M134 96v-8h8v8" opacity=".9"/></g>`,
      // a run with checkpoints, and one that picks up where it stopped
      autonomous: `<g ${cls} opacity=".35"><path d="M24 64h192"/></g>
        <g ${glow}><path d="M24 64h96"/></g>
        <g ${cls}><circle cx="24" cy="64" r="4"/><circle cx="216" cy="64" r="4"/></g>
        <g ${cls} opacity=".6"><path d="M72 64v-9M120 64v-9M168 64v-9"/></g>
        <g ${glow}><circle cx="120" cy="64" r="7"/><path d="M186 96c0 12-14 18-30 18h-22"/><path d="M140 108l-7 6 7 6"/></g>`,
    };
    return glyphs[kind] || '';
  };

  // Small line icons for the category tiles. One family: 24px box, 1.4 stroke,
  // rounded joins, no fills, so the set matches the diagrams elsewhere.
  const catIcon = (name) => ({
    shield: '<path d="M12 3l7 3v6c0 4.2-2.9 7.2-7 9-4.1-1.8-7-4.8-7-9V6z"/>',
    truck: '<path d="M3 7h10v8H3z"/><path d="M13 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="16.5" cy="18" r="1.6"/>',
    bolt: '<path d="M13 3L5 14h5l-1 7 8-11h-5z"/>',
    flow: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="12" r="2.2"/><circle cx="5" cy="18" r="2.2"/><path d="M7 7l10 4M7 17l10-4"/>',
    doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/>',
    devices: '<rect x="3" y="5" width="12" height="8" rx="1.5"/><path d="M6 17h6"/><rect x="16" y="9" width="5" height="9" rx="1.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chart: '<path d="M21 20H3"/><path d="M6 20v-6M11 20V7M16 20v-9"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7.5l9 6 9-6"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 8.5a3 3 0 010 5"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M15.6 15.6L21 21"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
  }[name] || '');

  // Two shapes of the same problem, drawn side by side. Left: the estate most
  // teams end up with, one scattered system per objective. Right: one engine
  // fanning out to the same objectives with nothing new to maintain.
  const fragmentationSvg = () => {
    const boxes = [
      [18, 24, 76, 30, 'agent'], [122, 14, 92, 28, 'integration'], [246, 30, 62, 26, 'etl'],
      [330, 16, 96, 32, 'crm'], [34, 92, 84, 30, 'script'], [150, 104, 98, 34, 'pipeline'],
      [286, 96, 72, 28, 'db'], [58, 176, 96, 30, 'ticketing'], [196, 184, 86, 28, 'agent'],
      [306, 174, 88, 32, 'files'], [110, 250, 82, 26, 'ops'], [252, 252, 94, 28, 'api'],
    ];
    const links = [
      'M94 39 C150 20, 190 50, 246 44', 'M122 28 C92 58, 74 72, 76 92',
      'M198 121 C234 132, 258 118, 286 110', 'M340 48 C322 78, 302 88, 300 96',
      'M118 107 C142 130, 150 152, 154 176', 'M200 198 C240 210, 280 198, 306 190',
      'M286 262 C300 242, 318 222, 332 206', 'M94 191 C62 220, 90 232, 110 250',
    ];
    // Three of the wires are dead and three of the systems have stopped
    // answering. The animation says which is which: live dashes travel, dead
    // ones sit still and dim.
    const dead = new Set([1, 3, 5]);
    const deadBoxes = new Set([4, 7, 10]);
    return `
        <svg class="why-svg chaos-svg" viewBox="0 0 440 300" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" stroke-width="1.1">
            ${links.map((d, i) => `<path class="chaos-link ${dead.has(i) ? 'is-dead' : 'is-live'}" style="--i:${i}" d="${d}"/>`).join('')}
          </g>
          <g class="chaos-breaks" fill="none" stroke="currentColor" stroke-width="1.3">
            ${[[352, 232], [136, 62], [268, 158]].map(([x, y], i) => `<path style="--i:${i}" d="M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10"/>`).join('')}
          </g>
          ${boxes.map(([x, y, w, h, label], i) => `
          <g class="chaos-box ${deadBoxes.has(i) ? 'is-dead' : 'is-live'}" style="--i:${i}">
            <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="currentColor" stroke-opacity=".45"/>
            <text x="${x + 9}" y="${y + h / 2 + 3.5}" style="font-family:var(--font-mono);font-size:9px;letter-spacing:.09em" fill="currentColor" fill-opacity=".7">${label.toUpperCase()}</text>
            ${deadBoxes.has(i) ? `<circle cx="${x + w - 9}" cy="${y + 9}" r="2.6" fill="currentColor" class="chaos-dot"/>` : ''}
          </g>`).join('')}
        </svg>`;
  };

  const fanoutSvg = () => {
    const outs = [['shield', 'Security'], ['truck', 'Vendor ops'], ['bolt', 'Productivity'],
      ['flow', 'Workflow'], ['doc', 'Documents'], ['devices', 'Devices']];
    const h = 34;
    // The node is a real button: click it (or press Enter) to trace the fan-out,
    // one line and one category at a time.
    return `
        <svg class="why-svg fan-svg" viewBox="0 0 440 300" role="group" aria-label="Sentinel reaching six categories">
          <g class="fan-node" role="button" tabindex="0" aria-label="Show how one engine reaches every category">
            <rect x="6" y="104" width="104" height="92" rx="10" fill="none" stroke="var(--highlight)" stroke-width="1.6"/>
            <text x="58" y="141" text-anchor="middle" style="font-family:var(--font-display);font-size:16px" fill="currentColor">Sentinel</text>
            <text x="58" y="159" text-anchor="middle" style="font-family:var(--font-mono);font-size:8.5px;letter-spacing:.12em" fill="currentColor" fill-opacity=".55">ONE ENGINE</text>
          </g>
          ${outs.map(([icon, label], i) => {
            const y = 12 + i * 46;
            return `
          <path class="fan-line" style="--i:${i}" pathLength="1" d="M114 150 C 196 150, 196 ${y + h / 2}, 244 ${y + h / 2}" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.2"/>
          <g class="fan-tile" style="--i:${i}">
            <rect x="244" y="${y}" width="184" height="${h}" rx="7" fill="none" stroke="currentColor" stroke-opacity=".28"/>
            <svg x="256" y="${y + 7}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${catIcon(icon)}</svg>
            <text x="286" y="${y + h / 2 + 3.5}" style="font-family:var(--font-mono);font-size:9.5px;letter-spacing:.08em" fill="currentColor" fill-opacity=".78">${label.toUpperCase()}</text>
          </g>`;
          }).join('')}
        </svg>`;
  };

  // The four stages, drawn left to right. Built from the same four steps the
  // numbered columns use below it, so the picture and the prose cannot drift.
  const loopDiagram = () => {
    const xs = [10, 260, 510, 760];
    const titles = ['Describe', 'Compile', 'Orchestrate', 'Execute & deliver'];
    const glyphs = [
      // a sentence being typed
      (x) => `<path d="M${x + 40} 112h120M${x + 40} 128h150M${x + 40} 144h88"/><path d="M${x + 166} 112v12" stroke-width="1.9"/>`,
      // a plan: one input, two branches
      (x) => `<circle cx="${x + 78}" cy="128" r="7"/><circle cx="${x + 142}" cy="104" r="7"/><circle cx="${x + 142}" cy="152" r="7"/><path d="M${x + 85} 125l50-18M${x + 85} 131l50 18"/>`,
      // a lead agent delegating to three
      (x) => `<rect x="${x + 97}" y="98" width="16" height="16" rx="3"/><path d="M${x + 105} 114v12M${x + 105} 126h-51v14M${x + 105} 126v14M${x + 105} 126h51v14"/><rect x="${x + 47}" y="140" width="14" height="14" rx="3"/><rect x="${x + 98}" y="140" width="14" height="14" rx="3"/><rect x="${x + 149}" y="140" width="14" height="14" rx="3"/>`,
      // the artefact, and the ledger beside it
      (x) => `<path d="M${x + 52} 100h40l16 16v58h-56z"/><path d="M${x + 92} 100v16h16"/><path d="M${x + 66} 136l7 7 13-16"/><path d="M${x + 126} 112h40M${x + 126} 128h30M${x + 126} 144h40"/>`,
    ];
    const nodes = xs.map((x, i) => `
          <g class="loop-node" style="--i:${i}">
            <rect x="${x}" y="26" width="210" height="150" rx="12" fill="none" stroke="currentColor" stroke-opacity=".16"/>
            <text x="${x + 16}" y="52" style="font-family:var(--font-mono);font-size:11px;letter-spacing:.14em" fill="currentColor" fill-opacity=".5">0${i + 1}</text>
            <text x="${x + 16}" y="80" style="font-family:var(--font-display);font-size:${titles[i].length > 12 ? 16 : 20}px" fill="currentColor">${titles[i]}</text>
            <g class="loop-glyph" stroke="currentColor" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none">${glyphs[i](x)}</g>
          </g>`).join('');
    const arrows = [0, 1, 2].map((i) => `<path class="loop-arrow" style="--i:${i}" d="M${xs[i] + 214} 101h30" stroke="currentColor" stroke-opacity=".45" stroke-width="1.5" marker-end="url(#loop-arrow)"/>`).join('');
    return `
        <figure class="loop-diagram" aria-hidden="true">
          <svg viewBox="0 0 980 200" focusable="false">
            <defs>
              <marker id="loop-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0l10 5-10 5z" fill="currentColor" fill-opacity=".5"/>
              </marker>
            </defs>
            ${nodes}
            ${arrows}
          </svg>
        </figure>`;
  };

  // A capability with a stage shows its explanation instead of describing it:
  // the request types itself out, an arrow forms, then the steps the compiler
  // made of it arrive one by one, each carrying the job it was given.
  const wfStage = (t) => `
            <div class="wf">
              <p class="wf-line"><span class="wf-typed"></span><span class="wf-caret" aria-hidden="true"></span></p>
              <div class="wf-arrow" aria-hidden="true">
                <svg viewBox="0 0 64 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2 12h48"/><path d="M50 6l8 6-8 6"/></svg>
              </div>
              <ol class="wf-nodes">
                ${t.stage.nodes.map((n, i) => `<li class="wf-node"><span class="wf-node__n">0${i + 1}</span><span class="wf-node__t">${esc(n)}</span></li>`).join('')}
              </ol>
            </div>`;

  // AXIS: a laptop with Sentinel sitting at the bottom of the screen. Windows
  // open and close above it, and the browser is worked the way a person would
  // work it: the field is found, clicked, typed into, and answered.
  const axisStage = (t) => {
    const win = (key, label, w1, w2) => `
          <div class="axis-win axis-win--${key}">
            <span class="axis-win__bar"><i></i><i></i><i></i><b>${label}</b></span>
            <span class="axis-win__line" style="width:${w1}%"></span>
            <span class="axis-win__line" style="width:${w2}%"></span>
          </div>`;
    return `
        <div class="axis">
          <div class="axis-screen">
            ${win('a', 'Mail', 78, 54)}
            ${win('b', 'Ledger', 64, 82)}
            ${win('c', 'Notes', 70, 44)}
            <div class="axis-browser">
              <span class="axis-browser__tabs"><i>records.example</i></span>
              <span class="axis-browser__url">records.example / invoices</span>
              <span class="axis-browser__row" style="width:62%"></span>
              <span class="axis-browser__row" style="width:48%"></span>
              <span class="axis-browser__field"><span class="axis-field-text"></span></span>
              <span class="axis-browser__btn"></span>
              <span class="axis-browser__found">${esc(t.stage.found || 'Matched')}</span>
              <span class="axis-cursor" aria-hidden="true">
                <svg viewBox="0 0 12 18" fill="currentColor"><path d="M1 1l9.6 8.6-4.3.5 2 4.8-2.1.9-2-4.9L1 13.6z"/></svg>
              </span>
            </div>
            <div class="axis-dock"><img class="axis-dock__mark" src="assets/mark.png" alt="" width="14" height="14" />Sentinel</div>
          </div>
          <div class="axis-base"></div>
        </div>`;
  };

  // Hive: the lead appears, a bus spreads under it, and four workers drop off
  // that one bus at the same level. Each card names the agent and the job it
  // took, and holds a spinner while it is coming up.
  // The mark each agent wears once it is up: the work it took, drawn in the same
  // line weight as every other icon on the page.
  const hiveIcon = (name) => ({
    search: catIcon('search'),
    layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
    doc: catIcon('doc'),
    mail: catIcon('mail'),
    shield: '<path d="M12 3l7 3v6c0 4.2-2.9 7.2-7 9-4.1-1.8-7-4.8-7-9V6z"/><path d="M8.8 12l2.3 2.3 4.3-4.6"/>',
  }[name] || catIcon('check'));

  // Each worker drives its own machine. Same frame as the AXIS laptop, different
  // work inside it: tabs opening on pages that get read, an editor being typed
  // into, a sheet and its charts filling in, a message going out with the report
  // attached.
  const hiveWork = (kind) => {
    const frame = (body) => `<span class="mlap"><span class="mlap__screen">${body}</span><span class="mlap__base"></span></span>`;

    if (kind === 'search') {
      const sites = [
        { tab: 'advisories.example', head: 'Login advisory', body: [
          'Session tokens issued before March are being revoked. Everyone signs in again before Friday, and anyone working from a supplier login does it twice.',
          'Two teams have already reported the same landing page, and both reports name one mailbox. The page asks for a password, then forwards to the company site without a warning.',
          'Nothing on it is signed, the certificate was issued four days ago, and the address differs from ours by one letter.',
          'If you opened the link, sign in from the bookmarks bar of a machine on the office network. Nothing else is needed. The desk is open until six.',
        ] },
        { tab: 'whois.example', head: 'Domain record', body: [
          'The domain was registered eleven years ago through a registrar in Bremen. Records that old usually stay put, so the changes this week are worth a second look.',
          'The contact address changed twice, both times to a free mailbox, and the name servers moved with it. The old records still resolve from two regions.',
          'No other domain on that registrar changed hands this month. Three domains on the same account did, all within an hour of each other.',
          "The registrar's own status page says nothing. Support has not answered the ticket opened on Tuesday.",
        ] },
        { tab: 'feeds.example', head: 'Threat feed', body: [
          'Three separate reports describe the same campaign. All three point at one landing page, one certificate and one mailbox.',
          'Two of them include the payload, dated four days apart. The third describes the redirect chain and stops short of the payload.',
          'The feed marks the campaign as active and asks for a second opinion before it is closed. Nothing in it is confirmed by the vendor.',
          'Coverage is partial: two of the reports come from the same sensor, so the count of three is really a count of two.',
        ] },
      ];
      return `<span class="hw hw--lap">${frame(`
        <span class="mtabbar">${sites.map((s, i) => `<i style="--t:${i}">${s.tab}</i>`).join('')}</span>
        <span class="mpages2">${sites.map((s, i) => `<span class="mpage2" style="--p:${i}"><span class="mnav"><i>Home</i><i>Advisories</i><i>Contact</i></span><b>${s.head}</b>${s.body.map((p) => `<p>${p}</p>`).join('')}</span>`).join('')}<span class="mscan2"></span></span>`)}</span>`;
    }

    if (kind === 'layout') {
      const code = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <meta name="viewport"',
        '      content="width=device-width" />',
        '    <title>Q3 report</title>',
        '    <link rel="stylesheet"',
        '      href="app.css" />',
        '  </head>',
        '  <body>',
        '    <header class="band">',
        '      <h1>Q3 in review</h1>',
        '      <p>Four regions, one ledger.</p>',
        '    </header>',
        '    <main class="wrap">',
        '      <h2>Findings</h2>',
        '      <ol class="ticks">',
        '        <li>Four regions closed</li>',
        '        <li>Two need a call</li>',
        '      </ol>',
        '    </main>',
        '  </body>',
        '</html>',
      ].join('\n');
      return `<span class="hw hw--lap">${frame(`
        <span class="mbar"><i></i><i></i><i></i><b>index.html</b></span>
        <span class="mide2">
          <span class="mfiles"><i>index.html</i><i>app.css</i><i>app.js</i></span>
          <span class="mcode2"><pre class="mtype" data-type="code">${esc(code)}</pre></span>
        </span>`)}</span>`;
    }

    if (kind === 'doc') {
      const rows = [
        ['Q1', 'Q2', 'Q3', 'Total'],
        ['142', '318', '97', '557'],
        ['216', '204', '188', '608'],
        ['318', '276', '241', '835'],
        ['676', '798', '526', '2 000'],
      ];
      return `<span class="hw hw--lap">${frame(`
        <span class="mbar"><i></i><i></i><i></i><b>q3.xlsx</b></span>
        <span class="msheet2">${rows.map((r, ri) => `<span class="mrow${ri === 0 ? ' mrow--head' : ''}">${r.map((c, ci) => `<i style="--i:${ri * 4 + ci}">${c}</i>`).join('')}</span>`).join('')}</span>
        <span class="mcharts2">
          <span class="mbars2"><i style="--h:42;--d:0s"></i><i style="--h:70;--d:.1s"></i><i style="--h:55;--d:.2s"></i><i style="--h:88;--d:.3s"></i></span>
          <svg class="mpie2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="50.27" stroke-dashoffset="50.27"/></svg>
        </span>`)}</span>`;
    }

    return `<span class="hw hw--lap">${frame(`
        <span class="mgmail">
          <span class="mgmail__bar"><b>New Message</b><em></em></span>
          <span class="mgmail__field"><em>To</em><b>you@sentinel.example</b></span>
          <span class="mgmail__field"><em>Subject</em><b>Weekly review: four findings</b></span>
          <span class="mgmail__body"><pre class="mtype" data-type="mail">Hello,&#10;the weekly review is attached. Four findings, two of them need your call before Friday.</pre></span>
          <span class="mgmail__foot"><b class="msendbtn">Send</b><em class="mcur mcur--send"></em></span>
        </span>
        <span class="msent">
          <span class="msent__av">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 21c0-4.1 3.4-6.4 7.5-6.4s7.5 2.3 7.5 6.4"/></svg>
          </span>
          <b>Message sent</b>
          <i>you@sentinel.example</i>
        </span>`)}</span>`;
  };

  const hiveStage = (t) => `
        <div class="hive">
          <div class="hive-lead">
            <img class="hive-lead__mark" src="assets/mark.png" alt="" width="16" height="16" />
            <span>Sentinel</span>
            <span class="hive-lead__role">lead agent</span>
          </div>
          <span class="hive-tree">
            <span class="hive-stem" aria-hidden="true"></span>
            <span class="hive-bus" aria-hidden="true"></span>
            <span class="hive-drop hive-drop--l" aria-hidden="true"></span>
            <span class="hive-drop hive-drop--r" aria-hidden="true"></span>
            <ol class="hive-agents">
              ${t.stage.agents.map((a) => `<li class="hive-agent">
                <span class="hive-agent__slot">
                  <i class="hive-agent__spin" aria-hidden="true"></i>
                  <svg class="hive-agent__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${hiveIcon(a.icon)}</svg>
                </span>
                <span class="hive-agent__role">${esc(a.role)}</span>
                <span class="hive-agent__task">${esc(a.task)}</span>
                ${hiveWork(a.icon)}
              </li>`).join('')}
            </ol>
          </span>
        </div>`;

  // BIFROST: two scenarios on one board. Scenario A starts on the handheld and
  // finishes on the desktop. Scenario B starts on the desktop, which asks the
  // handheld for the files; the handheld sends them and the desktop forwards
  // that mail. The board spins between the two.
  const bifrostStage = (t) => {
    const s = t.stage;
    const laptop = (body) => `<span class="bi-lap"><span class="bi-lap__screen"><span class="bi-lap__display">${body}<span class="bi-dock"><img src="assets/mark.png" alt="" width="11" height="11" />Sentinel</span></span></span><span class="bi-lap__base"></span></span>`;
    const phone = (body) => `<span class="bi-phone"><span class="bi-notch"></span><span class="bi-screen"><span class="bi-app">${body}</span></span></span>`;
    const head = `<span class="bi-app__head"><img src="assets/mark.png" alt="" width="9" height="9" /><b>Sentinel</b></span>`;

    const faceA = `
          ${laptop(`
            <span class="bi-idle" data-a="idle"><span>No task yet</span></span>
            <span class="bi-run" data-a="run">
              <span class="bi-run__h">Phishing triage</span>
              <span class="bi-step"><i></i>Read the message</span>
              <span class="bi-step"><i></i>Resolve the links</span>
              <span class="bi-step"><i></i>Draft the verdict</span>
              <span class="bi-step"><i></i>Mail the report</span>
              <span class="bi-bar" data-a="bar"><i></i></span>
              <span class="bi-note">Running · started from the handheld</span>
            </span>`)}
          ${phone(`
              ${head}
              <span class="bi-thread">
                <span class="bi-msg bi-msg--out" data-a="prompt"></span>
                <span class="bi-msg bi-msg--in" data-a="work">Working on it</span>
                <span class="bi-msg bi-msg--card" data-a="card"><b>${esc(s.report.head)}</b><i>${esc(s.report.line)}</i></span>
              </span>
              <span class="bi-comp"><span class="bi-comp__text" data-type="prompt">${esc(s.prompt)}</span><b class="bi-btn"></b></span>`)}`;

    const faceB = `
          ${laptop(`
            <span class="bi-cmd" data-b="cmd">
              <span class="bi-cmd__h"><img src="assets/mark.png" alt="" width="9" height="9" />Sent to the handheld</span>
              <span class="bi-cmd__text" data-type="command">${esc(s.command)}</span>
              <span class="bi-note">Waiting on the handheld</span>
            </span>
            <span class="bi-inbox" data-b="inbox">
              <span class="bi-win__h">Inbox · 1 new · from the handheld</span>
              <span class="bi-line"><em>Subject</em>${esc(s.subject)}</span>
              <span class="bi-att" data-b="inboxAtt"><i class="bi-doc"></i>${esc(s.files[0])}</span>
              <span class="bi-att" data-b="inboxAtt"><i class="bi-doc"></i>${esc(s.files[1])}</span>
              <span class="bi-note">Downloading both attachments</span>
            </span>
            <span class="bi-mail" data-b="forward">
              <span class="bi-win__h">Forward · new message</span>
              <span class="bi-line"><em>To</em>${esc(s.to)}</span>
              <span class="bi-line"><em>Subject</em>${esc(s.forward)}</span>
              <span class="bi-att" data-b="fwdAtt"><i class="bi-doc"></i>${esc(s.files[0])}</span>
              <span class="bi-att" data-b="fwdAtt"><i class="bi-doc"></i>${esc(s.files[1])}</span>
              ${(s.extras || []).map((f) => `<span class="bi-att bi-att--added" data-b="fwdAtt"><i class="bi-doc"></i>${esc(f)}</span>`).join('')}
              <span class="bi-send">Send</span>
            </span>
            <span class="bi-done" data-b="done">
              <span class="bi-done__av">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 21c0-4.1 3.4-6.4 7.5-6.4s7.5 2.3 7.5 6.4"/></svg>
              </span>
              <b>Message sent</b>
              <i>${esc(s.to)}</i>
            </span>`)}
          ${phone(`
              ${head}
              <span class="bi-thread">
                <span class="bi-pane bi-pane--apps" data-b="apps">
                  <span class="bi-apps">
                    ${[['files', 'Files', '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'],
                      ['mail', 'Mail', catIcon('mail')],
                      ['notes', 'Notes', catIcon('doc')],
                      ['chat', 'Chat', catIcon('chat')]]
                      .map(([key, label, path]) => `<span class="bi-app-icon"><i><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${path}</svg></i><b>${label}</b></span>`).join('')}
                  </span>
                </span>
                <span class="bi-pane" data-b="files">
                  <span class="bi-win__h">Files · triage</span>
                  <span class="bi-row" data-b="pick"><i class="bi-doc"></i>${esc(s.files[0])}</span>
                  <span class="bi-row" data-b="pick"><i class="bi-doc"></i>${esc(s.files[1])}</span>
                </span>
                <span class="bi-pane" data-b="mail">
                  <span class="bi-win__h">To you</span>
                  <span class="bi-att" data-b="phoneAtt"><i class="bi-doc"></i>${esc(s.files[0])}</span>
                  <span class="bi-att" data-b="phoneAtt"><i class="bi-doc"></i>${esc(s.files[1])}</span>
                  <span class="bi-send">Send</span>
                </span>
                <span class="bi-msg bi-msg--card" data-b="sent"><b>Mail sent</b><i>${esc(s.to)}</i></span>
              </span>
              <span class="bi-comp"><span class="bi-comp__text">Ask Sentinel anything</span></span>`)}`;

    return `<span class="hw hw--bi"><span class="bi">
          <span class="bi-ctl"><b data-ctl="spin" role="button" tabindex="0" aria-label="Spin to the other scenario">BIFROST</b></span>
          <span class="bi-flip">
            <span class="bi-face bi-face--a">${faceA}</span>
            <span class="bi-face bi-face--b">${faceB}</span>
          </span>
        </span></span>`;
  };

  // An acronym pointing at the letters it was cut from: AXIS out of
  // "Autonomous eXecution IntelligenCe System". Word-initial letters are used
  // when they exist, otherwise the next match anywhere in the word.
  const acrMark = (acronym, text) => {
    const start = (s, k) => k === 0 || /[\s\-–—(/]/.test(s[k - 1]);
    const marks = new Set();
    let from = 0;
    for (const ch of acronym.toLowerCase()) {
      let hit = -1;
      for (let k = from; k < text.length && hit < 0; k++) if (text[k].toLowerCase() === ch && start(text, k)) hit = k;
      for (let k = from; k < text.length && hit < 0; k++) if (text[k].toLowerCase() === ch) hit = k;
      if (hit >= 0) { marks.add(hit); from = hit + 1; }
    }
    return [...text].map((c, k) => (marks.has(k) ? `<b>${esc(c)}</b>` : esc(c))).join('');
  };

  // The ledger: time down the side, every entry landed and marked. The rail and
  // the circles are the tile's own drawing, carried to full size.
  const ledgerStage = (t) => {
    const rows = (t.stage && t.stage.rows) || [];
    const tick = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M1.6 6.5l3 3 6-7"/></svg>';
    const cross = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.6 2.6l6.8 6.8M9.4 2.6l-6.8 6.8"/></svg>';
    return `<span class="lg">
          <span class="lg-rail" aria-hidden="true"></span>
          <ol class="lg-rows">
            ${rows.map((r) => `<li class="lg-row${r.ok ? '' : ' lg-row--fail'}">
              <span class="lg-dot" aria-hidden="true"></span>
              <span class="lg-time">${esc(r.t)}</span>
              <span class="lg-text">${esc(r.text)}</span>
              <span class="lg-mark" aria-hidden="true">${r.ok ? tick : cross}</span>
            </li>`).join('')}
          </ol>
        </span>`;
  };

  // The deliverables stage: every scaffold in the library, as a wall of
  // thumbnails that never stops moving. Four columns, alternating direction, so
  // no two rows ever read as one grid.
  const wallStage = () => {
    const tiles = window.WALL || [];
    const COLS = 4;
    const buckets = Array.from({ length: COLS }, () => []);
    tiles.forEach((x, i) => buckets[i % COLS].push(x));
    const tile = (x) => `<span class="mw-t"><img src="${esc(x.src)}" alt="" loading="lazy" decoding="async" /></span>`;
    return `<span class="mw">
      ${buckets.map((b, ci) => {
        // Two copies: the run translates by exactly half its height, so the
        // seam lands on identical content and the loop has no jump.
        const copy = `<span class="mw-copy">${b.map(tile).join('')}</span>`;
        return `<span class="mw-col"><span class="mw-run${ci % 2 ? ' mw-run--down' : ''}" style="--dur:${34 + ci * 6}s">${copy}${copy}</span></span>`;
      }).join('')}
    </span>`;
  };

  const platStage = (t) => {
    if (!t.stage) {
      return `<svg class="plat__glyph plat__glyph--big" viewBox="0 0 240 130" aria-hidden="true" focusable="false">${specGlyph(t.k)}</svg>`;
    }
    if (t.stage.kind === 'axis') return axisStage(t);
    if (t.stage.kind === 'hive') return hiveStage(t);
    if (t.stage.kind === 'ledger') return ledgerStage(t);
    if (t.stage.kind === 'wall') return wallStage(t);
    if (t.stage.kind === 'bifrost') return bifrostStage(t);
    return wfStage(t);
  };

  const nav = (M.nav || []).map((n) => n.cta    ? `<a class="btn" href="${esc(n.href)}"${n.download ? ' download' : ''} style="padding:6px 14px;font-size:var(--fs--2);background:var(--ink-inverse);color:var(--surface-inverse)">${esc(n.label)}</a>`
    : `<a href="${esc(n.href)}"${n.download ? ' download' : ''}>${esc(n.label)}</a>`).join('');

  SD.mount(`
    <section id="top" class="hero hero--panel">
      <div class="wrap" style="padding-block:var(--s-5)">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--s-5);flex-wrap:wrap">
          <a href="#top" class="brand" style="font-family:var(--font-display);font-size:var(--fs-2);letter-spacing:var(--tracking-tight);text-decoration:none;color:inherit">
            <img class="brand__mark" src="assets/mark.png" alt="" width="40" height="40" />
            <span>${esc(M.mark || '')}</span>
          </a>
          <nav style="display:flex;gap:var(--s-5);font-size:var(--fs--1);flex-wrap:wrap;align-items:center" aria-label="Sections">
            ${nav}
          </nav>
        </div>
        <div style="padding-top:14vh">
          <p class="hero__kicker">${esc(M.kicker || '')}</p>
          <h1 class="hero__title" style="font-size:var(--fs-6);max-width:22ch;line-height:.9">${esc(D.hero.title).replace(/\n/g, '<br>')}</h1>
          ${D.hero.lede ? `<p class="hero__lede" style="max-width:44ch">${esc(D.hero.lede)}</p>` : ''}
          <div class="hero__actions">
            ${(D.hero.actions || []).map((a) => `<a class="btn${a.ghost ? ' btn--ghost' : ''}" href="${esc(a.href)}"${a.download ? ' download' : ''} style="${a.ghost ? 'color:var(--ink-inverse);border-color:var(--line-inverse)' : 'background:var(--ink-inverse);color:var(--surface-inverse)'}">${esc(a.label)}</a>`).join('')}
          </div>
        </div>
        ${(D.hero.meta || []).length ? `<div style="display:flex;gap:var(--s-6);flex-wrap:wrap;margin-top:12vh;padding-top:var(--s-4);border-top:1px solid var(--line-inverse);font-family:var(--font-mono);font-size:var(--fs--2);letter-spacing:var(--tracking-wide);text-transform:uppercase;opacity:.8">
          ${D.hero.meta.map((m) => `<span>${esc(m)}</span>`).join('')}
        </div>` : ''}
      </div>
    </section>

    <section class="band" style="padding-block:var(--s-7)">
      <div class="wrap">
        <div class="stats" style="--cols:4">
          ${D.stats.map((s) => `<div class="stat">
            <span class="stat__value" style="font-size:var(--fs-4)">${esc(s.value)}</span>
            <span class="stat__label">${esc(s.label)}</span>
            ${s.note ? `<span class="stat__note">${esc(s.note)}</span>` : ''}
          </div>`).join('')}
        </div>
      </div>
    </section>

    <section id="why" class="wrap" style="padding-block:var(--s-9)">
      <div class="section-head" style="margin-bottom:var(--s-7)">
        <div>
          <p class="eyebrow">${esc(D.story.kicker)}</p>
          <h2 class="section-head__title" style="font-size:var(--fs-4);margin-top:var(--s-4);max-width:24ch">${esc(D.story.title)}</h2>
        </div>
        ${D.story.note ? `<p class="section-head__note">${esc(D.story.note)}</p>` : ''}
      </div>
      <div class="why-pair">
        <article class="why-panel">
          ${fragmentationSvg()}
          <h3 class="why-panel__title">${esc(D.story.left.label)}</h3>
          <p class="why-panel__line">${esc(D.story.left.line)}</p>
        </article>
        <article class="why-panel why-panel--one">
          ${fanoutSvg()}
          <h3 class="why-panel__title">${esc(D.story.right.label)}</h3>
          <p class="why-panel__line">${esc(D.story.right.line)}</p>
        </article>
      </div>
    </section>

    <section id="specs" class="wrap" style="padding-block:var(--s-9)">
      <div class="section-head flip-head">
        <div>
          <p class="eyebrow">${esc(D.specs.eyebrow)}</p>
          <h2 class="section-head__title" style="font-size:var(--fs-3);margin-top:var(--s-3)">${esc(D.specs.title)}</h2>
        </div>
        <p class="section-head__note">${esc(D.specs.note)}</p>
      </div>
      <div class="plat-grid">
        ${D.specs.tiles.map((t, i) => `<article class="plat" tabindex="0" role="button" aria-expanded="false" data-i="${i}" aria-label="${esc(t.title)}">
          <svg class="plat__glyph" viewBox="0 0 240 130" aria-hidden="true" focusable="false">${specGlyph(t.k)}</svg>
          <h3 class="plat__title">${esc(t.title)}</h3>
          <p class="plat__note">${esc(t.note)}</p>
          <div class="plat__panel${t.stage && (t.stage.kind === 'hive' || t.stage.kind === 'bifrost') ? ' plat__panel--wide' : ''}">
            <div class="plat__brief">
              <p class="plat__index">0${i + 1}</p>
              <h3 class="plat__panel-title">${esc(t.title)}</h3>
              ${t.expand ? `<p class="plat__expand">${acrMark(t.title, t.expand)}</p>` : ''}
              <p class="plat__panel-note">${esc(t.note)}</p>
            </div>
            <div class="plat__show">${platStage(t)}</div>
          </div>
        </article>`).join('')}
      </div>
    </section>

    <section id="service" class="band band--inverse" style="padding-block:var(--s-9)">
      <div class="wrap">
        <div class="band__row" style="margin-bottom:var(--s-7)">
          <div>
            <p class="eyebrow" style="color:var(--highlight)">${esc(D.service.kicker)}</p>
            <h2 class="band__title" style="margin-top:12px;color:var(--ink-inverse)">${esc(D.service.title)}</h2>
          </div>
          <p style="color:var(--ink-inverse);opacity:.75;font-size:var(--fs--1);max-width:40ch">${esc(D.service.aside)}</p>
        </div>
        ${loopDiagram()}
        <ol class="steps-row">
          ${D.service.steps.map((s, i) => `<li class="step" style="--i:${i};border-top:1px solid var(--line-inverse);padding-top:var(--s-3)">
            <span style="font-family:var(--font-mono);font-size:var(--fs--2);color:var(--highlight)">${esc(s.n)}</span>
            <h3 style="font-family:var(--font-display);font-size:var(--fs-1);margin:var(--s-3) 0 var(--s-2);color:var(--ink-inverse)">${esc(s.title)}</h3>
            <p style="font-size:var(--fs--1);color:var(--ink-inverse);opacity:.72;margin:0">${esc(s.text)}</p>
          </li>`).join('')}
        </ol>
      </div>
    </section>

    <section id="categories" class="band" style="padding-block:var(--s-9)">
      <div class="wrap">
        <div class="band__row flip-head" style="margin-bottom:var(--s-7)">
          <div>
            <p class="eyebrow" style="color:var(--accent)">${esc(D.categories.kicker)}</p>
            <h2 class="band__title" style="margin-top:12px">${esc(D.categories.title)}</h2>
          </div>
          <p id="cat-note" class="band__note">${esc(D.categories.note)}</p>
        </div>
        <div class="cat-grid" aria-describedby="cat-note">
          ${D.categories.items.map((c) => c.items
            ? `<article class="cat cat--open">
                ${c.name ? `<h3 class="cat__name">${esc(c.name)}</h3>` : ''}
                <div class="cat__more">
                  ${c.items.map((m) => `<span class="cat__more-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${catIcon(m.icon)}</svg>
                    <span>${esc(m.label)}</span>
                  </span>`).join('')}
                  <span class="cat__more-dots" aria-label="and more">…</span>
                </div>
              </article>`
            : `<article class="cat">
                <h3 class="cat__name">${esc(c.name)}</h3>
                <svg class="cat__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">${catIcon(c.icon)}</svg>
              </article>`).join('')}
        </div>
        ${D.categories.footnote ? `<p class="cat-foot" style="margin-top:var(--s-5);max-width:62ch;font-size:var(--fs--1);color:var(--ink-subtle)">${esc(D.categories.footnote)}</p>` : ''}
      </div>
    </section>

    <section class="wrap" style="padding-block:var(--s-9)">
      <div class="faq-block">
        <p class="eyebrow">${esc(D.faq.eyebrow)}</p>
        <h2 class="section-head__title" style="font-size:var(--fs-3);margin-top:var(--s-3)">${esc(D.faq.title)}</h2>
        <div class="accordion">
          ${D.faq.items.map((f, i) => `<details${i === 0 ? ' open' : ''}>
            <summary>${esc(f.q)}</summary>
            <div class="accordion__body"><p>${esc(f.a)}</p></div>
          </details>`).join('')}
        </div>
      </div>
    </section>

    <section id="reserve" class="band band--accent" style="padding-block:var(--s-8)">
      <div class="wrap">
        <div class="band__row">
          <h2 class="band__title" style="color:var(--ink-on-accent)">${esc(D.reserve.title)}</h2>
          <div style="display:grid;gap:var(--s-4);justify-items:start">
            <span class="reserve-stack">
              <span class="reserve-ico" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3.5" width="18" height="12" rx="1.5" />
                  <path d="M7.4 12.2V9.4M11 12.2V7.2M14.6 12.2V9.8" />
                  <path d="M12 15.5v3.4M9.6 19.8h4.8" />
                </svg>
              </span>
              <a class="btn" href="${esc(D.reserve.href)}"${D.reserve.download ? ' download' : ''} style="background:var(--ink-on-accent);color:var(--surface-accent)">${esc(D.reserve.label)}</a>
            </span>
            ${D.reserve.deckHref ? `<a href="${esc(D.reserve.deckHref)}" download style="font-family:var(--font-mono);font-size:var(--fs--2);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--ink-on-accent);text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px">${esc(D.reserve.deckLabel || 'Download the deck')}</a>` : ''}
          </div>
        </div>
      </div>
    </section>

    ${SD.renderFooter(D.footer, M.title)}
  `);

  SD.init();

  // The fan-out: draw one line and one category at a time. It plays once when it
  // scrolls into view, so a reader who never clicks still sees the finished
  // picture, and replays from the start when the node is clicked.
  const fan = document.querySelector('.fan-svg');
  const fanNode = document.querySelector('.fan-node');
  if (fan && fanNode) {
    const lines = [...fan.querySelectorAll('.fan-line')];
    const tiles = [...fan.querySelectorAll('.fan-tile')];
    let timers = [];
    // One line, then its category, then the next: a reveal driven by timers
    // rather than keyframes, so it always arrives at the finished state even in
    // a pane where animation frames are throttled.
    const play = () => {
      timers.forEach(clearTimeout);
      timers = [];
      lines.concat(tiles).forEach((el) => el.classList.remove('is-in'));
      lines.forEach((line, i) => {
        timers.push(setTimeout(() => {
          line.classList.add('is-in');
          timers.push(setTimeout(() => tiles[i]?.classList.add('is-in'), 170));
        }, 60 + i * 220));
      });
    };
    fanNode.addEventListener('click', play);
    fanNode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
    // Nothing is drawn until the node is clicked: the fan-out is the answer to a
    // question the reader asks, not something that plays at them on scroll.
  }

  // The execution loop: the four stages, and the four columns under them, are
  // handed out one scroll at a time. The section holds the page while it does
  // that, so each gesture buys exactly one stage: no rubber-banding past the
  // sequence, and no timer racing the reader. Once the fourth is out, the next
  // gesture scrolls on to the following section, and after that the lock is
  // gone for good. The drawings then take turns tracing themselves, one tile at
  // a time, for as long as the section is on screen.
  const service = document.querySelector('#service');
  if (service) {
    const nodes = [...service.querySelectorAll('.loop-node')];
    const steps = [...service.querySelectorAll('.steps-row > li')];
    const arrows = [...service.querySelectorAll('.loop-arrow')];
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const count = nodes.length || steps.length;
    const GESTURE = 160; // a gap this long starts a new scroll gesture
    const SLOT = 1200; // how long one tile holds the moving icon
    let played = false;
    let holding = false;
    let lastGesture = 0;
    let shown = 0;
    let traced = false;
    let timers = [];

    // One stage: a connector, the tile it points at, then the column under it.
    // The first stage has no connector, because nothing comes before it.
    const revealStage = (i) => {
      if (i > 0) arrows[i - 1]?.classList.add('is-in');
      timers.push(setTimeout(() => {
        if (nodes[i]) nodes[i].classList.add('is-in');
        timers.push(setTimeout(() => steps[i]?.classList.add('is-in'), 140));
      }, i > 0 ? 90 : 0));
      shown = i + 1;
      if (shown >= count) startTrace();
    };

    const showAll = () => {
      holding = false;
      arrows.forEach((a) => a.classList.add('is-in'));
      nodes.forEach((n) => n.classList.add('is-in'));
      steps.forEach((s) => s.classList.add('is-in'));
      shown = count;
      startTrace();
    };

    // Each glyph keeps its solid drawing and gains a short copper sweep that
    // runs along it. The four sweeps are spaced one slot apart inside the same
    // four-slot cycle, so exactly one icon is moving at any moment.
    function startTrace() {
      if (traced || calm) return;
      traced = true;
      nodes.forEach((node, n) => {
        const glyph = node.querySelector('.loop-glyph');
        if (!glyph) return;
        [...glyph.children].forEach((el, s) => {
          if (typeof el.getTotalLength !== 'function') return;
          const len = el.getTotalLength();
          if (!len) return;
          const seg = Math.min(len * 0.24, 44);
          const sweep = el.cloneNode(false);
          sweep.setAttribute('fill', 'none');
          sweep.style.stroke = 'var(--highlight)';
          sweep.style.strokeWidth = '2.6';
          sweep.style.strokeOpacity = '1';
          sweep.style.strokeDasharray = `${seg} ${len * 2}`;
          glyph.appendChild(sweep);
          sweep.animate([
            { strokeDashoffset: 0 },
            { strokeDashoffset: -(len + seg), offset: 0.2 },
            { strokeDashoffset: -(len + seg), offset: 1 },
          ], { duration: SLOT * count, delay: n * SLOT + s * 40, iterations: Infinity, easing: 'linear' });
        });
      });
    }

    // The section's top edge has reached the top of the window: the page stops
    // exactly there, with the board empty, and each gesture lays down the next
    // piece. Nothing is snapped into place, so the section never jumps.
    const lock = () => {
      if (played) return;
      played = true;
      if (!count) { showAll(); return; }
      holding = true;
      lastY = window.scrollY;
      lastGesture = performance.now(); // the gesture that arrived is not a new one
    };

    // The sequence only ends early when the section has genuinely left the
    // window; a few pixels of momentum past the top is not leaving.
    const stillHere = () => {
      const r = service.getBoundingClientRect();
      return r.bottom > innerHeight * 0.25 && r.top < innerHeight * 0.75;
    };

    const advance = () => {
      if (shown >= count) { holding = false; return; }
      revealStage(shown);
    };

    const guard = (e) => {
      if (!holding) return;
      if (!stillHere() || e.deltaY < -20) { showAll(); return; }
      const now = performance.now();
      const fresh = now - lastGesture > GESTURE;
      lastGesture = now;
      // Every stage is out: let this gesture through, so the page moves on.
      if (fresh && shown >= count) { holding = false; return; }
      if (e.cancelable) e.preventDefault();
      if (fresh) advance();
    };
    const keys = (e) => {
      if (!holding) return;
      if (!['PageDown', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) return;
      e.preventDefault();
      advance();
    };
    addEventListener('wheel', guard, { passive: false });
    addEventListener('touchmove', guard, { passive: false });
    addEventListener('keydown', keys);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) holding = false; });

    let lastY = window.scrollY;
    const check = () => {
      const y = window.scrollY;
      const forward = y >= lastY;
      lastY = y;
      if (played || holding || !forward) return;
      const r = service.getBoundingClientRect();
      if (r.top > 0) return; // the top edge of the section has to reach the top
      // Someone who has already taken the page past the section gets the
      // finished picture and keeps moving.
      if (r.bottom < 0) { played = true; showAll(); return; }
      lock();
    };
    addEventListener('scroll', check, { passive: true });
    check();
  }

  // The laptop and the hive stages each run their own sequence while open.
  let axisLoop = null;
  let hiveLoop = null;
  let bifrostLoop = null;
  let ledgerLoop = null;
  let wallLoop = null;

  // A capability tile opens when it is pointed at: the rest of the shelf steps
  // aside, the tile takes the whole width, and its stage plays from the top.
  // Leaving, or moving focus away, puts the shelf back exactly as it was.
  const shelf = document.querySelector('.plat-grid');
  if (shelf) {
    const tiles = [...shelf.querySelectorAll('.plat')];
    let timers = [];
    const wide = () => innerWidth > 680;

    const reset = (tile) => {
      const wf = tile.querySelector('.wf');
      if (!wf) return;
      wf.classList.remove('is-done');
      tile.querySelector('.wf-typed').textContent = '';
      tile.querySelector('.wf-arrow').classList.remove('is-in');
      tile.querySelectorAll('.wf-node').forEach((n) => n.classList.remove('is-in'));
    };

    const close = () => {
      timers.forEach(clearTimeout);
      timers = [];
      shelf.classList.remove('is-focusing');
      shelf.style.minHeight = '';
      tiles.forEach((tile) => {
        tile.classList.remove('is-open');
        tile.setAttribute('aria-expanded', 'false');
        reset(tile);
      });
      if (axisLoop) axisLoop.stop();
      if (hiveLoop) hiveLoop.stop();
      if (bifrostLoop) bifrostLoop.stop();
      if (ledgerLoop) ledgerLoop.stop();
      if (wallLoop) wallLoop.stop();
    };

    // The text arrives on a clock it reads itself, so a slow frame never leaves
    // the sentence half typed: every tick writes as much as time allows.
    const type = (el, text, ms) => {
      const started = performance.now();
      const tick = () => {
        const p = Math.min(1, (performance.now() - started) / ms);
        el.textContent = text.slice(0, Math.round(text.length * p));
        if (p < 1) timers.push(setTimeout(tick, 24));
      };
      tick();
    };

    const open = (tile) => {
      if (!wide() || tile.classList.contains('is-open')) return;
      close();
      const i = Number(tile.dataset.i);
      const stage = D.specs.tiles[i] && D.specs.tiles[i].stage;
      shelf.classList.add('is-focusing');
      tile.classList.add('is-open');
      tile.setAttribute('aria-expanded', 'true');
      // An expansion can be taller than the shelf it replaces. Read its height
      // and give the shelf that height, so the section below is pushed down
      // rather than covered.
      shelf.style.minHeight = tile.offsetHeight + 'px';
      if (tile.querySelector('.axis') && axisLoop) axisLoop.start();
      if (tile.querySelector('.hive') && hiveLoop) hiveLoop.start();
      if (tile.querySelector('.bi') && bifrostLoop) bifrostLoop.start();
      if (tile.querySelector('.lg') && ledgerLoop) ledgerLoop.start();
      if (tile.querySelector('.mw') && wallLoop) wallLoop.start();
      const wf = tile.querySelector('.wf');
      if (!wf || !stage || !stage.prompt) return;
      const typed = tile.querySelector('.wf-typed');
      const arrow = tile.querySelector('.wf-arrow');
      const nodes = [...tile.querySelectorAll('.wf-node')];
      reset(tile);
      const typedFor = Math.min(3600, stage.prompt.length * 26);
      type(typed, stage.prompt, typedFor);
      const arrowAt = typedFor + 340;
      timers.push(setTimeout(() => arrow.classList.add('is-in'), arrowAt));
      nodes.forEach((n, k) => timers.push(setTimeout(() => n.classList.add('is-in'), arrowAt + 300 + k * 240)));
      timers.push(setTimeout(() => wf.classList.add('is-done'), arrowAt + 300 + nodes.length * 240 + 260));
    };

    tiles.forEach((tile) => {
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tile.classList.contains('is-open')) close();
        else open(tile);
      });
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.click(); }
      });
    });
    // Clicking anywhere else, or Escape, puts the shelf back.
    document.addEventListener('click', (e) => { if (!e.target.closest('.plat.is-open')) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  // The AXIS stage: Sentinel sits in the dock at the bottom of the screen, other
  // windows come and go above it, and the browser is worked by finding the field
  // by name, clicking it, typing into it and reading the answer back.
  const laptop = document.querySelector('.axis');
  if (laptop) {
    const tile = laptop.closest('.plat');
    const stage = (D.specs.tiles[Number(tile.dataset.i)] || {}).stage || {};
    const typed = stage.typed || 'invoice 4471';
    const winA = laptop.querySelector('.axis-win--a');
    const winB = laptop.querySelector('.axis-win--b');
    const winC = laptop.querySelector('.axis-win--c');
    const browser = laptop.querySelector('.axis-browser');
    const cursor = laptop.querySelector('.axis-cursor');
    const field = laptop.querySelector('.axis-field-text');
    let timers = [];
    let looping = false;

    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
      [winA, winB, winC, browser].forEach((el) => el.classList.remove('is-on'));
      browser.classList.remove('is-found');
      cursor.classList.remove('is-down');
      cursor.style.left = '';
      cursor.style.top = '';
      field.textContent = '';
    };

    // The pointer starts low in the window and ends on the field itself, read
    // from the field's own box so the two always agree.
    const place = () => {
      const b = browser.getBoundingClientRect();
      const f = field.getBoundingClientRect();
      if (!b.width) return;
      cursor.dataset.x = Math.round(f.left - b.left + f.width * 0.3);
      cursor.dataset.y = Math.round(f.top - b.top + f.height * 0.5);
      cursor.style.left = Math.round(b.width * 0.76) + 'px';
      cursor.style.top = Math.round(b.height * 0.9) + 'px';
    };
    const toField = () => {
      cursor.style.left = cursor.dataset.x + 'px';
      cursor.style.top = cursor.dataset.y + 'px';
    };

    const typeField = (ms) => {
      const started = performance.now();
      const tick = () => {
        const p = Math.min(1, (performance.now() - started) / ms);
        field.textContent = typed.slice(0, Math.round(typed.length * p));
        if (p < 1) timers.push(setTimeout(tick, 24));
      };
      tick();
    };

    const cycle = () => {
      if (!looping) return;
      clear();
      at(150, () => winA.classList.add('is-on'));
      at(650, () => winB.classList.add('is-on'));
      at(1100, () => winA.classList.remove('is-on'));
      at(1400, () => winC.classList.add('is-on'));
      at(1750, () => browser.classList.add('is-on'));
      at(2100, () => winB.classList.remove('is-on'));
      at(1900, place);
      at(2400, toField);
      at(2800, () => cursor.classList.add('is-down'));
      at(2960, () => { cursor.classList.remove('is-down'); typeField(760); });
      at(3820, () => browser.classList.add('is-found'));
      at(4300, () => winC.classList.remove('is-on'));
      at(6800, cycle);
    };

    axisLoop = {
      start: () => { looping = true; clear(); cycle(); },
      stop: () => { looping = false; clear(); },
    };
  }

  // The Hive stage: the lead appears, then each worker spawns in turn. A spinner
  // holds the card while the worker comes up, and the task it was handed takes
  // the spinner's place when it is ready.
  const hive = document.querySelector('.hive');
  if (hive) {
    const workers = [...hive.querySelectorAll('.hive-agent')];
    const codeEl = hive.querySelector('.mtype[data-type="code"]');
    const mailEl = hive.querySelector('.mtype[data-type="mail"]');
    const mailScreen = mailEl ? mailEl.closest('.mlap__screen') : null;
    [codeEl, mailEl].forEach((el) => { if (el) { el.dataset.full = el.textContent; el.textContent = ''; } });

    let timers = [];
    let typing = false;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    // Text is typed on a clock the element reads itself, so a slow frame never
    // leaves a line half written, and the editor follows the caret down.
    const type = (el, ms, done) => {
      const full = el.dataset.full || '';
      const started = performance.now();
      const step = () => {
        if (!typing) return;
        const p = Math.min(1, (performance.now() - started) / ms);
        el.textContent = full.slice(0, Math.round(full.length * p));
        const box = el.parentElement;
        if (box && box.scrollHeight > box.clientHeight) box.scrollTop = box.scrollHeight;
        if (p < 1) timers.push(setTimeout(step, 26));
        else if (done) done();
      };
      step();
    };

    const runCode = () => {
      if (!typing || !codeEl) return;
      codeEl.textContent = '';
      type(codeEl, 4600, () => at(2400, runCode));
    };

    const runMail = () => {
      if (!typing || !mailEl || !mailScreen) return;
      mailScreen.classList.remove('is-press', 'is-sent');
      mailEl.textContent = '';
      type(mailEl, 2800, () => {
        at(500, () => mailScreen.classList.add('is-press'));
        at(1000, () => { mailScreen.classList.remove('is-press'); mailScreen.classList.add('is-sent'); });
        at(4200, () => { mailScreen.classList.remove('is-sent'); runMail(); });
      });
    };

    const reset = () => {
      typing = false;
      timers.forEach(clearTimeout);
      timers = [];
      hive.classList.remove('is-on');
      workers.forEach((w) => w.classList.remove('is-spawning', 'is-ready'));
      if (mailScreen) mailScreen.classList.remove('is-press', 'is-sent');
      [codeEl, mailEl].forEach((el) => { if (el) el.textContent = ''; });
    };
    hiveLoop = {
      start: () => {
        reset();
        at(160, () => hive.classList.add('is-on'));
        // No two workers get the same start, and the order is not the order of
        // the cards: they are spawned at once and report back on their own time.
        const offsets = [0, 430, 250, 690];
        workers.forEach((w, i) => {
          const born = 600 + offsets[i % offsets.length] + Math.random() * 140;
          const ready = born + 720 + Math.random() * 320;
          at(born, () => w.classList.add('is-spawning'));
          at(ready, () => { w.classList.remove('is-spawning'); w.classList.add('is-ready'); });
        });
        at(1100, () => { typing = true; runCode(); runMail(); });
      },
      stop: reset,
    };
  }

  // The BIFROST stage: a prompt typed on the handheld, the run finishing on the
  // desktop with a spinner per step and a bar that fills as they land, the
  // report back on the handheld, then the view spinning to the desktop picking
  // the two files up from disk and mailing them.
  const bi = document.querySelector('.bi');
  if (bi) {
    const flip = bi.querySelector('.bi-flip');
    const faceA = bi.querySelector('.bi-face--a');
    const faceB = bi.querySelector('.bi-face--b');
    const a = (k) => faceA.querySelector(`[data-a="${k}"]`);
    const b = (k) => faceB.querySelector(`[data-b="${k}"]`);
    const promptEl = faceA.querySelector('[data-type="prompt"]');
    const cmdEl = faceB.querySelector('[data-type="command"]');
    const steps = [...faceA.querySelectorAll('.bi-step')];
    const bar = faceA.querySelector('[data-a="bar"] i');
    const picks = [...faceB.querySelectorAll('[data-b="pick"]')];
    const phoneAtts = [...faceB.querySelectorAll('[data-b="phoneAtt"]')];
    const inboxAtts = [...faceB.querySelectorAll('[data-b="inboxAtt"]')];
    const fwdAtts = [...faceB.querySelectorAll('[data-b="fwdAtt"]')];
    [promptEl, cmdEl].forEach((el) => { if (el) { el.dataset.full = el.textContent; el.textContent = ''; } });

    let timers = [];
    let live = false;
    let mode = 'a';
    let typing = 0;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    // Text is written against the clock, so a slow frame never leaves a line
    // half typed. Each run takes a token, and a reset retires every earlier one,
    // so a late tick cannot rewrite a composer that has been cleared.
    const type = (el, ms) => {
      if (!el) return;
      const token = ++typing;
      const full = el.dataset.full || '';
      const started = performance.now();
      const tick = () => {
        if (!live || token !== typing) return;
        const p = Math.min(1, (performance.now() - started) / ms);
        el.textContent = full.slice(0, Math.round(full.length * p));
        if (p < 1) timers.push(setTimeout(tick, 28));
      };
      tick();
    };

    const clearAll = () => {
      live = false;
      typing++;
      timers.forEach(clearTimeout);
      timers = [];
      bi.classList.remove('is-press');
      bi.querySelectorAll('.is-on, .is-run, .is-pick').forEach((n) => n.classList.remove('is-on', 'is-run', 'is-pick'));
      if (bar) bar.style.width = '0%';
      [promptEl, cmdEl].forEach((el) => { if (el) el.textContent = ''; });
    };

    // Each beat states what is on screen, and everything else in that face is
    // cleared. Nothing can linger from an earlier beat or an earlier scenario.
    const focus = (face, keep) => {
      face.querySelectorAll('.bi-msg, .bi-pane, .bi-idle, .bi-run, .bi-cmd, .bi-inbox, .bi-mail, .bi-done')
        .forEach((n) => n.classList.remove('is-on'));
      keep.forEach((n) => { if (n) n.classList.add('is-on'); });
    };

    // Scenario A: the handheld asks, the desktop runs it, the report comes back.
    const runA = () => {
      clearAll();
      live = true;
      mode = 'a';
      flip.classList.remove('is-back');
      const runPanel = a('run');
      const idle = a('idle');
      focus(faceA, [idle]);
      at(400, () => type(promptEl, 3200));
      at(4000, () => {
        const bubble = a('prompt');
        if (bubble) bubble.textContent = promptEl.dataset.full;
        promptEl.textContent = '';
        // The run only appears once the request has actually arrived.
        focus(faceA, [runPanel, bubble]);
      });
      at(4900, () => focus(faceA, [runPanel, a('prompt'), a('work')]));
      steps.forEach((s, i) => {
        const start = 5400 + i * 1200;
        at(start, () => s.classList.add('is-run'));
        at(start + 800, () => {
          s.classList.remove('is-run');
          s.classList.add('is-on');
          if (bar) bar.style.width = Math.round(((i + 1) / steps.length) * 100) + '%';
        });
      });
      // The result replaces the working pill: one or the other, never both.
      at(11600, () => focus(faceA, [runPanel, a('prompt'), a('card')]));
      at(14500, runB);
    };

    // Scenario B: the desktop asks the handheld for the files, the handheld
    // sends them, and the desktop forwards that mail to the user.
    const runB = () => {
      clearAll();
      live = true;
      mode = 'b';
      flip.classList.add('is-back');
      const cmd = b('cmd');
      focus(faceB, [cmd]);
      at(400, () => type(cmdEl, 3400));
      at(4400, () => focus(faceB, [cmd, b('apps')]));
      at(6000, () => focus(faceB, [cmd, b('files')]));
      picks.forEach((r, i) => at(6600 + i * 600, () => r.classList.add('is-pick')));
      at(8200, () => focus(faceB, [cmd, b('mail')]));
      phoneAtts.forEach((x, i) => at(8800 + i * 600, () => x.classList.add('is-on')));
      at(10600, () => bi.classList.add('is-press'));
      at(11200, () => {
        bi.classList.remove('is-press');
        focus(faceB, [b('sent')]);
      });
      // Only now does the desktop have a mail to open.
      at(12400, () => {
        focus(faceB, [b('sent'), b('inbox')]);
        inboxAtts.forEach((x) => x.classList.add('is-on'));
      });
      at(15000, () => focus(faceB, [b('sent'), b('forward')]));
      fwdAtts.forEach((x, i) => at(15600 + i * 700, () => x.classList.add('is-on')));
      at(19000, () => bi.classList.add('is-press'));
      // Send goes straight to the confirmation: no "Sent to" line in the window.
      at(19600, () => {
        bi.classList.remove('is-press');
        focus(faceB, [b('sent'), b('done')]);
      });
      at(23200, runA);
    };

    bifrostLoop = {
      start: runA,
      stop: () => { clearAll(); flip.classList.remove('is-back'); mode = 'a'; },
    };

    // The pill spins the board to the other scenario; whichever scenario is
    // playing carries on to the next one by itself.
    const ctl = bi.querySelector('[data-ctl]');
    if (ctl) {
      const spin = () => { if (mode === 'a') runB(); else runA(); };
      ctl.addEventListener('click', (e) => { e.stopPropagation(); spin(); });
      ctl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); spin(); }
      });
    }
  }

  // The ledger stage: entries land on the rail one after the other, each with
  // its own timestamp and its own outcome. One of them failed, because the
  // record is of the run and not of the pitch.
  const ledger = document.querySelector('.lg');
  if (ledger) {
    const rows = [...ledger.querySelectorAll('.lg-row')];
    let timers = [];
    let on = false;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const clear = () => { timers.forEach(clearTimeout); timers = []; };

    const cycle = () => {
      if (!on) return;
      clear();
      rows.forEach((r) => r.classList.remove('is-in'));
      const gap = 820;
      rows.forEach((r, i) => at(240 + i * gap, () => r.classList.add('is-in')));
      at(240 + rows.length * gap + 2600, cycle);
    };

    ledgerLoop = {
      start: () => { on = true; cycle(); },
      stop: () => { on = false; clear(); rows.forEach((r) => r.classList.remove('is-in')); },
    };
  }

  // The wall keeps its own time. It runs only while the tile is open, so a
  // closed shelf costs nothing.
  const wall = document.querySelector('.mw');
  if (wall) {
    const runs = [...wall.querySelectorAll('.mw-run')];
    wallLoop = {
      start: () => runs.forEach((r) => { r.style.animationPlayState = 'running'; }),
      stop: () => runs.forEach((r) => { r.style.animationPlayState = 'paused'; }),
    };
    wallLoop.stop();
  }
  // Footer entries point at the thing itself: walk to the platform shelf and
  // open the tile the link names. Scrolling happens first, because opening the
  // tile grows it and would otherwise pull the section out from under you.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-open-tile]');
    if (!link) return;
    e.preventDefault();
    const i = Number(link.dataset.openTile);
    const tile = document.querySelectorAll('.plat')[i];
    const target = link.getAttribute('href') || '#specs';
    if (!tile || !Number.isFinite(i)) { location.hash = target; return; }
    tile.scrollIntoView({ behavior: 'smooth', block: 'center' });
    history.replaceState(null, '', target);
    setTimeout(() => {
      if (innerWidth > 680 && !tile.classList.contains('is-open')) tile.click();
      // The panel is taller than the tile was; bring it back into frame once it
      // has grown, or the open card lands below the fold.
      setTimeout(() => tile.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    }, 460);
  });
})();
