import { html } from '../lib.js';
import { pieceSVG } from '../../view/piece-art.js';

// cell(r, c) -> { cls, piece: { type, side }, tok, hp: { on, max }, label }
export function MiniGrid({ rows, cols, cell, onTap, disabled, label, gridRef, boardClass }) {
  return html`<div class="mini-stage">
    <div class=${'bm' + (boardClass ? ' ' + boardClass : '')} ref=${gridRef} style=${{ '--rows': rows, '--cols': cols }} role="grid" aria-label=${label}>
      ${Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols, x = cell(r, c) || {};
        return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (r === 0 ? ' r0' : '') + (x.cls ? ' ' + x.cls : '')} disabled=${disabled}
          aria-label=${`Fila ${r + 1}, columna ${c + 1}`} onClick=${() => onTap?.(r, c)}>
          ${x.piece && html`<span class=${'bm-pc side-' + x.piece.side + (x.piece.w > 1 || x.piece.h > 1 ? ' boss-footprint' : '')} style=${x.piece.w > 1 || x.piece.h > 1 ? { width: 'calc(var(--cell) * ' + (x.piece.w || 1) + ')', height: 'calc(var(--cell) * ' + (x.piece.h || 1) + ')', inset: 'auto', left: '0', top: '0' } : undefined} dangerouslySetInnerHTML=${{ __html: pieceSVG(x.piece.type) }} />`}
          ${x.tok && html`<span class="bm-tok"></span>`}
          ${x.hp && html`<span class="pc-hp">${Array.from({ length: x.hp.max }, (_, i) => html`<b class=${i < x.hp.on ? 'on' : ''} />`)}</span>`}
          ${x.label && html`<span class="bm-lbl">${x.label}</span>`}
        </button>`;
      })}
    </div>
  </div>`;
}
