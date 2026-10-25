/* --------------------------------------------------------------------------
   sentinel-solution · data
   template: launch-pitch · archetype: panel-hero · style: cold-tech

   Every string below is drawn from the Sentinel solution description.
   No customer quotes, no prices, no measured results.
   -------------------------------------------------------------------------- */
window.DOC = {
  meta: {
    title: 'Sentinel: one engine for autonomous work',
    mark: 'Sentinel',
    kicker: 'Hackathon submission · SDSI · Category: Others',
    nav: [
      { label: 'Why', href: '#why' },
      { label: 'What', href: '#specs' },
      { label: 'How', href: '#service' },
      { label: 'Where', href: '#categories' },
      { label: 'Get the deck', href: 'sentinel-solution.pptx', download: true, cta: true },
    ],
  },

  hero: {
    title: 'One Engine,\nOne Solution\nInfinite Possibilities',
    actions: [
      { label: 'See how it runs', href: '#service' },
      { label: 'Download the deck (PPTX)', href: 'sentinel-solution.pptx', download: true, ghost: true },
    ],
  },

  stats: [
    { value: '1', label: 'engine' },
    { value: '6', label: 'systems' },
    { value: '6', label: 'categories and counting' },
    { value: '0', label: 'lines of code to define a workflow' },
  ],

  story: {
    kicker: 'Why one engine',
    title: 'A platform per use case is a platform you rebuild every time.',
    note: 'Same work, two shapes. One costs you a system per objective; the other costs you a description.',
    left: {
      label: 'A platform per use case',
      line: 'Separate agents, integrations, pipelines and systems to maintain, wired to each other and to the people in between. Every new objective is another set of wires to keep alive.',
    },
    right: {
      label: 'One engine',
      line: 'One runtime, pointed at any objective. Security, vendor mail, documents, devices: the results differ, the machinery does not.',
    },
  },

  service: {
    kicker: 'The execution loop',
    title: 'Four moves from a sentence to a finished artefact.',
    aside: 'The same loop carries a short task and a long-running job, on a desktop and on a handheld.',
    steps: [
      { n: '01', title: 'Describe', text: 'State the goal in plain English. No code, no configuration language, no diagrams to maintain.' },
      { n: '02', title: 'Compile', text: 'Workflow Compilation expands it into steps, dependencies, nested steps, parallel branches, loops and execution rules.' },
      { n: '03', title: 'Orchestrate', text: 'Hive puts a lead agent in charge and delegates across agents. Work runs in parallel while desktop control stays centrally authorised.' },
      { n: '04', title: 'Execute and deliver', text: 'AXIS works inside the applications the task lives in and verifies each result. Deliverable Generation returns the artefact; the ledger records the steps.' },
    ],
  },

  specs: {
    eyebrow: 'The platform',
    title: 'Six parts, one engine.',
    note: 'Each capability is a part of the same runtime, not a separate product. Nothing here is a performance claim.',
    tiles: [
      { k: 'compile', title: 'Workflows', note: 'A plain-English goal becomes steps, dependencies, branches and rules.',
        stage: {
          prompt: 'An email from "IT support" asks you to sign in and confirm your password today. Check who really sent it, where each link resolves, and what the message wants.',
          nodes: ['Read the message', 'Resolve every link', 'Draft the verdict'],
        } },
      { k: 'axis', title: 'AXIS', expand: 'Autonomous eXecution IntelligenCe System', note: 'Reads the interface as text and acts by role and name, not by pixel.',
        stage: { kind: 'axis', typed: 'invoice 4471', found: 'Matched, 1 record' } },
      { k: 'hive', title: 'Hive', note: 'A lead agent plans, delegates to workers, and keeps desktop control central.',
        stage: { kind: 'hive', agents: [
          { role: 'Researcher', task: 'finds sources', icon: 'search' },
          { role: 'Site builder', task: 'writes pages', icon: 'layout' },
          { role: 'Reporter', task: 'drafts summary', icon: 'doc' },
          { role: 'Messenger', task: 'notifies user', icon: 'mail' },
        ] } },
      { k: 'bifrost', title: 'BIFROST', expand: 'Bidirectional Inter-device Framework for Remote Operations, Supervision and Tasking', note: 'Desktop and handheld, linked and controlled in both directions.',
        stage: { kind: 'bifrost',
          prompt: 'Run the phishing triage workflow and mail the report to me.',
          command: 'Send the PDF and the XLS from the triage folder to the user.',
          to: 'you@sentinel.example',
          subject: 'Morning report · attachments',
          forward: 'Fwd: phishing triage · attachments',
          report: { head: 'Phishing triage', line: '4 findings, 1 critical' },
          files: ['phishing-triage.pdf', 'phishing-triage.xlsx'],
          extras: ['morning-report.docx', 'ledger-export.csv'] } },
      { k: 'ledger', title: 'Execution Ledger', note: 'Every action, outcome, timestamp and step status, on the record.',
        stage: { kind: 'ledger', rows: [
          { t: '09:14:02', text: 'Opened the message, read the sender and the reply-to', ok: true },
          { t: '09:14:07', text: 'Resolved 3 links, all to an unlisted domain', ok: true },
          { t: '09:14:12', text: 'Sign-in page did not load, retried once', ok: false },
          { t: '09:14:19', text: 'Retry landed, verdict drafted', ok: true },
          { t: '09:14:26', text: 'PDF and XLS written, mailed to you@sentinel.example', ok: true },
        ] } },
      { k: 'artifacts', title: 'Deliverables', note: 'Documents, decks and workbooks: an artefact, not a chat reply.',
        stage: { kind: 'wall' } },
    ],
  },

  categories: {
    kicker: 'Where it runs',
    title: 'The same engine, pointed at a different objective.',
    note: 'Six places it is applied today. The seventh is whatever you already do by hand. The objective, inputs and rules change; compilation, orchestration, execution and the ledger do not.',
    items: [
      { name: 'Security', icon: 'shield' },
      { name: 'Vendor operations', icon: 'truck' },
      { name: 'Productivity', icon: 'bolt' },
      { name: 'Workflow automation', icon: 'flow' },
      { name: 'Document processing', icon: 'doc' },
      { name: 'Cross-device automation', icon: 'devices' },
      {
        name: '& more',
        items: [
          { icon: 'calendar', label: 'Meetings' },
          { icon: 'chart', label: 'Reports' },
          { icon: 'chat', label: 'Support' },
          { icon: 'box', label: 'Orders' },
          { icon: 'mail', label: 'Inbox' },
          { icon: 'users', label: 'People' },
          { icon: 'search', label: 'Research' },
          { icon: 'check', label: 'QA' },
        ],
        open: true,
      },
    ],
  },

  faq: {
    eyebrow: 'Questions',
    title: 'Questions about how it works.',
    items: [
      { q: 'Do we have to write code?', a: 'No. A workflow begins as a plain-English goal. Workflow Compilation turns it into steps, dependencies, nested steps, parallel branches, loops and execution rules, and the platform runs it.' },
      { q: 'What is left behind after a run?', a: 'A finished artefact (a document, presentation or spreadsheet, not a chat reply) and the execution ledger: actions, outcomes, timestamps and step statuses. A blocked step or a verification issue is surfaced rather than assumed to have worked.' },
      { q: 'Where does it run?', a: 'On the desktop applications the work already uses, driven through accessibility information from the native interfaces. BIFROST extends the same work to handheld devices in both directions.' },
      { q: 'How is a new workflow added?', a: 'As a new use of the same engine. The procedure is described in plain English and compiled into steps, dependencies and rules; compilation, orchestration, execution and the ledger are already there. Nothing new is bought, installed or maintained per workflow.' },
    ],
  },

  reserve: {
    title: 'One engine. Read the full case.',
    label: 'Download the deck (PPTX)',
    href: 'sentinel-solution.pptx',
    download: true,
  },

  footer: {
    title: 'Sentinel',
    logo: 'assets/mark.png',
    note: 'A desktop workbench for autonomous work. Execution, orchestration and the record of both.',
    columns: [
      { title: 'Platform', items: [
        { label: 'Workflow Compilation', href: '#specs', tile: 0 },
        { label: 'AXIS', href: '#specs', tile: 1 },
        { label: 'Hive', href: '#specs', tile: 2 },
        { label: 'BIFROST', href: '#specs', tile: 3 },
      ] },
      { title: 'Deliverables', items: [
        { label: 'Deliverable Generation', href: '#specs', tile: 5 },
        { label: 'Execution Ledger', href: '#specs', tile: 4 },
        { label: 'Any business category', href: '#categories' },
      ] },
    ],
    base: ['© 2026 Sentinel', 'One engine, one platform, infinite possibilities'],
  },
};
