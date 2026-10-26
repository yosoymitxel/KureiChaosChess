import { html } from '../lib.js';
import { pieceSVG } from '../../view/piece-art.js';

// cell(r, c) -> { cls, piece: { type, side }, tok, hp: { on, max }, label }
export function MiniGrid({ rows, cols, cell, onTap, disabled, label, gridRef, boardClass }) {
  return html`<div class="mini-stage">
    <div class=${'bm' + (boardClass ? ' ' + boardClass : '')} ref=${gridRef} style=${{ '--rows': rows, '--cols': cols }} role="grid" aria-label=${label}>
      ${Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols, x = cell(r, c) || {};
        const classes = ['bm-cell', (r + c) % 2 ? 'b' : 'a', r === 0 && 'r0', x.cls].filter(Boolean).join(' ');
        return html`<button class=${classes} disabled=${disabled}
          aria-label=${x.ariaLabel || `Fila ${r + 1}, columna ${c + 1}`} onClick=${() => onTap?.(r, c)}>
          ${x.piece && html`<span class=${'bm-pc side-' + x.piece.side} dangerouslySetInnerHTML=${{ __html: pieceSVG(x.piece.type) }} />`}
          ${x.tok && html`<span class="bm-tok"></span>`}
          ${x.hp && html`<span class="pc-hp">${Array.from({ length: x.hp.max }, (_, j) => html`<b class=${j < x.hp.on ? 'on' : ''} />`)}</span>`}
          ${x.label && html`<span class="bm-lbl">${x.label}</span>`}
        </button>`;
      })}
    </div>
  </div>`;
}
