import { html } from '../lib.js';
import { pieceSVG } from '../../view/piece-art.js';

// cell(r, c) -> { cls, piece: { type, side }, mark }
export function MiniGrid({ rows, cols, cell, onTap, disabled, label }) {
  return html`<div class="bm" style=${{ '--rows': rows, '--cols': cols }} role="grid" aria-label=${label}>
    ${Array.from({ length: rows * cols }, (_, i) => {
      const r = Math.floor(i / cols), c = i % cols, x = cell(r, c) || {};
      return html`<button class=${'bm-cell ' + ((r + c) % 2 ? 'b' : 'a') + (x.cls ? ' ' + x.cls : '')} disabled=${disabled}
        aria-label=${`Fila ${r + 1}, columna ${c + 1}`} onClick=${() => onTap?.(r, c)}>
        ${x.mark && html`<span class="mg-mark">${x.mark}</span>`}
        ${x.piece && html`<span class=${'bm-pc side-' + x.piece.side} dangerouslySetInnerHTML=${{ __html: pieceSVG(x.piece.type) }} />`}
      </button>`;
    })}
  </div>`;
}
