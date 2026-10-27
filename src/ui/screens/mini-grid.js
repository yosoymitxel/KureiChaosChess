import { html } from '../lib.js';
import { pieceSVG } from '../../view/piece-art.js';
import { t } from '../../i18n/index.js';

// cell(r, c) -> { cls, piece: { type, side }, tok, hp: { on, max } }
export function MiniGrid({ rows, cols, cell, onTap, disabled, label, gridRef, boardClass }) {
  return html`<div class="mini-stage">
    <div class=${'bm' + (boardClass ? ' ' + boardClass : '')} ref=${gridRef} style=${{ '--rows': rows, '--cols': cols }} role="grid" aria-label=${label}>
      ${Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols, x = cell(r, c) || {};
        const classes = ['bm-cell', (r + c) % 2 ? 'b' : 'a', r === 0 && 'r0', x.cls].filter(Boolean).join(' ');
        return html`<button class=${classes} disabled=${disabled}
          aria-label=${x.ariaLabel || t('mini.cell', 'Fila {r}, columna {c}', { r: r + 1, c: c + 1 })} onClick=${() => onTap?.(r, c)}>
          ${x.piece && html`<span class=${'bm-pc side-' + x.piece.side} dangerouslySetInnerHTML=${{ __html: pieceSVG(x.piece.type) }} />`}
          ${x.tok && html`<span class="bm-tok"></span>`}
          ${x.hp && html`<span class="pc-hp">${Array.from({ length: x.hp.max }, (_, j) => html`<b class=${j < x.hp.on ? 'on' : ''} />`)}</span>`}
        </button>`;
      })}
    </div>
  </div>`;
}
