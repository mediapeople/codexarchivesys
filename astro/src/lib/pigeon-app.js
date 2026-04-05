const TYPE_GROUPS = [
  {
    label: 'Transmission',
    items: [
      {
        type: 'signal',
        label: 'Signal',
        layer: 'Immediate',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7C2.5 3.5 4 3.5 5 7C6 10.5 7.5 10.5 8.5 7C9.5 3.5 11 3.5 13 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
      },
      {
        type: 'fragment',
        label: 'Fragment',
        layer: 'Seed',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="4" cy="4" r="1.2" fill="currentColor"/><circle cx="10" cy="4" r="1.2" fill="currentColor"/><circle cx="7" cy="7.5" r="1.2" fill="currentColor"/><circle cx="3.5" cy="11" r="1" fill="currentColor"/><circle cx="10.5" cy="11" r="1" fill="currentColor"/></svg>',
      },
    ],
  },
  {
    label: 'Documentation',
    items: [
      {
        type: 'fieldlog',
        label: 'Field Log',
        layer: 'Record',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="2" y="1.5" width="10" height="11" rx="0.5" stroke="currentColor" stroke-width="1.1"/><line x1="4.5" y1="5" x2="9.5" y2="5" stroke="currentColor" stroke-width="1"/><line x1="4.5" y1="7.5" x2="9.5" y2="7.5" stroke="currentColor" stroke-width="1"/><line x1="4.5" y1="10" x2="7.5" y2="10" stroke="currentColor" stroke-width="1"/></svg>',
      },
      {
        type: 'artifact',
        label: 'Artifact',
        layer: 'Evidence',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="11" height="11" rx="0.5" stroke="currentColor" stroke-width="1.1"/><rect x="3.5" y="3.5" width="4" height="3.5" rx="0.3" stroke="currentColor" stroke-width="0.9"/><line x1="3.5" y1="9" x2="10.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="3.5" y1="11" x2="8" y2="11" stroke="currentColor" stroke-width="1"/></svg>',
      },
    ],
  },
  {
    label: 'Structure',
    items: [
      {
        type: 'scroll',
        label: 'Scroll',
        layer: 'Longform',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><line x1="2" y1="3.5" x2="12" y2="3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="2" y1="10.5" x2="9" y2="10.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
      },
      {
        type: 'codex',
        label: 'Codex',
        layer: 'Standard',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 3L7 12" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M7 3C5.5 2.5 3 2.5 1.5 3.5V12C3 11 5.5 11 7 11.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><path d="M7 3C8.5 2.5 11 2.5 12.5 3.5V12C11 11 8.5 11 7 11.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>',
      },
    ],
  },
  {
    label: 'Navigation',
    items: [
      {
        type: 'loremap',
        label: 'Loremap',
        layer: 'Terrain',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><line x1="7" y1="1.5" x2="7" y2="12.5" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><line x1="1.5" y1="7" x2="12.5" y2="7" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" stroke-width="1" stroke-linecap="round"/><line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>',
      },
      {
        type: 'nexus',
        label: 'Nexus',
        layer: 'Sequence',
        icon:
          '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1"/><circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>',
      },
    ],
  },
];

const TYPE_META = Object.fromEntries(
  TYPE_GROUPS.flatMap((group) => group.items.map((item) => [item.type, item]))
);

const SCRIPT_TYPE_META = JSON.stringify(TYPE_META).replace(/</g, '\\u003c');
const AXIS_LABELS = {
  scale: {
    micro: 'Micro',
    meso: 'Meso',
    macro: 'Macro',
  },
  depth: {
    surface: 'Surface',
    structural: 'Structural',
    recursive: 'Recursive',
  },
  focus: {
    moment: 'Moment',
    character: 'Character',
    system: 'System',
    witness: 'Witness',
  },
  function: {
    diagnostic: 'Diagnostic',
    therapeutic: 'Therapeutic',
    revelatory: 'Revelatory',
    comparative: 'Comparative',
  },
};
const SCRIPT_AXIS_LABELS = JSON.stringify(AXIS_LABELS).replace(/</g, '\\u003c');

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTypeGroups() {
  return TYPE_GROUPS.map((group) => {
    const buttons = group.items
      .map(
        (item) => `
              <button class="type-btn" data-type="${escapeHtml(item.type)}" type="button">
                <span class="type-btn-inner">
                  <span class="type-icon">${item.icon}</span>
                  ${escapeHtml(item.label)}
                </span>
                <span class="type-layer">${escapeHtml(item.layer)}</span>
              </button>`
      )
      .join('');

    return `
          <div class="type-group">
            <span class="type-group-label">${escapeHtml(group.label)}</span>
            <div class="type-row">${buttons}
            </div>
          </div>`;
  }).join('');
}

function renderAxisOptions(kind) {
  const labels = AXIS_LABELS[kind] || {};
  const options = Object.entries(labels)
    .map(
      ([value, label]) =>
        `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`
    )
    .join('');

  return `<option value="">Auto</option>${options}`;
}

export const PIGEON_APP_STYLES = String.raw`
:root {
  color-scheme: dark;
  --ink: #0e0d0b;
  --paper: #111009;
  --field: #161410;
  --field-raise: #1c1916;
  --rule: #2a2620;
  --rule-bright: #3d3830;
  --copper: #b87333;
  --copper-dim: #7a4d22;
  --copper-glow: rgba(184, 115, 51, 0.1);
  --copper-glow2: rgba(184, 115, 51, 0.2);
  --amber: #e8a84a;
  --muted: #8a8075;
  --body: #bdb3a6;
  --light: #ddd3c4;
  --white: #f0ebe2;
  --danger: #8b3a2a;
  --success-text: #6db88a;
  --transmit-h: 64px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  margin: 0;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--paper);
  color: var(--body);
  font-family: 'Courier Prime', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.5;
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 999;
  opacity: 0.55;
}

a {
  color: inherit;
}

button,
input,
textarea {
  font: inherit;
}

.masthead {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: calc(56px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 24px 0;
  border-bottom: 1px solid var(--rule);
  background: rgba(17, 16, 9, 0.94);
  backdrop-filter: blur(12px);
}

.masthead-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.pigeon-mark {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

@keyframes flap {
  0% {
    transform: rotate(0deg) scaleY(1);
  }
  20% {
    transform: rotate(-8deg) scaleY(0.85);
  }
  40% {
    transform: rotate(6deg) scaleY(1.1);
  }
  60% {
    transform: rotate(-5deg) scaleY(0.9);
  }
  80% {
    transform: rotate(3deg) scaleY(1.05);
  }
  100% {
    transform: rotate(0deg) scaleY(1);
  }
}

.pigeon-mark.flap {
  animation: flap 0.6s ease-in-out;
  transform-origin: center center;
}

.masthead-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: var(--light);
  line-height: 1.1;
  text-transform: uppercase;
}

.masthead-sep {
  color: var(--rule-bright);
}

.masthead-sub {
  font-size: 13px;
  color: var(--body);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masthead-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: lowercase;
  flex-shrink: 0;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--muted);
  transition: background 0.35s, box-shadow 0.35s;
}

.status-dot.live {
  background: var(--success-text);
  box-shadow: 0 0 7px rgba(109, 184, 138, 0.55);
  animation: pulse-dot 2.5s ease-in-out infinite;
}

.status-dot.transmitting {
  background: var(--copper);
  box-shadow: 0 0 10px rgba(184, 115, 51, 0.6);
  animation: pulse-dot 0.7s ease-in-out infinite;
}

.status-dot.error {
  background: #d26a55;
  box-shadow: 0 0 8px rgba(210, 106, 85, 0.45);
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.layout {
  width: min(100%, 680px);
  margin: 0 auto;
  padding: 0 24px 48px;
}

.section {
  margin-top: 48px;
  opacity: 0;
  transform: translateY(6px);
  animation: reveal 0.35s ease forwards;
}

.section:nth-child(1) {
  animation-delay: 0.04s;
}

.section:nth-child(2) {
  animation-delay: 0.1s;
}

.section:nth-child(3) {
  animation-delay: 0.16s;
}

.section:nth-child(4) {
  animation-delay: 0.22s;
}

.section:nth-child(5) {
  animation-delay: 0.28s;
}

@keyframes reveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-coord {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 18px;
  user-select: none;
}

.coord-num {
  flex-shrink: 0;
  color: var(--copper);
  font-size: 14px;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.coord-label {
  color: var(--muted);
  font-size: 14px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.section-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.type-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}

.type-toggle-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.type-selected-badge {
  display: none;
  align-items: center;
  gap: 8px;
  color: var(--amber);
  font-size: 15px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.type-selected-badge.visible {
  display: flex;
}

.type-selected-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.type-selected-icon svg,
.type-chevron svg {
  width: 100%;
  height: 100%;
}

.type-chevron {
  width: 18px;
  height: 18px;
  color: var(--muted);
  transition: transform 0.28s ease, color 0.15s;
  flex-shrink: 0;
}

.type-toggle.open .type-chevron {
  transform: rotate(180deg);
  color: var(--copper);
}

.type-collapsible {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease, margin-top 0.3s ease;
}

.type-collapsible.open {
  grid-template-rows: 1fr;
  margin-top: 16px;
}

.type-collapsible-inner {
  overflow: hidden;
}

.type-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.type-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.type-group-label {
  padding: 0 2px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.type-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid transparent;
  background: var(--field);
  color: var(--body);
  cursor: pointer;
  overflow: hidden;
  position: relative;
  text-align: left;
  font-size: 15px;
  letter-spacing: 0.12em;
  line-height: 1.2;
  text-transform: uppercase;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.type-btn:hover {
  background: var(--field-raise);
  color: var(--light);
}

.type-btn.active {
  background: var(--field-raise);
  border-color: var(--copper);
  color: var(--amber);
}

.type-btn-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-icon {
  width: 19px;
  height: 19px;
  flex-shrink: 0;
  opacity: 0.55;
  transition: opacity 0.15s;
}

.type-icon svg {
  width: 100%;
  height: 100%;
}

.type-btn:hover .type-icon {
  opacity: 0.8;
}

.type-btn.active .type-icon {
  opacity: 1;
}

.type-layer {
  padding-left: 29px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.1em;
  line-height: 1;
  text-transform: uppercase;
}

.type-btn.active .type-layer {
  color: var(--copper-dim);
}

.editor-surface,
.file-zone,
.dispatch-panel,
.btn-ghost,
.key-field {
  background: var(--field);
}

.editor-surface:focus-within,
.key-field:focus {
  box-shadow: inset 0 0 0 1px var(--copper-dim);
}

.editor-surface {
  transition: box-shadow 0.2s;
}

.editor-bar,
.dispatch-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--rule);
}

.editor-bar-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-action,
.btn-ghost {
  border: 0;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.editor-action {
  padding: 4px 8px;
  background: none;
  font-size: 14px;
}

.editor-action.smart {
  color: var(--amber);
}

.editor-action:hover,
.btn-ghost:hover {
  color: var(--light);
}

.btn-ghost {
  padding: 14px 16px;
  font-size: 14px;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.btn-ghost.danger:hover {
  color: #e06050;
}

.char-count,
.dispatch-clock {
  color: var(--muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.note-field {
  width: 100%;
  min-height: 360px;
  padding: 24px 20px;
  border: 0;
  outline: none;
  resize: vertical;
  background: transparent;
  color: var(--white);
  caret-color: var(--copper);
  font-size: 15px;
  line-height: 1.5;
}

.note-field::placeholder,
.key-field::placeholder {
  color: var(--muted);
}

.template-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.4;
}

.axis-panel {
  margin-top: 12px;
  padding: 14px 16px 16px;
  border-top: 1px solid var(--rule);
  background: rgba(184, 115, 51, 0.03);
}

.axis-panel-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.axis-title {
  color: var(--light);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.axis-copy {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.45;
}

.axis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 8px;
  margin-top: 14px;
}

.axis-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.axis-label {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.axis-select {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--rule);
  border-radius: 0;
  outline: none;
  background: var(--paper);
  color: var(--white);
  transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
}

.axis-select:focus {
  border-color: var(--copper-dim);
  box-shadow: 0 0 0 1px var(--copper-dim);
}

.axis-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.file-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.file-zone {
  position: relative;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.file-zone:hover {
  background: var(--field-raise);
}

.file-zone.has-file {
  background: var(--field-raise);
  box-shadow: inset 0 0 0 1px var(--copper-dim);
}

.file-zone input[type='file'] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-icon {
  display: block;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 24px;
  opacity: 0.4;
}

.file-label {
  display: block;
  color: var(--muted);
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.file-name {
  display: block;
  margin-top: 5px;
  color: var(--amber);
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.key-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.key-input-wrap {
  flex: 1;
  position: relative;
}

.key-field {
  width: 100%;
  border: 0;
  outline: none;
  color: var(--white);
  font-size: 15px;
  letter-spacing: 0.08em;
  padding: 14px 16px;
  transition: box-shadow 0.2s;
}

.key-saved-tag {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: var(--success-text);
  font-size: 12px;
  letter-spacing: 0.1em;
  opacity: 0;
  text-transform: uppercase;
  transition: opacity 0.2s;
}

.key-saved-tag.visible {
  opacity: 1;
}

.dispatch-header-label {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.telemetry {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
}

.telem-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
  align-items: baseline;
  font-size: 14px;
}

.telem-key {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}

.telem-val {
  color: var(--muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.telem-val.live {
  color: var(--light);
}

.telem-val.signal {
  color: var(--amber);
}

.log-area {
  min-height: 44px;
  padding: 12px 18px;
  border-top: 1px solid var(--rule);
  color: var(--muted);
  font-size: 13px;
  line-height: 1.4;
}

.log-line {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  line-height: 1.4;
}

.log-time {
  color: var(--muted);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.log-msg {
  color: var(--body);
  min-width: 0;
  word-break: break-word;
}

.log-msg.ok {
  color: var(--success-text);
}

.log-msg.err {
  color: #e06050;
}

.log-msg.info {
  color: var(--amber);
}

.log-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
}

.transmit-shell {
  background: var(--field);
  transition: box-shadow 0.3s, background 0.3s;
}

.transmit-shell.ready {
  box-shadow: inset 0 1px 0 var(--copper-dim), 0 8px 24px rgba(184, 115, 51, 0.08);
}

.transmit-shell.delivered {
  box-shadow: inset 0 1px 0 var(--success-text), 0 8px 24px rgba(109, 184, 138, 0.1);
}

.btn-transmit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  height: var(--transmit-h);
  padding: 0 24px;
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  overflow: hidden;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(20px, 5vw, 22px);
  font-weight: 400;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  transition: color 0.25s, background 0.25s;
}

.btn-transmit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--copper-glow);
  opacity: 0;
  transition: opacity 0.25s;
}

.btn-transmit.armed {
  color: var(--amber);
}

.btn-transmit.armed::before {
  opacity: 1;
}

.btn-transmit.armed:hover {
  color: var(--white);
  background: rgba(184, 115, 51, 0.12);
}

.btn-transmit.armed:active {
  transform: scale(0.995);
}

.btn-transmit:disabled {
  cursor: not-allowed;
}

.btn-transmit-icon,
.transmit-text {
  position: relative;
  z-index: 1;
}

.btn-transmit-icon {
  width: 18px;
  height: 18px;
  opacity: 0;
  transition: opacity 0.25s;
  flex-shrink: 0;
}

.btn-transmit.armed .btn-transmit-icon {
  opacity: 0.7;
}

@keyframes transmitting-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.btn-transmit.sending {
  animation: transmitting-pulse 0.8s ease-in-out infinite;
}

.workflow {
  margin-top: 52px;
  padding-top: 28px;
  border-top: 1px solid var(--rule);
}

.workflow-title {
  margin-bottom: 16px;
  color: var(--muted);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  font-style: italic;
  font-weight: 300;
  letter-spacing: 0.08em;
}

.workflow-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.workflow-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.4;
}

.step-n {
  width: 20px;
  flex-shrink: 0;
  color: var(--copper-dim);
  font-variant-numeric: tabular-nums;
}

.workflow-actions {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workflow-publish {
  margin-top: 18px;
  padding: 18px 18px 20px;
  border: 1px solid var(--rule);
  background: rgba(184, 115, 51, 0.04);
}

.workflow-publish[hidden] {
  display: none;
}

.workflow-publish-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.workflow-publish-title {
  color: var(--light);
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.workflow-publish-note {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
}

.workflow-publish-links {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workflow-publish-links .btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.archive-link {
  display: block;
  margin-top: 32px;
  padding: 16px;
  color: var(--muted);
  text-align: center;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition: color 0.15s;
}

.archive-link:hover {
  color: var(--body);
}

::-webkit-scrollbar {
  width: 3px;
}

::-webkit-scrollbar-track {
  background: var(--paper);
}

::-webkit-scrollbar-thumb {
  background: var(--rule);
}

@media (max-width: 720px) {
  .masthead-sub,
  .masthead-sep {
    display: none;
  }
}

@media (max-width: 420px) {
  .layout {
    padding-right: 18px;
    padding-left: 18px;
  }

  .masthead {
    padding-right: 18px;
    padding-left: 18px;
  }

  .type-row,
  .file-row {
    grid-template-columns: 1fr;
  }

  .key-row {
    flex-direction: column;
  }

  .workflow-step {
    gap: 12px;
  }

  .axis-grid {
    grid-template-columns: 1fr;
  }
}
`;

export function renderPigeonAppMarkup(options = {}) {
  const {
    eyebrow = 'Remote archive ingest',
    deck = 'Publish a markdown note from your phone, authenticate with your Carrier Pigeon key, and commit it straight into the ndcodex repository from anywhere.',
    notePlaceholder = `Paste anything here.\n\nWith images attached, a short note becomes a caption by default, and you can use lines like:\ntitle: Designers in 2026\ncaption: looking at the machine like it owes them rent`,
    templateNote = 'Short image notes publish as captions. Smart Draft is still there when you want full frontmatter or body prose.',
    attachNote = 'If the note body contains ![[image.jpg]] or markdown image links, Carrier Pigeon will rewrite matching file names to the uploaded public image paths.',
    keyNote = 'Stored only in this browser on this device so you do not have to re-enter it every time.',
    workflowTitle = 'Phone workflow',
    workflowSteps = [],
    copyButtonLabel = 'Copy App URL',
    archiveHref = 'https://ndcodex.com/',
    archiveLabel = '<- ND Codex Archive',
  } = options;

  const renderedWorkflowSteps = workflowSteps
    .map(
      (step, index) => `
        <div class="workflow-step">
          <span class="step-n">${String(index + 1).padStart(2, '0')}</span>
          <span>${escapeHtml(step)}</span>
        </div>`
    )
    .join('');

  return `
<header class="masthead">
  <div class="masthead-left">
    <svg class="pigeon-mark" id="pigeonMark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 8C20 8 17 6 14 7C12 7.5 10.5 9 9 9C7 9 5.5 8 4 9C2.5 10 2 12 3 13.5C4 15 6 15.5 8 15C9.5 14.6 11 13.5 12 14C13.5 14.7 13 17 14 18C15 19 17 18.5 18 17C19.5 15 19.5 12 18 11" stroke="#b87333" stroke-width="1" stroke-linecap="round"/>
      <path d="M8 15L5 19" stroke="#7a4d22" stroke-width="1" stroke-linecap="round"/>
      <path d="M9 9L7 6" stroke="#7a4d22" stroke-width="0.8" stroke-linecap="round"/>
      <circle cx="18.5" cy="8.5" r="1" fill="#b87333"/>
    </svg>
    <span class="masthead-title">Carrier<br />Pigeon</span>
    <span class="masthead-sep">.</span>
    <span class="masthead-sub">ND Codex</span>
  </div>
  <div class="masthead-status">
    <span class="status-dot" id="statusDot"></span>
    <span id="statusText">idle</span>
  </div>
</header>

<div class="layout">
  <section class="section">
    <div class="section-coord">
      <span class="coord-num">00</span>
      <span class="coord-label">${escapeHtml(eyebrow)}</span>
    </div>
    <p class="section-note">${escapeHtml(deck)}</p>
  </section>

  <section class="section">
    <div class="section-coord">
      <span class="coord-num">01</span>
      <span class="coord-label">Type</span>
    </div>
    <button class="type-toggle" id="typeToggle" type="button" aria-expanded="false">
      <span class="type-toggle-left">
        <span class="type-selected-badge" id="typeSelectedBadge">
          <span class="type-selected-icon" id="typeSelectedIcon"></span>
          <span id="typeSelectedLabel">Signal</span>
        </span>
      </span>
      <span class="type-chevron" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none"><path d="M3 6L8 11L13 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
    </button>
    <div class="type-collapsible" id="typeCollapsible">
      <div class="type-collapsible-inner">
        <div class="type-grid" id="typeGrid">${renderTypeGroups()}
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-coord">
      <span class="coord-num">02</span>
      <span class="coord-label">Body</span>
    </div>
    <div class="editor-surface">
      <div class="editor-bar">
        <div class="editor-bar-left">
          <button class="editor-action smart" id="smartDraftButton" type="button">Smart Draft</button>
          <button class="editor-action" id="loadTemplateButton" type="button">Load Template</button>
          <button class="editor-action" id="clearNoteButton" type="button">Clear</button>
        </div>
        <span class="char-count" id="charCount">0</span>
      </div>
      <textarea class="note-field" id="noteField" spellcheck="false" placeholder="${escapeHtml(notePlaceholder)}"></textarea>
      <div class="axis-panel">
        <div class="axis-panel-head">
          <span class="axis-title">Axis Review</span>
          <span class="axis-copy">Auto-filled from the note. Choose a value to pin an override before publish.</span>
        </div>
        <div class="axis-grid">
          <label class="axis-field">
            <span class="axis-label">Scale</span>
            <select class="axis-select" id="axisScaleSelect">${renderAxisOptions('scale')}</select>
          </label>
          <label class="axis-field">
            <span class="axis-label">Depth</span>
            <select class="axis-select" id="axisDepthSelect">${renderAxisOptions('depth')}</select>
          </label>
          <label class="axis-field">
            <span class="axis-label">Focus</span>
            <select class="axis-select" id="axisFocusSelect">${renderAxisOptions('focus')}</select>
          </label>
          <label class="axis-field">
            <span class="axis-label">Function</span>
            <select class="axis-select" id="axisFunctionSelect">${renderAxisOptions('function')}</select>
          </label>
        </div>
      </div>
    </div>
    <p class="template-note">${escapeHtml(templateNote)}</p>
  </section>

  <section class="section">
    <div class="section-coord">
      <span class="coord-num">03</span>
      <span class="coord-label">Attach</span>
    </div>
    <div class="file-row">
      <label class="file-zone" id="mdZone">
        <input type="file" accept=".md,.markdown,text/markdown,text/plain" id="mdFile" />
        <span class="file-icon">#</span>
        <span class="file-label">Markdown</span>
        <span class="file-name" id="mdFileName">No file</span>
      </label>
      <label class="file-zone" id="imgZone">
        <input type="file" accept="image/*" multiple id="imgFiles" />
        <span class="file-icon">[]</span>
        <span class="file-label">Images</span>
        <span class="file-name" id="imgFileName">No files</span>
      </label>
    </div>
    <p class="section-note">${escapeHtml(attachNote)}</p>
  </section>

  <section class="section">
    <div class="section-coord">
      <span class="coord-num">04</span>
      <span class="coord-label">Key</span>
    </div>
    <div class="key-row">
      <div class="key-input-wrap">
        <input class="key-field" id="keyField" type="password" inputmode="text" autocomplete="off" placeholder="Publishing key..." />
        <span class="key-saved-tag" id="keySavedTag">saved</span>
      </div>
      <button class="btn-ghost danger" id="forgetKeyButton" type="button">Forget</button>
    </div>
    <p class="section-note">${escapeHtml(keyNote)}</p>
  </section>

  <section class="section">
    <div class="section-coord">
      <span class="coord-num">05</span>
      <span class="coord-label">Telemetry</span>
    </div>
    <div class="dispatch-panel">
      <div class="dispatch-header">
        <span class="dispatch-header-label">Dispatch Readout</span>
        <span class="dispatch-clock" id="dispatchClock">--:--</span>
      </div>
      <div class="telemetry">
        <div class="telem-row">
          <span class="telem-key">Type</span>
          <span class="telem-val" id="roType">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Scale</span>
          <span class="telem-val" id="roScale">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Depth</span>
          <span class="telem-val" id="roDepth">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Focus</span>
          <span class="telem-val" id="roFocus">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Function</span>
          <span class="telem-val" id="roFunction">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Slug</span>
          <span class="telem-val" id="roSlug">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Path</span>
          <span class="telem-val" id="roPath">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">State</span>
          <span class="telem-val" id="roState">-</span>
        </div>
      </div>
      <div class="log-area" id="logArea">
        <div class="log-line">
          <span class="log-time">--:--:--</span>
          <span class="log-msg">Waiting for input.</span>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-coord">
      <span class="coord-num">06</span>
      <span class="coord-label">Transmit</span>
    </div>
    <div class="transmit-shell" id="transmitBar">
      <button class="btn-transmit" id="transmitButton" type="button" disabled>
        <svg class="btn-transmit-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 8C20 8 17 6 14 7C12 7.5 10.5 9 9 9C7 9 5.5 8 4 9C2.5 10 2 12 3 13.5C4 15 6 15.5 8 15C9.5 14.6 11 13.5 12 14C13.5 14.7 13 17 14 18C15 19 17 18.5 18 17C19.5 15 19.5 12 18 11" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
        </svg>
        <span class="transmit-text" id="transmitLabel">Send Pigeon</span>
      </button>
    </div>
  </section>

  <section class="workflow">
    <div class="workflow-title">${escapeHtml(workflowTitle)}</div>
    <div class="workflow-steps">${renderedWorkflowSteps}
    </div>
    <div class="workflow-actions">
      <button class="btn-ghost" id="copyUrlButton" type="button">${escapeHtml(copyButtonLabel)}</button>
    </div>
    <div class="workflow-publish" id="publishActions" hidden>
      <div class="workflow-publish-head">
        <div class="workflow-publish-title">Published Surface</div>
        <div class="workflow-publish-note" id="publishActionsNote"></div>
      </div>
      <div class="workflow-publish-links">
        <a class="btn-ghost" id="openObjectLink" href="#" hidden>Open Object</a>
        <a class="btn-ghost" id="openHudLink" href="#" hidden>View HUD</a>
        <a class="btn-ghost" id="openCommitLink" href="#" hidden>Open Commit</a>
      </div>
    </div>
  </section>

  <a class="archive-link" href="${escapeHtml(archiveHref)}">${escapeHtml(archiveLabel)}</a>
</div>`;
}

export function serializePigeonAppConfig(config = {}) {
  return JSON.stringify(config).replace(/</g, '\\u003c');
}

export const PIGEON_APP_SCRIPT = String.raw`
(() => {
  const configNode = document.getElementById('pigeon-app-config');
  const config = configNode ? JSON.parse(configNode.textContent || '{}') : {};
  const endpoint = config.endpoint || '/api/pigeon';
  const authRequired = Boolean(config.authRequired);
  const keyStorageKey = config.keyStorageKey || '';
  const draftStorageKey = config.draftStorageKey || '';
  const copyUrlValue = config.copyUrlValue || '';
  const copySuccessMessage = config.copySuccessMessage || 'Carrier Pigeon app URL copied to the clipboard.';
  const copyFailureMessage = config.copyFailureMessage || 'Could not copy the Carrier Pigeon URL from this browser.';
  const imageReadyMessage = config.imageReadyMessage || 'Carrier Pigeon will upload and attach the selected images.';
  const successMessage = config.successMessage || 'Carrier Pigeon accepted the note.';
  const networkErrorMessage = config.networkErrorMessage || 'Could not reach Carrier Pigeon.';
  const noNoteMessage =
    config.noNoteMessage || 'Add a markdown note or attach at least one image first.';
  const noKeyMessage = config.noKeyMessage || 'Enter the Carrier Pigeon publishing key first.';
  const preparingMessage = config.preparingMessage || 'Preparing note and media for the archive.';
  const preparingImagesMessage = config.preparingImagesMessage || 'Compressing images for upload.';
  const restoredDraftMessage = config.restoredDraftMessage || 'Recovered the last draft stored on this device.';
  const keyClearedMessage = config.keyClearedMessage || 'The saved publishing key has been removed from this device.';
  const templateLoadedMessage = config.templateLoadedMessage || 'Edit the template, then publish.';
  const fileLoadedMessage = config.fileLoadedMessage || 'Review the note and publish when ready.';
  const editorClearedMessage = config.editorClearedMessage || 'Editor cleared.';
  const smartDraftReadyMessage =
    config.smartDraftReadyMessage || 'Smart Draft inferred frontmatter. Review it, then send again.';
  const smartDraftButtonMessage =
    config.smartDraftButtonMessage || 'Review the inferred frontmatter, then send when ready.';
  const publishedSurfaceScrollMessage =
    config.publishedSurfaceScrollMessage ||
    'Published scrolls automatically generate a HUD. Open the object to read, or HUD to inspect.';
  const publishedSurfaceDefaultMessage =
    config.publishedSurfaceDefaultMessage ||
    'Published to the archive. Open the object to confirm it landed.';
  const localContentRoot = config.contentRoot || 'astro/src/content';
  const typeMeta = ${SCRIPT_TYPE_META};
  const axisLabels = ${SCRIPT_AXIS_LABELS};

  const typeToggle = document.getElementById('typeToggle');
  const typeCollapsible = document.getElementById('typeCollapsible');
  const typeGrid = document.getElementById('typeGrid');
  const typeSelectedBadge = document.getElementById('typeSelectedBadge');
  const typeSelectedIcon = document.getElementById('typeSelectedIcon');
  const typeSelectedLabel = document.getElementById('typeSelectedLabel');
  const noteField = document.getElementById('noteField');
  const axisScaleSelect = document.getElementById('axisScaleSelect');
  const axisDepthSelect = document.getElementById('axisDepthSelect');
  const axisFocusSelect = document.getElementById('axisFocusSelect');
  const axisFunctionSelect = document.getElementById('axisFunctionSelect');
  const charCount = document.getElementById('charCount');
  const mdFileInput = document.getElementById('mdFile');
  const mdFileName = document.getElementById('mdFileName');
  const mdZone = document.getElementById('mdZone');
  const imgFileInput = document.getElementById('imgFiles');
  const imgFileName = document.getElementById('imgFileName');
  const imgZone = document.getElementById('imgZone');
  const keyField = document.getElementById('keyField');
  const keySavedTag = document.getElementById('keySavedTag');
  const forgetKeyButton = document.getElementById('forgetKeyButton');
  const smartDraftButton = document.getElementById('smartDraftButton');
  const loadTemplateButton = document.getElementById('loadTemplateButton');
  const clearNoteButton = document.getElementById('clearNoteButton');
  const copyUrlButton = document.getElementById('copyUrlButton');
  const publishActions = document.getElementById('publishActions');
  const publishActionsNote = document.getElementById('publishActionsNote');
  const openObjectLink = document.getElementById('openObjectLink');
  const openHudLink = document.getElementById('openHudLink');
  const openCommitLink = document.getElementById('openCommitLink');
  const transmitBar = document.getElementById('transmitBar');
  const transmitButton = document.getElementById('transmitButton');
  const transmitLabel = document.getElementById('transmitLabel');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const dispatchClock = document.getElementById('dispatchClock');
  const logArea = document.getElementById('logArea');
  const roType = document.getElementById('roType');
  const roScale = document.getElementById('roScale');
  const roDepth = document.getElementById('roDepth');
  const roFocus = document.getElementById('roFocus');
  const roFunction = document.getElementById('roFunction');
  const roSlug = document.getElementById('roSlug');
  const roPath = document.getElementById('roPath');
  const roState = document.getElementById('roState');
  const pigeonMark = document.getElementById('pigeonMark');
  const axisSelects = {
    scale: axisScaleSelect,
    depth: axisDepthSelect,
    focus: axisFocusSelect,
    function: axisFunctionSelect,
  };

  const COLLECTION_MAP = {
    signal: localContentRoot + '/signal',
    fragment: localContentRoot + '/fragment',
    fieldlog: localContentRoot + '/fieldlog',
    artifact: localContentRoot + '/artifact',
    scroll: localContentRoot + '/scroll',
    codex: localContentRoot + '/codex',
    loremap: localContentRoot + '/loremap',
    nexus: localContentRoot + '/nexus',
  };

  let selectedType = 'signal';
  let typePanelOpen = false;
  let transmitState = 'idle';
  let typeWasManuallyChosen = false;

  const ARRAY_FIELDS = new Set([
    'actions',
    'classification',
    'dependencies',
    'featured',
    'images',
    'markers',
    'media',
    'tags',
    'themes',
  ]);

  const SMART_STOPWORDS = new Set([
    'a',
    'an',
    'about',
    'all',
    'also',
    'and',
    'after',
    'against',
    'almost',
    'among',
    'any',
    'around',
    'archive',
    'artifact',
    'are',
    'as',
    'at',
    'because',
    'before',
    'being',
    'between',
    'by',
    'carrier',
    'codex',
    'could',
    'date',
    'each',
    'entry',
    'field',
    'fieldlog',
    'first',
    'for',
    'fragment',
    'frontmatter',
    'from',
    'have',
    'into',
    'its',
    'just',
    'like',
    'many',
    'more',
    'note',
    'object',
    'object-type',
    'object_type',
    'objecttype',
    'of',
    'on',
    'or',
    'our',
    'pigeon',
    'published',
    'ready',
    'review',
    'send',
    'signal',
    'should',
    'some',
    'state',
    'starter',
    'scroll',
    'than',
    'that',
    'their',
    'them',
    'there',
    'these',
    'they',
    'this',
    'those',
    'throughout',
    'to',
    'through',
    'use',
    'using',
    'loremap',
    'nexus',
    'title',
    'type',
    'with',
    'would',
    'your',
  ]);

  const TYPE_KEYWORDS = {
    signal: [
      ['signal', 3],
      ['dispatch', 2.4],
      ['announcement', 2],
      ['broadcast', 1.8],
      ['alert', 1.8],
      ['transmission', 1.8],
    ],
    fragment: [
      ['fragment', 3],
      ['poem', 2.4],
      ['verse', 2.2],
      ['stanza', 2.2],
      ['aphorism', 2],
      ['excerpt', 1.8],
    ],
    fieldlog: [
      ['fieldlog', 3],
      ['field log', 3],
      ['observation', 2.2],
      ['project', 2],
      ['phase', 2],
      ['context', 1.8],
      ['actions', 1.8],
      ['findings', 1.8],
    ],
    artifact: [
      ['artifact', 3],
      ['relic', 2.2],
      ['specimen', 2],
      ['materials', 2],
      ['condition', 2],
      ['dimensions', 1.8],
    ],
    scroll: [
      ['scroll', 3],
      ['essay', 2.2],
      ['longform', 2],
      ['chapter', 1.8],
      ['invocation', 1.8],
      ['liturgical', 1.8],
      ['sermon', 1.6],
    ],
    codex: [
      ['codex', 3],
      ['protocol', 2.4],
      ['guide', 2],
      ['reference', 2],
      ['schema', 2],
      ['system', 1.8],
      ['version', 1.8],
      ['standard', 1.6],
    ],
    loremap: [
      ['loremap', 3],
      ['location', 2.2],
      ['terrain', 2.2],
      ['coordinates', 2],
      ['region', 1.8],
      ['district', 1.6],
      ['river', 1.4],
      ['mount', 1.4],
      ['map', 1.8],
    ],
    nexus: [
      ['nexus', 3],
      ['release', 2.2],
      ['launch', 2],
      ['featured', 1.8],
      ['lead', 1.6],
      ['roadmap', 1.6],
      ['sequence', 1.6],
      ['update', 1.4],
    ],
  };

  const AXIS_SCALE_VALUES = ['micro', 'meso', 'macro'];
  const AXIS_DEPTH_VALUES = ['surface', 'structural', 'recursive'];
  const AXIS_FOCUS_VALUES = ['moment', 'character', 'system', 'witness'];
  const AXIS_FUNCTION_VALUES = ['diagnostic', 'therapeutic', 'revelatory', 'comparative'];

  const AXIS_KEYWORDS = {
    scale: [
      {
        pattern: /\b(moment|breath|glance|touch|gesture|elevator|room|bench|table|hand|line|sentence|today|tonight|morning|afternoon|evening)\b/g,
        weights: { micro: 0.55 },
      },
      {
        pattern: /\b(pattern|practice|project|routine|cycle|phase|week|month|relationship|terrain|field|studio|archive|workflow|process)\b/g,
        weights: { meso: 0.55 },
      },
      {
        pattern: /\b(society|culture|history|civilization|collective|nation|economy|institution|governance|public|world|cosmos)\b/g,
        weights: { macro: 0.7 },
      },
    ],
    depth: [
      {
        pattern: /\b(saw|heard|noticed|looked|felt|found|observed|recorded|captured|status|condition|today|report)\b/g,
        weights: { surface: 0.55 },
      },
      {
        pattern: /\b(structure|system|pattern|framework|mechanism|model|schema|architecture|rule|doctrine|infrastructure|workflow|network|classification|contract)\b/g,
        weights: { structural: 0.65 },
      },
      {
        pattern: /\b(recursive|recursion|witness|observer|awareness|mirror|loop|feedback|reflection|threshold|consciousness|meta)\b/g,
        weights: { recursive: 0.75 },
      },
    ],
    focus: [
      {
        pattern: /\b(scene|moment|when|during|while|suddenly|room|elevator|street|bench|table|bridge|morning|night)\b/g,
        weights: { moment: 0.6 },
      },
      {
        pattern: /\b(mother|father|child|friend|operator|citizen|worker|guide|listener|parent|person|people|character)\b/g,
        weights: { character: 0.6 },
      },
      {
        pattern: /\b(system|archive|network|process|institution|workflow|schema|infrastructure|machine|publishing|protocol|classification|governance|interface)\b/g,
        weights: { system: 0.7 },
      },
      {
        pattern: /\b(witness|awareness|observer|breath|attention|presence|seeing|perception|consciousness)\b/g,
        weights: { witness: 0.75 },
      },
    ],
    function: [
      {
        pattern: /\b(issue|constraint|condition|status|problem|bug|failure|diagnos|pressure|signal|observation|report)\b/g,
        weights: { diagnostic: 0.7 },
      },
      {
        pattern: /\b(heal|healing|repair|steady|steadiness|calm|comfort|care|maintain|maintenance|continue|survive|soothe|integrat)\b/g,
        weights: { therapeutic: 0.75 },
      },
      {
        pattern: /\b(reveal|revealed|realize|realized|learned|discovered|showed|showing|unlocked|clarified|became clear)\b/g,
        weights: { revelatory: 0.8 },
      },
      {
        pattern: /\b(vs\.?|versus|unlike|compare|comparison|contrast|between|alongside)\b/g,
        weights: { comparative: 0.8 },
      },
    ],
  };

  const OBJECT_TYPE_AXIS_PRIORS = {
    signal: {
      scale: { micro: 2.1, meso: 0.3 },
      depth: { surface: 0.9, recursive: 0.4 },
      focus: { moment: 1.0, system: 0.5 },
      function: { revelatory: 1.2, diagnostic: 1.0 },
    },
    fragment: {
      scale: { micro: 2.2 },
      depth: { recursive: 1.1, surface: 0.4 },
      focus: { witness: 1.0, moment: 0.8 },
      function: { revelatory: 1.0, therapeutic: 0.4 },
    },
    fieldlog: {
      scale: { meso: 1.8, micro: 0.5 },
      depth: { surface: 1.5, structural: 1.2 },
      focus: { system: 1.4, moment: 0.8 },
      function: { diagnostic: 2.0 },
    },
    artifact: {
      scale: { meso: 1.2, micro: 0.8 },
      depth: { surface: 1.2, structural: 1.0 },
      focus: { system: 0.9, moment: 0.8 },
      function: { revelatory: 0.8, diagnostic: 0.8, comparative: 0.5 },
    },
    scroll: {
      scale: { meso: 1.3, micro: 0.6, macro: 0.4 },
      depth: { structural: 1.0, recursive: 0.8 },
      focus: { system: 0.8, moment: 0.8, character: 0.7, witness: 0.4 },
      function: { revelatory: 1.2, therapeutic: 0.8, diagnostic: 0.6 },
    },
    codex: {
      scale: { meso: 1.2, macro: 1.0 },
      depth: { structural: 2.1, recursive: 0.4 },
      focus: { system: 2.1 },
      function: { diagnostic: 1.2, revelatory: 1.0, comparative: 0.4 },
    },
    loremap: {
      scale: { meso: 1.7, macro: 0.6 },
      depth: { structural: 1.3, surface: 1.0 },
      focus: { system: 1.2, moment: 0.4 },
      function: { diagnostic: 1.0, revelatory: 0.8, comparative: 0.4 },
    },
    nexus: {
      scale: { meso: 1.5, macro: 0.7 },
      depth: { structural: 1.5 },
      focus: { system: 1.9 },
      function: { comparative: 1.5, revelatory: 0.8, diagnostic: 0.5 },
    },
  };

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function normalizeRawNote(raw) {
    return String(raw || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  }

  function buildTemplate(type) {
    const date = today();

    switch (type) {
      case 'signal':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: signal\ntags: []\norigin:\nmarkers: []\n---\n\nSignals are epiphanies prepared for transmission.\n';
      case 'fragment':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: fragment\ntags: []\norigin:\nvoice:\n---\n\nA fragment worth carrying forward.\n';
      case 'fieldlog':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: fieldlog\ntags: []\nproject:\nphase:\ncontext:\nactions: []\n---\n\n## Context\n\n## Observation\n\n## Notes\n';
      case 'artifact':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: artifact\ntags: []\nartifactType:\nmaterials:\ncondition:\nsource:\n---\n\nArtifact description.\n';
      case 'scroll':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: scroll\ntags: []\nsummary:\nbodyClass: prose\n---\n\nLongform draft.\n';
      case 'codex':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: codex\ntags: []\nversion:\nscope:\nstate: published\n---\n\nSystem note.\n';
      case 'loremap':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: loremap\ntags: []\nlocation:\nterrain:\nclassification: []\n---\n\nLocation note.\n';
      case 'nexus':
        return '---\ntitle:\ndate: ' + date + '\nobject_type: nexus\ntags: []\nlead:\nfeatured: []\nreleaseType:\n---\n\nConnection note.\n';
      default:
        return '---\ntitle:\ndate: ' + date + '\nobject_type: fragment\ntags: []\n---\n\n';
    }
  }

  function normalizeObjectType(value) {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized) {
      return null;
    }

    if (normalized === 'field-log' || normalized === 'field_log' || normalized === 'field log') {
      return 'fieldlog';
    }

    return typeMeta[normalized] ? normalized : null;
  }

  function normalizeAxisValue(value, allowedValues) {
    if (typeof value !== 'string') {
      return '';
    }

    const normalized = value.trim().toLowerCase();
    return allowedValues.includes(normalized) ? normalized : '';
  }

  function normalizeAxisScale(value) {
    return normalizeAxisValue(value, AXIS_SCALE_VALUES);
  }

  function normalizeAxisDepth(value) {
    return normalizeAxisValue(value, AXIS_DEPTH_VALUES);
  }

  function normalizeAxisFocus(value) {
    return normalizeAxisValue(value, AXIS_FOCUS_VALUES);
  }

  function normalizeAxisFunction(value) {
    return normalizeAxisValue(value, AXIS_FUNCTION_VALUES);
  }

  function normalizeAxisByKind(kind, value) {
    switch (kind) {
      case 'scale':
        return normalizeAxisScale(value);
      case 'depth':
        return normalizeAxisDepth(value);
      case 'focus':
        return normalizeAxisFocus(value);
      case 'function':
        return normalizeAxisFunction(value);
      default:
        return '';
    }
  }

  function axisFieldLabel(kind) {
    return kind ? kind.charAt(0).toUpperCase() + kind.slice(1) : '';
  }

  function readAxisOverridesFromFrontmatterFields(fields) {
    return {
      scale: normalizeAxisScale(fields.get('scale') && fields.get('scale')[0]),
      depth: normalizeAxisDepth(fields.get('depth') && fields.get('depth')[0]),
      focus: normalizeAxisFocus(fields.get('focus') && fields.get('focus')[0]),
      function: normalizeAxisFunction(fields.get('function') && fields.get('function')[0]),
    };
  }

  function createAxisScores(values) {
    const scores = {};
    values.forEach((value) => {
      scores[value] = 0;
    });
    return scores;
  }

  function bumpAxisScores(scores, weights, multiplier) {
    Object.entries(weights || {}).forEach(([value, weight]) => {
      scores[value] = (scores[value] || 0) + weight * (multiplier || 1);
    });
  }

  function countMatches(pattern, source) {
    const matches = source.match(pattern);
    return matches ? matches.length : 0;
  }

  function scoreAxisFromKeywords(scores, cues, source) {
    cues.forEach((cue) => {
      const matches = countMatches(cue.pattern, source);
      if (matches > 0) {
        bumpAxisScores(scores, cue.weights, matches);
      }
    });
  }

  function pickTopAxisValue(scores, fallback, tieBreak) {
    const ranked = Object.entries(scores).sort((left, right) => {
      if (left[1] === right[1]) {
        return tieBreak.indexOf(left[0]) - tieBreak.indexOf(right[0]);
      }
      return right[1] - left[1];
    });

    return ranked.length && ranked[0][1] > 0 ? ranked[0][0] : fallback;
  }

  function formatAxisValue(kind, value) {
    if (!value) {
      return '';
    }

    return axisLabels[kind] && axisLabels[kind][value] ? axisLabels[kind][value] : value;
  }

  function inferAxesFromText(input) {
    const sourceObject = input || {};
    const objectType = normalizeObjectType(sourceObject.objectType) || normalizeObjectType(selectedType);
    const title = String(sourceObject.title || '');
    const body = String(sourceObject.body || '');
    const existing = sourceObject.existing || {};
    const source = (title + '\n' + body).toLowerCase();
    const plain = plainTextFromMarkdown(source);
    const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    const headingCount = (normalizeRawNote(body).match(/^\s{0,3}#{1,6}\s+/gm) || []).length;
    const firstPersonCount = countMatches(/\b(i|me|my|mine)\b/g, plain);

    const scaleScores = createAxisScores(AXIS_SCALE_VALUES);
    const depthScores = createAxisScores(AXIS_DEPTH_VALUES);
    const focusScores = createAxisScores(AXIS_FOCUS_VALUES);
    const functionScores = createAxisScores(AXIS_FUNCTION_VALUES);

    const priors = objectType ? OBJECT_TYPE_AXIS_PRIORS[objectType] : null;
    if (priors && priors.scale) {
      bumpAxisScores(scaleScores, priors.scale);
    }
    if (priors && priors.depth) {
      bumpAxisScores(depthScores, priors.depth);
    }
    if (priors && priors.focus) {
      bumpAxisScores(focusScores, priors.focus);
    }
    if (priors && priors.function) {
      bumpAxisScores(functionScores, priors.function);
    }

    scoreAxisFromKeywords(scaleScores, AXIS_KEYWORDS.scale, plain);
    scoreAxisFromKeywords(depthScores, AXIS_KEYWORDS.depth, plain);
    scoreAxisFromKeywords(focusScores, AXIS_KEYWORDS.focus, plain);
    scoreAxisFromKeywords(functionScores, AXIS_KEYWORDS.function, plain);

    if (wordCount > 420 || headingCount > 2) {
      bumpAxisScores(scaleScores, { meso: 0.5, macro: 0.25 });
      bumpAxisScores(depthScores, { structural: 0.3 });
    }

    if (wordCount < 120 && headingCount === 0) {
      bumpAxisScores(scaleScores, { micro: 0.35 });
    }

    if (/\b(what this revealed|it became clear|this revealed|i realized)\b/.test(source)) {
      bumpAxisScores(functionScores, { revelatory: 1.2 });
    }

    if (/\b(versus|vs\.?|compare|comparison|contrast|between|alongside)\b/.test(source)) {
      bumpAxisScores(functionScores, { comparative: 1.0 });
    }

    if (/\b(maintenance|care|repair|steady|steadiness|survive|keep going)\b/.test(source)) {
      bumpAxisScores(functionScores, { therapeutic: 0.9 });
    }

    if (/\b(issue|constraint|bug|condition|status|report)\b/.test(source)) {
      bumpAxisScores(functionScores, { diagnostic: 0.9 });
    }

    if (firstPersonCount >= 4) {
      bumpAxisScores(depthScores, { recursive: 0.4 });
      bumpAxisScores(focusScores, { witness: 0.4 });
    }

    const inferred = {
      scale: pickTopAxisValue(
        scaleScores,
        objectType === 'signal' || objectType === 'fragment' ? 'micro' : 'meso',
        AXIS_SCALE_VALUES
      ),
      depth: pickTopAxisValue(
        depthScores,
        objectType === 'fieldlog' || objectType === 'artifact' || objectType === 'signal'
          ? 'surface'
          : objectType === 'fragment'
            ? 'recursive'
            : 'structural',
        AXIS_DEPTH_VALUES
      ),
      focus: pickTopAxisValue(
        focusScores,
        objectType === 'codex' || objectType === 'nexus' || objectType === 'loremap'
          ? 'system'
          : objectType === 'fragment'
            ? 'witness'
            : 'moment',
        AXIS_FOCUS_VALUES
      ),
      function: pickTopAxisValue(
        functionScores,
        objectType === 'fieldlog' || objectType === 'codex' || objectType === 'loremap'
          ? 'diagnostic'
          : objectType === 'nexus'
            ? 'comparative'
            : 'revelatory',
        AXIS_FUNCTION_VALUES
      ),
    };

    return {
      scale: existing.scale || inferred.scale,
      depth: existing.depth || inferred.depth,
      focus: existing.focus || inferred.focus,
      function: existing.function || inferred.function,
    };
  }

  function hasAxes(axes) {
    return Boolean(axes && (axes.scale || axes.depth || axes.focus || axes.function));
  }

  function parseFrontmatterArray(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inner = trimmed.slice(1, -1).trim();
      if (!inner) {
        return [];
      }

      return inner
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }

    return trimmed
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  function parseFrontmatterScalar(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) {
      return '';
    }

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') {
          return parsed.trim();
        }
      } catch (error) {
        return trimmed.slice(1, -1).trim();
      }
    }

    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1).replace(/''/g, "'").trim();
    }

    return trimmed;
  }

  function normalizeTitleScalar(value) {
    return String(value || '')
      .trim()
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*>+\s*/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .trim();
  }

  function parseFrontmatter(raw) {
    const normalized = normalizeRawNote(raw);
    const normalizedForMatch = normalized.replace(/^\s+/, '');
    const result = {
      title: '',
      caption: '',
      date: '',
      state: '',
      objectType: null,
      axes: {
        scale: '',
        depth: '',
        focus: '',
        function: '',
      },
      axisOverrides: {
        scale: '',
        depth: '',
        focus: '',
        function: '',
      },
      tags: [],
      images: [],
      body: normalized.trim(),
      hasFrontmatter: false,
      hasTitleField: false,
      hasDateField: false,
    };

    const parsedFrontmatter = parseLooseFrontmatter(normalizedForMatch);
    if (!parsedFrontmatter) {
      const smartImageDraft = parseSmartImageDraft(normalizedForMatch);
      if (smartImageDraft) {
        result.caption = smartImageDraft.caption;
        result.body = '';
        result.axes = inferAxesFromText({
          objectType: selectedType,
          title: result.title,
          body: '',
          existing: result.axes,
        });
        return result;
      }

      result.axes = inferAxesFromText({
        objectType: selectedType,
        title: result.title,
        body: result.body,
        existing: result.axes,
      });
      return result;
    }

    result.hasFrontmatter = true;
    const fields = parsedFrontmatter.fields;
    const objectType =
      normalizeObjectType(fields.get('object_type') && fields.get('object_type')[0]) ||
      normalizeObjectType(fields.get('objecttype') && fields.get('objecttype')[0]) ||
      normalizeObjectType(fields.get('type') && fields.get('type')[0]);

    result.hasTitleField = fields.has('title');
    result.hasDateField = fields.has('date');
    result.title = normalizeTitleScalar(parseFrontmatterScalar((fields.get('title') && fields.get('title')[0]) || ''));
    result.caption = parseFrontmatterScalar((fields.get('caption') && fields.get('caption')[0]) || '');
    result.date = parseFrontmatterScalar((fields.get('date') && fields.get('date')[0]) || '');
    result.state = parseFrontmatterScalar((fields.get('state') && fields.get('state')[0]) || '');
    result.objectType = objectType;
    result.axisOverrides = readAxisOverridesFromFrontmatterFields(fields);
    const frontmatterBody = parsedFrontmatter.body.trim();
    const inferredCaption =
      !result.caption && shouldTreatPlainImageNoteAsCaption(frontmatterBody) ? frontmatterBody : '';
    result.caption = result.caption || inferredCaption;
    result.axes = inferAxesFromText({
      objectType: objectType || selectedType,
      title: result.title,
      body: inferredCaption ? '' : frontmatterBody,
      existing: result.axisOverrides,
    });
    result.tags = (fields.get('tags') || []).flatMap(parseFrontmatterArray);
    result.images = (fields.get('images') || []).flatMap(parseFrontmatterArray);
    result.body = inferredCaption ? '' : frontmatterBody;
    return result;
  }

  function parseLooseFrontmatter(source) {
    const lines = source.split('\n');
    if (!lines.length) {
      return null;
    }

    let startIndex = 0;
    while (startIndex < lines.length && !lines[startIndex].trim()) {
      startIndex += 1;
    }

    if (startIndex >= lines.length) {
      return null;
    }

    const hasFence = lines[startIndex].trim() === '---';
    if (!hasFence) {
      const firstFieldMatch = lines[startIndex].trimEnd().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!firstFieldMatch) {
        return null;
      }

      const firstKey = firstFieldMatch[1].toLowerCase();
      if (!/^(title|caption|date|object_type|objecttype|type|state|tags|images|summary|id|status|visibility|themes|media|scale|depth|focus|function)$/.test(firstKey)) {
        return null;
      }
    }

    const fields = new Map();
    let currentKey = '';
    let bodyStartIndex = -1;

    for (let index = hasFence ? startIndex + 1 : startIndex; index < lines.length; index += 1) {
      const rawLine = lines[index];
      const trimmedLine = rawLine.trimEnd();
      const fullyTrimmed = trimmedLine.trim();

      if (hasFence && fullyTrimmed === '---') {
        bodyStartIndex = index + 1;
        break;
      }

      if (!fullyTrimmed) {
        if (!hasFence && fields.size > 0) {
          bodyStartIndex = index + 1;
          break;
        }
        continue;
      }

      const listMatch = trimmedLine.match(/^\s*-\s*(.+)$/);
      if (listMatch && currentKey) {
        const existing = fields.get(currentKey) || [];
        existing.push(listMatch[1].trim());
        fields.set(currentKey, existing);
        continue;
      }

      const fieldMatch = trimmedLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (fieldMatch) {
        currentKey = fieldMatch[1].toLowerCase();
        const value = fieldMatch[2].trim();
        fields.set(currentKey, value ? [value] : []);
        continue;
      }

      if (/^\s+/.test(rawLine) && currentKey) {
        const existing = fields.get(currentKey) || [];
        if (existing.length === 0) {
          existing.push(trimmedLine.trim());
        } else {
          existing[existing.length - 1] = (existing[existing.length - 1] + ' ' + trimmedLine.trim()).trim();
        }
        fields.set(currentKey, existing);
        continue;
      }

      if (fields.size > 0) {
        bodyStartIndex = index;
        break;
      }
    }

    if (fields.size === 0) {
      return null;
    }

    return {
      fields,
      body: bodyStartIndex >= 0 ? lines.slice(bodyStartIndex).join('\n') : '',
    };
  }

  function hasMeaningfulValue(value) {
    if (Array.isArray(value)) {
      return value.some((item) => String(item || '').trim().length > 0);
    }

    return typeof value === 'string' ? value.trim().length > 0 : value != null;
  }

  function cloneFieldValue(value) {
    return Array.isArray(value) ? value.slice() : value;
  }

  function fillMissingField(fields, key, value) {
    if (!hasMeaningfulValue(value) || hasMeaningfulValue(fields[key])) {
      return false;
    }

    fields[key] = cloneFieldValue(value);
    return true;
  }

  function readLooseFrontmatter(raw) {
    const normalized = normalizeRawNote(raw);
    const parsedFrontmatter = parseLooseFrontmatter(normalized.replace(/^\s+/, ''));
    const fields = {};
    const order = [];

    if (!parsedFrontmatter) {
      const smartImageDraft = parseSmartImageDraft(normalized);
      if (smartImageDraft) {
        return {
          fields: { caption: smartImageDraft.caption },
          order: ['caption'],
          body: '',
        };
      }

      return {
        fields,
        order,
        body: normalized.trim(),
      };
    }

    parsedFrontmatter.fields.forEach((values, key) => {
      order.push(key);
      if (ARRAY_FIELDS.has(key)) {
        fields[key] = values.flatMap(parseFrontmatterArray).filter(Boolean);
      } else if (values.length > 1) {
        fields[key] = values.map((value) => parseFrontmatterScalar(value)).filter(Boolean);
      } else {
        fields[key] = parseFrontmatterScalar((values[0] || '') + '');
      }
    });

    const frontmatterBody = parsedFrontmatter.body.trim();
    if (!hasMeaningfulValue(fields.caption) && shouldTreatPlainImageNoteAsCaption(frontmatterBody)) {
      fields.caption = frontmatterBody;
      if (!order.includes('caption')) {
        order.push('caption');
      }

      return {
        fields,
        order,
        body: '',
      };
    }

    return {
      fields,
      order,
      body: frontmatterBody,
    };
  }

  function shouldTreatPlainImageNoteAsCaption(value) {
    if (!hasAttachedImages()) {
      return false;
    }

    const trimmed = normalizeRawNote(value).trim();
    if (!trimmed || trimmed.length > 280) {
      return false;
    }

    if (/\n\s*\n/.test(trimmed)) {
      return false;
    }

    const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0 || lines.length > 3) {
      return false;
    }

    const fencedCodeMarker = String.fromCharCode(96).repeat(3);
    const looksStructuredMarkdown = (line) =>
      line === '---' ||
      line.startsWith(fencedCodeMarker) ||
      /^#{1,6}\s/.test(line) ||
      /^>\s/.test(line) ||
      /^[-*+]\s/.test(line) ||
      /^\d+[.)]\s/.test(line);

    if (
      lines.some(
        (line) =>
          looksStructuredMarkdown(line) ||
          /!\[\[|!\[[^\]]*\]\([^)]+\)/.test(line)
      )
    ) {
      return false;
    }

    return true;
  }

  function parseSmartImageDraft(raw) {
    const normalized = normalizeRawNote(raw).trim();
    if (!normalized || parseLooseFrontmatter(normalized.replace(/^\s+/, ''))) {
      return null;
    }

    if (!shouldTreatPlainImageNoteAsCaption(normalized)) {
      return null;
    }

    return {
      caption: normalized,
    };
  }

  function stripMarkdownLinks(value) {
    return String(value || '')
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  }

  function cleanTitleCandidate(value) {
    const cleaned = stripMarkdownLinks(value)
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*>+\s*/, '')
      .replace(/^\s*[-*+]\s+/, '')
      .replace(/^\s*\d+[.)]\s+/, '')
      .replace(/[*_\u0060~]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^['"“”‘’]+|['"“”‘’]+$/g, '')
      .replace(/[.?!:;,\-]+$/g, '')
      .trim();

    if (!cleaned) {
      return '';
    }

    if (cleaned.length <= 96) {
      return cleaned;
    }

    return cleaned.split(/\s+/).slice(0, 12).join(' ');
  }

  function plainTextFromMarkdown(value) {
    return stripMarkdownLinks(value)
      .replace(/\u0060\u0060\u0060[\s\S]*?\u0060\u0060\u0060/g, ' ')
      .replace(/\u0060[^\u0060]*\u0060/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
      .replace(/[>*_~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function inferTitleFromText(body) {
    const normalized = normalizeRawNote(body).trim();
    if (!normalized) {
      return '';
    }

    const headingMatch = normalized.match(/^\s{0,3}#{1,6}\s+(.+)$/m);
    if (headingMatch) {
      const headingTitle = cleanTitleCandidate(headingMatch[1]);
      if (headingTitle) {
        return headingTitle;
      }
    }

    const lines = normalized.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || /^\u0060\u0060\u0060/.test(trimmed) || /^([A-Za-z0-9_-]+):\s*/.test(trimmed)) {
        continue;
      }

      const candidate = cleanTitleCandidate(trimmed);
      if (candidate.length >= 4) {
        return candidate;
      }
    }

    const plain = plainTextFromMarkdown(normalized);
    if (!plain) {
      return '';
    }

    const sentenceMatch = plain.match(/^(.{8,120}?[.?!])(?:\s|$)/);
    if (sentenceMatch) {
      return cleanTitleCandidate(sentenceMatch[1]);
    }

    return cleanTitleCandidate(plain.split(/\s+/).slice(0, 12).join(' '));
  }

  function inferDateFromText(body) {
    const normalized = normalizeRawNote(body);
    const isoMatch = normalized.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      return isoMatch[1];
    }

    const namedMonthMatch = normalized.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(20\d{2})\b/i
    );
    if (namedMonthMatch) {
      const monthIndex =
        [
          'january',
          'february',
          'march',
          'april',
          'may',
          'june',
          'july',
          'august',
          'september',
          'october',
          'november',
          'december',
        ].indexOf(namedMonthMatch[1].toLowerCase()) + 1;

      if (monthIndex > 0) {
        return (
          namedMonthMatch[3] +
          '-' +
          String(monthIndex).padStart(2, '0') +
          '-' +
          String(Number.parseInt(namedMonthMatch[2], 10)).padStart(2, '0')
        );
      }
    }

    return today();
  }

  function normalizeTagCandidate(value) {
    const slug = slugify(String(value || '').replace(/^#/, ''));
    return slug && !SMART_STOPWORDS.has(slug) ? slug : '';
  }

  function inferTagsFromText(title, body) {
    const tagSet = new Set();
    const hashtagMatches = normalizeRawNote(body).match(/(^|\s)#([a-z0-9][a-z0-9-]{1,31})\b/gi) || [];

    hashtagMatches.forEach((match) => {
      const normalizedTag = normalizeTagCandidate(match.replace(/(^|\s)#/, ''));
      if (normalizedTag) {
        tagSet.add(normalizedTag);
      }
    });

    if (tagSet.size >= 5) {
      return Array.from(tagSet).slice(0, 5);
    }

    const scores = new Map();
    const pushWordScore = (word, weight) => {
      const normalizedWord = normalizeTagCandidate(word);
      if (!normalizedWord || normalizedWord.length < 4) {
        return;
      }
      scores.set(normalizedWord, (scores.get(normalizedWord) || 0) + weight);
    };

    const titleWords = plainTextFromMarkdown(title).toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || [];
    titleWords.forEach((word) => pushWordScore(word, 3));

    const bodyWords = plainTextFromMarkdown(body).toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || [];
    bodyWords.forEach((word) => pushWordScore(word, 1));

    Array.from(scores.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .forEach(([word]) => {
        if (tagSet.size < 5) {
          tagSet.add(word);
        }
      });

    return Array.from(tagSet).slice(0, 5);
  }

  function inferSummaryFromText(body) {
    const plain = plainTextFromMarkdown(body);
    if (!plain) {
      return '';
    }

    const sentenceMatch = plain.match(/^(.{40,220}?[.?!])(?:\s|$)/);
    if (sentenceMatch) {
      return sentenceMatch[1].trim();
    }

    if (plain.length <= 180) {
      return plain;
    }

    return plain.slice(0, 177).trim() + '...';
  }

  function inferObjectTypeFromText(title, body) {
    const source = (title + '\n' + body).toLowerCase();
    const scores = Object.fromEntries(
      Object.keys(typeMeta).map((type) => [type, 0])
    );

    Object.entries(TYPE_KEYWORDS).forEach(([type, entries]) => {
      entries.forEach(([term, weight]) => {
        if (source.includes(term)) {
          scores[type] += weight;
        }
      });
    });

    const wordCount = plainTextFromMarkdown(body).split(/\s+/).filter(Boolean).length;
    const headingCount = (normalizeRawNote(body).match(/^\s{0,3}#{1,6}\s+/gm) || []).length;

    if (/^##\s+(context|observation|notes?|actions?)\b/im.test(body)) {
      scores.fieldlog += 2.8;
    }

    if (/\b(materials?|condition|artifact|relic|specimen|dimensions?)\b/i.test(body)) {
      scores.artifact += 2.4;
    }

    if (/\b(latitude|longitude|coordinates?|terrain|region|district|river|mount|location)\b/i.test(body)) {
      scores.loremap += 2.4;
    }

    if (/^\s*[-*]\s+/m.test(body) && /\b(release|featured|lead|links?|sequence|roadmap)\b/i.test(body)) {
      scores.nexus += 2.6;
    }

    if (/\b(protocol|schema|reference|guide|handbook|standard|version|scope)\b/i.test(body)) {
      scores.codex += 2.4;
    }

    if (/\b(signal|dispatch|announcement|broadcast|alert)\b/i.test(body)) {
      scores.signal += 2.2;
    }

    if (/\b(fragment|poem|verse|stanza|aphorism|excerpt)\b/i.test(body) || /^\s*>\s+/m.test(body)) {
      scores.fragment += 2.3;
    }

    if (wordCount > 350 || headingCount > 2) {
      scores.scroll += 2.6;
      scores.codex += 0.8;
    }

    if (wordCount < 120 && headingCount === 0) {
      scores.signal += 0.6;
      scores.fragment += 0.8;
    }

    if (typeWasManuallyChosen) {
      scores[selectedType] += 1.2;
    }

    const ranked = Object.entries(scores).sort((left, right) => right[1] - left[1]);
    if (!ranked.length || ranked[0][1] < 1.25) {
      return typeWasManuallyChosen ? selectedType : 'codex';
    }

    return ranked[0][0];
  }

  function getTypeSpecificDefaults(type, body) {
    switch (type) {
      case 'signal':
        return { origin: '', markers: [] };
      case 'fragment':
        return { origin: '', voice: '' };
      case 'fieldlog':
        return { project: '', phase: '', context: '', actions: [] };
      case 'artifact':
        return { artifactType: '', materials: '', condition: '' };
      case 'scroll':
        return { summary: inferSummaryFromText(body), bodyClass: 'prose' };
      case 'codex':
        return { version: '', scope: '', state: 'published' };
      case 'loremap':
        return { location: '', terrain: '', classification: [] };
      case 'nexus':
        return { lead: '', featured: [], releaseType: '' };
      default:
        return {};
    }
  }

  function formatInlineYamlValue(value) {
    const stringValue = String(value || '').trim();
    if (!stringValue) {
      return '""';
    }

    if (/^(true|false|null)$/i.test(stringValue) || /^-?\d+(\.\d+)?$/.test(stringValue)) {
      return stringValue;
    }

    if (/^[A-Za-z0-9._/-]+$/.test(stringValue)) {
      return stringValue;
    }

    return JSON.stringify(stringValue);
  }

  function renderFrontmatterNote(fields, originalOrder, typeKey, inferredType, body) {
    const renderedFields = { ...fields };
    const orderedKeys = [];
    const pushKey = (key) => {
      if (!Object.prototype.hasOwnProperty.call(renderedFields, key) || orderedKeys.includes(key)) {
        return;
      }
      orderedKeys.push(key);
    };

    pushKey('title');
    pushKey('date');
    pushKey(typeKey);
    if (typeKey === 'type') {
      pushKey('object_type');
    }
    pushKey('caption');
    pushKey('tags');
    pushKey('scale');
    pushKey('depth');
    pushKey('focus');
    pushKey('function');
    Object.keys(getTypeSpecificDefaults(inferredType, body)).forEach(pushKey);
    originalOrder.forEach(pushKey);
    Object.keys(renderedFields).forEach(pushKey);

    const lines = orderedKeys.map((key) => {
      const value = renderedFields[key];
      if (Array.isArray(value)) {
        const items = value.map((item) => String(item || '').trim()).filter(Boolean);
        return key + ': ' + (items.length ? '[' + items.map(formatInlineYamlValue).join(', ') + ']' : '[]');
      }

      const normalizedValue = String(value || '').trim();
      return key + ': ' + (normalizedValue ? formatInlineYamlValue(normalizedValue) : '');
    });

    const normalizedBody = normalizeRawNote(body).trim();
    return ['---', ...lines, '---', normalizedBody].filter(Boolean).join('\n');
  }

  function smartDraft(options) {
    const settings = options || {};
    const rawNote = normalizeRawNote(noteField.value);
    if (!rawNote.trim()) {
      updateInterface({ forceError: true });
      logLine('err', noNoteMessage);
      return null;
    }

    const parsed = parseFrontmatter(rawNote);
    const loose = readLooseFrontmatter(rawNote);
    const fields = { ...loose.fields };
    const originalTypeKey = Object.prototype.hasOwnProperty.call(fields, 'object_type')
      ? 'object_type'
      : Object.prototype.hasOwnProperty.call(fields, 'type')
        ? 'type'
        : 'object_type';
    const existingType =
      normalizeObjectType(
        originalTypeKey === 'object_type' ? fields.object_type : fields.type
      ) ||
      normalizeObjectType(fields.object_type) ||
      normalizeObjectType(fields.type);
    const captionText = parsed.caption || '';
    const body = loose.body || parsed.body || (captionText ? '' : rawNote.trim());
    const inferenceText = captionText || body;
    const inferredTitle = parsed.title || inferTitleFromText(inferenceText);
    const inferredDate =
      parsed.date && !Number.isNaN(Date.parse(parsed.date)) ? parsed.date : inferDateFromText(inferenceText);
    const inferredType =
      existingType || (captionText && !body ? resolvePublishType(parsed) : inferObjectTypeFromText(inferredTitle, body));
    const inferredTags = parsed.tags.length ? parsed.tags : inferTagsFromText(inferredTitle, inferenceText);
    const inferredAxes = inferAxesFromText({
      objectType: inferredType,
      title: inferredTitle,
      body,
      existing: {
        scale: normalizeAxisScale(fields.scale),
        depth: normalizeAxisDepth(fields.depth),
        focus: normalizeAxisFocus(fields.focus),
        function: normalizeAxisFunction(fields.function),
      },
    });

    const appliedFields = [];

    if (fillMissingField(fields, 'title', inferredTitle)) {
      appliedFields.push('title');
    }

    if (fillMissingField(fields, 'date', inferredDate)) {
      appliedFields.push('date');
    }

    if (!hasMeaningfulValue(fields[originalTypeKey])) {
      fields[originalTypeKey] = inferredType;
      appliedFields.push('type');
    }

    if (fillMissingField(fields, 'tags', inferredTags)) {
      appliedFields.push('tags');
    }

    ['scale', 'depth', 'focus', 'function'].forEach((key) => {
      if (fillMissingField(fields, key, inferredAxes[key])) {
        appliedFields.push(key);
      }
    });

    const typeDefaults = getTypeSpecificDefaults(inferredType, body);
    Object.entries(typeDefaults).forEach(([key, value]) => {
      if (fillMissingField(fields, key, value)) {
        appliedFields.push(key);
      }
    });

    const nextNote = renderFrontmatterNote(fields, loose.order, originalTypeKey, inferredType, body);
    const changed = nextNote.trim() !== rawNote.trim();
    noteField.value = nextNote;
    persistDraft();
    const updatedParsed = updateInterface();
    noteField.focus();

    if (!changed) {
      if (!settings.silent) {
        logLine('info', 'Smart Draft left the current frontmatter as-is.');
      }
      return { parsed: updatedParsed, changed, inferredType };
    }

    if (!settings.silent) {
      logLine('ok', 'Smart Draft -> ' + describeType(inferredType));
      logLine('', smartDraftButtonMessage);
    }

    return {
      parsed: updatedParsed,
      changed,
      inferredType,
      appliedFields,
    };
  }

  function slugify(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }

  function collectionPath(type, slug) {
    if (!type || !slug) {
      return null;
    }

    const base = COLLECTION_MAP[type] || localContentRoot + '/' + type;
    return base + '/' + slug + '.md';
  }

  function describeType(type) {
    return typeMeta[type] ? typeMeta[type].label : type;
  }

  function selectedImageCount() {
    return Array.from(imgFileInput.files || []).length;
  }

  function hasAttachedImages() {
    return selectedImageCount() > 0;
  }

  function hasDeclaredImages(parsed) {
    return Array.isArray(parsed.images) && parsed.images.length > 0;
  }

  function isImageOnlyDraft(parsed) {
    return !parsed.body && (hasAttachedImages() || hasDeclaredImages(parsed));
  }

  function hasPublishableContent(parsed) {
    return Boolean(parsed.body || hasAttachedImages() || hasDeclaredImages(parsed));
  }

  function hasValidOrFallbackDate(parsed) {
    if (parsed.date) {
      return !Number.isNaN(Date.parse(parsed.date));
    }

    return isImageOnlyDraft(parsed);
  }

  function formatFallbackPublishDate(rawValue) {
    const parsedDate =
      rawValue && !Number.isNaN(Date.parse(rawValue)) ? new Date(rawValue) : new Date();

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function resolvePublishType(parsed) {
    if (parsed.objectType) {
      return parsed.objectType;
    }

    if (typeWasManuallyChosen) {
      return selectedType;
    }

    return isImageOnlyDraft(parsed) ? 'artifact' : selectedType;
  }

  function resolveDisplayTitle(parsed) {
    if (parsed.title) {
      return parsed.title;
    }

    if (!isImageOnlyDraft(parsed)) {
      return '';
    }

    return describeType(resolvePublishType(parsed)) + ' — ' + formatFallbackPublishDate(parsed.date);
  }

  function setTelem(node, value, signal) {
    if (!node) {
      return;
    }

    if (value) {
      node.textContent = value;
      node.classList.add('live');
      node.classList.toggle('signal', Boolean(signal));
    } else {
      node.textContent = '-';
      node.classList.remove('live');
      node.classList.remove('signal');
    }
  }

  function setMastheadStatus(kind) {
    statusDot.className = 'status-dot';

    if (kind === 'ready' || kind === 'delivered') {
      statusDot.classList.add('live');
    } else if (kind === 'transmitting') {
      statusDot.classList.add('transmitting');
    } else if (kind === 'error') {
      statusDot.classList.add('error');
    }

    statusText.textContent = kind === 'ready' ? 'ready' : kind;
  }

  function triggerFlap(delay) {
    window.setTimeout(() => {
      pigeonMark.classList.remove('flap');
      void pigeonMark.offsetWidth;
      pigeonMark.classList.add('flap');
    }, delay || 0);
  }

  function openTypePanel(forceState) {
    typePanelOpen = typeof forceState === 'boolean' ? forceState : !typePanelOpen;
    typeCollapsible.classList.toggle('open', typePanelOpen);
    typeToggle.classList.toggle('open', typePanelOpen);
    typeToggle.setAttribute('aria-expanded', String(typePanelOpen));
  }

  function syncSelectedType(type, options) {
    const normalizedType = normalizeObjectType(type);
    if (!normalizedType || !typeGrid) {
      return;
    }

    const settings = options || {};
    selectedType = normalizedType;
    typeGrid.querySelectorAll('.type-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.type === normalizedType);
    });

    const selectedButton = typeGrid.querySelector('[data-type="' + normalizedType + '"]');
    if (selectedButton) {
      const icon = selectedButton.querySelector('.type-icon');
      if (icon) {
        typeSelectedIcon.innerHTML = icon.innerHTML;
      }
    }

    typeSelectedBadge.classList.add('visible');
    typeSelectedLabel.textContent = describeType(normalizedType);

    if (settings.closePanel !== false) {
      openTypePanel(false);
    }

    if (!settings.silent) {
      logLine('info', 'Type -> ' + describeType(normalizedType));
    }

    if (settings.source === 'user') {
      typeWasManuallyChosen = true;
    } else if (settings.source === 'default') {
      typeWasManuallyChosen = false;
    }
  }

  function updateReadoutFromParsed(parsed) {
    const type = resolvePublishType(parsed);
    const displayTitle = resolveDisplayTitle(parsed);
    const slug = displayTitle ? slugify(displayTitle) : '';
    const path = type && slug ? collectionPath(type, slug) : '';
    const state = parsed.state || (displayTitle && type && hasPublishableContent(parsed) ? 'ready' : '');
    const axes = isImageOnlyDraft(parsed)
      ? inferAxesFromText({
          objectType: type,
          title: displayTitle,
          body: parsed.body || '',
          existing: parsed.axisOverrides || {},
        })
      : parsed.axes || {
          scale: '',
          depth: '',
          focus: '',
          function: '',
        };

    setTelem(roType, type ? describeType(type) : '', false);
    setTelem(roScale, formatAxisValue('scale', axes.scale), false);
    setTelem(roDepth, formatAxisValue('depth', axes.depth), false);
    setTelem(roFocus, formatAxisValue('focus', axes.focus), false);
    setTelem(roFunction, formatAxisValue('function', axes.function), false);
    setTelem(roSlug, slug, false);
    setTelem(roPath, path, false);
    setTelem(roState, state, true);
  }

  function updateReadoutFromResponse(data) {
    const type = normalizeObjectType(data.objectType || data.object_type) || selectedType;
    const slug = typeof data.slug === 'string' ? data.slug : '';
    const path = type && slug ? collectionPath(type, slug) : '';
    const axes = data && typeof data.axes === 'object' && data.axes
      ? data.axes
      : {};
    setTelem(roType, type ? describeType(type) : '', false);
    setTelem(roScale, formatAxisValue('scale', normalizeAxisScale(axes.scale)), false);
    setTelem(roDepth, formatAxisValue('depth', normalizeAxisDepth(axes.depth)), false);
    setTelem(roFocus, formatAxisValue('focus', normalizeAxisFocus(axes.focus)), false);
    setTelem(roFunction, formatAxisValue('function', normalizeAxisFunction(axes.function)), false);
    setTelem(roSlug, slug, false);
    setTelem(roPath, path, false);
    setTelem(roState, 'published', true);
  }

  function syncAxisControlsFromParsed(parsed) {
    const hasNote = noteField.value.trim().length > 0;
    const resolvedAxes = isImageOnlyDraft(parsed)
      ? inferAxesFromText({
          objectType: resolvePublishType(parsed),
          title: resolveDisplayTitle(parsed),
          body: parsed.body || '',
          existing: parsed.axisOverrides || {},
        })
      : parsed.axes || {};
    const overrides = parsed.axisOverrides || {};

    Object.entries(axisSelects).forEach(([kind, select]) => {
      if (!select) {
        return;
      }

      const resolvedValue = normalizeAxisByKind(kind, resolvedAxes[kind]);
      const overrideValue = normalizeAxisByKind(kind, overrides[kind]);
      const autoOption = select.querySelector('option[value=""]');
      if (autoOption) {
        autoOption.textContent = resolvedValue
          ? 'Auto (' + formatAxisValue(kind, resolvedValue) + ')'
          : 'Auto';
      }

      select.disabled = !hasNote;
      select.value = overrideValue || '';
    });
  }

  function isArmed(parsed) {
    const type = resolvePublishType(parsed);
    const hasRequiredKey = authRequired ? keyField.value.trim().length > 0 : true;
    return Boolean(
      hasPublishableContent(parsed) &&
        resolveDisplayTitle(parsed) &&
        hasValidOrFallbackDate(parsed) &&
        type &&
        hasRequiredKey
    );
  }

  function getTransmitBlocker(parsed, key) {
    const trimmedNote = noteField.value.trim();
    const type = resolvePublishType(parsed);
    const imageOnlyDraft = isImageOnlyDraft(parsed);

    if (!trimmedNote && !hasAttachedImages()) {
      return noNoteMessage;
    }

    if (authRequired && !key) {
      return noKeyMessage;
    }

    if (!parsed.title && !imageOnlyDraft) {
      if (!parsed.hasFrontmatter) {
        return 'Run Smart Draft or start the note with frontmatter and add a title.';
      }

      return parsed.hasTitleField
        ? 'Fill in the title after title: in the frontmatter.'
        : 'Add a title: line in the frontmatter first.';
    }

    if (!parsed.date && !imageOnlyDraft) {
      return parsed.hasDateField
        ? 'Fill in the date after date: in the frontmatter.'
        : 'Run Smart Draft or add a date: line in the frontmatter first.';
    }

    if (parsed.date && Number.isNaN(Date.parse(parsed.date))) {
      return 'Use a valid date in the frontmatter first.';
    }

    if (!type) {
      return 'Choose a type first.';
    }

    if (!parsed.body && !imageOnlyDraft) {
      return 'Add some body text below the frontmatter or attach at least one image first.';
    }

    return '';
  }

  function setTransmitVisualState(state, armed) {
    transmitState = state;
    transmitButton.classList.remove('sending');
    transmitButton.classList.remove('armed');
    transmitBar.classList.remove('ready');
    if (state !== 'delivered') {
      transmitBar.classList.remove('delivered');
    }

    if (state === 'sending') {
      transmitButton.disabled = true;
      transmitButton.setAttribute('aria-disabled', 'true');
      transmitButton.classList.add('sending');
      transmitLabel.textContent = 'Transmitting...';
      setMastheadStatus('transmitting');
      return;
    }

    if (state === 'delivered') {
      transmitButton.disabled = true;
      transmitButton.setAttribute('aria-disabled', 'true');
      transmitBar.classList.add('delivered');
      transmitLabel.textContent = 'Delivered';
      setMastheadStatus('delivered');
      return;
    }

    transmitLabel.textContent = 'Send Pigeon';

    if (armed) {
      transmitButton.disabled = false;
      transmitButton.setAttribute('aria-disabled', 'false');
      transmitButton.classList.add('armed');
      transmitBar.classList.add('ready');
      setMastheadStatus(state === 'error' ? 'error' : 'ready');
      return;
    }

    transmitButton.disabled = false;
    transmitButton.setAttribute('aria-disabled', 'true');
    setMastheadStatus(state === 'error' ? 'error' : 'idle');
  }

  function updateInterface(options) {
    const settings = options || {};
    const parsed = parseFrontmatter(noteField.value);
    charCount.textContent = String(noteField.value.length);

    if (parsed.objectType && parsed.objectType !== selectedType) {
      syncSelectedType(parsed.objectType, { silent: true, closePanel: false });
    } else if (isImageOnlyDraft(parsed) && !typeWasManuallyChosen && resolvePublishType(parsed) !== selectedType) {
      syncSelectedType(resolvePublishType(parsed), { silent: true, closePanel: false, source: 'default' });
    } else if (!typeSelectedBadge.classList.contains('visible')) {
      syncSelectedType(selectedType, { silent: true, closePanel: false });
    }

    updateReadoutFromParsed(parsed);
    syncAxisControlsFromParsed(parsed);

    if (settings.preserveDelivered && transmitState === 'delivered') {
      return parsed;
    }

    const armed = isArmed(parsed);
    setTransmitVisualState(settings.forceError ? 'error' : 'idle', armed);
    return parsed;
  }

  function updateClock() {
    const now = new Date();
    dispatchClock.textContent =
      String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }

  function trimLogLines() {
    while (logArea.querySelectorAll('.log-line').length > 4) {
      const firstLine = logArea.querySelector('.log-line');
      if (!firstLine) {
        break;
      }
      firstLine.remove();
    }
  }

  function logLine(kind, message, options) {
    const now = new Date();
    const timestamp =
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');

    const row = document.createElement('div');
    row.className = 'log-line';

    const time = document.createElement('span');
    time.className = 'log-time';
    time.textContent = timestamp;

    const body = document.createElement('span');
    body.className = 'log-msg' + (kind ? ' ' + kind : '');

    if (options && options.href) {
      const link = document.createElement('a');
      link.className = 'log-link';
      link.href = options.href;
      link.textContent = message;
      if (options.external) {
        link.target = '_blank';
        link.rel = 'noreferrer';
      }
      body.appendChild(link);
    } else {
      body.textContent = message;
    }

    row.appendChild(time);
    row.appendChild(body);
    logArea.appendChild(row);
    trimLogLines();
  }

  function setActionLink(node, href, label, options) {
    if (!node) {
      return false;
    }

    const resolvedHref = typeof href === 'string' && href ? resolveHref(href) : '';
    node.textContent = label;
    node.hidden = !resolvedHref;

    if (!resolvedHref) {
      node.removeAttribute('href');
      node.removeAttribute('target');
      node.removeAttribute('rel');
      return false;
    }

    node.href = resolvedHref;

    if (options && options.external) {
      node.target = '_blank';
      node.rel = 'noreferrer';
    } else {
      node.removeAttribute('target');
      node.removeAttribute('rel');
    }

    return true;
  }

  function clearPublishActions() {
    if (publishActions) {
      publishActions.hidden = true;
    }

    if (publishActionsNote) {
      publishActionsNote.textContent = '';
    }

    setActionLink(openObjectLink, '', 'Open Object');
    setActionLink(openHudLink, '', 'View HUD');
    setActionLink(openCommitLink, '', 'Open Commit');
  }

  function showPublishActions(data) {
    const objectHref =
      typeof data.object_url === 'string' && data.object_url
        ? data.object_url
        : typeof data.url === 'string' && data.url
          ? data.url
          : '';
    const hudHref = typeof data.hud_url === 'string' ? data.hud_url : '';
    const commitHref = typeof data.commitUrl === 'string' ? data.commitUrl : '';

    const hasObject = setActionLink(openObjectLink, objectHref, 'Open Object');
    const hasHud = setActionLink(openHudLink, hudHref, 'View HUD');
    const hasCommit = setActionLink(openCommitLink, commitHref, 'Open Commit', { external: true });

    if (!publishActions) {
      return;
    }

    publishActions.hidden = !(hasObject || hasHud || hasCommit);

    if (publishActionsNote) {
      publishActionsNote.textContent = hasHud
        ? publishedSurfaceScrollMessage
        : publishedSurfaceDefaultMessage;
    }
  }

  function persistDraft() {
    clearPublishActions();
    if (!draftStorageKey) {
      return;
    }

    if (noteField.value) {
      localStorage.setItem(draftStorageKey, noteField.value);
    } else {
      localStorage.removeItem(draftStorageKey);
    }
  }

  function persistKey() {
    if (!keyStorageKey) {
      return;
    }

    const value = keyField.value.trim();
    if (value) {
      localStorage.setItem(keyStorageKey, value);
    } else {
      localStorage.removeItem(keyStorageKey);
    }
  }

  function describeImages(files) {
    if (!files.length) {
      return 'No files';
    }

    if (files.length === 1) {
      return files[0].name;
    }

    return files.length + ' images';
  }

  async function readImageElement(file) {
    if (typeof createImageBitmap === 'function') {
      try {
        return await createImageBitmap(file);
      } catch (error) {
      }
    }

    return await new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
      image.src = objectUrl;
    });
  }

  async function compressImageForUpload(file) {
    if (!file.type.startsWith('image/') || file.size <= 1800000) {
      return file;
    }

    try {
      const image = await readImageElement(file);
      const width = image.width || image.naturalWidth || 0;
      const height = image.height || image.naturalHeight || 0;
      if (!width || !height) {
        return file;
      }

      const maxDimension = 2000;
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        return file;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, outputType, outputType === 'image/png' ? undefined : 0.86);
      });

      if (!(blob instanceof Blob) || blob.size === 0 || blob.size >= file.size) {
        return file;
      }

      return new File([blob], file.name, {
        type: outputType,
        lastModified: Date.now(),
      });
    } catch (error) {
      return file;
    }
  }

  function resolvedCopyUrl() {
    if (copyUrlValue) {
      return copyUrlValue;
    }

    return window.location.href;
  }

  function resolveHref(path) {
    try {
      return new URL(path, window.location.origin).href;
    } catch (error) {
      return path;
    }
  }

  async function handleMarkdownFile() {
    const file = mdFileInput.files && mdFileInput.files[0];
    if (!file) {
      return;
    }

    noteField.value = await file.text();
    persistDraft();
    mdFileName.textContent = file.name;
    mdZone.classList.add('has-file');
    logLine('info', 'File -> ' + file.name);
    updateInterface();
    noteField.focus();
    logLine('', fileLoadedMessage);
  }

  function handleImageFiles() {
    const files = Array.from(imgFileInput.files || []);
    imgFileName.textContent = describeImages(files);
    imgZone.classList.toggle('has-file', files.length > 0);
    if (files.length) {
      logLine('info', describeImages(files) + ' attached');
      logLine('', imageReadyMessage);
    }
    updateInterface();
  }

  function handleKeyInput() {
    persistKey();
    keySavedTag.classList.toggle('visible', keyField.value.trim().length > 0);
    updateInterface();
  }

  function forgetKey() {
    keyField.value = '';
    persistKey();
    keySavedTag.classList.remove('visible');
    updateInterface();
    logLine('info', keyClearedMessage);
  }

  function clearNote() {
    noteField.value = '';
    mdFileInput.value = '';
    imgFileInput.value = '';
    mdFileName.textContent = 'No file';
    imgFileName.textContent = 'No files';
    mdZone.classList.remove('has-file');
    imgZone.classList.remove('has-file');
    if (!typeWasManuallyChosen) {
      syncSelectedType('signal', { silent: true, closePanel: false, source: 'default' });
    }
    persistDraft();
    updateInterface();
    logLine('info', editorClearedMessage);
  }

  function loadTemplate() {
    noteField.value = buildTemplate(selectedType);
    mdFileInput.value = '';
    mdFileName.textContent = 'Template loaded';
    mdZone.classList.remove('has-file');
    persistDraft();
    updateInterface();
    noteField.focus();
    logLine('info', 'Template -> ' + describeType(selectedType));
    logLine('', templateLoadedMessage);
  }

  function setAxisOverride(kind, rawValue) {
    if (!noteField.value.trim()) {
      updateInterface();
      return;
    }

    let parsed = parseFrontmatter(noteField.value);
    if (!parsed.hasFrontmatter) {
      const drafted = smartDraft({ silent: true });
      parsed = drafted && drafted.parsed ? drafted.parsed : parseFrontmatter(noteField.value);
      logLine('info', 'Smart Draft added frontmatter so the axis override can be pinned.');
    }

    const loose = readLooseFrontmatter(noteField.value);
    const fields = { ...loose.fields };
    const order = loose.order.slice();
    const typeKey = Object.prototype.hasOwnProperty.call(fields, 'object_type')
      ? 'object_type'
      : Object.prototype.hasOwnProperty.call(fields, 'type')
        ? 'type'
        : 'object_type';
    const resolvedType = parsed.objectType || selectedType;
    const normalizedValue = normalizeAxisByKind(kind, rawValue);

    if (normalizedValue) {
      fields[kind] = normalizedValue;
    } else {
      delete fields[kind];
    }

    noteField.value = renderFrontmatterNote(fields, order, typeKey, resolvedType, loose.body || parsed.body || '');
    persistDraft();
    const updatedParsed = updateInterface();
    const resolvedAxes = updatedParsed.axes || {};
    const resolvedValue = normalizeAxisByKind(kind, resolvedAxes[kind]);

    if (normalizedValue) {
      logLine('info', axisFieldLabel(kind) + ' pinned -> ' + formatAxisValue(kind, normalizedValue));
      return;
    }

    logLine(
      'info',
      axisFieldLabel(kind) +
        ' -> auto' +
        (resolvedValue ? ' (' + formatAxisValue(kind, resolvedValue) + ')' : '')
    );
  }

  function applySelectedTypeToNote(nextType) {
    const normalizedType = normalizeObjectType(nextType);
    if (!normalizedType || !noteField.value.trim()) {
      return false;
    }

    const parsed = parseFrontmatter(noteField.value);
    const loose = readLooseFrontmatter(noteField.value);
    const hasTypeKey =
      Object.prototype.hasOwnProperty.call(loose.fields, 'object_type') ||
      Object.prototype.hasOwnProperty.call(loose.fields, 'type');

    if (!parsed.hasFrontmatter && !hasTypeKey) {
      return false;
    }

    const fields = { ...loose.fields };
    const order = loose.order.slice();
    const typeKey = Object.prototype.hasOwnProperty.call(fields, 'object_type')
      ? 'object_type'
      : Object.prototype.hasOwnProperty.call(fields, 'type')
        ? 'type'
        : 'object_type';

    if (fields[typeKey] === normalizedType) {
      return false;
    }

    fields[typeKey] = normalizedType;
    noteField.value = renderFrontmatterNote(fields, order, typeKey, normalizedType, loose.body || parsed.body || '');
    persistDraft();
    updateInterface();
    logLine('info', 'Type pinned -> ' + describeType(normalizedType));
    return true;
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(resolvedCopyUrl());
      logLine('ok', copySuccessMessage);
    } catch (error) {
      logLine('err', copyFailureMessage);
    }
  }

  async function transmit() {
    let parsed = parseFrontmatter(noteField.value);
    const key = keyField.value.trim();

    if (
      noteField.value.trim() &&
      !isImageOnlyDraft(parsed) &&
      (!parsed.hasFrontmatter || !parsed.title || !parsed.date)
    ) {
      const drafted = smartDraft({ silent: true, fromTransmit: true });
      parsed = drafted && drafted.parsed ? drafted.parsed : parseFrontmatter(noteField.value);
      updateInterface();
      logLine('info', smartDraftReadyMessage);
      return;
    }

    const resolvedType = resolvePublishType(parsed);
    const blocker = getTransmitBlocker(parsed, key);

    if (blocker) {
      updateInterface({ forceError: true });
      logLine('err', blocker);
      return;
    }

    setTransmitVisualState('sending', false);
    clearPublishActions();
    triggerFlap(0);
    logLine('info', preparingMessage);

    try {
      const formData = new FormData();
      formData.append('note', noteField.value.trim());
      formData.append('object_type', resolvedType);

      const selectedImages = Array.from(imgFileInput.files || []);
      if (selectedImages.length) {
        logLine('info', preparingImagesMessage);
      }

      const preparedImages = await Promise.all(selectedImages.map((file) => compressImageForUpload(file)));
      preparedImages.forEach((file) => {
        formData.append('images', file, file.name);
      });

      const headers = {};
      if (key) {
        headers.Authorization = 'Bearer ' + key;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData,
      });

      const text = await response.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch (error) {
        data = null;
      }

      if (!response.ok) {
        throw new Error((data && (data.error || data.detail)) || text || ('HTTP ' + response.status));
      }

      updateReadoutFromResponse(data || {});
      setTransmitVisualState('delivered', false);
      triggerFlap(300);
      logLine('ok', (data && data.note) || successMessage);
      showPublishActions(data || {});

      if (data && typeof data.object_url === 'string' && data.object_url) {
        logLine('info', 'Open published entry', {
          href: resolveHref(data.object_url),
        });
      }

      if (data && typeof data.hud_url === 'string' && data.hud_url) {
        logLine('info', 'Open HUD', {
          href: resolveHref(data.hud_url),
        });
      }

      if (data && typeof data.commitUrl === 'string' && data.commitUrl) {
        logLine('info', 'Open commit', {
          href: data.commitUrl,
          external: true,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message ? error.message : networkErrorMessage;
      const armed = isArmed(parsed);
      setTransmitVisualState('error', armed);
      logLine('err', message || networkErrorMessage);
    }
  }

  typeToggle.addEventListener('click', () => {
    openTypePanel();
  });

  typeGrid.querySelectorAll('.type-btn').forEach((button) => {
    button.addEventListener('click', () => {
      syncSelectedType(button.dataset.type, { silent: false, closePanel: true, source: 'user' });
      if (!applySelectedTypeToNote(button.dataset.type)) {
        updateInterface();
      }
    });
  });

  noteField.addEventListener('input', () => {
    persistDraft();
    updateInterface();
  });

  Object.entries(axisSelects).forEach(([kind, select]) => {
    if (!select) {
      return;
    }

    select.addEventListener('change', () => {
      setAxisOverride(kind, select.value);
    });
  });

  mdFileInput.addEventListener('change', handleMarkdownFile);
  imgFileInput.addEventListener('change', handleImageFiles);
  keyField.addEventListener('input', handleKeyInput);
  forgetKeyButton.addEventListener('click', forgetKey);
  clearNoteButton.addEventListener('click', clearNote);
  smartDraftButton.addEventListener('click', () => {
    smartDraft();
  });
  loadTemplateButton.addEventListener('click', loadTemplate);
  copyUrlButton.addEventListener('click', copyUrl);
  transmitButton.addEventListener('click', transmit);

  if (keyStorageKey) {
    keyField.value = localStorage.getItem(keyStorageKey) || '';
    keySavedTag.classList.toggle('visible', keyField.value.trim().length > 0);
  }

  if (draftStorageKey) {
    noteField.value = localStorage.getItem(draftStorageKey) || '';
  }

  updateClock();
  window.setInterval(updateClock, 30000);

  syncSelectedType('signal', { silent: true, closePanel: false, source: 'default' });
  updateInterface();

  if (noteField.value.trim()) {
    logLine('info', restoredDraftMessage);
  }
})();
`;
