const PRESENTATION = new Set([
  'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-opacity', 'stroke-miterlimit',
  'opacity', 'transform'
]);

const ELEMENT_ATTRIBUTES = new Map([
  ['g', new Set([...PRESENTATION, 'style'])],
  ['path', new Set([...PRESENTATION, 'style', 'd'])],
  ['rect', new Set([...PRESENTATION, 'style', 'x', 'y', 'width', 'height', 'rx', 'ry'])],
  ['circle', new Set([...PRESENTATION, 'style', 'cx', 'cy', 'r'])],
  ['ellipse', new Set([...PRESENTATION, 'style', 'cx', 'cy', 'rx', 'ry'])],
  ['line', new Set([...PRESENTATION, 'style', 'x1', 'y1', 'x2', 'y2'])],
  ['polygon', new Set([...PRESENTATION, 'style', 'points'])],
  ['polyline', new Set([...PRESENTATION, 'style', 'points'])]
]);

const NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?(?:px|%)?$/i;
const GEOMETRY_NUMBERS = new Set(['x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2']);
const OPACITY = /^(?:0(?:\.\d+)?|1(?:\.0+)?)$/;
const PATH_DATA = /^[MmZzLlHhVvCcSsQqTtAa0-9eE+.,\-\s]+$/;
const POINTS = /^[0-9eE+.,\-\s]+$/;
const TRANSFORM = /^(?:(?:matrix|translate|scale|rotate|skewX|skewY)\s*\(\s*[-+0-9.eE,\s]+\)\s*)+$/;

function safePresentationValue(property, value) {
  const v = value.trim();
  if (property === 'fill' || property === 'stroke') {
    return /^(?:none|transparent|currentColor|#[0-9a-f]{3,8}|var\(--(?:pc|pc-2|ink|brass)\))$/i.test(v) ? v : null;
  }
  if (property === 'fill-rule' || property === 'clip-rule') {
    return /^(?:nonzero|evenodd)$/i.test(v) ? v : null;
  }
  if (property === 'stroke-linecap') {
    return /^(?:butt|round|square)$/i.test(v) ? v : null;
  }
  if (property === 'stroke-linejoin') {
    return /^(?:miter|round|bevel)$/i.test(v) ? v : null;
  }
  if (property === 'opacity' || property === 'fill-opacity' || property === 'stroke-opacity') {
    return OPACITY.test(v) ? v : null;
  }
  if (property === 'stroke-width' || property === 'stroke-miterlimit') {
    return NUMBER.test(v) ? v : null;
  }
  if (property === 'transform') {
    return TRANSFORM.test(v) ? v : null;
  }
  return null;
}

function safeStyle(value) {
  const declarations = [];
  for (const declaration of value.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator < 1) continue;
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const safe = safePresentationValue(property, declaration.slice(separator + 1));
    if (safe !== null) declarations.push(property + ':' + safe);
  }
  return declarations.join(';');
}

function parseAttributes(source) {
  const attributes = [];
  const seen = new Set();
  let index = 0;

  while (index < source.length) {
    while (/\s/.test(source[index] || '')) index++;
    if (index >= source.length) break;

    const nameMatch = /^[A-Za-z_:][A-Za-z0-9_.:-]*/.exec(source.slice(index));
    if (!nameMatch) throw new Error('SVG contiene un atributo mal formado');
    const name = nameMatch[0].toLowerCase();
    index += nameMatch[0].length;

    while (/\s/.test(source[index] || '')) index++;
    if (source[index] !== '=') throw new Error('SVG contiene un atributo sin valor');
    index++;
    while (/\s/.test(source[index] || '')) index++;

    const quote = source[index];
    if (quote !== '"' && quote !== "'") throw new Error('SVG contiene un atributo sin comillas');
    index++;
    const end = source.indexOf(quote, index);
    if (end < 0) throw new Error('SVG contiene un atributo sin cerrar');
    const value = source.slice(index, end);
    if (value.includes('<')) throw new Error('SVG contiene un valor de atributo inválido');
    index = end + 1;

    if (seen.has(name)) throw new Error('SVG contiene un atributo duplicado: ' + name);
    seen.add(name);
    attributes.push([name, value]);
  }
  return attributes;
}

function parseTag(source) {
  if (source.startsWith('/')) {
    const closing = /^\/([A-Za-z][A-Za-z0-9:.-]*)\s*$/.exec(source);
    if (!closing) throw new Error('SVG contiene una etiqueta de cierre mal formada');
    return { closing: true, name: closing[1].toLowerCase() };
  }

  const selfClosing = /\/\s*$/.test(source);
  const body = selfClosing ? source.replace(/\/\s*$/, '') : source;
  const nameMatch = /^([A-Za-z][A-Za-z0-9:.-]*)/.exec(body);
  if (!nameMatch) throw new Error('SVG contiene una etiqueta mal formada');
  return {
    closing: false,
    selfClosing,
    name: nameMatch[1].toLowerCase(),
    attributes: parseAttributes(body.slice(nameMatch[0].length))
  };
}

function tagEnd(source, start) {
  let quote = null;
  for (let index = start + 1; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return index;
    }
  }
  throw new Error('SVG contiene una etiqueta sin cerrar');
}

function safeAttributes(tagName, attributes) {
  const allowed = ELEMENT_ATTRIBUTES.get(tagName);
  if (!allowed) return '';
  const output = [];

  for (const [name, rawValue] of attributes) {
    if (!allowed.has(name)) continue;
    const value = name === 'style'
      ? safeStyle(rawValue)
      : GEOMETRY_NUMBERS.has(name)
        ? (NUMBER.test(rawValue) ? rawValue : null)
      : name === 'd'
        ? (PATH_DATA.test(rawValue) ? rawValue : '')
        : name === 'points'
          ? (POINTS.test(rawValue) ? rawValue : '')
          : safePresentationValue(name, rawValue);

    if (value === null || value === '') continue;
    output.push(name + '="' + value.replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"');
  }
  return output.length ? ' ' + output.join(' ') : '';
}

/**
 * Reduce un fragmento SVG a primitivas vectoriales y atributos de presentación permitidos.
 * El contenido desconocido (scripts, foreignObject, enlaces, eventos y CSS externo) se descarta.
 * XML mal formado se rechaza para evitar que un editor genere una salida parcialmente interpretable.
 */
export function sanitizeSvgFragment(fragment) {
  if (typeof fragment !== 'string') throw new TypeError('El fragmento SVG debe ser texto');

  const output = [];
  const stack = [];
  let index = 0;

  while (index < fragment.length) {
    const start = fragment.indexOf('<', index);
    if (start < 0) break;

    if (fragment.startsWith('<!--', start)) {
      const endComment = fragment.indexOf('-->', start + 4);
      if (endComment < 0) throw new Error('SVG contiene un comentario sin cerrar');
      index = endComment + 3;
      continue;
    }
    if (fragment.startsWith('<!', start) || fragment.startsWith('<?', start)) {
      throw new Error('SVG no admite declaraciones, entidades ni instrucciones dentro de una pieza');
    }

    const end = tagEnd(fragment, start);
    const tag = parseTag(fragment.slice(start + 1, end).trim());

    if (tag.closing) {
      const frame = stack.pop();
      if (!frame || frame.name !== tag.name) throw new Error('SVG contiene etiquetas desbalanceadas');
      if (frame.emit) output.push('</' + tag.name + '>');
    } else {
      const parentEmits = stack.length === 0 || stack[stack.length - 1].emit;
      const emit = parentEmits && ELEMENT_ATTRIBUTES.has(tag.name);
      if (emit) output.push('<' + tag.name + safeAttributes(tag.name, tag.attributes) + (tag.selfClosing ? '/>' : '>'));
      if (!tag.selfClosing) stack.push({ name: tag.name, emit });
    }

    index = end + 1;
  }

  if (stack.length) throw new Error('SVG contiene etiquetas sin cerrar');
  return output.join('');
}
