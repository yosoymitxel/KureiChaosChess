import assert from 'node:assert/strict';
import { sanitizeSvgFragment } from './svg-sanitizer.mjs';
import { BODIES } from '../src/view/piece-bodies.js';

for (const [name, body] of Object.entries(BODIES)) {
  assert.equal(sanitizeSvgFragment(body), body, name + ' must remain within the SVG allowlist');
}

const clean = sanitizeSvgFragment(
  '<g fill="#f3ead8" id="piece" onclick="alert(1)">' +
  '<path d="M0 0L10 10" onload="alert(2)" href="javascript:alert(3)" ' +
  'style="fill:url(https://evil.invalid/a);stroke:#2a2233;fill-rule:nonzero;background-image:url(https://evil.invalid/b)"/>' +
  '</g>'
);

assert.match(clean, /^<g fill="#f3ead8"><path d="M0 0L10 10" style="stroke:#2a2233;fill-rule:nonzero"\/><\/g>$/);
assert.doesNotMatch(clean, /onclick|onload|javascript:|https:|url\(|background-image|id="piece"/i);

const nested = sanitizeSvgFragment(
  '<g><foreignObject><script>alert(1)</script><path d="M2 2L3 3"/></foreignObject>' +
  '<path d="M1 1L2 2" fill="#fff"/></g>'
);
assert.equal((nested.match(/<path\b/g) || []).length, 1);
assert.doesNotMatch(nested, /foreignObject|script|alert/i);

const geometry = sanitizeSvgFragment('<g><circle cx="1" cy="2" r="3"/><rect x="4" y="5" width="6" height="7"/></g>');
assert.equal(geometry, '<g><circle cx="1" cy="2" r="3"/><rect x="4" y="5" width="6" height="7"/></g>');
assert.doesNotMatch(sanitizeSvgFragment('<circle cx="1" onload="x" cy="2" r="3" style="filter:url(https://bad.invalid)"/>'), /onload|https:/i);

const comments = sanitizeSvgFragment('<!-- <script>alert(1)</script> --><g><circle cx="1" cy="2" r="3"/></g>');
assert.equal(comments, '<g><circle cx="1" cy="2" r="3"/></g>');

assert.throws(() => sanitizeSvgFragment('<g><path d="M0 0L1 1"></g></path>'), /desbalanceadas/);
assert.throws(() => sanitizeSvgFragment('<!DOCTYPE svg [<!ENTITY x "y">]><g/>'), /declaraciones|entidades/);
assert.throws(() => sanitizeSvgFragment('<g><path d="M0 0L1 1"></g>'), /desbalanceadas|sin cerrar/);

console.log('SVG security checks passed: element/attribute allowlist, no script/event/external CSS, strict XML nesting.');
