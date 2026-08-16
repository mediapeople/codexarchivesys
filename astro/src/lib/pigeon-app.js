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
  font-size: 17.6px;
}

body {
  margin: 0;
  min-height: 100vh;
  overflow-x: hidden;
  background: var(--paper);
  color: var(--body);
  font-family: 'Courier Prime', 'Courier New', monospace;
  font-size: 16.5px;
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
textarea,
select {
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
  font-size: 20px;
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
  font-size: 14px;
  color: var(--body);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.masthead-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 15px;
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
  font-size: 15px;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.coord-label {
  color: var(--muted);
  font-size: 15px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.section-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
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
  font-size: 16px;
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
  font-size: 13px;
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
  font-size: 16px;
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
  font-size: 13px;
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
  font-size: 15px;
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
  font-size: 14px;
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
  font-size: 16px;
  line-height: 1.5;
}

.note-field::placeholder,
.key-field::placeholder {
  color: var(--muted);
}

.template-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
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
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.axis-copy {
  color: var(--muted);
  font-size: 13px;
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
  font-size: 13px;
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

.orientation-shell {
  margin-top: 12px;
  padding: 16px;
  border-top: 1px solid var(--rule);
  background:
    linear-gradient(180deg, rgba(184, 115, 51, 0.05), rgba(184, 115, 51, 0.01)),
    rgba(255, 255, 255, 0.01);
}

.orientation-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.orientation-title {
  color: var(--light);
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.orientation-copy {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.object-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.object-form-btn {
  min-height: 40px;
  padding: 10px 14px;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--muted);
  cursor: pointer;
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s, background 0.15s, box-shadow 0.15s;
}

.object-form-btn:hover,
.object-form-btn.suggested {
  color: var(--light);
  border-color: var(--rule-bright);
  background: var(--field-raise);
}

.object-form-btn.active {
  color: var(--white);
  box-shadow: inset 0 0 0 1px currentColor;
}

.object-form-btn[data-object-form='bubble'].active,
.object-form-btn[data-object-form='bubble'].suggested {
  color: #ffcf88;
  border-color: rgba(255, 207, 136, 0.55);
  background: rgba(176, 107, 45, 0.18);
}

.object-form-btn[data-object-form='coordinate'].active,
.object-form-btn[data-object-form='coordinate'].suggested {
  color: #9ad5ff;
  border-color: rgba(108, 176, 222, 0.55);
  background: rgba(37, 78, 106, 0.22);
}

.object-form-btn[data-object-form='creature'].active,
.object-form-btn[data-object-form='creature'].suggested {
  color: #a4edb1;
  border-color: rgba(110, 176, 124, 0.55);
  background: rgba(38, 76, 47, 0.22);
}

.object-form-btn--ghost {
  border-style: dashed;
}

.orientation-suggestion {
  margin: 12px 0 0;
  color: var(--body);
  font-size: 14px;
  line-height: 1.55;
}

.orientation-prompts {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.orientation-field,
.media-intent-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.orientation-label,
.media-intent-label {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.orientation-input,
.media-intent-input,
.media-intent-select {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--rule);
  outline: none;
  background: var(--paper);
  color: var(--white);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.orientation-input:focus,
.media-intent-input:focus,
.media-intent-select:focus {
  border-color: var(--copper-dim);
  box-shadow: 0 0 0 1px var(--copper-dim);
}

.trace-panel {
  margin-top: 14px;
  border-top: 1px solid var(--rule);
  padding-top: 12px;
}

.trace-panel summary {
  cursor: pointer;
  color: var(--amber);
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.trace-grid {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.related-shell {
  margin-top: 12px;
  padding: 16px;
  border-top: 1px solid var(--rule);
  background:
    linear-gradient(180deg, rgba(157, 178, 116, 0.06), rgba(157, 178, 116, 0.015)),
    rgba(255, 255, 255, 0.01);
}

.related-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.related-title {
  color: var(--light);
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.related-copy {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.related-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.related-card {
  padding: 14px;
  border: 1px solid var(--rule);
  background: rgba(255, 255, 255, 0.02);
}

.related-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.related-card-title {
  color: var(--white);
  font-size: 15px;
  line-height: 1.4;
}

.related-card-meta {
  margin-top: 6px;
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.related-card-note {
  margin: 10px 0 0;
  color: var(--body);
  font-size: 14px;
  line-height: 1.55;
}

.related-card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.related-card-action,
.related-card-link {
  min-height: 38px;
  padding: 9px 12px;
  border: 1px solid var(--rule);
  background: var(--paper);
  color: var(--light);
  cursor: pointer;
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.related-card-action:hover,
.related-card-link:hover {
  border-color: var(--rule-bright);
  background: var(--field-raise);
}

.related-card-action[disabled] {
  cursor: default;
  opacity: 0.7;
}

.media-intent-panel {
  margin-top: 14px;
  padding: 16px;
  border: 1px solid var(--rule);
  background: rgba(255, 255, 255, 0.02);
}

.media-intent-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.media-intent-title {
  color: var(--light);
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.media-intent-copy {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.media-intent-grid {
  display: grid;
  gap: 12px;
}

.media-intent-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--rule);
  background: rgba(255, 255, 255, 0.015);
}

.media-intent-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.media-intent-file {
  color: var(--light);
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.media-intent-meta {
  color: var(--muted);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}

.media-intent-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.media-intent-toggle {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--body);
  font-size: 13px;
}

.media-intent-toggle input {
  margin: 0;
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
  font-size: 14px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.file-name {
  display: block;
  margin-top: 5px;
  color: var(--amber);
  font-size: 14px;
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
  font-size: 16px;
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
  font-size: 13px;
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
  font-size: 13px;
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
  font-size: 15px;
}

.telem-key {
  color: var(--muted);
  font-size: 13px;
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
  font-size: 14px;
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
  font-size: 15px;
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
      <div class="orientation-shell">
        <div class="orientation-head">
          <span class="orientation-title">Object Form</span>
          <span class="orientation-copy">Optional guidance only. Lock it if you know, or let Pigeon suggest lightly.</span>
        </div>
        <div class="object-form-row" id="objectFormRow">
          <button class="object-form-btn" data-object-form="bubble" type="button">Bubble</button>
          <button class="object-form-btn" data-object-form="coordinate" type="button">Coordinate</button>
          <button class="object-form-btn" data-object-form="creature" type="button">Creature</button>
          <button class="object-form-btn object-form-btn--ghost" id="objectFormClearButton" type="button">Clear</button>
        </div>
        <p class="orientation-suggestion" id="objectFormSuggestion" hidden></p>
        <div class="orientation-prompts" id="orientationPrompts" hidden>
          <label class="orientation-field" id="orientationFieldOneWrap" hidden>
            <span class="orientation-label" id="orientationFieldOneLabel"></span>
            <input class="orientation-input" id="orientationFieldOneInput" type="text" autocomplete="off" />
          </label>
          <label class="orientation-field" id="orientationFieldTwoWrap" hidden>
            <span class="orientation-label" id="orientationFieldTwoLabel"></span>
            <input class="orientation-input" id="orientationFieldTwoInput" type="text" autocomplete="off" />
          </label>
        </div>
        <details class="trace-panel" id="tracePanel">
          <summary>Trace</summary>
          <div class="trace-grid">
            <label class="orientation-field">
              <span class="orientation-label">Pull</span>
              <input class="orientation-input" id="tracePullInput" type="text" autocomplete="off" />
            </label>
            <label class="orientation-field">
              <span class="orientation-label">Selection Note</span>
              <input class="orientation-input" id="traceSelectionInput" type="text" autocomplete="off" />
            </label>
            <label class="orientation-field">
              <span class="orientation-label">Interruptions</span>
              <input class="orientation-input" id="traceInterruptionsInput" type="text" autocomplete="off" placeholder="comma-separated" />
            </label>
          </div>
        </details>
        <div class="related-shell" id="relatedSuggestionsPanel" hidden>
          <div class="related-head">
            <span class="related-title">Related Suggestions</span>
            <span class="related-copy" id="relatedSuggestionsNote">Smart Draft can surface nearby objects and likely seed links. Add only what feels real.</span>
          </div>
          <div class="related-list" id="relatedSuggestionsList"></div>
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
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif" multiple id="imgFiles" />
        <span class="file-icon">[]</span>
        <span class="file-label">Images</span>
        <span class="file-name" id="imgFileName">No files</span>
      </label>
    </div>
    <div class="media-intent-panel" id="mediaIntentPanel" hidden></div>
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
          <span class="telem-key">Title</span>
          <span class="telem-val" id="roTitle">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Excerpt</span>
          <span class="telem-val" id="roExcerpt">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Hero</span>
          <span class="telem-val" id="roHero">-</span>
        </div>
        <div class="telem-row">
          <span class="telem-key">Form</span>
          <span class="telem-val" id="roForm">-</span>
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
  const objectFormButtons = Array.from(document.querySelectorAll('[data-object-form]'));
  const objectFormClearButton = document.getElementById('objectFormClearButton');
  const objectFormSuggestion = document.getElementById('objectFormSuggestion');
  const orientationPrompts = document.getElementById('orientationPrompts');
  const orientationFieldOneWrap = document.getElementById('orientationFieldOneWrap');
  const orientationFieldOneLabel = document.getElementById('orientationFieldOneLabel');
  const orientationFieldOneInput = document.getElementById('orientationFieldOneInput');
  const orientationFieldTwoWrap = document.getElementById('orientationFieldTwoWrap');
  const orientationFieldTwoLabel = document.getElementById('orientationFieldTwoLabel');
  const orientationFieldTwoInput = document.getElementById('orientationFieldTwoInput');
  const tracePanel = document.getElementById('tracePanel');
  const tracePullInput = document.getElementById('tracePullInput');
  const traceSelectionInput = document.getElementById('traceSelectionInput');
  const traceInterruptionsInput = document.getElementById('traceInterruptionsInput');
  const relatedSuggestionsPanel = document.getElementById('relatedSuggestionsPanel');
  const relatedSuggestionsNote = document.getElementById('relatedSuggestionsNote');
  const relatedSuggestionsList = document.getElementById('relatedSuggestionsList');
  const charCount = document.getElementById('charCount');
  const mdFileInput = document.getElementById('mdFile');
  const mdFileName = document.getElementById('mdFileName');
  const mdZone = document.getElementById('mdZone');
  const imgFileInput = document.getElementById('imgFiles');
  const imgFileName = document.getElementById('imgFileName');
  const imgZone = document.getElementById('imgZone');
  const mediaIntentPanel = document.getElementById('mediaIntentPanel');
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
  const openCommitLink = document.getElementById('openCommitLink');
  const transmitBar = document.getElementById('transmitBar');
  const transmitButton = document.getElementById('transmitButton');
  const transmitLabel = document.getElementById('transmitLabel');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const dispatchClock = document.getElementById('dispatchClock');
  const logArea = document.getElementById('logArea');
  const roType = document.getElementById('roType');
  const roTitle = document.getElementById('roTitle');
  const roExcerpt = document.getElementById('roExcerpt');
  const roHero = document.getElementById('roHero');
  const roForm = document.getElementById('roForm');
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
  const captureStorageKey = draftStorageKey ? draftStorageKey + ':capture' : '';
  let objectFormLock = '';
  let dismissedObjectFormSuggestion = '';
  let captureFieldState = {
    holds_under_isolation: '',
    field_break: '',
    survives_alone: '',
    pressure: '',
    selection_note: '',
    pull: '',
    interruptions: '',
  };
  let mediaIntentState = [];
  let archiveContextItems = [];
  let archiveContextStatus = 'idle';
  let archiveContextPromise = null;
  let relatedSuggestionState = [];

  const ARRAY_FIELDS = new Set([
    'actions',
    'classification',
    'dependencies',
    'featured',
    'images',
    'markers',
    'media',
    'related',
    'tags',
    'themes',
  ]);
  const RAW_BLOCK_PROTECTED_KEYS = new Set([
    'media',
    'slug',
    'connections',
    'includedobjects',
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

  const OBJECT_FORM_LABELS = {
    bubble: 'Bubble',
    coordinate: 'Coordinate',
    creature: 'Creature',
  };

  const OBJECT_FORM_DESCRIPTIONS = {
    bubble: 'Language that can survive alone.',
    coordinate: 'Form that still holds under isolation.',
    creature: 'A live pattern responding to pressure.',
  };

  const OBJECT_FORM_PROMPTS = {
    bubble: [
      {
        key: 'survives_alone',
        label: 'Does this survive alone?',
        placeholder: 'What still holds when it stands by itself?',
      },
    ],
    coordinate: [
      {
        key: 'holds_under_isolation',
        label: 'Would this hold without its surroundings?',
        placeholder: 'What keeps its shape when isolated?',
      },
      {
        key: 'field_break',
        label: 'What broke the field?',
        placeholder: 'Name the interruption or rupture.',
      },
    ],
    creature: [
      {
        key: 'pressure',
        label: 'What pressure is being solved?',
        placeholder: 'What live pressure is this responding to?',
      },
    ],
  };

  const OBJECT_FORM_PRIORS = {
    signal: { bubble: 2.2, coordinate: 0.3 },
    fragment: { bubble: 2.7 },
    fieldlog: { creature: 1.6, coordinate: 0.8 },
    artifact: { coordinate: 2.4 },
    scroll: { creature: 1.2, bubble: 0.6, coordinate: 0.5 },
    codex: { coordinate: 1.9, creature: 0.5 },
    loremap: { coordinate: 2.5 },
    nexus: { creature: 1.7, coordinate: 0.9 },
  };

  const OBJECT_FORM_KEYWORDS = {
    bubble: [
      { pattern: /\b(fragment|phrase|line|caption|tagline|epigram|poem|verse|stanza|short note)\b/g, weight: 0.9 },
      { pattern: /\b(alone|standalone|self-contained|self contained|independent|portable)\b/g, weight: 0.75 },
      { pattern: /^>\s.+$/gm, weight: 0.8 },
    ],
    coordinate: [
      { pattern: /\b(image|photo|frame|surface|layout|diagram|map|screenshot|plate|specimen|artifact)\b/g, weight: 0.72 },
      { pattern: /\b(isolate|isolation|structure|composition|geometry|boundary|position|coordinate)\b/g, weight: 0.82 },
      { pattern: /\b(crop|detail|scan|reference|view|screen|field break)\b/g, weight: 0.55 },
    ],
    creature: [
      { pattern: /\b(pressure|tension|adapt|response|behavior|survive|survival|metabol|organism|living pattern)\b/g, weight: 0.9 },
      { pattern: /\b(loop|feedback|react|reactive|solving|coping|strain|drift|repair)\b/g, weight: 0.72 },
      { pattern: /\b(what it wants|what it does|how it moves|how it changes)\b/g, weight: 0.72 },
    ],
  };

  const MEDIA_INTENT_ROLE_OPTIONS = ['hero', 'gallery', 'detail', 'scan', 'process', 'reference'];
  const RELATED_SUGGESTION_LIMIT = 3;
  const RELATED_ENDPOINTS = ['/feed.json', '/objects.json'];
  const RELATED_TYPE_PRIORS = {
    signal: { signal: 0.35, fragment: 1.1, codex: 0.7, scroll: 0.45 },
    fragment: { fragment: 0.5, signal: 0.8, scroll: 1.25, codex: 0.9, fieldlog: 0.7 },
    fieldlog: { fieldlog: 0.45, fragment: 0.95, codex: 0.85, scroll: 0.95, artifact: 0.55 },
    artifact: { artifact: 0.35, loremap: 0.8, fieldlog: 0.5, scroll: 0.35 },
    scroll: { scroll: 0.4, fragment: 1.35, codex: 0.9, fieldlog: 0.8, signal: 0.55 },
    codex: { codex: 0.5, fragment: 1.15, scroll: 0.8, fieldlog: 0.65, signal: 0.7 },
    loremap: { loremap: 0.45, artifact: 0.75, fieldlog: 0.45, scroll: 0.3 },
    nexus: { nexus: 0.35, scroll: 0.8, codex: 0.8, fieldlog: 0.7, signal: 0.65, fragment: 0.75 },
  };

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function normalizeObjectForm(value) {
    if (typeof value !== 'string') {
      return '';
    }

    const normalized = value.trim().toLowerCase();
    return OBJECT_FORM_LABELS[normalized] ? normalized : '';
  }

  function objectFormLabel(value) {
    const normalized = normalizeObjectForm(value);
    return normalized ? OBJECT_FORM_LABELS[normalized] : '';
  }

  function objectFormDescription(value) {
    const normalized = normalizeObjectForm(value);
    return normalized ? OBJECT_FORM_DESCRIPTIONS[normalized] : '';
  }

  function normalizeCaptureFieldValue(value) {
    return String(value || '').trim();
  }

  function splitCaptureList(value) {
    return String(value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function normalizeFlexibleStringArray(value) {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    }

    if (typeof value === 'string') {
      return parseFrontmatterArray(value)
        .map((item) => String(item || '').trim())
        .filter(Boolean);
    }

    return [];
  }

  function uniqueStrings(values) {
    const seen = new Set();
    return values.filter((value) => {
      const normalized = String(value || '').trim();
      if (!normalized) {
        return false;
      }

      const key = normalized.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
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
      excerpt: '',
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
      related: [],
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
    result.excerpt =
      parseFrontmatterScalar((fields.get('excerpt') && fields.get('excerpt')[0]) || '') ||
      parseFrontmatterScalar((fields.get('summary') && fields.get('summary')[0]) || '');
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
    result.related = (fields.get('related') || []).flatMap(parseFrontmatterArray);
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
      if (!/^(title|caption|date|object_type|objecttype|type|state|tags|images|summary|excerpt|id|status|visibility|themes|media|scale|depth|focus|function|related)$/.test(firstKey)) {
        return null;
      }
    }

    const fields = new Map();
    const entries = [];
    let currentKey = '';
    let bodyStartIndex = -1;
    let currentEntry = null;

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
        if (currentEntry) {
          currentEntry.rawLines.push(trimmedLine);
        }
        continue;
      }

      const fieldMatch = trimmedLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (fieldMatch) {
        currentKey = fieldMatch[1].toLowerCase();
        const value = fieldMatch[2].trim();
        fields.set(currentKey, value ? [value] : []);
        currentEntry = {
          key: currentKey,
          rawLines: [trimmedLine],
        };
        entries.push(currentEntry);
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
        if (currentEntry) {
          currentEntry.rawLines.push(trimmedLine);
        }
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
      entries,
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
    const rawBlocks = {};

    if (!parsedFrontmatter) {
      const smartImageDraft = parseSmartImageDraft(normalized);
      if (smartImageDraft) {
        return {
          fields: { caption: smartImageDraft.caption },
          order: ['caption'],
          rawBlocks,
          body: '',
        };
      }

      return {
        fields,
        order,
        rawBlocks,
        body: normalized.trim(),
      };
    }

    parsedFrontmatter.entries.forEach((entry) => {
      rawBlocks[entry.key] = entry.rawLines.slice();
    });

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
        rawBlocks,
        body: '',
      };
    }

    return {
      fields,
      order,
      rawBlocks,
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

  function extractObjectSlug(value) {
    const raw = String(value || '').trim();
    if (!raw) {
      return '';
    }

    if (raw.startsWith('codex://object/')) {
      return decodeURIComponent(raw.slice('codex://object/'.length)).trim();
    }

    try {
      const url = new URL(raw, window.location.origin);
      const match = url.pathname.match(/^\/(?:objects|codex|nexus)\/([^/]+)\/?$/i);
      return match && match[1] ? decodeURIComponent(match[1]).trim() : raw;
    } catch (error) {
      return raw.replace(/^\/+|\/+$/g, '');
    }
  }

  function tokenizeSimilarityText(value) {
    const plain = plainTextFromMarkdown(value).toLowerCase();
    if (!plain) {
      return [];
    }

    return uniqueStrings(
      (plain.match(/[a-z0-9][a-z0-9-]{2,}/g) || []).filter(
        (token) => !SMART_STOPWORDS.has(token)
      )
    );
  }

  function intersectStrings(left, right) {
    const rightSet = new Set((right || []).map((value) => String(value || '').toLowerCase()));
    return uniqueStrings(left || []).filter((value) => rightSet.has(String(value || '').toLowerCase()));
  }

  function normalizeArchiveContextItem(item) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const slug = extractObjectSlug(item.archive_id || item.id || item.slug || item.url || '');
    const type = normalizeObjectType(item.type);
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    const summary = typeof item.summary === 'string' ? item.summary.trim() : '';
    const contentText =
      typeof item.content_text === 'string'
        ? item.content_text
        : typeof item.contentText === 'string'
          ? item.contentText
          : '';
    const tags = uniqueStrings(
      normalizeFlexibleStringArray(item.tags).map((value) => normalizeTagCandidate(value)).filter(Boolean)
    );
    const keywords = uniqueStrings(
      normalizeFlexibleStringArray(item.keywords).map((value) => normalizeTagCandidate(value)).filter(Boolean)
    );
    const objectForm = normalizeObjectForm(
      item.object_form ||
        item.objectForm ||
        (item.capture && typeof item.capture === 'object' ? item.capture.object_form : '')
    );
    const url =
      typeof item.url === 'string' && item.url
        ? item.url
        : slug
          ? (type === 'codex' ? '/codex/' + slug + '/' : '/objects/' + slug + '/')
          : '';

    if (!slug || !type || !title) {
      return null;
    }

    const titlePlain = plainTextFromMarkdown(title).toLowerCase();
    const summaryPlain = plainTextFromMarkdown(summary).toLowerCase();
    const searchPlain = plainTextFromMarkdown([title, summary, contentText].join('\n')).toLowerCase();
    const titleTokens = tokenizeSimilarityText(title);
    const summaryTokens = tokenizeSimilarityText(summary);
    const contentTokens = tokenizeSimilarityText(contentText).slice(0, 72);
    const tokens = uniqueStrings([
      ...titleTokens,
      ...summaryTokens,
      ...contentTokens,
      ...tags,
      ...keywords,
    ]);

    return {
      slug,
      ref: slug,
      url,
      type,
      title,
      summary,
      objectForm,
      tags,
      keywords,
      titlePlain,
      summaryPlain,
      searchPlain,
      titleTokens,
      summaryTokens,
      tokens,
    };
  }

  async function loadArchiveContextItems() {
    if (archiveContextStatus === 'loaded') {
      return archiveContextItems;
    }

    if (archiveContextPromise) {
      return archiveContextPromise;
    }

    archiveContextStatus = 'loading';
    archiveContextPromise = (async () => {
      for (const endpointPath of RELATED_ENDPOINTS) {
        try {
          const response = await fetch(resolveHref(endpointPath), {
            headers: {
              Accept: 'application/json',
            },
            cache: 'force-cache',
          });
          if (!response.ok) {
            continue;
          }

          const payload = await response.json();
          const items = Array.isArray(payload && payload.items) ? payload.items : [];
          const normalizedItems = items
            .map((item) => normalizeArchiveContextItem(item))
            .filter(Boolean);

          if (normalizedItems.length > 0) {
            archiveContextItems = normalizedItems;
            archiveContextStatus = 'loaded';
            archiveContextPromise = null;
            updateInterface();
            return archiveContextItems;
          }
        } catch (error) {
          // Keep trying the next endpoint.
        }
      }

      archiveContextItems = [];
      archiveContextStatus = 'error';
      archiveContextPromise = null;
      updateInterface();
      return archiveContextItems;
    })();

    return archiveContextPromise;
  }

  function primeArchiveContextItems() {
    if (archiveContextStatus === 'idle') {
      void loadArchiveContextItems();
    }
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
    const normalizedBody = normalizeRawNote(body);
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
    const headingCount = (normalizedBody.match(/^\s{0,3}#{1,6}\s+/gm) || []).length;

    if (/^##\s+(context|observation|notes?|actions?)\b/im.test(body)) {
      scores.fieldlog += 2.8;
    }

    if (/\b(materials?|condition|artifact|relic|specimen|dimensions?)\b/i.test(body)) {
      scores.artifact += 2.4;
    }

    if (/\b(latitude|longitude|coordinates?|terrain|region|district|river|mount|location)\b/i.test(body)) {
      scores.loremap += 2.4;
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
      if (typeWasManuallyChosen) {
        return selectedType;
      }

      const nonEmptyLines = normalizedBody
        .split('\n')
        .map((line) => plainTextFromMarkdown(line).trim())
        .filter(Boolean);
      const shortLineCount = nonEmptyLines.filter(
        (line) => line.split(/\s+/).filter(Boolean).length <= 6
      ).length;
      const shortLineRatio = nonEmptyLines.length ? shortLineCount / nonEmptyLines.length : 0;
      const stanzaBreakCount = (normalizedBody.match(/\n\s*\n/g) || []).length;

      if (
        wordCount >= 60 &&
        nonEmptyLines.length >= 12 &&
        shortLineRatio >= 0.7 &&
        stanzaBreakCount >= 4
      ) {
        return 'scroll';
      }

      return 'codex';
    }

    return ranked[0][0];
  }

  function inferObjectForm(parsed) {
    const resolvedType = resolvePublishType(parsed);
    const plain = plainTextFromMarkdown(
      (parsed.title || '') + '\n' + (parsed.body || parsed.caption || noteField.value || '')
    ).toLowerCase();
    const scores = {
      bubble: 0,
      coordinate: 0,
      creature: 0,
    };
    const priors = OBJECT_FORM_PRIORS[resolvedType];
    const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    const headingCount = (normalizeRawNote(parsed.body || '').match(/^\s{0,3}#{1,6}\s+/gm) || []).length;

    if (priors) {
      Object.entries(priors).forEach(([form, weight]) => {
        scores[form] += weight;
      });
    }

    Object.entries(OBJECT_FORM_KEYWORDS).forEach(([form, rules]) => {
      rules.forEach((rule) => {
        const matches = countMatches(rule.pattern, plain);
        if (matches > 0) {
          scores[form] += matches * rule.weight;
        }
      });
    });

    if (hasAttachedImages()) {
      scores.coordinate += selectedImageCount() > 1 ? 1.25 : 0.95;
    }

    if (isImageOnlyDraft(parsed)) {
      scores.coordinate += 0.8;
    }

    if (wordCount > 0 && wordCount <= 42 && headingCount === 0) {
      scores.bubble += 0.65;
    }

    if (wordCount > 180) {
      scores.creature += 0.25;
      scores.coordinate += 0.2;
    }

    if (parsed.axes && parsed.axes.function === 'diagnostic') {
      scores.coordinate += 0.35;
      scores.creature += 0.35;
    }

    if (parsed.axes && parsed.axes.focus === 'witness') {
      scores.bubble += 0.25;
      scores.creature += 0.25;
    }

    const ranked = Object.entries(scores).sort((left, right) => {
      if (left[1] === right[1]) {
        return ['bubble', 'coordinate', 'creature'].indexOf(left[0]) - ['bubble', 'coordinate', 'creature'].indexOf(right[0]);
      }
      return right[1] - left[1];
    });

    if (!ranked.length || ranked[0][1] < 1.2) {
      return {
        form: '',
        message: '',
      };
    }

    const normalizedForm = normalizeObjectForm(ranked[0][0]);
    const description = objectFormDescription(normalizedForm);
    return {
      form: normalizedForm,
      message: normalizedForm ? 'Suggestion: ' + objectFormLabel(normalizedForm) + '. ' + description : '',
    };
  }

  function getSuggestedObjectForm(parsed) {
    const suggestion = inferObjectForm(parsed);
    if (!suggestion.form) {
      return { form: '', message: '' };
    }

    if (dismissedObjectFormSuggestion && dismissedObjectFormSuggestion === suggestion.form) {
      return { form: '', message: '' };
    }

    return suggestion;
  }

  function getActiveObjectForm(parsed) {
    return normalizeObjectForm(objectFormLock) || normalizeObjectForm(getSuggestedObjectForm(parsed).form);
  }

  function getObjectFormPreview(parsed) {
    const suggestion = getSuggestedObjectForm(parsed);
    const lockedForm = normalizeObjectForm(objectFormLock);
    const form = lockedForm || normalizeObjectForm(suggestion.form);
    if (!form) {
      return { form: '', source: '', message: '' };
    }

    if (lockedForm) {
      return {
        form: lockedForm,
        source: 'lock',
        message: 'Locked as ' + objectFormLabel(lockedForm) + '. Clear to return to suggestion mode.',
      };
    }

    return {
      form,
      source: 'suggestion',
      message: suggestion.message,
    };
  }

  function syncObjectFormButtons(parsed) {
    const preview = getObjectFormPreview(parsed);
    objectFormButtons.forEach((button) => {
      const normalized = normalizeObjectForm(button.dataset.objectForm);
      button.classList.toggle('active', Boolean(normalized && normalized === preview.form && preview.source === 'lock'));
      button.classList.toggle('suggested', Boolean(normalized && normalized === preview.form && preview.source === 'suggestion'));
    });

    if (objectFormClearButton) {
      objectFormClearButton.textContent = preview.source === 'lock' ? 'Unlock' : 'Clear';
    }

    if (objectFormSuggestion) {
      if (preview.message) {
        objectFormSuggestion.hidden = false;
        objectFormSuggestion.textContent = preview.message;
      } else {
        objectFormSuggestion.hidden = true;
        objectFormSuggestion.textContent = '';
      }
    }
  }

  function setOrientationPromptField(wrap, labelNode, inputNode, config) {
    if (!wrap || !labelNode || !inputNode) {
      return;
    }

    if (!config) {
      wrap.hidden = true;
      labelNode.textContent = '';
      inputNode.value = '';
      inputNode.removeAttribute('data-capture-key');
      inputNode.placeholder = '';
      return;
    }

    wrap.hidden = false;
    labelNode.textContent = config.label;
    inputNode.setAttribute('data-capture-key', config.key);
    inputNode.placeholder = config.placeholder || '';
    inputNode.value = captureFieldState[config.key] || '';
  }

  function syncOrientationPrompts(parsed) {
    const form = getActiveObjectForm(parsed);
    const prompts = form ? OBJECT_FORM_PROMPTS[form] || [] : [];
    const hasPrompts = prompts.length > 0;

    if (orientationPrompts) {
      orientationPrompts.hidden = !hasPrompts;
    }

    setOrientationPromptField(
      orientationFieldOneWrap,
      orientationFieldOneLabel,
      orientationFieldOneInput,
      hasPrompts ? prompts[0] : null
    );
    setOrientationPromptField(
      orientationFieldTwoWrap,
      orientationFieldTwoLabel,
      orientationFieldTwoInput,
      hasPrompts ? prompts[1] : null
    );
  }

  function hasCaptureFieldContent() {
    return Object.values(captureFieldState).some((value) => normalizeCaptureFieldValue(value).length > 0);
  }

  function hasPersistableCaptureState() {
    return Boolean(
      normalizeObjectForm(objectFormLock) ||
        hasCaptureFieldContent() ||
        (tracePanel && tracePanel.open)
    );
  }

  function persistCaptureState() {
    if (!captureStorageKey) {
      return;
    }

    if (!hasPersistableCaptureState()) {
      localStorage.removeItem(captureStorageKey);
      return;
    }

    localStorage.setItem(
      captureStorageKey,
      JSON.stringify({
        objectFormLock: normalizeObjectForm(objectFormLock) || '',
        captureFieldState,
        traceOpen: Boolean(tracePanel && tracePanel.open),
      })
    );
  }

  function restoreCaptureState() {
    if (!captureStorageKey) {
      return;
    }

    const raw = localStorage.getItem(captureStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      objectFormLock = normalizeObjectForm(parsed && parsed.objectFormLock) || '';
      const restoredFields =
        parsed && parsed.captureFieldState && typeof parsed.captureFieldState === 'object'
          ? parsed.captureFieldState
          : {};
      captureFieldState = {
        holds_under_isolation: normalizeCaptureFieldValue(restoredFields.holds_under_isolation),
        field_break: normalizeCaptureFieldValue(restoredFields.field_break),
        survives_alone: normalizeCaptureFieldValue(restoredFields.survives_alone),
        pressure: normalizeCaptureFieldValue(restoredFields.pressure),
        selection_note: normalizeCaptureFieldValue(restoredFields.selection_note),
        pull: normalizeCaptureFieldValue(restoredFields.pull),
        interruptions: normalizeCaptureFieldValue(restoredFields.interruptions),
      };

      if (tracePanel && parsed && parsed.traceOpen) {
        tracePanel.open = true;
      }
    } catch (error) {
      localStorage.removeItem(captureStorageKey);
    }
  }

  function syncTraceInputs() {
    if (tracePullInput) {
      tracePullInput.value = captureFieldState.pull || '';
    }
    if (traceSelectionInput) {
      traceSelectionInput.value = captureFieldState.selection_note || '';
    }
    if (traceInterruptionsInput) {
      traceInterruptionsInput.value = captureFieldState.interruptions || '';
    }
  }

  function defaultMediaIntentForFile(file, index, parsed) {
    const activeForm = getActiveObjectForm(parsed);
    return {
      key: String(index + 1) + ':' + file.name,
      index: index + 1,
      original_filename: file.name,
      role: index === 0 ? 'hero' : 'gallery',
      source: true,
      potential_coordinate: activeForm === 'coordinate',
      isolate_later: false,
      alt: '',
      caption: '',
    };
  }

  function syncMediaIntentState(parsed) {
    const files = Array.from(imgFileInput.files || []);
    if (!files.length) {
      mediaIntentState = [];
      if (mediaIntentPanel) {
        mediaIntentPanel.hidden = true;
        mediaIntentPanel.innerHTML = '';
      }
      return [];
    }

    const existingByKey = new Map(
      mediaIntentState.map((item) => [item.key || (String(item.index) + ':' + item.original_filename), item])
    );

    mediaIntentState = files.map((file, index) => {
      const nextKey = String(index + 1) + ':' + file.name;
      const existing = existingByKey.get(nextKey);
      const fallback = defaultMediaIntentForFile(file, index, parsed);
      const normalizedRole = MEDIA_INTENT_ROLE_OPTIONS.includes(existing && existing.role)
        ? existing.role
        : fallback.role;
      return {
        ...fallback,
        ...(existing || {}),
        key: nextKey,
        index: index + 1,
        original_filename: file.name,
        role: normalizedRole,
        source: existing && typeof existing.source === 'boolean' ? existing.source : true,
        potential_coordinate:
          existing && typeof existing.potential_coordinate === 'boolean'
            ? existing.potential_coordinate
            : fallback.potential_coordinate,
        isolate_later:
          existing && typeof existing.isolate_later === 'boolean' ? existing.isolate_later : false,
        alt: normalizeCaptureFieldValue(existing && existing.alt),
        caption: normalizeCaptureFieldValue(existing && existing.caption),
      };
    });

    renderMediaIntentPanel(parsed);
    return mediaIntentState;
  }

  function buildMediaIntentField(label, control) {
    const field = document.createElement('label');
    field.className = 'media-intent-field';

    const heading = document.createElement('span');
    heading.className = 'media-intent-label';
    heading.textContent = label;

    field.appendChild(heading);
    field.appendChild(control);
    return field;
  }

  function buildMediaIntentToggle(label, checked, onChange) {
    const row = document.createElement('label');
    row.className = 'media-intent-toggle';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = Boolean(checked);
    input.addEventListener('change', () => {
      onChange(input.checked);
    });

    const text = document.createElement('span');
    text.textContent = label;

    row.appendChild(input);
    row.appendChild(text);
    return row;
  }

  function renderMediaIntentPanel(parsed) {
    if (!mediaIntentPanel) {
      return;
    }

    if (!mediaIntentState.length) {
      mediaIntentPanel.hidden = true;
      mediaIntentPanel.innerHTML = '';
      return;
    }

    mediaIntentPanel.hidden = false;
    mediaIntentPanel.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'media-intent-head';
    heading.innerHTML =
      '<span class="media-intent-title">Media intent</span><span class="media-intent-copy">Optional staging for how each image should read when NI and AI inspect the object.</span>';
    mediaIntentPanel.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'media-intent-grid';

    mediaIntentState.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'media-intent-card';

      const cardHead = document.createElement('div');
      cardHead.className = 'media-intent-card-head';

      const fileLabel = document.createElement('strong');
      fileLabel.className = 'media-intent-file';
      fileLabel.textContent = item.original_filename;

      const fileMeta = document.createElement('span');
      fileMeta.className = 'media-intent-meta';
      fileMeta.textContent = 'Image ' + String(index + 1);

      cardHead.appendChild(fileLabel);
      cardHead.appendChild(fileMeta);
      card.appendChild(cardHead);

      const roleSelect = document.createElement('select');
      roleSelect.className = 'media-intent-select';
      MEDIA_INTENT_ROLE_OPTIONS.forEach((role) => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        option.selected = role === item.role;
        roleSelect.appendChild(option);
      });
      roleSelect.addEventListener('change', () => {
        mediaIntentState[index].role = roleSelect.value;
      });
      card.appendChild(buildMediaIntentField('Role', roleSelect));

      const toggles = document.createElement('div');
      toggles.className = 'media-intent-toggles';
      toggles.appendChild(
        buildMediaIntentToggle('Source', item.source, (checked) => {
          mediaIntentState[index].source = checked;
        })
      );
      toggles.appendChild(
        buildMediaIntentToggle('Potential coordinate', item.potential_coordinate, (checked) => {
          mediaIntentState[index].potential_coordinate = checked;
        })
      );
      toggles.appendChild(
        buildMediaIntentToggle('Isolate later', item.isolate_later, (checked) => {
          mediaIntentState[index].isolate_later = checked;
        })
      );
      card.appendChild(toggles);

      const altInput = document.createElement('input');
      altInput.className = 'media-intent-input';
      altInput.type = 'text';
      altInput.autocomplete = 'off';
      altInput.placeholder = 'Optional alt text';
      altInput.value = item.alt || '';
      altInput.addEventListener('input', () => {
        mediaIntentState[index].alt = altInput.value;
      });
      card.appendChild(buildMediaIntentField('Alt', altInput));

      const captionInput = document.createElement('input');
      captionInput.className = 'media-intent-input';
      captionInput.type = 'text';
      captionInput.autocomplete = 'off';
      captionInput.placeholder = 'Optional caption';
      captionInput.value = item.caption || '';
      captionInput.addEventListener('input', () => {
        mediaIntentState[index].caption = captionInput.value;
      });
      card.appendChild(buildMediaIntentField('Caption', captionInput));

      grid.appendChild(card);
    });

    mediaIntentPanel.appendChild(grid);
  }

  function buildCapturePayload(parsed) {
    const preview = getObjectFormPreview(parsed);
    const activeForm = normalizeObjectForm(preview.form);
    const orientationResponses = {};
    const promptKeys = activeForm ? (OBJECT_FORM_PROMPTS[activeForm] || []).map((item) => item.key) : [];

    promptKeys.forEach((key) => {
      const value = normalizeCaptureFieldValue(captureFieldState[key]);
      if (!value) {
        return;
      }

      orientationResponses[key] = value;
    });

    const interruptions = splitCaptureList(captureFieldState.interruptions);
    const traceExpanded = {};
    if (normalizeCaptureFieldValue(captureFieldState.selection_note)) {
      traceExpanded.selection_note = normalizeCaptureFieldValue(captureFieldState.selection_note);
    }
    if (interruptions.length) {
      traceExpanded.interruptions = interruptions;
    }
    Object.entries(orientationResponses).forEach(([key, value]) => {
      traceExpanded[key] = value;
    });

    const mediaIntent = mediaIntentState
      .map((item) => {
        const candidate = {
          index: item.index,
          original_filename: item.original_filename,
          role: item.role,
          source: item.source,
          potential_coordinate: item.potential_coordinate,
          isolate_later: item.isolate_later,
          alt: normalizeCaptureFieldValue(item.alt),
          caption: normalizeCaptureFieldValue(item.caption),
        };

        if (!candidate.alt) {
          delete candidate.alt;
        }
        if (!candidate.caption) {
          delete candidate.caption;
        }
        return candidate;
      })
      .filter((item) => Boolean(item.original_filename));

    const hasManualGuidance = Boolean(
      normalizeObjectForm(objectFormLock) ||
        normalizeCaptureFieldValue(captureFieldState.pull) ||
        Object.keys(traceExpanded).length > 0
    );
    const captureMode =
      !noteField.value.trim() && hasAttachedImages()
        ? 'image-only'
        : hasManualGuidance
          ? 'guided'
          : 'default';
    const typeResolution = hasManualGuidance
      ? 'capture'
      : mediaIntent.length > 0 || preview.source === 'suggestion'
        ? 'staging'
        : '';

    const payload = {
      protocol_version: 'pigeon-1.1',
      capture_mode: captureMode,
      object_form_suggestion: preview.source === 'suggestion' ? preview.form : '',
      object_form_lock: preview.source === 'lock' ? preview.form : '',
      type_resolution: typeResolution,
      orientation:
        activeForm && Object.keys(orientationResponses).length > 0
          ? {
              prompt_set: activeForm,
              optional: true,
              supportive: true,
              responses: orientationResponses,
            }
          : null,
      trace:
        normalizeCaptureFieldValue(captureFieldState.pull) ||
        Object.keys(traceExpanded).length > 0 ||
        Boolean(tracePanel && tracePanel.open)
          ? {
              pull: normalizeCaptureFieldValue(captureFieldState.pull) || undefined,
              collapsed: !(tracePanel && tracePanel.open),
              expanded: Object.keys(traceExpanded).length > 0 ? traceExpanded : undefined,
            }
          : null,
      media_intent: mediaIntent.length > 0 ? mediaIntent : null,
      staging: mediaIntent.some((item) => item.isolate_later)
        ? { isolate_later: true }
        : null,
    };

    if (
      !payload.object_form_suggestion &&
      !payload.object_form_lock &&
      !payload.orientation &&
      !payload.trace &&
      !payload.media_intent &&
      !payload.staging
    ) {
      return null;
    }

    if (!payload.object_form_suggestion) {
      delete payload.object_form_suggestion;
    }
    if (!payload.object_form_lock) {
      delete payload.object_form_lock;
    }
    if (!payload.type_resolution) {
      delete payload.type_resolution;
    }
    if (!payload.orientation) {
      delete payload.orientation;
    }
    if (!payload.trace) {
      delete payload.trace;
    }
    if (!payload.media_intent) {
      delete payload.media_intent;
    }
    if (!payload.staging) {
      delete payload.staging;
    }

    return payload;
  }

  function formatFormReadout(capture) {
    if (!capture) {
      return '';
    }

    const locked = normalizeObjectForm(capture.object_form_lock);
    const suggested = normalizeObjectForm(capture.object_form_suggestion);
    if (locked) {
      return objectFormLabel(locked) + ' / locked';
    }
    if (suggested) {
      return objectFormLabel(suggested) + ' / suggested';
    }
    return '';
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

  function getStableType(parsed) {
    if (parsed.objectType) {
      return parsed.objectType;
    }

    if (typeWasManuallyChosen) {
      return selectedType;
    }

    return isImageOnlyDraft(parsed) ? 'artifact' : '';
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

  function renderFrontmatterNote(fields, originalOrder, rawBlocks, typeKey, inferredType, body) {
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
      const preservedBlock =
        rawBlocks &&
        RAW_BLOCK_PROTECTED_KEYS.has(key) &&
        Array.isArray(rawBlocks[key]) &&
        rawBlocks[key].length > 0
          ? rawBlocks[key]
          : null;
      if (preservedBlock) {
        return preservedBlock.join('\n');
      }

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

  function buildRelatedDraftProfile(parsed) {
    const rawNote = normalizeRawNote(noteField.value).trim();
    if (!rawNote) {
      return null;
    }

    const loose = readLooseFrontmatter(noteField.value);
    const captionText = parsed.caption || '';
    const body = loose.body || parsed.body || '';
    const inferenceText = captionText || body || rawNote;
    const title = parsed.title || inferTitleFromText(inferenceText);
    const summary = parsed.excerpt || inferSummaryFromText(parsed.body || parsed.caption || '');
    const type = resolvePublishType(parsed) || inferObjectTypeFromText(title, body);
    const tags = uniqueStrings(
      (
        parsed.tags.length
          ? parsed.tags
          : inferTagsFromText(title, inferenceText)
      )
        .map((value) => normalizeTagCandidate(value))
        .filter(Boolean)
    );
    const existingRelated = uniqueStrings(
      normalizeFlexibleStringArray(loose.fields.related)
        .map((value) => extractObjectSlug(value))
        .filter(Boolean)
    );
    const preview = getObjectFormPreview(parsed);
    const titlePlain = plainTextFromMarkdown(title).toLowerCase();
    const summaryPlain = plainTextFromMarkdown(summary).toLowerCase();
    const bodyPlain = plainTextFromMarkdown(inferenceText).toLowerCase();
    const titleTokens = tokenizeSimilarityText(title);
    const summaryTokens = tokenizeSimilarityText(summary);
    const bodyTokens = tokenizeSimilarityText(inferenceText).slice(0, 64);
    const tokens = uniqueStrings([...titleTokens, ...summaryTokens, ...bodyTokens, ...tags]);

    if (!title && !bodyPlain) {
      return null;
    }

    if (tokens.length < 3 && tags.length === 0 && titlePlain.length < 16) {
      return null;
    }

    return {
      slug: title ? slugify(title) : '',
      type,
      form: preview.form || '',
      tags,
      existingRelated,
      titlePlain,
      summaryPlain,
      bodyPlain,
      titleTokens,
      summaryTokens,
      bodyTokens,
      tokens,
    };
  }

  function scoreRelatedCandidate(profile, candidate) {
    if (!profile || !candidate || !candidate.ref) {
      return null;
    }

    const candidateRef = candidate.ref.toLowerCase();
    if (
      (profile.slug && candidate.slug === profile.slug) ||
      profile.existingRelated.some((value) => value.toLowerCase() === candidateRef)
    ) {
      return null;
    }

    const sharedTags = intersectStrings(profile.tags, candidate.tags);
    const sharedTerms = intersectStrings(profile.tokens, candidate.tokens);
    const titleOverlap = intersectStrings(profile.titleTokens, candidate.titleTokens);
    const summaryOverlap = intersectStrings(profile.summaryTokens, candidate.summaryTokens);
    const bodyOverlap = intersectStrings(profile.bodyTokens, candidate.tokens);
    const reasons = [];
    let score = 0;

    if (sharedTags.length > 0) {
      score += 1.15 + Math.min(sharedTags.length - 1, 2) * 0.3;
      reasons.push('shared tags: ' + sharedTags.slice(0, 2).join(', '));
    }

    if (titleOverlap.length > 0) {
      score += 0.9 + Math.min(titleOverlap.length, 3) * 0.35;
      reasons.push('title overlap');
    }

    if (summaryOverlap.length > 0) {
      score += Math.min(summaryOverlap.length, 3) * 0.28;
    }

    if (sharedTerms.length > 0) {
      score += Math.min(sharedTerms.length, 6) * 0.28;
    }

    if (bodyOverlap.length > 1) {
      score += Math.min(bodyOverlap.length, 5) * 0.2;
    }

    const typePrior =
      (RELATED_TYPE_PRIORS[profile.type] && RELATED_TYPE_PRIORS[profile.type][candidate.type]) || 0;
    if (typePrior) {
      score += typePrior;
    }

    const phraseHit =
      candidate.titlePlain &&
      candidate.titlePlain.length >= 14 &&
      (profile.bodyPlain.includes(candidate.titlePlain) || profile.titlePlain.includes(candidate.titlePlain));
    if (phraseHit) {
      score += 1.8;
      reasons.push('body echoes existing object');
    }

    const reversePhraseHit =
      profile.titlePlain &&
      profile.titlePlain.length >= 14 &&
      candidate.searchPlain.includes(profile.titlePlain);
    if (reversePhraseHit) {
      score += 1.0;
    }

    if (profile.form && candidate.objectForm && candidate.objectForm === profile.form) {
      score += 0.35;
      reasons.push('matching form');
    }

    if (
      candidate.type === 'fragment' &&
      ['scroll', 'codex', 'fieldlog', 'nexus'].includes(profile.type) &&
      (phraseHit || titleOverlap.length > 0 || bodyOverlap.length >= 3)
    ) {
      score += 0.95;
      reasons.push('possible seed fragment');
    }

    if (
      profile.type === 'fragment' &&
      ['scroll', 'codex', 'fieldlog'].includes(candidate.type) &&
      (sharedTerms.length >= 2 || titleOverlap.length > 0)
    ) {
      score += 0.65;
      reasons.push('possible expansion target');
    }

    if (score < 2.1) {
      return null;
    }

    return {
      ...candidate,
      score,
      reasons: uniqueStrings(reasons).slice(0, 2),
    };
  }

  function computeRelatedSuggestions(parsed) {
    const profile = buildRelatedDraftProfile(parsed);
    if (!profile || archiveContextStatus !== 'loaded' || !archiveContextItems.length) {
      return [];
    }

    return archiveContextItems
      .map((candidate) => scoreRelatedCandidate(profile, candidate))
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
      .slice(0, RELATED_SUGGESTION_LIMIT);
  }

  function clearRelatedSuggestions() {
    relatedSuggestionState = [];
    if (!relatedSuggestionsPanel || !relatedSuggestionsList || !relatedSuggestionsNote) {
      return;
    }

    relatedSuggestionsPanel.hidden = true;
    relatedSuggestionsNote.textContent =
      'Smart Draft can surface nearby objects and likely seed links. Add only what feels real.';
    relatedSuggestionsList.replaceChildren();
  }

  function syncRelatedSuggestions(parsed) {
    if (!relatedSuggestionsPanel || !relatedSuggestionsList || !relatedSuggestionsNote) {
      return;
    }

    const profile = buildRelatedDraftProfile(parsed);
    if (!profile) {
      clearRelatedSuggestions();
      return;
    }

    if (archiveContextStatus === 'idle') {
      primeArchiveContextItems();
    }

    if (archiveContextStatus === 'loading') {
      relatedSuggestionState = [];
      relatedSuggestionsPanel.hidden = false;
      relatedSuggestionsNote.textContent = 'Loading archive context for nearby-object suggestions...';
      relatedSuggestionsList.replaceChildren();
      return;
    }

    if (archiveContextStatus !== 'loaded') {
      clearRelatedSuggestions();
      return;
    }

    const suggestions = computeRelatedSuggestions(parsed);
    relatedSuggestionState = suggestions;
    if (!suggestions.length) {
      clearRelatedSuggestions();
      return;
    }

    relatedSuggestionsPanel.hidden = false;
    relatedSuggestionsNote.textContent =
      'Nearby archive objects and likely lineage links. Add only what feels real.';
    relatedSuggestionsList.replaceChildren(
      ...suggestions.map((item) => {
        const card = document.createElement('article');
        card.className = 'related-card';

        const head = document.createElement('div');
        head.className = 'related-card-head';

        const title = document.createElement('div');
        title.className = 'related-card-title';
        title.textContent = item.title;

        const addButton = document.createElement('button');
        addButton.className = 'related-card-action';
        addButton.type = 'button';
        addButton.dataset.relatedRef = item.ref;
        addButton.textContent = 'Add to related';

        head.appendChild(title);
        head.appendChild(addButton);

        const meta = document.createElement('div');
        meta.className = 'related-card-meta';
        meta.textContent = describeType(item.type) + (item.objectForm ? ' / ' + objectFormLabel(item.objectForm) : '');

        const note = document.createElement('p');
        note.className = 'related-card-note';
        note.textContent =
          item.reasons.length > 0
            ? item.reasons.join(' · ')
            : item.summary || 'Nearby archive match.';

        const actions = document.createElement('div');
        actions.className = 'related-card-actions';

        const link = document.createElement('a');
        link.className = 'related-card-link';
        link.href = resolveHref(item.url);
        link.target = '_blank';
        link.rel = 'noreferrer';
        link.textContent = 'Open';

        actions.appendChild(link);

        card.appendChild(head);
        card.appendChild(meta);
        card.appendChild(note);
        card.appendChild(actions);
        return card;
      })
    );
  }

  function addRelatedReference(ref) {
    const normalizedRef = extractObjectSlug(ref);
    if (!normalizedRef || !noteField.value.trim()) {
      return false;
    }

    let parsed = parseFrontmatter(noteField.value);
    if (!parsed.hasFrontmatter) {
      const drafted = smartDraft({ silent: true });
      parsed = drafted && drafted.parsed ? drafted.parsed : parseFrontmatter(noteField.value);
      logLine('info', 'Smart Draft added frontmatter so related can be pinned.');
    }

    const loose = readLooseFrontmatter(noteField.value);
    const existingRelated = uniqueStrings(
      normalizeFlexibleStringArray(loose.fields.related)
        .map((value) => extractObjectSlug(value))
        .filter(Boolean)
    );

    if (existingRelated.some((value) => value.toLowerCase() === normalizedRef.toLowerCase())) {
      logLine('info', 'Related already includes -> ' + normalizedRef);
      return false;
    }

    const fields = { ...loose.fields };
    const order = loose.order.slice();
    const typeKey = Object.prototype.hasOwnProperty.call(fields, 'object_type')
      ? 'object_type'
      : Object.prototype.hasOwnProperty.call(fields, 'type')
        ? 'type'
        : 'object_type';
    const resolvedType = parsed.objectType || selectedType;
    fields.related = [...existingRelated, normalizedRef];

    noteField.value = renderFrontmatterNote(
      fields,
      order,
      loose.rawBlocks,
      typeKey,
      resolvedType,
      loose.body || parsed.body || ''
    );
    persistDraft();
    updateInterface();
    logLine('ok', 'Added related -> ' + normalizedRef);
    return true;
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
    const lockedType = existingType || (typeWasManuallyChosen ? selectedType : '');
    const captionText = parsed.caption || '';
    const body = loose.body || parsed.body || (captionText ? '' : rawNote.trim());
    const inferenceText = captionText || body;
    const inferredTitle = parsed.title || inferTitleFromText(inferenceText);
    const inferredDate =
      parsed.date && !Number.isNaN(Date.parse(parsed.date)) ? parsed.date : inferDateFromText(inferenceText);
    const inferredType =
      lockedType || (captionText && !body ? resolvePublishType(parsed) : inferObjectTypeFromText(inferredTitle, body));
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

    const nextNote = renderFrontmatterNote(
      fields,
      loose.order,
      loose.rawBlocks,
      originalTypeKey,
      inferredType,
      body
    );
    const changed = nextNote.trim() !== rawNote.trim();
    noteField.value = nextNote;
    persistDraft();
    const updatedParsed = updateInterface();
    noteField.focus();

    if (!changed) {
      if (!settings.silent) {
        logLine('info', 'Smart Draft left the current frontmatter as-is.');
        if (relatedSuggestionState.length > 0) {
          logLine('info', 'Related suggestions are ready below the note.');
        }
      }
      return { parsed: updatedParsed, changed, inferredType };
    }

    if (!settings.silent) {
      logLine('ok', 'Smart Draft -> ' + describeType(inferredType));
      logLine('', smartDraftButtonMessage);
      if (relatedSuggestionState.length > 0) {
        logLine('info', 'Related suggestions are ready below the note.');
      }
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
    return getStableType(parsed) || selectedType;
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
    const capture = buildCapturePayload(parsed);
    const type = getStableType(parsed);
    const displayTitle = resolveDisplayTitle(parsed);
    const excerpt = parsed.excerpt || inferSummaryFromText(parsed.body || parsed.caption || '');
    const attachedImages = Array.from(imgFileInput.files || []);
    const heroLabel = attachedImages.length
      ? attachedImages[0].name + (attachedImages.length > 1 ? ' +' + (attachedImages.length - 1) : '')
      : Array.isArray(parsed.images) && parsed.images.length > 0
        ? parsed.images[0] + (parsed.images.length > 1 ? ' +' + (parsed.images.length - 1) : '')
        : readLooseFrontmatter(noteField.value).rawBlocks.media
          ? 'Structured media preserved'
          : '';
    const slug = displayTitle && type ? slugify(displayTitle) : '';
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
    setTelem(roTitle, displayTitle, false);
    setTelem(roExcerpt, excerpt, false);
    setTelem(roHero, heroLabel, false);
    setTelem(roForm, formatFormReadout(capture), Boolean(capture && capture.object_form_lock));
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
    const capture =
      data && data.capture && typeof data.capture === 'object'
        ? data.capture
        : null;
    const axes = data && typeof data.axes === 'object' && data.axes
      ? data.axes
      : {};
    setTelem(roType, type ? describeType(type) : '', false);
    setTelem(roForm, formatFormReadout(capture), Boolean(capture && capture.object_form_lock));
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
    return !getTransmitBlocker(parsed, keyField.value.trim());
  }

  function getTransmitBlocker(parsed, key) {
    const trimmedNote = noteField.value.trim();
    const type = getStableType(parsed);
    const imageOnlyDraft = isImageOnlyDraft(parsed);
    const attachedImages = Array.from(imgFileInput.files || []);

    if (attachedImages.length > 8) {
      return 'Attach no more than 8 images to one Pigeon post.';
    }

    if (attachedImages.some((file) => file.size > 25 * 1024 * 1024)) {
      return 'Each source image must be 25 MiB or smaller.';
    }

    if (attachedImages.reduce((sum, file) => sum + file.size, 0) > 50 * 1024 * 1024) {
      return 'Source images may total no more than 50 MiB per post.';
    }

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
      return 'Run Smart Draft or choose a type before publishing.';
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

    const currentSuggestion = inferObjectForm(parsed);
    if (
      dismissedObjectFormSuggestion &&
      currentSuggestion.form &&
      dismissedObjectFormSuggestion !== currentSuggestion.form
    ) {
      dismissedObjectFormSuggestion = '';
    }

    syncObjectFormButtons(parsed);
    syncOrientationPrompts(parsed);
    syncTraceInputs();
    syncMediaIntentState(parsed);
    syncRelatedSuggestions(parsed);
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
    setActionLink(openCommitLink, '', 'Open Commit');
  }

  function showPublishActions(data) {
    const objectHref =
      typeof data.object_url === 'string' && data.object_url
        ? data.object_url
        : typeof data.url === 'string' && data.url
          ? data.url
          : '';
    const commitHref = typeof data.commitUrl === 'string' ? data.commitUrl : '';

    const hasObject = setActionLink(openObjectLink, objectHref, 'Open Object');
    const hasCommit = setActionLink(openCommitLink, commitHref, 'Open Commit', { external: true });

    if (!publishActions) {
      return;
    }

    publishActions.hidden = !(hasObject || hasCommit);

    if (publishActionsNote) {
      publishActionsNote.textContent = publishedSurfaceDefaultMessage;
    }
  }

  function persistDraft() {
    clearPublishActions();
    if (!draftStorageKey) {
      persistCaptureState();
      return;
    }

    if (noteField.value) {
      localStorage.setItem(draftStorageKey, noteField.value);
    } else {
      localStorage.removeItem(draftStorageKey);
    }

    persistCaptureState();
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

  async function compressImageForUpload(file, targetBytes) {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size <= targetBytes) {
      return file;
    }

    try {
      const image = await readImageElement(file);
      const width = image.width || image.naturalWidth || 0;
      const height = image.height || image.naturalHeight || 0;
      if (!width || !height) {
        return file;
      }

      const outputType = file.type === 'image/png' || file.type === 'image/webp'
        ? 'image/webp'
        : 'image/jpeg';
      const attempts = [
        { maxDimension: 2000, quality: 0.82 },
        { maxDimension: 1600, quality: 0.74 },
        { maxDimension: 1280, quality: 0.66 },
      ];
      let smallestBlob = null;

      for (const attempt of attempts) {
        const scale = Math.min(1, attempt.maxDimension / Math.max(width, height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          return file;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, outputType, attempt.quality);
        });

        if (!(blob instanceof Blob) || blob.size === 0) {
          continue;
        }
        if (!smallestBlob || blob.size < smallestBlob.size) {
          smallestBlob = blob;
        }
        if (blob.size <= targetBytes) {
          smallestBlob = blob;
          break;
        }
      }

      if (image && typeof image.close === 'function') {
        image.close();
      }

      if (!(smallestBlob instanceof Blob) || smallestBlob.size >= file.size) {
        return file;
      }

      return new File([smallestBlob], file.name, {
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
    syncMediaIntentState(parseFrontmatter(noteField.value));
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
    objectFormLock = '';
    dismissedObjectFormSuggestion = '';
    captureFieldState = {
      holds_under_isolation: '',
      field_break: '',
      survives_alone: '',
      pressure: '',
      selection_note: '',
      pull: '',
      interruptions: '',
    };
    mediaIntentState = [];
    if (tracePanel) {
      tracePanel.open = false;
    }
    syncTraceInputs();
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

    noteField.value = renderFrontmatterNote(
      fields,
      order,
      loose.rawBlocks,
      typeKey,
      resolvedType,
      loose.body || parsed.body || ''
    );
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
    noteField.value = renderFrontmatterNote(
      fields,
      order,
      loose.rawBlocks,
      typeKey,
      normalizedType,
      loose.body || parsed.body || ''
    );
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
      (!parsed.hasFrontmatter || !parsed.title || !parsed.date || !getStableType(parsed))
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
      const capture = buildCapturePayload(parsed);
      if (capture) {
        formData.append('capture', JSON.stringify(capture));
      }

      const selectedImages = Array.from(imgFileInput.files || []);
      if (selectedImages.length) {
        logLine('info', preparingImagesMessage);
      }

      const uploadMediaBudget = Math.floor(3.6 * 1024 * 1024);
      const perImageBudget = selectedImages.length > 0
        ? Math.floor(uploadMediaBudget / selectedImages.length)
        : uploadMediaBudget;
      const preparedImages = await Promise.all(
        selectedImages.map((file) => compressImageForUpload(file, perImageBudget))
      );
      const preparedImageBytes = preparedImages.reduce((sum, file) => sum + file.size, 0);
      if (preparedImageBytes > uploadMediaBudget) {
        throw new Error(
          'These images are still too large for one remote Pigeon flight. ' +
          'Choose fewer images or export smaller copies; the remote upload budget is 3.6 MiB total.'
        );
      }
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

  objectFormButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextForm = normalizeObjectForm(button.dataset.objectForm);
      if (!nextForm) {
        return;
      }

      objectFormLock = nextForm;
      dismissedObjectFormSuggestion = '';
      persistCaptureState();
      updateInterface();
      logLine('info', 'Object form locked -> ' + objectFormLabel(nextForm));
    });
  });

  if (objectFormClearButton) {
    objectFormClearButton.addEventListener('click', () => {
      const parsed = parseFrontmatter(noteField.value);
      const preview = getObjectFormPreview(parsed);

      if (normalizeObjectForm(objectFormLock)) {
        objectFormLock = '';
        persistCaptureState();
        updateInterface();
        logLine('info', 'Object form lock cleared.');
        return;
      }

      if (preview.source === 'suggestion' && preview.form) {
        dismissedObjectFormSuggestion = preview.form;
        updateInterface();
        logLine('info', 'Object form suggestion dismissed.');
      }
    });
  }

  noteField.addEventListener('input', () => {
    persistDraft();
    updateInterface();
  });

  if (relatedSuggestionsList) {
    relatedSuggestionsList.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-related-ref]');
      if (!trigger) {
        return;
      }

      addRelatedReference(trigger.getAttribute('data-related-ref') || '');
    });
  }

  [orientationFieldOneInput, orientationFieldTwoInput].forEach((input) => {
    if (!input) {
      return;
    }

    input.addEventListener('input', () => {
      const key = input.getAttribute('data-capture-key');
      if (!key) {
        return;
      }

      captureFieldState[key] = input.value;
      persistCaptureState();
      updateInterface();
    });
  });

  if (tracePullInput) {
    tracePullInput.addEventListener('input', () => {
      captureFieldState.pull = tracePullInput.value;
      persistCaptureState();
      updateInterface();
    });
  }

  if (traceSelectionInput) {
    traceSelectionInput.addEventListener('input', () => {
      captureFieldState.selection_note = traceSelectionInput.value;
      persistCaptureState();
      updateInterface();
    });
  }

  if (traceInterruptionsInput) {
    traceInterruptionsInput.addEventListener('input', () => {
      captureFieldState.interruptions = traceInterruptionsInput.value;
      persistCaptureState();
      updateInterface();
    });
  }

  if (tracePanel) {
    tracePanel.addEventListener('toggle', () => {
      persistCaptureState();
      updateInterface();
    });
  }

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

  restoreCaptureState();
  syncTraceInputs();
  syncMediaIntentState(parseFrontmatter(noteField.value));

  updateClock();
  window.setInterval(updateClock, 30000);

  syncSelectedType('signal', { silent: true, closePanel: false, source: 'default' });
  updateInterface();

  if (noteField.value.trim()) {
    logLine('info', restoredDraftMessage);
  }
})();
`;
